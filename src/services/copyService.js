import {
  mockApproveCompatibleCopy,
  mockCancelCompatibleCopy,
  mockCreateCompatibleCopy,
  mockGetCompatibleCopies,
  mockGetCompatibleCopyCounts,
  mockRejectCompatibleCopy,
  mockSubmitCopy,
} from "@/mocks/api/copyApi";

import apiRequest from "./apiRequest";
import { useMock } from "./config";

export async function submitCopy(payload) {
  const {
    number,
    title,
    content,
    nnbCategory,
    wbkCategory,
    url,
    clickAction,
    expirationType,
    retentionMonths,
    expiredAt,
  } = payload || {};
  const body = {
    number,
    title,
    content,
    nnbCategory,
    wbkCategory,
    url,
    clickAction,
    expirationType,
    retentionMonths,
    expiredAt,
  };
  if (useMock) return mockSubmitCopy(body);
  return apiRequest.post("/api/copies", body);
}

export const getCompatibleCopies = () => {
  if (useMock) return mockGetCompatibleCopies();
  return Promise.resolve([]);
};

export const getCompatibleCopyCounts = () => {
  if (useMock) return mockGetCompatibleCopyCounts();
  return Promise.resolve({});
};

export const createCompatibleCopy = (payload) => {
  if (useMock) return mockCreateCompatibleCopy(payload);
  return submitCopy(payload);
};

export const cancelCompatibleCopy = (id) => {
  if (useMock) return mockCancelCompatibleCopy(id);
  return Promise.reject(new Error("正式 API 尚未提供文案取消送審 endpoint"));
};

export const approveCompatibleCopy = (id) => {
  if (useMock) return mockApproveCompatibleCopy(id);
  return Promise.reject(new Error("正式 API 尚未提供文案核准 endpoint"));
};

export const rejectCompatibleCopy = (id, reason) => {
  if (useMock) return mockRejectCompatibleCopy(id, reason);
  return Promise.reject(new Error("正式 API 尚未提供文案駁回 endpoint"));
};

/**
 * 文案送審
 * @param {Object} data - 文案送審資料
 * @returns {Promise} - 文案送審結果
 */
export const SubmitCopy = (data) => submitCopy(data);
