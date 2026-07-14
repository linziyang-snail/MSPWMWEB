import { describe, expect, it, vi } from "vitest";

const get = vi.fn(() => Promise.resolve({ content: [], totalElements: 0 }));

vi.mock("@/services/apiRequest", () => ({
  default: { get: (...args) => get(...args) },
  unwrapApiBody: (response) => response,
}));

import { getChangeRequests } from "@/services/approvalService";

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
});
