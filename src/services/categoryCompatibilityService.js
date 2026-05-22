import { mockGetCompatibleCopyCategories } from "@/mocks/api/copyCategoryApi";

import { useMock } from "./config";

export const GetCompatibleCopyCategories = () => {
  if (useMock) return mockGetCompatibleCopyCategories();
  return Promise.reject(new Error("正式 API 尚未提供科別列表查詢 endpoint"));
};
