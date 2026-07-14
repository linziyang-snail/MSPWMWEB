import { beforeEach, describe, expect, it, vi } from "vitest";

const get = vi.fn();

vi.mock("@/services/apiRequest", () => ({
  default: { get: (...args) => get(...args) },
  unwrapApiBody: (response) => response,
}));

import {
  getAllUsers,
  getUsersForOrganization,
} from "@/services/userService";

describe("category deletion user helpers", () => {
  beforeEach(() => get.mockReset());

  it("fetches every user page without a status filter", async () => {
    get
      .mockResolvedValueOnce({ content: Array.from({ length: 100 }, (_, id) => ({ id })) })
      .mockResolvedValueOnce({ content: [{ id: 100 }] });

    const users = await getAllUsers({ status: "ACTIVE" });

    expect(users).toHaveLength(101);
    expect(get).toHaveBeenNthCalledWith(1, "/api/users", {
      params: { page: 1, size: 100 },
    });
    expect(get).toHaveBeenNthCalledWith(2, "/api/users", {
      params: { page: 2, size: 100 },
    });
  });

  it("matches direct and nested organization ids across number and string forms", () => {
    const users = [
      { id: "a", orgId: 7 },
      { id: "b", organizationId: "7" },
      { id: "c", organization: { id: 7 } },
      { id: "d", orgId: 8 },
    ];

    expect(getUsersForOrganization(users, "7").map((user) => user.id)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });
});
