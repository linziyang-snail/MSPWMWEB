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

export const orgTypeLabelMap = {
  DEPARTMENT: "部門",
  SECTION: "科別",
};

export const statusLabelMap = {
  ACTIVE: "啟用",
  INACTIVE: "停用",
  DISABLED: "停用",
  DELETED: "已刪除",
  LOCKED: "已鎖定",
  PENDING: "待覆核",
  PENDING_MULTI: "待覆核",
  APPROVED: "已放行",
  REJECTED: "已駁回",
  CANCELLED: "已取消",
};

export const requestStatusLabelMap = {
  PENDING: "待覆核",
  APPROVED: "已放行",
  REJECTED: "已駁回",
  CANCELLED: "已取消",
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
  DISABLED: "已停用",
  CANCELLED: "已取消",
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
