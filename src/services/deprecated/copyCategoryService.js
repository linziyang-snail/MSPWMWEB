import {
  mockCreateCopyCategory,
  mockDisableCopyCategory,
  mockGetCopyCategoriesByDepartmentId,
  mockUpdateCopyCategory,
} from "@/mocks/api/copyCategoryApi";

import apiRequest from "../apiRequest";
import { useMock } from "../config";

/**
 * @deprecated Swagger 標註 CopyCategory API 已廢棄，使用前需向後端確認替代 API。
 */
export async function getCopyCategoriesByDepartment(params) {
  const { departmentId } = normalizeDepartmentParams(params);
  if (useMock) return mockGetCopyCategoriesByDepartmentId(departmentId);
  return apiRequest.get(`/api/departments/copy-categories/${departmentId}`);
}

/**
 * @deprecated Swagger 標註 CopyCategory API 已廢棄，使用前需向後端確認替代 API。
 */
export async function getCopyCategoriesByDepartmentId(params) {
  return getCopyCategoriesByDepartment(params);
}

/**
 * @deprecated Swagger 標註 CopyCategory API 已廢棄，使用前需向後端確認替代 API。
 */
export async function createCopyCategory(payload) {
  const { categoryName } = payload || {};
  const body = { categoryName };
  if (useMock) return mockCreateCopyCategory(categoryName);
  return apiRequest.post("/api/departments/copy-categories", body);
}

/**
 * @deprecated Swagger 標註 CopyCategory API 已廢棄，使用前需向後端確認替代 API。
 */
export async function updateCopyCategory(params, legacyPayload) {
  const { copyCategoryId, categoryName } = normalizeCopyCategoryUpdateParams(
    params,
    legacyPayload,
  );
  const body = { categoryName };
  if (useMock) return mockUpdateCopyCategory(copyCategoryId, categoryName);
  return apiRequest.put(
    `/api/departments/copy-categories/${copyCategoryId}`,
    body,
  );
}

/**
 * @deprecated Swagger 標註 CopyCategory API 已廢棄，使用前需向後端確認替代 API。
 */
export async function disableCopyCategory(params) {
  const { copyCategoryId } = normalizeCopyCategoryIdParams(params);
  if (useMock) return mockDisableCopyCategory(copyCategoryId);
  return apiRequest.delete(
    `/api/departments/copy-categories/${copyCategoryId}`,
  );
}

/**
 * 查詢該部門的文案分類
 * @deprecated Swagger 標註 CopyCategory API 已廢棄，使用前需向後端確認替代 API。
 * @param {number} departmentId - 部門 ID
 * @returns {Promise} - 文案分類列表
 */
export const GetCopyCategoriesByDepartmentId = (departmentId) =>
  getCopyCategoriesByDepartmentId({ departmentId });

/**
 * 新增文案分類
 * @deprecated Swagger 標註 CopyCategory API 已廢棄，使用前需向後端確認替代 API。
 * @param {string} categoryName - 文案分類名稱
 * @returns {Promise} - 新增文案分類結果
 */
export const CreateCopyCategory = (categoryName) =>
  createCopyCategory({ categoryName });

/**
 * 修改文案分類
 * @deprecated Swagger 標註 CopyCategory API 已廢棄，使用前需向後端確認替代 API。
 * @param {number} copyCategoryId - 文案分類 ID
 * @param {string} categoryName - 文案分類名稱
 * @returns {Promise} - 修改文案分類結果
 */
export const UpdateCopyCategory = (copyCategoryId, categoryName) =>
  updateCopyCategory(copyCategoryId, { categoryName });

/**
 * 停用文案分類
 * @deprecated Swagger 標註 CopyCategory API 已廢棄，使用前需向後端確認替代 API。
 * @param {number} copyCategoryId - 文案分類 ID
 * @returns {Promise} - 停用文案分類結果
 */
export const DisableCopyCategory = (copyCategoryId) =>
  disableCopyCategory({ copyCategoryId });

function normalizeDepartmentParams(params) {
  if (params && typeof params === "object") return params;
  return { departmentId: params };
}

function normalizeCopyCategoryIdParams(params) {
  if (params && typeof params === "object") return params;
  return { copyCategoryId: params };
}

function normalizeCopyCategoryUpdateParams(params, legacyPayload) {
  if (legacyPayload) return { copyCategoryId: params, ...legacyPayload };
  return params || {};
}
