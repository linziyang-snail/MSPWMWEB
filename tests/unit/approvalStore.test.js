import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getChangeRequests = vi.fn();
vi.mock("@/services/approvalService", () => ({
  getChangeRequests: (...a) => getChangeRequests(...a),
  getChangeRequestHistory: vi.fn(),
  getPendingChangeRequests: vi.fn(),
}));

import { useApprovalStore } from "@/stores/approvalStore";

beforeEach(() => {
  setActivePinia(createPinia());
  getChangeRequests.mockReset();
});

describe("approvalStore category pending count (sidebar badge)", () => {
  it("queries pending ORGANIZATION change-requests and stores the total", async () => {
    getChangeRequests.mockResolvedValueOnce({ content: [{}, {}, {}], totalElements: 3 });
    const store = useApprovalStore();
    await store.fetchCategoryPendingCount();
    expect(getChangeRequests).toHaveBeenCalledWith(
      expect.objectContaining({ targetType: "ORGANIZATION", status: "PENDING" }),
    );
    expect(store.categoryPendingCount).toBe(3);
  });

  it("resetState clears the count (used on login/logout)", () => {
    const store = useApprovalStore();
    store.categoryPendingCount = 5;
    store.resetState();
    expect(store.categoryPendingCount).toBe(0);
  });

  it("swallows fetch errors so the badge never crashes the sidebar", async () => {
    getChangeRequests.mockRejectedValueOnce(new Error("boom"));
    const store = useApprovalStore();
    await store.fetchCategoryPendingCount();
    expect(store.categoryPendingCount).toBe(0);
  });
});
