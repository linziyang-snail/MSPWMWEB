import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getAccountChangeRequests = vi.fn();
const getUsers = vi.fn();
vi.mock("@/services/userService", () => ({
  getAccountChangeRequests: (...a) => getAccountChangeRequests(...a),
  getUsers: (...a) => getUsers(...a),
}));

import { useUserStore } from "@/stores/userStore";

beforeEach(() => {
  setActivePinia(createPinia());
  getAccountChangeRequests.mockReset();
  getUsers.mockReset();
});

describe("userStore pending badge counts", () => {
  it("pendingNewCount and pendingChangeCount come from their own queries", async () => {
    const store = useUserStore();
    getAccountChangeRequests.mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);
    await store.fetchAccountChangeRequests({ status: "PENDING", action: ["CREATE"] });
    expect(store.pendingNewCount).toBe(2);

    getAccountChangeRequests.mockResolvedValueOnce([{ id: 3 }]);
    await store.fetchAccountChangeRequests({ status: "PENDING", action: ["UPDATE", "DELETE"] });
    expect(store.pendingChangeCount).toBe(1);
  });

  it("caches a change-request query, and force refetches it", async () => {
    const store = useUserStore();
    getAccountChangeRequests.mockResolvedValue([{ id: 1 }]);
    await store.fetchAccountChangeRequests({ status: "PENDING", action: ["CREATE"] });
    await store.fetchAccountChangeRequests({ status: "PENDING", action: ["CREATE"] });
    expect(getAccountChangeRequests).toHaveBeenCalledTimes(1);
    await store.fetchAccountChangeRequests(
      { status: "PENDING", action: ["CREATE"] },
      { force: true },
    );
    expect(getAccountChangeRequests).toHaveBeenCalledTimes(2);
  });
});

describe("userStore.fetchUsers caching", () => {
  it("invalidates the aggregate cache and in-flight query with a specific status", () => {
    const store = useUserStore();
    const pendingRequest = Promise.resolve();
    const allRequest = Promise.resolve();
    const combinedRequest = Promise.resolve();
    const inactiveRequest = Promise.resolve();
    const changeRequest = Promise.resolve();
    store.usersByStatus = {
      PENDING: [{ id: "pending" }],
      ALL: [{ id: "pending" }, { id: "inactive" }],
      INACTIVE: [{ id: "inactive" }],
    };
    store.inFlightByKey = {
      "users:page=1&size=100&status=PENDING": pendingRequest,
      "users:page=1&size=100&status=ALL": allRequest,
      "users:page=1&size=100&status=ACTIVE%2CPENDING": combinedRequest,
      "users:page=1&size=100&status=INACTIVE": inactiveRequest,
      "changeRequests:USER:PENDING:ALL": changeRequest,
    };

    store.invalidateUsers("PENDING");

    expect(store.usersByStatus).toEqual({ INACTIVE: [{ id: "inactive" }] });
    expect(store.inFlightByKey).toEqual({
      "users:page=1&size=100&status=INACTIVE": inactiveRequest,
      "changeRequests:USER:PENDING:ALL": changeRequest,
    });
  });

  it("caches by status and force refetches", async () => {
    const store = useUserStore();
    getUsers.mockResolvedValue({ content: [{ id: "u1" }], totalElements: 1 });
    await store.fetchUsers({ status: "ACTIVE", size: 100 });
    await store.fetchUsers({ status: "ACTIVE", size: 100 });
    expect(getUsers).toHaveBeenCalledTimes(1);
    await store.fetchUsers({ status: "ACTIVE", size: 100, force: true });
    expect(getUsers).toHaveBeenCalledTimes(2);
  });

  it("fetches further pages when a status exceeds one page (>100)", async () => {
    const store = useUserStore();
    const fullPage = Array.from({ length: 100 }, (_, i) => ({ id: `u${i}` }));
    const tail = Array.from({ length: 30 }, (_, i) => ({ id: `u${100 + i}` }));
    getUsers
      .mockResolvedValueOnce({ content: fullPage, totalElements: 130 })
      .mockResolvedValueOnce({ content: tail, totalElements: 130 });

    await store.fetchUsers({ status: "ACTIVE", size: 100 });

    expect(getUsers).toHaveBeenCalledTimes(2);
    expect(store.getCachedUsers("ACTIVE")).toHaveLength(130);
  });

  it("fetches and caches every page without a status filter", async () => {
    const store = useUserStore();
    const fullPage = Array.from({ length: 100 }, (_, i) => ({ id: `u${i}` }));
    const tail = Array.from({ length: 20 }, (_, i) => ({ id: `u${100 + i}` }));
    getUsers
      .mockResolvedValueOnce({ content: fullPage, totalElements: 120 })
      .mockResolvedValueOnce({ content: tail, totalElements: 120 });

    await store.fetchUsers({ status: null, size: 100 });

    expect(getUsers).toHaveBeenCalledTimes(2);
    expect(getUsers).toHaveBeenNthCalledWith(1, {
      page: 1,
      size: 100,
    });
    expect(getUsers).toHaveBeenNthCalledWith(2, {
      page: 2,
      size: 100,
    });
    expect(store.getCachedUsers(null)).toHaveLength(120);
  });
});
