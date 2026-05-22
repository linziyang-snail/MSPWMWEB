import { mockGetOperationHistory } from "@/mocks/api/operationHistoryApi";

import { useMock } from "./config";

export const GetOperationHistory = (params = {}) => {
  if (useMock) return mockGetOperationHistory(params);
  return Promise.reject(new Error("正式 API 尚未提供操作歷程查詢 endpoint"));
};
