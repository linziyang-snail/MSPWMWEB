import {
  mockChangeMyPassword,
  mockCreateUser,
  mockDeleteUser,
  mockGetAccountChangeRequests,
  mockGetUserById,
  mockGetUsers,
  mockResetUserPassword,
  mockUnlockUser,
  mockUpdateUser,
} from "@/mocks/api/userApi";
import { readAuthStorage } from "@/utils/authStorage";

import apiRequest, { unwrapApiBody } from "./apiRequest";
import { changeMyPassword as changeMyPasswordApi } from "./authService";
import { useMock } from "./config";

export async function getUsers(params = {}) {
  const { page = 1, size = 20 } = params || {};
  if (useMock) return mockGetUsers(page, size);
  return unwrapApiBody(
    await apiRequest.get("/api/users", { params: { page, size } }),
  );
}

export async function getUserById(params) {
  const { id } = normalizeIdParams(params);
  if (useMock) return mockGetUserById(id);
  return unwrapApiBody(await apiRequest.get(`/api/users/${id}`));
}

export async function createUser(payload) {
  const { id, password, userName, orgId, roleIds = [] } = payload || {};
  const body = { id, password, userName, orgId, roleIds };
  if (useMock) return mockCreateUser(body);
  return apiRequest.post("/api/users", body);
}

export async function updateUser(params, legacyPayload) {
  const { id, userName, orgId, roleIds = [] } = normalizeUserUpdateParams(
    params,
    legacyPayload,
  );
  const body = { userName, orgId, roleIds };
  if (useMock) return mockUpdateUser(id, body);
  return apiRequest.put(`/api/users/${id}`, body);
}

export async function disableUser(params) {
  const { id } = normalizeIdParams(params);
  if (useMock) return mockDeleteUser(id);
  return apiRequest.delete(`/api/users/${id}`);
}

export async function unlockUser(params) {
  const { id } = normalizeIdParams(params);
  if (useMock) return mockUnlockUser(id);
  return apiRequest.put(`/api/users/${id}/unlock`, {});
}

export async function resetUserPassword(params, legacyPayload) {
  const { id, newPassword } = normalizeResetPasswordParams(
    params,
    legacyPayload,
  );
  const body = { newPassword };
  if (useMock) return mockResetUserPassword(id, newPassword);
  return apiRequest.put(`/api/users/${id}/password`, body);
}

export async function changeMyPassword(payload) {
  const { id = getStoredUserId(), oldPassword, newPassword } = payload || {};
  const body = { id, oldPassword, newPassword };
  if (useMock) return mockChangeMyPassword(oldPassword, newPassword);
  return changeMyPasswordApi(body);
}

export async function getAccountChangeRequests() {
  if (useMock) return mockGetAccountChangeRequests();
  return [];
}

/**
 * 查詢所有使用者（分頁）
 * @param {number} page - 頁碼，預設 1
 * @param {number} size - 每頁筆數，預設 20
 * @returns {Promise} - 使用者分頁列表
 */
export const GetUsers = (page = 1, size = 20) => getUsers({ page, size });

/**
 * 查詢單一使用者
 * @param {string} id - 使用者 ID，1 到 7 位數字
 * @returns {Promise} - 使用者資料
 */
export const GetUserById = (id) => getUserById({ id });

/**
 * 新增使用者（需審核）
 * @param {Object} data - 新增使用者資料
 * @returns {Promise} - 新增使用者申請結果
 */
export const CreateUser = (data) => createUser(data);

/**
 * 申請修改使用者（需審核）
 * @param {string} id - 使用者 ID，1 到 7 位數字
 * @param {Object} data - 修改使用者資料
 * @returns {Promise} - 修改使用者申請結果
 */
export const UpdateUser = (id, data) => updateUser(id, data);

/**
 * 申請停用使用者（需審核）
 * @param {string} id - 使用者 ID，1 到 7 位數字
 * @returns {Promise} - 停用使用者申請結果
 */
export const DeleteUser = (id) => disableUser({ id });

/**
 * 解鎖使用者
 * @param {string} id - 使用者 ID，1 到 7 位數字
 * @returns {Promise} - 解鎖結果
 */
export const UnlockUser = (id) => unlockUser({ id });

/**
 * 重設使用者密碼
 * @param {string} id - 使用者 ID，1 到 7 位數字
 * @param {string} newPassword - 新密碼
 * @returns {Promise} - 重設密碼結果
 */
export const ResetUserPassword = (id, newPassword) =>
  resetUserPassword(id, { newPassword });

/**
 * 修改自己的密碼
 * @param {string} oldPassword - 舊密碼
 * @param {string} newPassword - 新密碼
 * @returns {Promise} - 修改密碼結果
 */
export const ChangeMyPassword = (params, newPassword) => {
  if (params && typeof params === "object") return changeMyPassword(params);
  return changeMyPassword({ oldPassword: params, newPassword });
};

export const GetAccountChangeRequests = () => getAccountChangeRequests();

function normalizeIdParams(params) {
  if (params && typeof params === "object") return params;
  return { id: params };
}

function normalizeUserUpdateParams(params, legacyPayload) {
  if (legacyPayload) return { id: params, ...legacyPayload };
  return params || {};
}

function normalizeResetPasswordParams(params, legacyPayload) {
  if (legacyPayload) return { id: params, ...legacyPayload };
  return params || {};
}

function getStoredUserId() {
  return readAuthStorage()?.userId || "";
}
