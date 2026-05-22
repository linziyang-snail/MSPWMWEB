import { getCopyCounts, mockCopies } from "@/mocks/copies.mock";

import { mockNoResponse } from "./common";

let copyRows = [...mockCopies];
let nextCopyId = 9000;

const createCopyCode = () => {
  nextCopyId += 1;
  return `C${String(nextCopyId).padStart(12, "0")}`;
};

export const mockSubmitCopy = async () => mockNoResponse();

export const mockGetCompatibleCopies = async () => [...copyRows];

export const mockGetCompatibleCopyCounts = async () => getCopyCounts(copyRows);

export const mockCreateCompatibleCopy = async (payload = {}) => {
  const now = new Date().toISOString();
  const item = {
    id: nextCopyId,
    code: payload.code || payload.number || createCopyCode(),
    title: payload.title,
    category: payload.category || payload.nnbCategory || "",
    nnbCategory: payload.nnbCategory || "",
    wbkCategory: payload.wbkCategory || "",
    content: payload.content,
    status: "PENDING",
    note: payload.note || "",
    clickAction: payload.clickAction || "NONE",
    url: payload.url || "",
    expirationType: payload.expirationType || "RETENTION_MONTHS",
    retentionMonths: Number(payload.retentionMonths || 1),
    expiredAt: payload.expiredAt || null,
    createdBy: "陳小華",
    createdAt: now,
    submittedBy: "陳小華",
    submittedAt: now,
    approvedBy: null,
    approvedAt: null,
    rejectedBy: null,
    rejectedAt: null,
    rejectReason: "",
    cancelledBy: null,
    cancelledAt: null,
  };

  copyRows = [item, ...copyRows];
  return item;
};

export const mockCancelCompatibleCopy = async (id) => {
  copyRows = copyRows.map((item) =>
    Number(item.id) === Number(id)
      ? {
          ...item,
          status: "CANCELLED",
          cancelledBy: "陳小華",
          cancelledAt: new Date().toISOString(),
        }
      : item,
  );
  return copyRows.find((item) => Number(item.id) === Number(id)) || null;
};

export const mockApproveCompatibleCopy = async (id) => {
  copyRows = copyRows.map((item) =>
    Number(item.id) === Number(id)
      ? {
          ...item,
          status: "APPROVED",
          approvedBy: "陳經理",
          approvedAt: new Date().toISOString(),
        }
      : item,
  );
  return copyRows.find((item) => Number(item.id) === Number(id)) || null;
};

export const mockRejectCompatibleCopy = async (id, reason = "") => {
  copyRows = copyRows.map((item) =>
    Number(item.id) === Number(id)
      ? {
          ...item,
          status: "REJECTED",
          rejectedBy: "陳經理",
          rejectedAt: new Date().toISOString(),
          rejectReason: reason,
        }
      : item,
  );
  return copyRows.find((item) => Number(item.id) === Number(id)) || null;
};
