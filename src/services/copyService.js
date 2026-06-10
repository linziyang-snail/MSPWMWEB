import {
  approveChangeRequest,
  cancelChangeRequest,
  getChangeRequests,
  rejectChangeRequest,
} from "@/services/approvalService";
import apiRequest from "./apiRequest";

const COPY_STATUSES = ["PENDING", "APPROVED", "REJECTED", "CANCELED"];
const COPY_ACTIONS = ["CREATE", "UPDATE", "DELETE"];

export async function submitCopy(payload) {
  return apiRequest.post("/api/copies", normalizeSubmitCopyPayload(payload));
}

export async function getCopyChangeRequests(params = {}) {
  const {
    status = COPY_STATUSES,
    action,
    page = 1,
    size = 100,
    force = false,
  } = params || {};
  const pageData = await getChangeRequests({
    targetType: "COPY",
    status,
    action,
    page,
    size,
    force,
  });
  const content = (pageData.content || []).map(normalizeCopyChangeRequest);
  return {
    ...pageData,
    content,
    list: content,
    totalElements: Number(pageData.totalElements ?? content.length),
  };
}

export const approveCopyChangeRequest = (id) => approveChangeRequest({ id });

export const rejectCopyChangeRequest = (id, reason = "") =>
  rejectChangeRequest({ id, remark: reason });

export const cancelCopyChangeRequest = (id) => cancelChangeRequest({ id });

function normalizeSubmitCopyPayload(payload = {}) {
  const expirationType = payload.expirationType || "NONE";
  const clickAction = payload.clickAction || "NONE";
  const body = {
    number: String(payload.number ?? payload.code ?? "").trim(),
    title: String(payload.title ?? "").trim(),
    content: String(payload.content ?? "").trim(),
    nnbCategory: payload.nnbCategory || "",
    wbkCategory: payload.wbkCategory || "",
    url: clickAction === "OPEN_URL" ? payload.url || "" : payload.url || "",
    clickAction,
    expirationType,
  };
  if (expirationType === "RETENTION_MONTHS") {
    body.retentionMonths = Number(payload.retentionMonths);
  }
  if (expirationType === "EXPIRED_AT") {
    body.expiredAt = toDateTimeString(payload.expiredAt);
  }
  return body;
}

function normalizeCopyChangeRequest(row = {}) {
  const payload = safeParsePayload(row.payload);
  const action = String(row.action || "").toUpperCase();
  const status = String(row.status || "").toUpperCase();
  const code = payload.number || payload.code || row.targetId || "-";
  const title = payload.title || "-";
  return {
    ...row,
    id: row.id,
    changeRequestId: row.id,
    targetType: "COPY",
    targetId: row.targetId || code,
    action,
    actionLabel: getCopyActionLabel(action),
    status,
    code,
    number: code,
    title,
    content: payload.content || "",
    nnbCategory: payload.nnbCategory || "",
    wbkCategory: payload.wbkCategory || "",
    url: payload.url || "",
    clickAction: payload.clickAction || "NONE",
    expirationType: payload.expirationType || "NONE",
    retentionMonths: payload.retentionMonths ?? "",
    expiredAt: payload.expiredAt || "",
    note: payload.note || "",
    submittedBy: row.requesterId || "-",
    submittedAt: row.createdAt || "",
    createdBy: row.requesterId || "-",
    createdAt: row.createdAt || "",
    approvedBy: status === "APPROVED" ? row.reviewerId || "-" : "",
    approvedAt: status === "APPROVED" ? row.closedAt || "" : "",
    rejectedBy: status === "REJECTED" ? row.reviewerId || "-" : "",
    rejectedAt: status === "REJECTED" ? row.closedAt || "" : "",
    cancelledBy: status === "CANCELED" ? row.reviewerId || row.requesterId || "-" : "",
    cancelledAt: status === "CANCELED" ? row.closedAt || row.createdAt || "" : "",
    reviewerId: row.reviewerId || "",
    reviewAt: row.closedAt || "",
    rejectReason: row.remark || "",
    remark: row.remark || "",
    payload,
  };
}

function safeParsePayload(payload) {
  if (!payload) return {};
  if (typeof payload === "object") return payload;
  const normalized = String(payload).trim();
  if (!normalized) return {};
  try {
    return JSON.parse(normalized);
  } catch {
    return {};
  }
}

function getCopyActionLabel(action = "") {
  return {
    CREATE: "新增",
    UPDATE: "編輯",
    DELETE: "刪除",
  }[String(action || "").toUpperCase()] || action || "-";
}

function toDateTimeString(value) {
  if (!value) return "";
  if (String(value).includes("T")) return String(value);
  return `${String(value).slice(0, 10)}T00:00:00`;
}
