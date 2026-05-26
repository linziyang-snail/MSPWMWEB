import {
  mockApproveChangeRequest,
  mockCancelChangeRequest,
  mockGetChangeRequestHistory,
  mockGetPendingChangeRequests,
  mockRejectChangeRequest,
} from "@/mocks/api/approvalApi";

import apiRequest, { unwrapApiBody } from "./apiRequest";
import { useMock } from "./config";

export async function getPendingChangeRequests(params = {}) {
  if (useMock) return mockGetPendingChangeRequests(params.targetType);
  return unwrapApiBody(await apiRequest.get("/api/change-requests", { params }));
}

export async function getChangeRequestHistory(params = {}) {
  if (useMock) {
    return mockGetChangeRequestHistory(params.targetType, params.targetId);
  }
  return unwrapApiBody(
    await apiRequest.get("/api/change-requests/history", { params }),
  );
}

export async function approveChangeRequest(params) {
  const { id } = normalizeIdParams(params);
  if (useMock) return mockApproveChangeRequest(id);
  return apiRequest.put(`/api/change-requests/${id}/approve`, {});
}

export async function rejectChangeRequest(params, legacyPayload) {
  const { id, remark = "" } = normalizeRejectParams(params, legacyPayload);
  const body = { remark };
  if (useMock) return mockRejectChangeRequest(id, remark);
  return apiRequest.put(`/api/change-requests/${id}/reject`, body);
}

export async function cancelChangeRequest(params) {
  const { id } = normalizeIdParams(params);
  if (useMock) return mockCancelChangeRequest(id);
  return apiRequest.put(`/api/change-requests/${id}/cancel`, {});
}

/**
 * 查詢待審核列表
 * @param {string} targetType - 審核目標類型
 * @returns {Promise} - 待審核列表
 */
export const GetPendingChangeRequests = (targetType) =>
  getPendingChangeRequests({ targetType });

/**
 * 查詢特定對象的審核歷史
 * @param {string} targetType - 審核目標類型
 * @param {string} targetId - 審核目標 ID
 * @returns {Promise} - 審核歷史列表
 */
export const GetChangeRequestHistory = (targetType, targetId) =>
  getChangeRequestHistory({ targetType, targetId });

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
