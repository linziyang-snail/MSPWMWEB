export const CHANGE_REQUEST_STATUSES = ["PENDING", "APPROVED", "REJECTED", "CANCELED"];
export const CHANGE_REQUEST_ACTIONS = ["CREATE", "UPDATE", "DELETE"];
export const OPERATION_HISTORY_TARGET_TYPES = ["USER", "ORGANIZATION"];

export function safeParsePayload(payload) {
  if (!payload) return {};
  if (typeof payload === "object") return payload;
  const normalizedPayload = String(payload).trim();
  if (!normalizedPayload) return {};
  try {
    return JSON.parse(normalizedPayload);
  } catch {
    return {};
  }
}

export function getChangeRequestActionLabel(action = "") {
  const normalizedAction = String(action || "").toUpperCase();
  return (
    {
      CREATE: "新增",
      UPDATE: "編輯",
      DELETE: "刪除",
    }[normalizedAction] || action || "-"
  );
}

export function getChangeRequestStatusLabel(status = "") {
  const normalizedStatus = String(status || "").toUpperCase();
  return (
    {
      PENDING: "待審核",
      APPROVED: "已核准",
      REJECTED: "已駁回",
      CANCELED: "已取消",
    }[normalizedStatus] || status || "-"
  );
}

export function getChangeRequestTargetTypeLabel(targetType = "") {
  const normalizedTargetType = String(targetType || "").toUpperCase();
  return (
    {
      USER: "帳號",
      ORGANIZATION: "科別",
    }[normalizedTargetType] || targetType || "-"
  );
}

export function getChangedFieldsLabel(row = {}) {
  const normalizedAction = String(row.action || "").toUpperCase();
  return (
    {
      CREATE: "基本資料",
      UPDATE: "基本資料",
      DELETE: "狀態",
    }[normalizedAction] || "-"
  );
}

export function normalizeChangeRequestForHistory(row = {}) {
  const payload = safeParsePayload(row.payload);
  const targetType = String(row.targetType || "").toUpperCase();
  const action = String(row.action || "").toUpperCase();
  const status = String(row.status || "").toUpperCase();
  const displayDate = row.closedAt || row.createdAt || "";
  const targetDisplay = getChangeRequestTargetDisplay(row, payload, targetType);

  return {
    ...row,
    id: row.id,
    displayDate,
    createdAt: row.createdAt || displayDate,
    operator: row.requesterId || "-",
    reviewer: row.reviewerId || "-",
    targetType,
    targetTypeLabel: getChangeRequestTargetTypeLabel(targetType),
    targetDisplay,
    action,
    actionLabel: getChangeRequestActionLabel(action),
    status,
    statusLabel: getChangeRequestStatusLabel(status),
    changedFieldsLabel: getChangedFieldsLabel({ ...row, action }),
    remark: row.remark || "-",
    module: getChangeRequestTargetTypeLabel(targetType),
    userId: row.requesterId || "-",
    userName: row.requesterId || "-",
    description: targetDisplay,
  };
}

export function sortChangeRequestsByDisplayDateDesc(rows = []) {
  return [...rows].sort((a, b) =>
    String(b.displayDate || b.closedAt || b.createdAt || "").localeCompare(
      String(a.displayDate || a.closedAt || a.createdAt || ""),
    ),
  );
}

function getChangeRequestTargetDisplay(row = {}, payload = {}, targetType = "") {
  if (targetType === "USER") return getUserTargetDisplay(row, payload);
  if (targetType === "ORGANIZATION") return getOrganizationTargetDisplay(row, payload);
  return String(row.targetId || "-");
}

function getUserTargetDisplay(row = {}, payload = {}) {
  const userId = payload.userId || payload.id || row.targetId || "";
  const userName = payload.userName || "";
  if (userId && userName) return `${userId} / ${userName}`;
  return userId || row.targetId || "-";
}

function getOrganizationTargetDisplay(row = {}, payload = {}) {
  const orgName = payload.orgName || payload.name || payload.categoryName || "";
  if (row.targetId && orgName) return `${row.targetId} / ${orgName}`;
  return row.targetId || orgName || "-";
}
