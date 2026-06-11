import { expect, test } from "@playwright/test";

import { MUTATE, hasCreds, login, uid } from "./helpers.js";

// A password that satisfies the rules (>=12, >=3 of upper/lower/digit/symbol,
// must not contain the account id).
const VALID_PW = "Ubotubot1234!";

// Creates real data (a throwaway category + account) — opt in with E2E_MUTATE=1.
test.describe("account flow", () => {
  test.skip(!MUTATE, "set E2E_MUTATE=1 to run data-creating flows");
  test.skip(
    !hasCreds("ADMIN") || !hasCreds("ADMIN2"),
    "set E2E_ADMIN_PW and E2E_ADMIN2_PW (two admins are required)",
  );

  // BaseSelect is a custom dropdown: click the trigger (shows the placeholder or
  // current value), then click the teleported option. When the option text equals
  // the trigger text, .last() targets the teleported option rather than the trigger.
  async function pickFromSelect(page, triggerName, optionName) {
    await page.getByRole("button", { name: triggerName }).click();
    await page
      .getByRole("button", { name: optionName, exact: true })
      .last()
      .click();
  }

  async function createActiveCategory(page, name) {
    await login(page, "ADMIN");
    await page.goto("/categories/all");
    await page.getByRole("button", { name: "新增科別" }).click();
    await page.getByPlaceholder("請輸入科別名稱").fill(name);
    const created = page.waitForResponse(
      (r) =>
        r.url().includes("/api/organizations") &&
        r.request().method() === "POST",
    );
    await page.getByRole("button", { name: "確認提交" }).click();
    await created;

    // A second admin approves so the section becomes active and assignable.
    await login(page, "ADMIN2");
    await page.goto("/categories/pending");
    const row = page.locator("tr").filter({ hasText: name });
    await expect(row).toBeVisible({ timeout: 15_000 });
    const approved = page.waitForResponse((r) => r.url().includes("/approve"));
    await row.getByRole("button", { name: "核准" }).click();
    await page.getByRole("button", { name: "確認核准" }).click();
    await approved;
  }

  async function createAccount(page, { id, name, category, roleLabel }) {
    await page.goto("/accounts/active");
    await page.getByRole("button", { name: "新增人員" }).click();
    await page.getByPlaceholder("請輸入員編(限數字)").fill(id);
    await page.getByPlaceholder("至少12個字元（必填)").fill(VALID_PW);
    await page.getByPlaceholder("請輸入中文姓名").fill(name);
    await pickFromSelect(page, "請選擇科別", category);
    await pickFromSelect(page, "經辦人員", roleLabel);
    const created = page.waitForResponse(
      (r) => r.url().includes("/api/users") && r.request().method() === "POST",
    );
    await page.getByRole("button", { name: "建立帳號" }).click();
    await created;
  }

  async function approveNewAccount(page, id) {
    await page.goto("/accounts/pending-changes");
    const card = page.locator("article").filter({ hasText: id });
    await expect(card).toBeVisible({ timeout: 15_000 });
    const approved = page.waitForResponse((r) => r.url().includes("/approve"));
    await card.getByRole("button", { name: "核准" }).click();
    await page.getByRole("button", { name: "確認核准" }).click();
    await approved;
  }

  test("ADMIN creates a 經辦 account, ADMIN2 approves → shows in 已啟用", async ({
    page,
  }) => {
    const stamp = uid();
    const category = `E2E帳科${stamp}`;
    const id = `7${stamp.slice(-6)}`; // 7-digit numeric employee id
    const name = `E2E測試員${stamp.slice(-4)}`;

    await createActiveCategory(page, category);

    await login(page, "ADMIN");
    await createAccount(page, { id, name, category, roleLabel: "經辦人員" });

    await login(page, "ADMIN2");
    await approveNewAccount(page, id);

    // Approved new accounts are PASSWORD_INVALID, which lives under 已啟用 (需改密碼).
    await login(page, "ADMIN");
    await page.goto("/accounts/active");
    await page.getByPlaceholder("請輸入員編、人員姓名").fill(id);
    await page.getByRole("button", { name: "查詢" }).click();
    await expect(page.locator("tr").filter({ hasText: id })).toBeVisible({
      timeout: 15_000,
    });
  });
});
