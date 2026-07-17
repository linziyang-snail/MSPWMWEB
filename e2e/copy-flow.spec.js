import { expect, test } from "@playwright/test";

import { MUTATE, hasCreds, login, uid } from "./helpers.js";

const SEARCH = "搜尋文案編號、標題或內容...";

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

    const posted = page.waitForResponse(
      (r) => r.url().includes("/api/copies") && r.request().method() === "POST",
    );
    await page.getByRole("button", { name: "送出審核" }).click();
    const body = (await posted).request().postDataJSON();
    expect(body.content).toMatch(/\|\$1\|/); // at least one inserted parameter
    expect(body.comment).toBeTruthy(); // 備註 was sent
    expect(body.remark).toBeUndefined();
  }

  // Search filters across all loaded rows, so a copy is found regardless of page.
  async function searchPending(page, statusPath, title) {
    await page.goto(statusPath);
    await page.getByPlaceholder(SEARCH).fill(title);
    return page.locator("article").filter({ hasText: title });
  }

  // Confirm a cancel dialog and wait for the PUT so a following navigation
  // doesn't race the not-yet-committed status change.
  async function confirmCancel(page) {
    const done = page.waitForResponse(
      (r) => r.url().includes("/cancel") && r.request().method() === "PUT",
    );
    await page.getByRole("button", { name: "確認刪除" }).click();
    await done;
  }

  test("USER submits a copy and it shows up under 待審核文案", async ({
    page,
  }) => {
    const title = `E2E測試文案 ${uid()}`;
    await login(page, "USER");
    await submitCopy(page, title);

    await searchPending(page, "/copies/pending", title);
    await expect(page.getByRole("heading", { name: title })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("MANAGER approves a USER-submitted copy", async ({ page }) => {
    test.skip(!hasCreds("MANAGER"), "set E2E_MANAGER_PW");
    const title = `E2E核准文案 ${uid()}`;
    await login(page, "USER");
    await submitCopy(page, title);

    await login(page, "MANAGER");
    const card = await searchPending(page, "/copies/pending", title);
    await expect(card).toBeVisible({ timeout: 15_000 });
    const approved = page.waitForResponse(
      (r) => r.url().includes("/approve") && r.request().method() === "PUT",
    );
    await card.getByRole("button", { name: "核准" }).click();
    await page.getByRole("button", { name: "確認核准" }).click();
    await approved;

    await searchPending(page, "/copies/approved", title);
    await expect(page.getByRole("heading", { name: title })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("MANAGER rejects a USER-submitted copy with a reason", async ({
    page,
  }) => {
    test.skip(!hasCreds("MANAGER"), "set E2E_MANAGER_PW");
    const title = `E2E駁回文案 ${uid()}`;
    await login(page, "USER");
    await submitCopy(page, title);

    await login(page, "MANAGER");
    const card = await searchPending(page, "/copies/pending", title);
    await expect(card).toBeVisible({ timeout: 15_000 });
    const rejected = page.waitForResponse(
      (r) => r.url().includes("/reject") && r.request().method() === "PUT",
    );
    await card.getByRole("button", { name: "駁回" }).click();
    await page.getByPlaceholder(/請輸入駁回原因/).fill("E2E駁回原因測試");
    await page.getByRole("button", { name: "確認駁回" }).click();
    await rejected;

    await searchPending(page, "/copies/rejected", title);
    await expect(page.getByRole("heading", { name: title })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("USER cancels their own pending copy", async ({ page }) => {
    const title = `E2E取消文案 ${uid()}`;
    await login(page, "USER");
    await submitCopy(page, title);

    const card = await searchPending(page, "/copies/pending", title);
    await expect(card).toBeVisible({ timeout: 15_000 });
    await card.getByRole("button", { name: "取消送審" }).click();
    await confirmCancel(page);

    await searchPending(page, "/copies/cancelled", title);
    await expect(page.getByRole("heading", { name: title })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("USER duplicates a cancelled copy into a new pending one", async ({
    page,
  }) => {
    const title = `E2E複製文案 ${uid()}`;
    await login(page, "USER");
    await submitCopy(page, title);

    // cancel it
    let card = await searchPending(page, "/copies/pending", title);
    await expect(card).toBeVisible({ timeout: 15_000 });
    await card.getByRole("button", { name: "取消送審" }).click();
    await confirmCancel(page);

    // duplicate from cancelled (new number; the title is prefilled with （副本）)
    card = await searchPending(page, "/copies/cancelled", title);
    await expect(card).toBeVisible({ timeout: 15_000 });
    await card.getByRole("button", { name: "複製新建" }).click();
    await page.getByPlaceholder("C123456789012").fill(`E2E${uid()}`);
    const posted = page.waitForResponse(
      (r) => r.url().includes("/api/copies") && r.request().method() === "POST",
    );
    await page.getByRole("button", { name: "送出審核" }).click();
    await posted;

    await searchPending(page, "/copies/pending", `${title}（副本）`);
    await expect(
      page.getByRole("heading", { name: `${title}（副本）` }),
    ).toBeVisible({ timeout: 15_000 });
  });
});
