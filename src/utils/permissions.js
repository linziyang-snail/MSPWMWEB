import { normalizeRoles } from "@/utils/authRoles";

export const ROLE_PERMISSION_MAP = {
  ADMIN: [
    "USER_VIEW",
    "USER_CREATE",
    "USER_UPDATE",
    "USER_DELETE",
    "USER_UNLOCK",
    "USER_RESET_PASSWORD",
    "ORG_VIEW",
    "ORG_CREATE",
    "ORG_UPDATE",
    "ORG_DELETE",
    "ROLE_VIEW",
    "APPROVAL_HISTORY_VIEW",
    "OPERATION_LOG_VIEW",
  ],
  MANAGER: [
    "APPROVAL_VIEW",
    "APPROVAL_APPROVE",
    "APPROVAL_REJECT",
    "APPROVAL_HISTORY_VIEW",
  ],
  USER: ["COPY_SUBMIT", "APPROVAL_HISTORY_VIEW"],
};

export function getPermissionsByRoles(roles = []) {
  return [
    ...new Set(
      normalizeRoles(roles).flatMap((role) => ROLE_PERMISSION_MAP[role] || []),
    ),
  ];
}

export function hasPermission(roles = [], permission) {
  if (!permission) return true;
  return getPermissionsByRoles(roles).includes(permission);
}
