import { expect, test } from "@playwright/test";

import { MUTATE, hasCreds, login } from "./helpers.js";

// Creates real data — opt in with E2E_MUTATE=1.
test.describe("category create flow", () => {
  test.skip(!MUTATE, "set E2E_MUTATE=1 to run data-creating flows");
  test.skip(!hasCreds("ADMIN"), "set E2E_ADMIN_ID / E2E_ADMIN_PW");

  test("ADMIN creates a category and it shows up under 待審核科別", async ({
    page,
  }) => {
    const name = `E2E科${Date.now().toString().slice(-6)}`;

    await login(page, "ADMIN");
    await page.goto("/categories/all");
    await page.getByRole("button", { name: "新增科別" }).click();

    await page.getByPlaceholder("請輸入科別名稱").fill(name);
    await page.getByRole("button", { name: "確認提交" }).click();

    await page.goto("/categories/pending");
    await expect(page.getByText(name)).toBeVisible({ timeout: 15_000 });
  });
});
