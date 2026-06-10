import { expect, test } from "@playwright/test";

// Optional credentials for the real login flow. Run with, e.g.:
//   E2E_USER_ID=admin01 E2E_PASSWORD=*** npm run test:e2e
const userId = process.env.E2E_USER_ID;
const password = process.env.E2E_PASSWORD;

test.describe("auth & routing", () => {
  test("unauthenticated access to a protected page redirects to /login", async ({
    page,
  }) => {
    await page.goto("/copies/all");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByPlaceholder("請輸入您的員工編號")).toBeVisible();
  });

  test("login lands on a role home page", async ({ page }) => {
    test.skip(
      !userId || !password,
      "set E2E_USER_ID and E2E_PASSWORD to run the real login flow",
    );
    await page.goto("/login");
    await page.getByPlaceholder("請輸入您的員工編號").fill(userId);
    await page.getByPlaceholder("請輸入您的密碼").fill(password);
    await page.getByRole("button", { name: /立即登入|登入中/ }).click();
    await expect(page).toHaveURL(/\/(copies|accounts)\b/, { timeout: 15_000 });
  });
});
