import { beforeEach, describe, expect, it, vi } from "vitest";

const get = vi.fn();

vi.mock("@/services/apiRequest", () => ({
  default: { get: (...args) => get(...args) },
  unwrapApiBody: (response) => response,
}));

import { getUsers } from "@/services/userService";

describe("getUsers", () => {
  beforeEach(() => get.mockReset());

  it("omits status when querying all users", async () => {
    get.mockResolvedValueOnce({ content: [] });

    await getUsers({ page: 1, size: 100, status: null });

    expect(get).toHaveBeenCalledWith("/api/users", {
      params: { page: 1, size: 100 },
    });
  });

  it("does not default status when it is not provided", async () => {
    get.mockResolvedValueOnce({ content: [] });

    await getUsers({ page: 1, size: 100 });

    expect(get).toHaveBeenCalledWith("/api/users", {
      params: { page: 1, size: 100 },
    });
  });
});
