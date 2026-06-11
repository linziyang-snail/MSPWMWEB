import { expect, test } from "@playwright/test";

import { MUTATE, hasCreds, login } from "./helpers.js";

const SEARCH = "搜尋文案編號、標題或內容...";

// Unique low-order id (timestamp tail + random) so parallel/near-in-time copies
// never collide on the DB-unique `number`.
function uid() {
  return (
    String(Date.now()).slice(-6) +
    String(Math.floor(Math.random() * 1000)).padStart(3, "0")
  );
}

// Creates real data — opt in with E2E_MUTATE=1.
test.describe("copy flow", () => {
  test.skip(!MUTATE, "set E2E_MUTATE=1 to run data-creating flows");
  test.skip(!hasCreds("USER"), "set E2E_USER_PW");

  async function submitCopy(page, title) {
    const number = `E2E${uid()}`;
    await page.goto("/copies/all");
    await page.getByRole("button", { name: "新增文案" }).click();
    await page.getByPlaceholder("C123456789012").fill(number);
    await page.getByPlaceholder("請輸入文案標題").fill(title);

    // Realistic content: a sentence with 1-10 inserted parameters interspersed
    // between text (exercises the 插入參數 feature). Plus a 備註.
    const content = page.getByPlaceholder("請輸入推播文案內容...");
    const insertBtn = page.getByRole("button", { name: "插入參數" });
    await content.fill("這是一段推播文案，有關於信用卡優惠 ");
    const paramCount = 1 + Math.floor(Math.random() * 10);
    for (let i = 0; i < paramCount; i += 1) {
      await content.focus();
      await page.keyboard.press("Control+End");
      await insertBtn.click();
      await content.focus();
      await page.keyboard.press("Control+End");
      await page.keyboard.type(` 謝謝${i + 1} `);
    }
    await page.getByPlaceholder("請輸入文案備註...").fill(`E2E備註 ${number}`);

    // Wait for the POST, and verify the inserted parameters + 備註 reached the API.
    const posted = page.waitForResponse(
      (r) => r.url().includes("/api/copies") && r.request().method() === "POST",
    );
    await page.getByRole("button", { name: "送出審核" }).click();
    const body = (await posted).request().postDataJSON();
    expect(body.content).toMatch(/\|\$1\|/); // at least one inserted parameter
    expect(body.remark).toBeTruthy(); // 備註 was sent
  }

  // Search filters across all loaded rows, so the copy is found regardless of
  // which page it would otherwise land on.
  async function findCopyHeading(page, statusPath, title) {
    await page.goto(statusPath);
    await page.getByPlaceholder(SEARCH).fill(title);
    return page.getByRole("heading", { name: title });
  }

  test("USER submits a copy and it shows up under 待審核文案", async ({
    page,
  }) => {
    const title = `E2E測試文案 ${uid()}`;
    await login(page, "USER");
    await submitCopy(page, title);

    const heading = await findCopyHeading(page, "/copies/pending", title);
    await expect(heading).toBeVisible({ timeout: 15_000 });
  });

  test("MANAGER approves a USER-submitted copy", async ({ page }) => {
    test.skip(!hasCreds("MANAGER"), "set E2E_MANAGER_PW");
    const title = `E2E核准文案 ${uid()}`;

    await login(page, "USER");
    await submitCopy(page, title);

    await login(page, "MANAGER");
    await page.goto("/copies/pending");
    await page.getByPlaceholder(SEARCH).fill(title);
    const card = page.locator("article").filter({ hasText: title });
    await expect(card).toBeVisible({ timeout: 15_000 });
    await card.getByRole("button", { name: "核准" }).click();
    await page.getByRole("button", { name: "確認核准" }).click();

    const approved = await findCopyHeading(page, "/copies/approved", title);
    await expect(approved).toBeVisible({ timeout: 15_000 });
  });
});
