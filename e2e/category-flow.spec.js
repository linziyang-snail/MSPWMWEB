import { expect, test } from "@playwright/test";

import { MUTATE, hasCreds, login } from "./helpers.js";

// Creates real data — opt in with E2E_MUTATE=1.
test.describe("category flow", () => {
  test.skip(!MUTATE, "set E2E_MUTATE=1 to run data-creating flows");
  test.skip(!hasCreds("ADMIN"), "set E2E_ADMIN_PW");

  async function createCategory(page, name) {
    await page.goto("/categories/all");
    await page.getByRole("button", { name: "新增科別" }).click();
    await page.getByPlaceholder("請輸入科別名稱").fill(name);
    await page.getByRole("button", { name: "確認提交" }).click();
  }

  test("ADMIN creates a category and it shows up under 待審核科別", async ({
    page,
  }) => {
    const name = `E2E科${Date.now().toString().slice(-6)}`;
    await login(page, "ADMIN");
    await createCategory(page, name);

    await page.goto("/categories/pending");
    await expect(page.getByText(name)).toBeVisible({ timeout: 15_000 });
  });

  test("ADMIN2 approves the category ADMIN created", async ({ page }) => {
    test.skip(!hasCreds("ADMIN2"), "set E2E_ADMIN2_PW (a second admin)");
    const name = `E2E核科${Date.now().toString().slice(-6)}`;

    await login(page, "ADMIN");
    await createCategory(page, name);

    // The creator can't approve their own request, so a second admin approves.
    await login(page, "ADMIN2");
    await page.goto("/categories/pending");
    const row = page.locator("tr", { hasText: name });
    await expect(row).toBeVisible({ timeout: 15_000 });
    await row.getByRole("button", { name: "核准" }).click();
    await page.getByRole("button", { name: "確認核准" }).click();

    await page.goto("/categories/all");
    await expect(page.getByText(name)).toBeVisible({ timeout: 15_000 });
  });
});
