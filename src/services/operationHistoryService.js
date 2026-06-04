import { getChangeRequests } from "@/services/approvalService";
import {
  CHANGE_REQUEST_ACTIONS,
  CHANGE_REQUEST_STATUSES,
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
  const pageData = await getChangeRequests({
    targetType: "USER",
    status: CHANGE_REQUEST_STATUSES,
    action: CHANGE_REQUEST_ACTIONS,
    page,
    size,
    start: start || startDate,
    end: end || endDate,
    force,
  });
  const content = sortChangeRequestsByDisplayDateDesc(
    (pageData.content || []).map(normalizeChangeRequestForHistory),
  );
  return {
    list: content,
    content,
    totalElements: Number(pageData.totalElements || content.length),
    page,
    size,
  };
}

export const GetOperationHistory = (params) => getOperationHistory(params);
