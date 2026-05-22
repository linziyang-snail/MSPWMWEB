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
    "COPY_SUBMIT",
    "COPY_CATEGORY_VIEW",
    "COPY_CATEGORY_CREATE",
    "COPY_CATEGORY_UPDATE",
    "COPY_CATEGORY_DELETE",
    "APPROVAL_VIEW",
    "APPROVAL_APPROVE",
    "APPROVAL_REJECT",
    "APPROVAL_CANCEL",
    "APPROVAL_HISTORY_VIEW",
  ],
  REVIEWER: [
    "APPROVAL_VIEW",
    "APPROVAL_APPROVE",
    "APPROVAL_REJECT",
    "APPROVAL_HISTORY_VIEW",
  ],
  EDITOR: ["COPY_SUBMIT", "APPROVAL_HISTORY_VIEW"],
  VIEWER: ["USER_VIEW", "ORG_VIEW", "ROLE_VIEW"],
};

export function getPermissionsByRoles(roles = []) {
  return [...new Set(roles.flatMap((role) => ROLE_PERMISSION_MAP[role] || []))];
}

export function hasPermission(roles = [], permission) {
  if (!permission) return true;
  return getPermissionsByRoles(roles).includes(permission);
}
