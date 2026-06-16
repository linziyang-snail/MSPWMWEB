export const AUTH_STORAGE_KEY = "mspwm.auth";
export const ACCESS_TOKEN_KEY = "mspwm.accessToken";

const LEGACY_AUTH_KEYS = [
  AUTH_STORAGE_KEY,
  ACCESS_TOKEN_KEY,
  "accessToken",
  "token",
  "userInfo",
  "user",
  "roles",
  "permissions",
  "auth",
  "authUser",
  "mspwm_token",
  "mspwm_user",
  "mspwm_roles",
  "isLogin",
  "isAuthenticated",
];

export function clearAuthStorage() {
  if (typeof window === "undefined") return;
  LEGACY_AUTH_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}

export function readAuthStorage() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(sessionStorage.getItem(AUTH_STORAGE_KEY) || "null");
  } catch {
    clearAuthStorage();
    return null;
  }
}

export function readAccessToken() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(ACCESS_TOKEN_KEY) || "";
}

export function writeAuthStorage(payload) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
  sessionStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken || "");

  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}
