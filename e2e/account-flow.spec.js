import { expect, test } from "@playwright/test";

import { MUTATE, hasCreds, login, loginWith, uid } from "./helpers.js";

// Passwords that satisfy the rules (>=12, >=3 of upper/lower/digit/symbol, must
// not contain the account id).
const VALID_PW = "Ubotubot1234!";
const NEW_PW = "Ubotubot5678!";

// Creates real data (a throwaway category + account) — opt in with E2E_MUTATE=1.
test.describe("account flow", () => {
  test.skip(!MUTATE, "set E2E_MUTATE=1 to run data-creating flows");
  test.skip(
    !hasCreds("ADMIN") || !hasCreds("ADMIN2"),
    "set E2E_ADMIN_PW and E2E_ADMIN2_PW (two admins are required)",
  );

  // BaseSelect is a custom dropdown. Locate the trigger by its field label (not
  // by its current text, which may be a default value), open it, then click the
  // teleported option. Scope to the modal <form> so the label can't hit the
  // table's sortable 科別 column header. .last() targets the teleported option
  // when its text equals the trigger's.
  async function pickFromSelect(page, labelText, optionName) {
    const trigger = page
      .locator("form")
      .getByText(labelText, { exact: true })
      .locator("..")
      .getByRole("button");
    await trigger.click();
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
    await pickFromSelect(page, "科別", category);
    await pickFromSelect(page, "權限等級", roleLabel);
    const created = page.waitForResponse(
      (r) => r.url().includes("/api/users") && r.request().method() === "POST",
    );
    await page.getByRole("button", { name: "建立帳號" }).click();
    const resp = await created;
    const body = await resp.text();
    expect(body, `account create failed (status ${resp.status()})`).toContain(
      '"0000"',
    );
  }

  async function approveNewAccount(page, id) {
    // 待審核新帳號 (CREATE) renders as a table; the new account's id is in a cell.
    await page.goto("/accounts/pending-changes");
    const row = page.locator("tr").filter({ hasText: id });
    await expect(row).toBeVisible({ timeout: 15_000 });
    const approved = page.waitForResponse((r) => r.url().includes("/approve"));
    await row.getByRole("button", { name: "核准" }).click();
    await page.getByRole("button", { name: "確認核准" }).click();
    await approved;
  }

  // ADMIN creates a section + account; ADMIN2 approves it. Returns the account.
  async function createAndApproveAccount(page, roleLabel = "經辦人員") {
    const stamp = uid();
    const account = {
      category: `E2E帳科${stamp}`,
      id: `7${stamp.slice(-6)}`, // 7-digit numeric employee id
      name: `E2E測試員${stamp.slice(-4)}`,
    };
    await createActiveCategory(page, account.category);
    await login(page, "ADMIN");
    await createAccount(page, { ...account, roleLabel });
    await login(page, "ADMIN2");
    await approveNewAccount(page, account.id);
    return account;
  }

  // A freshly-approved account is PASSWORD_INVALID: logging in pops the "must
  // change password" notice, then a change-password form; the old password is
  // remembered and sent with the new one.
  async function firstLoginChangePassword(page, id, oldPw, newPw) {
    await page.goto("/login");
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    await page.goto("/login");
    await page.getByPlaceholder("請輸入您的員工編號").fill(id);
    await page.getByPlaceholder("請輸入您的密碼").fill(oldPw);
    await page.getByRole("button", { name: "立即登入" }).click();

    await page.getByRole("button", { name: "確認" }).click(); // 請更新您的密碼 notice
    await page.getByPlaceholder("請輸入新密碼").fill(newPw);
    await page.getByPlaceholder("請再次輸入新密碼").fill(newPw);
    const changed = page.waitForResponse(
      (r) =>
        r.url().includes("/auth/me/password") &&
        r.request().method() === "PUT",
    );
    await page.getByRole("button", { name: "修改密碼" }).click();
    await changed;
    await page.getByRole("button", { name: "確認" }).click(); // 密碼已更新 alert
  }

  // Search the 已啟用 list for an account and click one of its row actions
  // (aria-label: 重設密碼 / 編輯帳號 / 刪除帳號).
  async function openActiveRowAction(page, id, ariaLabel) {
    await page.goto("/accounts/active");
    await page.getByPlaceholder("請輸入員編、人員姓名").fill(id);
    await page.getByRole("button", { name: "查詢" }).click();
    const row = page.locator("tr").filter({ hasText: id });
    await expect(row).toBeVisible({ timeout: 15_000 });
    await row.getByRole("button", { name: ariaLabel }).click();
  }

  // UPDATE/DELETE requests appear as cards under 待審核帳號異動.
  async function approveChangeReview(page, id) {
    await page.goto("/accounts/pending-review");
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
    const { id } = await createAndApproveAccount(page);

    // Approved new accounts are PASSWORD_INVALID, which lives under 已啟用 (需改密碼).
    await login(page, "ADMIN");
    await page.goto("/accounts/active");
    await page.getByPlaceholder("請輸入員編、人員姓名").fill(id);
    await page.getByRole("button", { name: "查詢" }).click();
    await expect(page.locator("tr").filter({ hasText: id })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("new account changes password on first login, then can log in", async ({
    page,
  }) => {
    const { id } = await createAndApproveAccount(page);

    await firstLoginChangePassword(page, id, VALID_PW, NEW_PW);

    // Now ACTIVE: logging in with the new password reaches the 經辦 home (copies).
    await loginWith(page, id, NEW_PW);
    await expect(page).toHaveURL(/\/copies\//);
  });

  test("ADMIN edits the account name, ADMIN2 approves the change", async ({
    page,
  }) => {
    const { id } = await createAndApproveAccount(page);
    const newName = `改名${uid().slice(-4)}`;

    await login(page, "ADMIN");
    await openActiveRowAction(page, id, "編輯帳號");
    await page
      .locator("form")
      .getByText("人員姓名", { exact: true })
      .locator("..")
      .getByRole("textbox")
      .fill(newName);
    const updated = page.waitForResponse(
      (r) =>
        r.url().includes("/api/users/") &&
        r.request().method() === "PUT" &&
        !r.url().includes("/password"),
    );
    await page.getByRole("button", { name: "儲存變更" }).click();
    await updated;

    await login(page, "ADMIN2");
    await approveChangeReview(page, id);

    // the approved new name now shows on the account
    await login(page, "ADMIN");
    await page.goto("/accounts/active");
    await page.getByPlaceholder("請輸入員編、人員姓名").fill(id);
    await page.getByRole("button", { name: "查詢" }).click();
    await expect(page.locator("tr").filter({ hasText: newName })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("ADMIN resets the account password (immediate, no approval)", async ({
    page,
  }) => {
    const { id } = await createAndApproveAccount(page);

    await login(page, "ADMIN");
    await openActiveRowAction(page, id, "重設密碼");
    await page.getByPlaceholder("請輸入新密碼").fill(NEW_PW);
    await page.getByPlaceholder("至少12個字元（必填)").fill(NEW_PW);
    const reset = page.waitForResponse(
      (r) => r.url().includes("/password") && r.request().method() === "PUT",
    );
    await page.getByRole("button", { name: "確認修改" }).click();
    const body = await (await reset).text();
    expect(body, "password reset failed").toContain('"0000"');
  });

  test("ADMIN deletes the account, ADMIN2 approves → 全部帳號不顯示", async ({
    page,
  }) => {
    const { id } = await createAndApproveAccount(page);

    await login(page, "ADMIN");
    await openActiveRowAction(page, id, "刪除帳號");
    const deleted = page.waitForResponse(
      (r) =>
        r.url().includes("/api/users/") && r.request().method() === "DELETE",
    );
    await page.getByRole("button", { name: "確認刪除" }).click();
    await deleted;

    await login(page, "ADMIN2");
    await approveChangeReview(page, id);

    await login(page, "ADMIN");
    await page.goto("/accounts/all");
    await expect(page.locator("tr").filter({ hasText: id })).toHaveCount(0);
  });
});
