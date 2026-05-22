export const STATUS_LABEL_MAP = {
  ACTIVE: "已啟用",
  DISABLED: "已停用",
  DELETED: "已刪除",
  LOCKED: "已鎖定",
  PENDING: "待審核",
  APPROVED: "核准",
  REJECTED: "駁回",
  CANCELLED: "取消",
};

export const ACTION_LABEL_MAP = {
  CREATE: "新增",
  UPDATE: "修改",
  DELETE: "刪除",
  DISABLE: "停用",
  SUBMIT: "送審",
  LOGIN: "登入",
  LOGOUT: "登出",
};

export const TARGET_TYPE_LABEL_MAP = {
  USER: "帳號",
  ORGANIZATION: "組織",
  COPY: "文案",
  COPY_CATEGORY: "文案分類",
};

export const CLICK_ACTION_OPTIONS = [
  { label: "無點擊行為", value: "NONE" },
  { label: "開啟網址", value: "OPEN_URL" },
  { label: "開啟指定頁面", value: "OPEN_PAGE" },
];

export const EXPIRATION_TYPE_OPTIONS = [
  { label: "不設定", value: "NONE" },
  { label: "保留月數", value: "RETENTION_MONTHS" },
  { label: "指定到期時間", value: "EXPIRED_AT" },
];
