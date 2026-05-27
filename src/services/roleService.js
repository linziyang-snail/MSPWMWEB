import apiRequest, { unwrapApiBody } from "./apiRequest";

export async function getRoles() {
  return unwrapApiBody(await apiRequest.get("/api/roles"));
}

/**
 * 查詢所有角色
 * @returns {Promise} - 角色列表
 */
export const GetRoles = () => getRoles();
