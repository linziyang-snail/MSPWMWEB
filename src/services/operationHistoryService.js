import { getChangeRequests } from "@/services/approvalService";
import {
  CHANGE_REQUEST_ACTIONS,
  CHANGE_REQUEST_STATUSES,
  OPERATION_HISTORY_TARGET_TYPES,
  normalizeChangeRequestForHistory,
  sortChangeRequestsByDisplayDateDesc,
} from "@/utils/changeRequestUtils";

const DEFAULT_PAGE_SIZE = 100;

export async function getOperationHistory(params = {}) {
  const {
    page = 1,
    size = DEFAULT_PAGE_SIZE,
    start,
    end,
    startDate,
    endDate,
    force = false,
  } = params || {};
  const pages = await Promise.all(
    OPERATION_HISTORY_TARGET_TYPES.map((targetType) =>
      getChangeRequests({
        targetType,
        status: CHANGE_REQUEST_STATUSES,
        action: CHANGE_REQUEST_ACTIONS,
        page,
        size,
        start: start || startDate,
        end: end || endDate,
        force,
      }),
    ),
  );
  const content = sortChangeRequestsByDisplayDateDesc(
    pages.flatMap((pageData) => pageData.content || []).map(normalizeChangeRequestForHistory),
  );
  return {
    list: content,
    content,
    totalElements: pages.reduce((sum, pageData) => sum + Number(pageData.totalElements || 0), 0),
    page,
    size,
  };
}

export const GetOperationHistory = (params) => getOperationHistory(params);
