import { describe, expect, it } from "vitest";

import { routes } from "@/router/routes";
import { breadcrumbMap, sidebarSections } from "@/utils/navigation";

const accountRoutes = routes.find((route) => route.path === "/").children;
const findRoute = (name) => accountRoutes.find((route) => route.name === name);

describe("account routes and navigation", () => {
  it("provides real all and rejected account routes", () => {
    expect(accountRoutes).toContainEqual(
      expect.objectContaining({ name: "AccountAll" }),
    );
    expect(findRoute("AccountRejected").redirect).toBeUndefined();
  });

  it("lists all and rejected accounts in account navigation", () => {
    const accountChildren = sidebarSections.find(
      (section) => section.label === "人員管理",
    ).children;

    expect(accountChildren.map((item) => item.label)).toEqual(
      expect.arrayContaining(["全部帳號", "已駁回帳號"]),
    );
    expect(breadcrumbMap.AccountAll).toEqual(["推播人員管理", "全部帳號"]);
    expect(breadcrumbMap.AccountRejected).toEqual(["推播人員管理", "已駁回帳號"]);
  });

  it("removes the deleted account page and redirects old bookmarks", () => {
    const accountChildren = sidebarSections.find(
      (section) => section.label === "人員管理",
    ).children;
    const deletedRoute = accountRoutes.find(
      (route) => route.path === "accounts/deleted",
    );

    expect(findRoute("AccountDeleted")).toBeUndefined();
    expect(deletedRoute).toEqual(
      expect.objectContaining({ redirect: "/accounts/all" }),
    );
    expect(accountChildren.map((item) => item.label)).not.toContain("已刪除帳號");
    expect(breadcrumbMap.AccountDeleted).toBeUndefined();
  });
});
