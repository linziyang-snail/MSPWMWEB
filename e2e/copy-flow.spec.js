import { expect, test } from "@playwright/test";

import { MUTATE, hasCreds, login } from "./helpers.js";

// Creates real data — opt in with E2E_MUTATE=1.
test.describe("copy submit flow", () => {
  test.skip(!MUTATE, "set E2E_MUTATE=1 to run data-creating flows");
  test.skip(!hasCreds("USER"), "set E2E_USER_ID / E2E_USER_PW");

  test("USER submits a copy and it shows up under 待審核文案", async ({
    page,
  }) => {
    const stamp = Date.now();
    const number = `E2E${stamp}`.slice(0, 12);
    const title = `E2E測試文案 ${stamp}`;

    await login(page, "USER");
    await page.goto("/copies/all");
    await page.getByRole("button", { name: "新增文案" }).click();

    await page.getByPlaceholder("C123456789012").fill(number);
    await page.getByPlaceholder("請輸入文案標題").fill(title);
    await page.getByPlaceholder("請輸入推播文案內容...").fill(`內容 ${stamp}`);
    await page.getByRole("button", { name: "送出審核" }).click();

    await page.goto("/copies/pending");
    await expect(page.getByText(title)).toBeVisible({ timeout: 15_000 });
  });
});
