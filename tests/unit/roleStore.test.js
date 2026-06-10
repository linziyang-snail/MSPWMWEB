import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getRoles = vi.fn();
vi.mock("@/services/roleService", () => ({
  getRoles: (...args) => getRoles(...args),
}));

import { useRoleStore } from "@/stores/roleStore";

beforeEach(() => {
  setActivePinia(createPinia());
  getRoles.mockReset();
});

describe("roleStore before /api/roles loads (fallback)", () => {
  it("maps role name <-> id with ADMIN=1/MANAGER=2/USER=3", () => {
    const store = useRoleStore();
    expect(store.roleNameToId).toMatchObject({ ADMIN: 1, MANAGER: 2, USER: 3 });
    expect(store.roleIdToName[3]).toBe("USER");
    expect(store.roleIdToName[1]).toBe("ADMIN");
  });
  it("assignable options exclude ADMIN and are ordered USER, MANAGER", () => {
    const store = useRoleStore();
    const values = store.assignableRoleOptions.map((o) => o.value);
    expect(values).toEqual(["USER", "MANAGER"]);
    expect(values).not.toContain("ADMIN");
  });
});

describe("roleStore after /api/roles loads (dynamic)", () => {
  it("derives id mapping from the API response", async () => {
    getRoles.mockResolvedValueOnce([
      { id: 10, roleName: "USER" },
      { id: 20, roleName: "MANAGER" },
      { id: 99, roleName: "ADMIN" },
    ]);
    const store = useRoleStore();
    await store.fetchRoles();
    expect(store.roleNameToId.USER).toBe(10);
    expect(store.roleNameToId.MANAGER).toBe(20);
    expect(store.roleIdToName[10]).toBe("USER");
  });
  it("still excludes ADMIN from assignable options after loading", async () => {
    getRoles.mockResolvedValueOnce([
      { id: 99, roleName: "ADMIN" },
      { id: 20, roleName: "MANAGER" },
      { id: 10, roleName: "USER" },
    ]);
    const store = useRoleStore();
    await store.fetchRoles();
    expect(store.assignableRoleOptions.map((o) => o.value)).not.toContain("ADMIN");
  });
  it("ensureLoaded fetches once", async () => {
    getRoles.mockResolvedValue([{ id: 3, roleName: "USER" }]);
    const store = useRoleStore();
    await store.ensureLoaded();
    await store.ensureLoaded();
    expect(getRoles).toHaveBeenCalledTimes(1);
  });
});
