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
  return apiRequest.post(
    "/auth/login",
    { userId, password },
    { skipAuth: true },
  );
}

export async function logout() {
  if (useMock) return mockLogout();
  return apiRequest.post("/auth/logout", {});
}

export async function refreshToken() {
  if (useMock) return mockRefreshToken();
  return apiRequest.post("/auth/refresh", {});
}

export async function changeMyPassword(payload) {
  const { id, oldPassword, newPassword } = payload || {};
  const body = { id, oldPassword, newPassword };
  if (useMock) return {};
  return apiRequest.put("/auth/me/password", body);
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

/**
 * 修改自己的密碼
 * @param {Object} data - 修改密碼資料，包含 id、oldPassword、newPassword
 * @returns {Promise} - 修改密碼結果
 */
export const ChangeMyPassword = (data) => changeMyPassword(data);
