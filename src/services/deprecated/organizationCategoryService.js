import {
  mockAddOrganizationCategory,
  mockAssignOrganizationCategories,
  mockGetOrganizationCategories,
  mockRemoveOrganizationCategory,
} from "@/mocks/api/organizationCategoryApi";

import apiRequest, { unwrapApiBody } from "../apiRequest";
import { useMock } from "../config";

/**
 * @deprecated Swagger 標註 OrganizationCategory API 已廢棄，使用前需向後端確認替代 API。
 */
export async function getOrganizationCategories(params) {
  const { orgId } = normalizeOrgParams(params);
  if (useMock) return mockGetOrganizationCategories(orgId);
  return unwrapApiBody(await apiRequest.get(`/api/organizations/${orgId}/categories`));
}

/**
 * @deprecated Swagger 標註 OrganizationCategory API 已廢棄，使用前需向後端確認替代 API。
 */
export async function assignOrganizationCategories(params, legacyPayload) {
  const { orgId, categoryIds = [] } = normalizeOrgCategoryPayload(
    params,
    legacyPayload,
  );
  const body = { orgId, categoryIds };
  if (useMock) return mockAssignOrganizationCategories(orgId, categoryIds);
  return apiRequest.put(`/api/organizations/${orgId}/categories`, body);
}

/**
 * @deprecated Swagger 標註 OrganizationCategory API 已廢棄，使用前需向後端確認替代 API。
 */
export async function addOrganizationCategory(params, legacyCategoryId) {
  const { orgId, categoryId } = normalizeOrgCategoryActionParams(
    params,
    legacyCategoryId,
  );
  if (useMock) return mockAddOrganizationCategory(orgId, categoryId);
  return apiRequest.post(
    `/api/organizations/${orgId}/categories/${categoryId}`,
    {},
  );
}

/**
 * @deprecated Swagger 標註 OrganizationCategory API 已廢棄，使用前需向後端確認替代 API。
 */
export async function removeOrganizationCategory(params, legacyCategoryId) {
  const { orgId, categoryId } = normalizeOrgCategoryActionParams(
    params,
    legacyCategoryId,
  );
  if (useMock) return mockRemoveOrganizationCategory(orgId, categoryId);
  return apiRequest.delete(
    `/api/organizations/${orgId}/categories/${categoryId}`,
  );
}

/**
 * 查詢組織已綁定的文案分類
 * @deprecated OpenAPI 標記為已廢棄
 * @param {number} orgId - 組織 ID
 * @returns {Promise} - 組織綁定文案分類資料
 */
export const GetOrganizationCategories = (orgId) =>
  getOrganizationCategories({ orgId });

/**
 * 指派文案分類給組織
 * @deprecated OpenAPI 標記為已廢棄
 * @param {number} orgId - 組織 ID
 * @param {number[]} categoryIds - 文案分類 ID 陣列
 * @returns {Promise} - 指派結果
 */
export const AssignOrganizationCategories = (orgId, categoryIds) =>
  assignOrganizationCategories(orgId, { categoryIds });

/**
 * 新增單筆組織與文案分類綁定
 * @deprecated OpenAPI 標記為已廢棄
 * @param {number} orgId - 組織 ID
 * @param {number} categoryId - 文案分類 ID
 * @returns {Promise} - 新增綁定結果
 */
export const AddOrganizationCategory = (orgId, categoryId) =>
  addOrganizationCategory(orgId, categoryId);

/**
 * 移除單筆組織與文案分類綁定
 * @deprecated OpenAPI 標記為已廢棄
 * @param {number} orgId - 組織 ID
 * @param {number} categoryId - 文案分類 ID
 * @returns {Promise} - 移除綁定結果
 */
export const RemoveOrganizationCategory = (orgId, categoryId) =>
  removeOrganizationCategory(orgId, categoryId);

function normalizeOrgParams(params) {
  if (params && typeof params === "object") return params;
  return { orgId: params };
}

function normalizeOrgCategoryPayload(params, legacyPayload) {
  if (legacyPayload) return { orgId: params, ...legacyPayload };
  return params || {};
}

function normalizeOrgCategoryActionParams(params, legacyCategoryId) {
  if (legacyCategoryId) return { orgId: params, categoryId: legacyCategoryId };
  return params || {};
}
