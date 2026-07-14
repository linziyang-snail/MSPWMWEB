import { readAuthStorage } from "@/utils/authStorage";

import apiRequest, { unwrapApiBody } from "./apiRequest";
import { changeMyPassword as changeMyPasswordApi } from "./authService";

export async function getUsers(params = {}) {
  const { page = 1, size = 20, status } = params || {};
  return unwrapApiBody(
    await apiRequest.get("/api/users", {
      params: pruneEmptyParams({ page, size: clampUserPageSize(size), status }),
    }),
  );
}

export async function getAllUsers(params = {}) {
  const size = 100;
  const content = [];
  for (let page = 1; page <= 100; page += 1) {
    const response = await getUsers({ ...params, page, size, status: undefined });
    const rows = response?.content || [];
    content.push(...rows);
    if (rows.length < size) break;
  }
  return content;
}

export function getUsersForOrganization(users = [], organizationId) {
  return users.filter(
    (user) =>
      String(user.orgId ?? user.organizationId ?? user.organization?.id ?? "") ===
      String(organizationId),
  );
}

export async function searchUsersByKeyword(params = {}) {
  const {
    page = 1,
    size = 20,
    status = "ACTIVE",
    keyword = "",
  } = params || {};
  const normalizedKeyword = String(keyword).trim();
  if (!normalizedKeyword) {
    throw new Error("keyword is required");
  }
  const statuses = normalizeArrayParam(status);
  if (statuses.length > 1) {
    const pages = await Promise.all(
      statuses.map((singleStatus) =>
        searchUsersByKeyword({
          ...params,
          page,
          size,
          status: singleStatus,
          keyword: normalizedKeyword,
        }),
      ),
    );
    const content = mergeUsersById(pages.flatMap((pageData) => pageData?.content || []));
    return {
      content,
      totalElements: pages.reduce((sum, pageData) => sum + Number(pageData?.totalElements || 0), 0),
      page,
      size: clampUserPageSize(size),
    };
  }
  return unwrapApiBody(
    await apiRequest.get("/api/users/keyword", {
      params: pruneEmptyParams({
        page,
        size: clampUserPageSize(size),
        status: statuses[0] || status,
        keyword: normalizedKeyword,
      }),
    }),
  );
}

export async function getUserById(params) {
  const { id } = normalizeIdParams(params);
  return unwrapApiBody(await apiRequest.get(`/api/users/${id}`));
}

export async function createUser(payload) {
  const { id, password, userName, orgId, roleIds = [] } = payload || {};
  const body = { id, password, userName, orgId, roleIds };
  return apiRequest.post("/api/users", body);
}

export async function updateUser(params, legacyPayload) {
  const { id, userName, orgId, roleIds = [] } = normalizeUserUpdateParams(
    params,
    legacyPayload,
  );
  const body = { userName, orgId, roleIds };
  return apiRequest.put(`/api/users/${id}`, body);
}

export async function disableUser(params) {
  const { id } = normalizeIdParams(params);
  return apiRequest.delete(`/api/users/${id}`);
}

export async function resetUserPassword(params, legacyPayload) {
  const { id, newPassword } = normalizeResetPasswordParams(
    params,
    legacyPayload,
  );
  const body = { newPassword };
  return apiRequest.put(`/api/users/${id}/password`, body);
}

export async function changeMyPassword(payload) {
  const { id = getStoredUserId(), oldPassword, newPassword } = payload || {};
  const body = { id, oldPassword, newPassword };
  return changeMyPasswordApi(body);
}

export async function getAccountChangeRequests(params = "PENDING") {
  const query = typeof params === "string"
    ? { status: params }
    : params || {};
  const {
    status = "PENDING",
    action,
    page: pageNumber = 1,
    size = 100,
  } = query;
  const page = unwrapApiBody(
    await apiRequest.get("/api/change-requests", {
      params: pruneEmptyParams({
        targetType: "USER",
        status: normalizeArrayParam(status),
        action: normalizeArrayParam(action),
        page: pageNumber,
        size: clampUserPageSize(size),
      }),
    }),
  );
  const rows = Array.isArray(page) ? page : page?.content || [];
  if (!Array.isArray(rows)) return [];
  const userRows = rows.filter((item) => {
    const targetType = item?.targetType || "USER";
    return targetType === "USER";
  });
  Object.defineProperty(userRows, "totalElements", {
    value: Number(page?.totalElements ?? userRows.length),
    enumerable: false,
  });
  return userRows;
}

function normalizeArrayParam(value) {
  if (Array.isArray(value)) return value.filter((item) => item !== undefined && item !== null && item !== "");
  if (value === undefined || value === null || value === "") return [];
  return [value];
}

function mergeUsersById(rows = []) {
  return Array.from(
    rows.reduce((map, row) => {
      if (!row?.id) return map;
      map.set(String(row.id), row);
      return map;
    }, new Map()).values(),
  );
}

export async function exportUsers() {
  const response = await apiRequest.get("/api/users/export", {
    responseType: "blob",
    headers: {
      Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
  const filename = getDownloadFilename(response?.headers?.["content-disposition"]);
  downloadBlob(response.data, filename);
}

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

function clampUserPageSize(size) {
  const parsedSize = Number(size);
  if (!Number.isFinite(parsedSize) || parsedSize <= 0) return 20;
  return Math.min(Math.trunc(parsedSize), 100);
}

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

function getDownloadFilename(contentDisposition = "") {
  const disposition = String(contentDisposition || "");
  const encodedMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (encodedMatch?.[1]) {
    try {
      return decodeURIComponent(encodedMatch[1]);
    } catch {
      return encodedMatch[1];
    }
  }
  const filenameMatch = disposition.match(/filename="?([^";]+)"?/i);
  if (filenameMatch?.[1] && !filenameMatch[1].startsWith("=?")) {
    return filenameMatch[1];
  }
  return "使用者列表.xlsx";
}

function downloadBlob(blob, filename) {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "使用者列表.xlsx";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function pruneEmptyParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}
