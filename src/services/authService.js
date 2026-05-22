import {
  mockLogin,
  mockLogout,
  mockRefreshToken,
} from "@/mocks/api/authApi";

import apiRequest from "./apiRequest";
import { useMock } from "./config";

export async function login(payload) {
  const { userId, password } = payload || {};
  if (useMock) return mockLogin(userId, password);
  return apiRequest.post("/auth/login", { userId, password });
}

export async function logout() {
  if (useMock) return mockLogout();
  return apiRequest.post("/auth/logout", {});
}

export async function refreshToken() {
  if (useMock) return mockRefreshToken();
  return apiRequest.post("/auth/refresh", {});
}

/**
 * 登入
 * @param {string} userId - 使用者代號
 * @param {string} password - 密碼
 * @returns {Promise} - 登入結果，包含 accessToken、userId、userName、roles
 */
export const Login = (userId, password) => login({ userId, password });

/**
 * 登出
 * @returns {Promise} - 登出結果
 */
export const Logout = () => logout();

/**
 * 刷新 Access Token
 * @returns {Promise} - 新的 Access Token
 */
export const RefreshToken = () => refreshToken();
