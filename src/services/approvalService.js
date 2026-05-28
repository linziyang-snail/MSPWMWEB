import apiRequest, { unwrapApiBody } from "./apiRequest";

export async function getChangeRequests(params = {}) {
  const { targetType, status = "PENDING" } = params || {};
  return unwrapApiBody(
    await apiRequest.get("/api/change-requests", {
      params: pruneEmptyParams({ targetType, status }),
    }),
  );
}

export async function getPendingChangeRequests(params = {}) {
  return getChangeRequests({ ...params, status: params?.status || "PENDING" });
}

export async function getChangeRequestHistory(params = {}) {
  const { targetType, targetId } = params || {};
  if (!hasRequiredHistoryParams(targetType, targetId)) return [];
  return unwrapApiBody(
    await apiRequest.get("/api/change-requests/history", {
      params: { targetType, targetId },
    }),
  );
}

export async function searchChangeRequests(params = {}) {
  const {
    targetId,
    startDate,
    endDate,
    page = 1,
    size = 20,
  } = params || {};
  return unwrapApiBody(
    await apiRequest.get("/api/change-requests/search", {
      params: pruneEmptyParams({
        targetId,
        startDate: toYyyyMmDd(startDate),
        endDate: toYyyyMmDd(endDate),
        page,
        size: clampPageSize(size),
      }),
    }),
  );
}

export async function approveChangeRequest(params) {
  const { id } = normalizeIdParams(params);
  return apiRequest.put(`/api/change-requests/${id}/approve`, {});
}

export async function rejectChangeRequest(params, legacyPayload) {
  const { id, remark = "" } = normalizeRejectParams(params, legacyPayload);
  const body = { remark };
  return apiRequest.put(`/api/change-requests/${id}/reject`, body);
}

export async function cancelChangeRequest(params) {
  const { id } = normalizeIdParams(params);
  return apiRequest.put(`/api/change-requests/${id}/cancel`, {});
}

/**
 * 查詢待審核列表
 * @param {string} targetType - 審核目標類型
 * @returns {Promise} - 待審核列表
 */
export const GetPendingChangeRequests = (targetType) =>
  getPendingChangeRequests({ targetType });

export const GetChangeRequests = (params) => getChangeRequests(params);

/**
 * 查詢特定對象的審核歷史
 * @param {string} targetType - 審核目標類型
 * @param {string} targetId - 審核目標 ID
 * @returns {Promise} - 審核歷史列表
 */
export const GetChangeRequestHistory = (targetType, targetId) =>
  getChangeRequestHistory({ targetType, targetId });

export const SearchChangeRequests = (params) => searchChangeRequests(params);

/**
 * 放行審核申請
 * @param {number} id - 審核申請 ID
 * @returns {Promise} - 放行結果
 */
export const ApproveChangeRequest = (id) => approveChangeRequest({ id });

/**
 * 駁回審核申請
 * @param {number} id - 審核申請 ID
 * @param {string} remark - 駁回原因
 * @returns {Promise} - 駁回結果
 */
export const RejectChangeRequest = (id, remark) =>
  rejectChangeRequest(id, { remark });

/**
 * 取消審核申請
 * @param {number} id - 審核申請 ID
 * @returns {Promise} - 取消結果
 */
export const CancelChangeRequest = (id) => cancelChangeRequest({ id });

function normalizeIdParams(params) {
  if (params && typeof params === "object") return params;
  return { id: params };
}

function normalizeRejectParams(params, legacyPayload) {
  if (legacyPayload) return { id: params, ...legacyPayload };
  return params || {};
}

function hasRequiredHistoryParams(targetType, targetId) {
  return Boolean(String(targetType || "").trim() && String(targetId || "").trim());
}

function clampPageSize(size) {
  const parsedSize = Number(size);
  if (!Number.isFinite(parsedSize) || parsedSize <= 0) return 20;
  return Math.min(Math.trunc(parsedSize), 100);
}

function pruneEmptyParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

function toYyyyMmDd(value) {
  if (!value) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const date = String(value.getDate()).padStart(2, "0");
    return `${value.getFullYear()}${month}${date}`;
  }
  return String(value).replaceAll("/", "").replaceAll("-", "").slice(0, 8);
}
