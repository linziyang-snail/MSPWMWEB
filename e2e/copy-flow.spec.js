import { expect, test } from "@playwright/test";

import { MUTATE, hasCreds, login } from "./helpers.js";

// Creates real data — opt in with E2E_MUTATE=1.
test.describe("copy flow", () => {
  test.skip(!MUTATE, "set E2E_MUTATE=1 to run data-creating flows");
  test.skip(!hasCreds("USER"), "set E2E_USER_PW");

  async function submitCopy(page, title) {
    const stamp = Date.now();
    const number = `E2E${stamp}`.slice(0, 12);
    await page.goto("/copies/all");
    await page.getByRole("button", { name: "新增文案" }).click();
    await page.getByPlaceholder("C123456789012").fill(number);
    await page.getByPlaceholder("請輸入文案標題").fill(title);
    await page.getByPlaceholder("請輸入推播文案內容...").fill(`內容 ${stamp}`);
    await page.getByRole("button", { name: "送出審核" }).click();
  }

  test("USER submits a copy and it shows up under 待審核文案", async ({
    page,
  }) => {
    const title = `E2E測試文案 ${Date.now()}`;
    await login(page, "USER");
    await submitCopy(page, title);

    await page.goto("/copies/pending");
    await expect(page.getByText(title)).toBeVisible({ timeout: 15_000 });
  });

  test("MANAGER approves a USER-submitted copy", async ({ page }) => {
    test.skip(!hasCreds("MANAGER"), "set E2E_MANAGER_PW");
    const title = `E2E核准文案 ${Date.now()}`;

    await login(page, "USER");
    await submitCopy(page, title);

    await login(page, "MANAGER");
    await page.goto("/copies/pending");
    const card = page.locator("article", { hasText: title });
    await expect(card).toBeVisible({ timeout: 15_000 });
    await card.getByRole("button", { name: "核准" }).click();
    await page.getByRole("button", { name: "確認核准" }).click();

    await page.goto("/copies/approved");
    await expect(page.getByText(title)).toBeVisible({ timeout: 15_000 });
  });
});
