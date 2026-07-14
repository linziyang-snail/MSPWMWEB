import { getChangeRequests } from "@/services/approvalService";
import {
  CHANGE_REQUEST_ACTIONS,
  CHANGE_REQUEST_STATUSES,
  normalizeChangeRequestForHistory,
  sortChangeRequestsByDisplayDateDesc,
} from "@/utils/changeRequestUtils";

const DEFAULT_PAGE_SIZE = 100;
const HISTORY_TARGET_TYPES = ["USER", "ORGANIZATION"];

async function fetchAllHistoryForTargetType(targetType, params = {}) {
  const { start, end, startDate, endDate, force = false } = params || {};
  const size = DEFAULT_PAGE_SIZE;
  let page = 1;
  let raw = [];
  // 1 request for <=100 rows; fetch further pages only when the dataset
  // exceeds a page, so nothing is truncated past 100.
  for (let guard = 0; guard < 100; guard += 1) {
    const pageData = await getChangeRequests({
      targetType,
      status: CHANGE_REQUEST_STATUSES,
      action: CHANGE_REQUEST_ACTIONS,
      page,
      size,
      start: start || startDate,
      end: end || endDate,
      force,
      skipGlobalErrorHandler: true,
    });
    const rows = pageData.content || [];
    raw = raw.concat(rows);
    if (rows.length < size) break;
    page += 1;
  }
  return raw;
}

export async function getOperationHistory(params = {}) {
  const results = await Promise.allSettled(
    HISTORY_TARGET_TYPES.map((targetType) =>
      fetchAllHistoryForTargetType(targetType, params),
    ),
  );
  const failedTargetTypes = results
    .map((result, index) =>
      result.status === "rejected" ? HISTORY_TARGET_TYPES[index] : null,
    )
    .filter(Boolean);
  if (failedTargetTypes.length === HISTORY_TARGET_TYPES.length) {
    throw results[0].reason;
  }
  const raw = results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );
  const content = sortChangeRequestsByDisplayDateDesc(
    raw.map(normalizeChangeRequestForHistory),
  );
  return {
    list: content,
    content,
    totalElements: content.length,
    page: 1,
    size: content.length,
    partialFailure: failedTargetTypes.length > 0,
    failedTargetTypes,
  };
}

export const GetOperationHistory = (params) => getOperationHistory(params);
