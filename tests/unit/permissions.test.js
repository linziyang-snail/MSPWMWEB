import { describe, expect, it } from "vitest";

import { getPermissionsByRoles, hasPermission } from "@/utils/permissions";

describe("getPermissionsByRoles", () => {
  it("grants ADMIN user-management permissions", () => {
    const perms = getPermissionsByRoles(["ADMIN"]);
    expect(perms).toContain("USER_CREATE");
    expect(perms).toContain("ORG_CREATE");
  });
  it("grants MANAGER approval permissions but not user create", () => {
    const perms = getPermissionsByRoles(["MANAGER"]);
    expect(perms).toContain("APPROVAL_APPROVE");
    expect(perms).not.toContain("USER_CREATE");
  });
  it("grants USER copy submit only", () => {
    const perms = getPermissionsByRoles(["USER"]);
    expect(perms).toContain("COPY_SUBMIT");
    expect(perms).not.toContain("USER_CREATE");
  });
  it("merges and de-duplicates across roles", () => {
    const perms = getPermissionsByRoles(["USER", "MANAGER"]);
    expect(new Set(perms).size).toBe(perms.length);
  });
});

describe("hasPermission", () => {
  it("checks membership", () => {
    expect(hasPermission(["MANAGER"], "APPROVAL_APPROVE")).toBe(true);
    expect(hasPermission(["USER"], "USER_CREATE")).toBe(false);
  });
  it("an empty permission is always allowed", () => {
    expect(hasPermission(["USER"], "")).toBe(true);
  });
});
