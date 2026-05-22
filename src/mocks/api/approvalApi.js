import { mockApprovals } from "@/mocks/approvals.mock";

import { mockNoResponse } from "./common";

export const mockGetPendingChangeRequests = async (targetType) =>
  mockApprovals.filter((item) => {
    const matchTarget = !targetType || item.targetType === targetType;
    return matchTarget && item.status === "PENDING";
  });

export const mockGetChangeRequestHistory = async (targetType, targetId) =>
  mockApprovals.filter((item) => {
    const matchTarget = !targetType || item.targetType === targetType;
    const matchId =
      !targetId || String(item.targetId).includes(String(targetId));
    return matchTarget && matchId;
  });

export const mockApproveChangeRequest = async () => mockNoResponse();

export const mockRejectChangeRequest = async () => mockNoResponse();

export const mockCancelChangeRequest = async () => mockNoResponse();
