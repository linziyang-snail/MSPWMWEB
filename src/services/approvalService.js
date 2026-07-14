import apiRequest, { unwrapApiBody } from "./apiRequest";

const changeRequestsCache = {};
const changeRequestsInFlight = {};
const CHANGE_REQUEST_TARGET_TYPES = ["USER", "COPY", "ORGANIZATION"];
const CHANGE_REQUEST_STATUSES = ["PENDING", "APPROVED", "REJECTED", "CANCELED"];

export async function getChangeRequests(params = {}) {
  const {
    id,
    targetId,
    targetType,
    action,
    status,
    start,
    end,
    page = 1,
    size = 100,
    force = false,
    skipGlobalErrorHandler = false,
  } = params || {};
  if (!targetType) throw new Error("targetType is required");
  const normalizedStatus = normalizeArrayParam(status);
  if (!normalizedStatus.length) throw new Error("status is required");
  const query = pruneEmptyParams({
    id,
    targetId,
    targetType,
    action: normalizeArrayParam(action),
    status: normalizedStatus,
    start: toIsoDate(start),
    end: toIsoDate(end),
    page,
    size: clampPageSize(size),
  });
  const cacheKey = buildChangeRequestsKey(query);
  if (changeRequestsCache[cacheKey] && !force) return changeRequestsCache[cacheKey];
  if (changeRequestsInFlight[cacheKey] && !force) return changeRequestsInFlight[cacheKey];

  changeRequestsInFlight[cacheKey] = apiRequest.get("/api/change-requests", {
      params: query,
      skipGlobalErrorHandler,
    })
    .then(unwrapApiBody)
    .then(normalizeChangeRequestPage)
    .then((pageData) => {
      changeRequestsCache[cacheKey] = pageData;
      return pageData;
    })
    .finally(() => {
      delete changeRequestsInFlight[cacheKey];
    });
  return changeRequestsInFlight[cacheKey];
}

export async function getPendingChangeRequests(params = {}) {
  return getChangeRequestList({ ...params, status: params?.status || "PENDING" });
}

export async function getChangeRequestHistory(params = {}) {
  const { targetType, targetId } = params || {};
  if (!hasRequiredHistoryParams(targetType, targetId)) return [];
  return getChangeRequestList({
    ...params,
    targetType,
    targetId,
    status: CHANGE_REQUEST_STATUSES,
    page: params.page || 1,
    size: params.size || 100,
  });
}

export async function searchChangeRequests(params = {}) {
  const {
    id,
    targetType,
    targetId,
    action,
    status = CHANGE_REQUEST_STATUSES,
    start,
    end,
    startDate,
    endDate,
    page = 1,
    size = 20,
  } = params || {};
  if (targetType) {
    return getChangeRequests({
      id,
      targetType,
      targetId,
      action,
      status,
      start: start || startDate,
      end: end || endDate,
      page,
      size,
    });
  }
  const content = await getChangeRequestList({
    id,
    targetId,
    action,
    status,
    start: start || startDate,
    end: end || endDate,
    page,
    size,
  });
  return {
    content,
    totalElements: content.length,
    page,
    size: clampPageSize(size),
  };
}

export async function approveChangeRequest(params) {
  const { id } = normalizeIdParams(params);
  return apiRequest.put(`/api/change-requests/${id}/approve`, {});
}

export async function rejectChangeRequest(params, legacyPayload) {
  const { id, remark = "" } = normalizeRejectParams(params, legacyPayload);
  const body = { remark };
  return apiRequest.put(`/api/change-requests/${id}/reject`, body);
}

export async function cancelChangeRequest(params) {
  const { id } = normalizeIdParams(params);
  return apiRequest.put(`/api/change-requests/${id}/cancel`, {});
}

export function invalidateChangeRequests(params = {}) {
  Object.keys(changeRequestsCache).forEach((key) => delete changeRequestsCache[key]);
  Object.keys(changeRequestsInFlight).forEach((key) => delete changeRequestsInFlight[key]);
}

function normalizeIdParams(params) {
  if (params && typeof params === "object") return params;
  return { id: params };
}

function normalizeRejectParams(params, legacyPayload) {
  if (legacyPayload) return { id: params, ...legacyPayload };
  return params || {};
}

function hasRequiredHistoryParams(targetType, targetId) {
  return Boolean(String(targetType || "").trim() && String(targetId || "").trim());
}

function clampPageSize(size) {
  const parsedSize = Number(size);
  if (!Number.isFinite(parsedSize) || parsedSize <= 0) return 20;
  return Math.min(Math.trunc(parsedSize), 100);
}

async function getChangeRequestList(params = {}) {
  const targetTypes = params.targetType ? [params.targetType] : CHANGE_REQUEST_TARGET_TYPES;
  const pages = await Promise.all(
    targetTypes.map((targetType) =>
      getChangeRequests({
        ...params,
        targetType,
        status: params.status || "PENDING",
        page: params.page || 1,
        size: params.size || 100,
      }),
    ),
  );
  return pages
    .flatMap((pageData) => pageData.content || [])
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}

function normalizeChangeRequestPage(body) {
  if (Array.isArray(body)) {
    return {
      content: body,
      totalElements: body.length,
      page: 1,
      size: body.length,
    };
  }
  const content = Array.isArray(body?.content) ? body.content : [];
  return {
    ...body,
    content,
    totalElements: body?.totalElements ?? content.length,
    page: body?.page ?? 1,
    size: body?.size ?? content.length,
  };
}

function normalizeArrayParam(value) {
  if (Array.isArray(value)) return value.filter((item) => item !== undefined && item !== null && item !== "");
  if (value === undefined || value === null || value === "") return [];
  return [value];
}

function pruneEmptyParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== "";
    }),
  );
}

function toIsoDate(value) {
  if (!value) return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const date = String(value.getDate()).padStart(2, "0");
    return `${value.getFullYear()}-${month}-${date}`;
  }
  const normalized = String(value).replaceAll("/", "-");
  if (/^\d{8}$/.test(normalized)) {
    return `${normalized.slice(0, 4)}-${normalized.slice(4, 6)}-${normalized.slice(6, 8)}`;
  }
  return normalized.slice(0, 10);
}

function buildChangeRequestsKey(params = {}) {
  return JSON.stringify({
    id: params.id || "",
    targetId: params.targetId || "",
    targetType: params.targetType || "",
    action: normalizeArrayParam(params.action).join(","),
    status: normalizeArrayParam(params.status).join(","),
    start: params.start || "",
    end: params.end || "",
    page: params.page || 1,
    size: params.size || 100,
  });
}
