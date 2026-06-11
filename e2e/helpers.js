import { expect } from "@playwright/test";

// Shared E2E helpers. Employee IDs default to the known test accounts; only the
// PASSWORDS must be supplied via env vars (never hardcode passwords):
//   E2E_USER_PW      經辦         (id default 1126580)
//   E2E_MANAGER_PW   覆核主管      (id default 9903674)
//   E2E_ADMIN_PW     超級管理員    (id default admin01)
//   E2E_ADMIN2_PW    第二位管理員  (id default admin02, used to approve admin01's requests)
//   E2E_MUTATE=1     enable the data-creating / approval flows
// Any id can still be overridden with E2E_<ROLE>_ID.
const accounts = {
  USER: { id: process.env.E2E_USER_ID || "1126580", pw: process.env.E2E_USER_PW },
  MANAGER: { id: process.env.E2E_MANAGER_ID || "9903674", pw: process.env.E2E_MANAGER_PW },
  ADMIN: { id: process.env.E2E_ADMIN_ID || "admin01", pw: process.env.E2E_ADMIN_PW },
  ADMIN2: { id: process.env.E2E_ADMIN2_ID || "admin02", pw: process.env.E2E_ADMIN2_PW },
};

export const MUTATE = process.env.E2E_MUTATE === "1";

// Unique low-order id (timestamp tail + random) so parallel / near-in-time
// records never collide on unique fields (copy number, names, etc.).
export function uid() {
  return (
    String(Date.now()).slice(-6) +
    String(Math.floor(Math.random() * 1000)).padStart(3, "0")
  );
}

export function hasCreds(role) {
  const a = accounts[role];
  return Boolean(a?.id && a?.pw);
}

// Clean-session login with explicit credentials; waits until navigation leaves
// /login. (Not for first-login accounts that must change their password.)
export async function loginWith(page, id, pw) {
  // Start from a clean session so switching users mid-test can't leave auth or
  // overlay state that blocks the login form.
  await page.goto("/login");
  await page.evaluate(() => {
    sessionStorage.clear();
    localStorage.clear();
  });
  await page.goto("/login");

  const loginButton = page.getByRole("button", { name: "立即登入" });
  await page.getByPlaceholder("請輸入您的員工編號").fill(id);
  await page.getByPlaceholder("請輸入您的密碼").fill(pw);
  await expect(loginButton).toBeEnabled();
  await loginButton.click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
    timeout: 15_000,
  });
}

export async function login(page, role) {
  const a = accounts[role];
  await loginWith(page, a.id, a.pw);
}
