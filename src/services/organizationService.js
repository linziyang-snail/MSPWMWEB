import apiRequest, { unwrapApiBody } from "./apiRequest";

export async function getOrganizations() {
  return unwrapApiBody(await apiRequest.get("/api/organizations"));
}

export async function createOrganization(payload) {
  const { orgName, orgType } = payload || {};
  const body = { orgName, orgType };
  return apiRequest.post("/api/organizations", body);
}

export async function updateOrganization(params, legacyPayload) {
  const { id, orgName } = normalizeOrganizationUpdateParams(
    params,
    legacyPayload,
  );
  const body = { orgName };
  return apiRequest.put(`/api/organizations/${id}`, body);
}

export async function disableOrganization(params) {
  const { id } = normalizeIdParams(params);
  return apiRequest.delete(`/api/organizations/${id}`);
}

/**
 * 查詢可管理的組織列表
 * @returns {Promise} - 組織列表
 */
export const GetOrganizations = () => getOrganizations();

/**
 * 新增組織
 * @param {Object} data - 新增組織資料
 * @returns {Promise} - 新增組織結果
 */
export const CreateOrganization = (data) => createOrganization(data);

/**
 * 修改組織
 * @param {number} id - 組織 ID
 * @param {Object} data - 修改組織資料
 * @returns {Promise} - 修改組織結果
 */
export const UpdateOrganization = (id, data) =>
  updateOrganization(id, data);

/**
 * 停用組織
 * @param {number} id - 組織 ID
 * @returns {Promise} - 停用組織結果
 */
export const DisableOrganization = (id) => disableOrganization({ id });

function normalizeIdParams(params) {
  if (params && typeof params === "object") return params;
  return { id: params };
}

function normalizeOrganizationUpdateParams(params, legacyPayload) {
  if (legacyPayload) return { id: params, ...legacyPayload };
  return params || {};
}
