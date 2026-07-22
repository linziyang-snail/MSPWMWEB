import { expect, test } from "@playwright/test";

import { MUTATE, hasCreds, login, uid } from "./helpers.js";

// Creates real data — opt in with E2E_MUTATE=1.
test.describe("category flow", () => {
  test.skip(!MUTATE, "set E2E_MUTATE=1 to run data-creating flows");
  test.skip(!hasCreds("ADMIN"), "set E2E_ADMIN_PW");

  async function createCategory(page, name) {
    await page.goto("/categories/all");
    await page.getByRole("button", { name: "新增科別" }).click();
    await page.getByPlaceholder("請輸入科別名稱").fill(name);
    const posted = page.waitForResponse(
      (r) =>
        r.url().includes("/api/organizations") &&
        r.request().method() === "POST",
    );
    await page.getByRole("button", { name: "確認提交" }).click();
    await posted;
  }

  async function approvePending(page, name) {
    await page.goto("/categories/pending");
    const row = page.locator("tr").filter({ hasText: name });
    await expect(row).toBeVisible({ timeout: 15_000 });
    const approved = page.waitForResponse((r) => r.url().includes("/approve"));
    await row.getByRole("button", { name: "核准" }).click();
    await page.getByRole("button", { name: "確認核准" }).click();
    await approved;
  }

  test("ADMIN creates a category and it shows up under 待審核科別", async ({
    page,
  }) => {
    const name = `E2E科${uid()}`;
    await login(page, "ADMIN");
    await createCategory(page, name);

    await page.goto("/categories/pending");
    await expect(page.getByText(name)).toBeVisible({ timeout: 15_000 });
  });

  test("ADMIN2 approves the category ADMIN created", async ({ page }) => {
    test.skip(!hasCreds("ADMIN2"), "set E2E_ADMIN2_PW (a second admin)");
    const name = `E2E核科${uid()}`;
    await login(page, "ADMIN");
    await createCategory(page, name);

    // The creator can't approve their own request, so a second admin approves.
    await login(page, "ADMIN2");
    await approvePending(page, name);

    await page.goto("/categories/all");
    await expect(page.getByText(name)).toBeVisible({ timeout: 15_000 });
  });

  test("ADMIN2 rejects the category ADMIN created", async ({ page }) => {
    test.skip(!hasCreds("ADMIN2"), "set E2E_ADMIN2_PW");
    const name = `E2E駁科${uid()}`;
    await login(page, "ADMIN");
    await createCategory(page, name);

    await login(page, "ADMIN2");
    await page.goto("/categories/pending");
    const row = page.locator("tr").filter({ hasText: name });
    await expect(row).toBeVisible({ timeout: 15_000 });
    await row.getByRole("button", { name: "駁回" }).click();
    await page.getByPlaceholder(/請輸入駁回原因/).fill("E2E科別駁回原因");
    const rejected = page.waitForResponse(
      (r) => r.url().includes("/reject") && r.request().method() === "PUT",
    );
    await page.getByRole("button", { name: "確認駁回" }).click();
    await rejected;

    await page.goto("/categories/rejected");
    await expect(page.getByText(name)).toBeVisible({ timeout: 15_000 });
  });

  test("ADMIN deletes a category and ADMIN2 approves the delete", async ({
    page,
  }) => {
    test.skip(!hasCreds("ADMIN2"), "set E2E_ADMIN2_PW");
    const name = `E2E刪科${uid()}`;

    // create + approve so there is an active category to delete
    await login(page, "ADMIN");
    await createCategory(page, name);
    await login(page, "ADMIN2");
    await approvePending(page, name);

    // ADMIN requests the delete from 全部科別
    await login(page, "ADMIN");
    await page.goto("/categories/all");
    const card = page.locator("article").filter({ hasText: name });
    await expect(card).toBeVisible({ timeout: 15_000 });
    await card.getByRole("button", { name: "刪除科別" }).click();
    await page.getByRole("button", { name: "確認刪除" }).click();

    // ADMIN2 approves the delete request
    await login(page, "ADMIN2");
    await approvePending(page, name);

    await page.goto("/categories/all");
    await expect(page.locator("article").filter({ hasText: name })).toHaveCount(0);
  });
});
