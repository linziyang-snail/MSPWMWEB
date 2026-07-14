import { beforeEach, describe, expect, it, vi } from "vitest";

const { getChangeRequests } = vi.hoisted(() => ({ getChangeRequests: vi.fn() }));

vi.mock("@/services/approvalService", () => ({ getChangeRequests }));

import { getOperationHistory } from "@/services/operationHistoryService";

beforeEach(() => {
  getChangeRequests.mockReset();
});

describe("getOperationHistory", () => {
  it("combines user and organization history in descending date order", async () => {
    getChangeRequests.mockImplementation(({ targetType }) =>
      Promise.resolve({
        content:
          targetType === "USER"
            ? [historyRow({ id: 1, targetType, closedAt: "2026-07-10T09:00:00" })]
            : [historyRow({ id: 2, targetType, closedAt: "2026-07-11T09:00:00" })],
      }),
    );

    const response = await getOperationHistory();

    expect(getChangeRequests).toHaveBeenCalledTimes(2);
    expect(getChangeRequests).toHaveBeenCalledWith(
      expect.objectContaining({ targetType: "USER" }),
    );
    expect(getChangeRequests).toHaveBeenCalledWith(
      expect.objectContaining({ targetType: "ORGANIZATION" }),
    );
    expect(response.list.map(({ targetType }) => targetType)).toEqual([
      "ORGANIZATION",
      "USER",
    ]);
    expect(response.content).toBe(response.list);
    expect(response.totalElements).toBe(2);
    expect(response.partialFailure).toBe(false);
    expect(response.failedTargetTypes).toEqual([]);
  });

  it("returns user history and failure metadata when organization history fails", async () => {
    getChangeRequests.mockImplementation(({ targetType }) => {
      if (targetType === "ORGANIZATION") return Promise.reject(new Error("org failed"));
      return Promise.resolve({ content: [historyRow({ id: 1, targetType })] });
    });

    const response = await getOperationHistory();

    expect(response.list).toHaveLength(1);
    expect(response.list[0].targetType).toBe("USER");
    expect(response.partialFailure).toBe(true);
    expect(response.failedTargetTypes).toEqual(["ORGANIZATION"]);
  });

  it("rejects when every target type fails", async () => {
    getChangeRequests.mockRejectedValue(new Error("history failed"));

    await expect(getOperationHistory()).rejects.toThrow("history failed");
  });
});

function historyRow(overrides = {}) {
  return {
    id: 1,
    targetType: "USER",
    action: "UPDATE",
    status: "APPROVED",
    requesterId: "admin",
    createdAt: "2026-07-09T09:00:00",
    payload: {},
    ...overrides,
  };
}
