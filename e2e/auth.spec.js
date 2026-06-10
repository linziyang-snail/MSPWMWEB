import { expect, test } from "@playwright/test";

import { hasCreds, login } from "./helpers.js";

test("unauthenticated access to a protected page redirects to /login", async ({
  page,
}) => {
  await page.goto("/copies/all");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByPlaceholder("請輸入您的員工編號")).toBeVisible();
});

test.describe("USER (經辦)", () => {
  test.skip(!hasCreds("USER"), "set E2E_USER_ID / E2E_USER_PW");

  test("lands on copy management", async ({ page }) => {
    await login(page, "USER");
    await expect(page).toHaveURL(/\/copies\//);
  });

  test("sidebar shows 文案管理 but not 人員管理", async ({ page }) => {
    await login(page, "USER");
    await expect(page.getByRole("link", { name: "文案管理" })).toBeVisible();
    await expect(page.getByRole("link", { name: "人員管理" })).toHaveCount(0);
  });

  test("cannot reach account management (bounced to copies)", async ({
    page,
  }) => {
    await login(page, "USER");
    await page.goto("/accounts/active");
    await expect(page).toHaveURL(/\/copies\//);
  });
});

test.describe("MANAGER (覆核主管)", () => {
  test.skip(!hasCreds("MANAGER"), "set E2E_MANAGER_ID / E2E_MANAGER_PW");

  test("lands on copy management", async ({ page }) => {
    await login(page, "MANAGER");
    await expect(page).toHaveURL(/\/copies\//);
  });
});

test.describe("ADMIN (超級管理員)", () => {
  test.skip(!hasCreds("ADMIN"), "set E2E_ADMIN_ID / E2E_ADMIN_PW");

  test("lands on account management", async ({ page }) => {
    await login(page, "ADMIN");
    await expect(page).toHaveURL(/\/accounts\//);
  });

  test("sidebar shows 人員管理 + 科別管理 but not 文案管理", async ({ page }) => {
    await login(page, "ADMIN");
    await expect(page.getByRole("link", { name: "人員管理" })).toBeVisible();
    await expect(page.getByRole("link", { name: "科別管理" })).toBeVisible();
    await expect(page.getByRole("link", { name: "文案管理" })).toHaveCount(0);
  });

  test("cannot reach copy management (bounced to accounts)", async ({
    page,
  }) => {
    await login(page, "ADMIN");
    await page.goto("/copies/all");
    await expect(page).toHaveURL(/\/accounts\//);
  });
});
