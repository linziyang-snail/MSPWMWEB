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
    await page.getByPlaceholder("請輸入推播文案內容...").fill(`內容 ${number}`);
    // Wait for the POST to finish so a following navigation doesn't abort it.
    const posted = page.waitForResponse(
      (r) => r.url().includes("/api/copies") && r.request().method() === "POST",
    );
    await page.getByRole("button", { name: "送出審核" }).click();
    await posted;
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
