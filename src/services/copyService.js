import apiRequest from "./apiRequest";

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
  return apiRequest.post("/api/copies", body);
}

export const getCompatibleCopies = () => {
  return Promise.resolve([]);
};

export const getCompatibleCopyCounts = () => {
  return Promise.resolve({});
};

export const createCompatibleCopy = (payload) => {
  return submitCopy(payload);
};

export const cancelCompatibleCopy = () => {
  return Promise.reject(new Error("正式 API 尚未提供文案取消送審 endpoint"));
};

export const approveCompatibleCopy = () => {
  return Promise.reject(new Error("正式 API 尚未提供文案核准 endpoint"));
};

export const rejectCompatibleCopy = () => {
  return Promise.reject(new Error("正式 API 尚未提供文案駁回 endpoint"));
};

/**
 * 文案送審
 * @param {Object} data - 文案送審資料
 * @returns {Promise} - 文案送審結果
 */
export const SubmitCopy = (data) => submitCopy(data);
