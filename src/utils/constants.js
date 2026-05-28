export const ROLE = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  USER: "USER",
};

export const roleLabelMap = {
  ADMIN: "超級管理員",
  MANAGER: "覆核主管",
  USER: "經辦人員",
};

export const roleIdMap = {
  ADMIN: 1,
  MANAGER: 2,
  USER: 3,
};

export const orgTypeLabelMap = {
  DEPARTMENT: "部門",
  SECTION: "科別",
  部門: "部門",
  科別: "科別",
};

export const orgTypeValueMap = {
  DEPARTMENT: "DEPARTMENT",
  SECTION: "SECTION",
  部門: "DEPARTMENT",
  科別: "SECTION",
};

export const organizationStatusValueMap = {
  ACTIVE: "ACTIVE",
  啟用: "ACTIVE",
  DISABLED: "DISABLED",
  INACTIVE: "DISABLED",
  停用: "DISABLED",
  PENDING: "PENDING",
  PENDING_APPROVAL: "PENDING",
  審核中: "PENDING",
  REJECTED: "REJECTED",
  已駁回: "REJECTED",
};

export const statusLabelMap = {
  ACTIVE: "啟用",
  INACTIVE: "停用",
  DISABLED: "停用",
  DELETED: "已刪除",
  LOCKED: "已鎖定",
  PENDING: "待覆核",
  PENDING_APPROVAL: "審核中",
  PENDING_MULTI: "待覆核",
  APPROVED: "已放行",
  REJECTED: "已駁回",
  CANCELED: "已取消",
  啟用: "啟用",
  停用: "停用",
  審核中: "審核中",
};

export const requestStatusLabelMap = {
  PENDING: "待覆核",
  APPROVED: "已放行",
  REJECTED: "已駁回",
  CANCELED: "已取消",
};

export const requestActionLabelMap = {
  CREATE: "新增",
  UPDATE: "修改",
  DELETE: "停用",
  DISABLE: "停用",
  SUBMIT: "送審",
  LOGIN: "登入",
  LOGOUT: "登出",
};

export const targetTypeLabelMap = {
  USER: "使用者",
  ORGANIZATION: "組織",
  COPY: "文案",
  COPY_CATEGORY: "文案分類",
};

export const clickActionLabelMap = {
  NONE: "無",
  OPEN_URL: "開啟連結",
  OPEN_PAGE: "跳轉頁面",
};

export const expirationTypeLabelMap = {
  NONE: "無",
  RETENTION_MONTHS: "保存時效",
  EXPIRED_AT: "指定到期日",
};

export const copyStatusLabelMap = {
  APPROVED: "已放行",
  PENDING: "待覆核",
  REJECTED: "已駁回",
  CANCELED: "已取消",
  DISABLED: "已停用",
};

export const CLICK_ACTION_OPTIONS = [
  { label: clickActionLabelMap.NONE, value: "NONE" },
  { label: clickActionLabelMap.OPEN_URL, value: "OPEN_URL" },
  { label: clickActionLabelMap.OPEN_PAGE, value: "OPEN_PAGE" },
];

export const EXPIRATION_TYPE_OPTIONS = [
  { label: expirationTypeLabelMap.NONE, value: "NONE" },
  { label: expirationTypeLabelMap.RETENTION_MONTHS, value: "RETENTION_MONTHS" },
  { label: expirationTypeLabelMap.EXPIRED_AT, value: "EXPIRED_AT" },
];

export const STATUS_LABEL_MAP = statusLabelMap;
export const ACTION_LABEL_MAP = requestActionLabelMap;
export const TARGET_TYPE_LABEL_MAP = targetTypeLabelMap;

export function normalizeOrgTypeValue(orgType) {
  const key = String(orgType || "").trim();
  return orgTypeValueMap[key] || key;
}

export function normalizeOrganizationStatusValue(status) {
  const key = String(status || "").trim();
  return organizationStatusValueMap[key] || key;
}

export function isSectionOrganization(org = {}) {
  return normalizeOrgTypeValue(org.orgType) === "SECTION";
}

export const isSection = isSectionOrganization;

export function isDepartmentOrganization(org = {}) {
  return normalizeOrgTypeValue(org.orgType) === "DEPARTMENT";
}

export const isDepartment = isDepartmentOrganization;

export function isActiveOrganization(org = {}) {
  return normalizeOrganizationStatusValue(org.status) === "ACTIVE";
}

export function isActiveStatus(status) {
  return normalizeOrganizationStatusValue(status) === "ACTIVE";
}

export function isPendingOrganization(org = {}) {
  return normalizeOrganizationStatusValue(org.status) === "PENDING";
}

export function isPendingStatus(status) {
  return normalizeOrganizationStatusValue(status) === "PENDING";
}

export function isDisabledOrganization(org = {}) {
  return normalizeOrganizationStatusValue(org.status) === "DISABLED";
}

export function isDisabledStatus(status) {
  return normalizeOrganizationStatusValue(status) === "DISABLED";
}

export function isActiveSectionOrganization(org = {}) {
  return isSectionOrganization(org) && isActiveOrganization(org);
}
