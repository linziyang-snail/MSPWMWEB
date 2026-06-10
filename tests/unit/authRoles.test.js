import { describe, expect, it } from "vitest";

import {
  canAccessRoles,
  getDefaultEntryPathForRoles,
  hasAdminRole,
  normalizeRoles,
} from "@/utils/authRoles";

describe("normalizeRoles", () => {
  it("uppercases and drops unknown roles", () => {
    expect(normalizeRoles(["user", "FOO", "Admin"])).toEqual(["USER", "ADMIN"]);
  });
  it("returns [] for non-arrays", () => {
    expect(normalizeRoles(null)).toEqual([]);
    expect(normalizeRoles(undefined)).toEqual([]);
  });
  it("de-duplicates", () => {
    expect(normalizeRoles(["USER", "user"])).toEqual(["USER"]);
  });
});

describe("canAccessRoles (drives the /403 guard)", () => {
  it("allows when no roles are required", () => {
    expect(canAccessRoles(["USER"], [])).toBe(true);
  });
  it("ADMIN is gated like everyone else — no global bypass", () => {
    // ADMIN must not reach copy management (USER/MANAGER only)...
    expect(canAccessRoles(["ADMIN"], ["USER"])).toBe(false);
    expect(canAccessRoles(["ADMIN"], ["USER", "MANAGER"])).toBe(false);
    // ...but does reach its own ADMIN routes.
    expect(canAccessRoles(["ADMIN"], ["ADMIN"])).toBe(true);
  });
  it("allows on a matching role", () => {
    expect(canAccessRoles(["MANAGER"], ["USER", "MANAGER"])).toBe(true);
  });
  it("denies a USER on an ADMIN-only route", () => {
    expect(canAccessRoles(["USER"], ["ADMIN"])).toBe(false);
  });
  it("denies empty/invalid roles when a role is required (the /403 fallback case)", () => {
    expect(canAccessRoles([], ["ADMIN"])).toBe(false);
    expect(canAccessRoles([], ["USER", "MANAGER"])).toBe(false);
  });
});

describe("getDefaultEntryPathForRoles", () => {
  it("ADMIN -> account pending changes", () => {
    expect(getDefaultEntryPathForRoles(["ADMIN"])).toBe("/accounts/pending-changes");
  });
  it("MANAGER and USER -> copies", () => {
    expect(getDefaultEntryPathForRoles(["MANAGER"])).toBe("/copies/all");
    expect(getDefaultEntryPathForRoles(["USER"])).toBe("/copies/all");
  });
  it("empty roles fall back to copies", () => {
    expect(getDefaultEntryPathForRoles([])).toBe("/copies/all");
  });
});

describe("hasAdminRole", () => {
  it("detects ADMIN", () => {
    expect(hasAdminRole(["ADMIN", "USER"])).toBe(true);
    expect(hasAdminRole(["MANAGER"])).toBe(false);
  });
});
