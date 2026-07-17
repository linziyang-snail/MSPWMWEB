import { describe, expect, it, vi } from "vitest";

const get = vi.fn(() => Promise.resolve({ content: [], totalElements: 0 }));
const put = vi.fn(() => Promise.resolve({ code: "0000" }));

vi.mock("@/services/apiRequest", () => ({
  default: {
    get: (...args) => get(...args),
    put: (...args) => put(...args),
  },
  unwrapApiBody: (response) => response,
}));

import {
  getChangeRequests,
  rejectChangeRequest,
} from "@/services/approvalService";

describe("approvalService change-request error handling", () => {
  it("passes the aggregate opt-out flag to apiRequest", async () => {
    await getChangeRequests({
      targetType: "USER",
      status: "APPROVED",
      force: true,
      skipGlobalErrorHandler: true,
    });

    expect(get).toHaveBeenCalledWith(
      "/api/change-requests",
      expect.objectContaining({ skipGlobalErrorHandler: true }),
    );
  });

  it("sends a rejection reason as comment", async () => {
    await rejectChangeRequest({ id: 44, comment: "資料不完整" });

    expect(put).toHaveBeenCalledWith(
      "/api/change-requests/44/reject",
      { comment: "資料不完整" },
    );
  });
});
