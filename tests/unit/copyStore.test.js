import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getCopyChangeRequests = vi.fn();
const submitCopy = vi.fn(() => Promise.resolve({ code: "0000" }));
const approveCopyChangeRequest = vi.fn(() => Promise.resolve());
const rejectCopyChangeRequest = vi.fn(() => Promise.resolve());
const cancelCopyChangeRequest = vi.fn(() => Promise.resolve());

vi.mock("@/services/copyService", () => ({
  getCopyChangeRequests: (...a) => getCopyChangeRequests(...a),
  submitCopy: (...a) => submitCopy(...a),
  approveCopyChangeRequest: (...a) => approveCopyChangeRequest(...a),
  rejectCopyChangeRequest: (...a) => rejectCopyChangeRequest(...a),
  cancelCopyChangeRequest: (...a) => cancelCopyChangeRequest(...a),
}));

import { useCopyStore } from "@/stores/copyStore";

beforeEach(() => {
  setActivePinia(createPinia());
  getCopyChangeRequests.mockReset();
  getCopyChangeRequests.mockResolvedValue({ content: [], totalElements: 0 });
  submitCopy.mockClear();
});

describe("copyStore.ensureLoaded caching", () => {
  it("fetches once per status key, then serves cache on repeat", async () => {
    const store = useCopyStore();
    await store.ensureLoaded({ status: "PENDING" });
    await store.ensureLoaded({ status: "PENDING" });
    expect(getCopyChangeRequests).toHaveBeenCalledTimes(1);
  });

  it("force:true bypasses the cache (the tab re-entry refresh)", async () => {
    const store = useCopyStore();
    await store.ensureLoaded({ status: "PENDING" });
    await store.ensureLoaded({ status: "PENDING", force: true });
    expect(getCopyChangeRequests).toHaveBeenCalledTimes(2);
  });

  it("fetches further pages when the dataset exceeds one page (>100)", async () => {
    const store = useCopyStore();
    const fullPage = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      status: "PENDING",
    }));
    const tail = Array.from({ length: 50 }, (_, i) => ({
      id: 100 + i,
      status: "PENDING",
    }));
    getCopyChangeRequests
      .mockResolvedValueOnce({ content: fullPage, totalElements: 150 })
      .mockResolvedValueOnce({ content: tail, totalElements: 150 });

    await store.ensureLoaded({ status: "PENDING" });

    expect(getCopyChangeRequests).toHaveBeenCalledTimes(2);
    expect(store.counts.pending).toBe(150);
    expect(store.byStatus("PENDING")).toHaveLength(150);
  });
});

describe("copyStore mutations invalidate cache", () => {
  it("create submits then invalidates, so the next load refetches", async () => {
    const store = useCopyStore();
    await store.ensureLoaded({ status: "PENDING" });
    await store.create({ number: "C1" });
    expect(submitCopy).toHaveBeenCalledTimes(1);
    await store.ensureLoaded({ status: "PENDING" });
    expect(getCopyChangeRequests).toHaveBeenCalledTimes(2);
  });
});

describe("copyStore.counts", () => {
  it("derives pending count from per-status totalElements", async () => {
    const store = useCopyStore();
    getCopyChangeRequests.mockResolvedValueOnce({
      content: [{ id: 1, status: "PENDING" }],
      totalElements: 5,
    });
    await store.ensureLoaded({ status: "PENDING" });
    expect(store.counts.pending).toBe(5);
  });
});
