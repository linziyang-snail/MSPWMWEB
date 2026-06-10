// Shared E2E helpers. Credentials come from env vars — never hardcode them.
//   E2E_USER_ID / E2E_USER_PW        (經辦)
//   E2E_MANAGER_ID / E2E_MANAGER_PW  (覆核主管)
//   E2E_ADMIN_ID / E2E_ADMIN_PW      (超級管理員)
//   E2E_MUTATE=1                     enable the data-creating flows
const accounts = {
  USER: { id: process.env.E2E_USER_ID, pw: process.env.E2E_USER_PW },
  MANAGER: { id: process.env.E2E_MANAGER_ID, pw: process.env.E2E_MANAGER_PW },
  ADMIN: { id: process.env.E2E_ADMIN_ID, pw: process.env.E2E_ADMIN_PW },
};

export const MUTATE = process.env.E2E_MUTATE === "1";

export function hasCreds(role) {
  const a = accounts[role];
  return Boolean(a?.id && a?.pw);
}

export async function login(page, role) {
  const a = accounts[role];
  await page.goto("/login");
  await page.getByPlaceholder("請輸入您的員工編號").fill(a.id);
  await page.getByPlaceholder("請輸入您的密碼").fill(a.pw);
  await page.getByRole("button", { name: /立即登入|登入中/ }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
    timeout: 15_000,
  });
}
