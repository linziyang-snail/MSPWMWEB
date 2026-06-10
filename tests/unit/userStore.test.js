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
  it("caches by status and force refetches", async () => {
    const store = useUserStore();
    getUsers.mockResolvedValue({ content: [{ id: "u1" }], totalElements: 1 });
    await store.fetchUsers({ status: "ACTIVE", size: 100 });
    await store.fetchUsers({ status: "ACTIVE", size: 100 });
    expect(getUsers).toHaveBeenCalledTimes(1);
    await store.fetchUsers({ status: "ACTIVE", size: 100, force: true });
    expect(getUsers).toHaveBeenCalledTimes(2);
  });
});
