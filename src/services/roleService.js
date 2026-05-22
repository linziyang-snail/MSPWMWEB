import { mockGetRoles } from "@/mocks/api/roleApi";

import apiRequest from "./apiRequest";
import { useMock } from "./config";

export async function getRoles() {
  if (useMock) return mockGetRoles();
  return apiRequest.get("/api/roles");
}

/**
 * 查詢所有角色
 * @returns {Promise} - 角色列表
 */
export const GetRoles = () => getRoles();
