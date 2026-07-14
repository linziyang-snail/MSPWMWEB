import { flushPromises, shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

const route = { name: "AccountAll", meta: { title: "全部帳號", status: "ALL" } };
const fetchUsers = vi.fn(() => Promise.resolve());
const fetchAccountChangeRequests = vi.fn(() => Promise.resolve());
const getCachedUsers = vi.fn(() => []);
const getCachedChangeRequests = vi.fn(() => []);

vi.mock("vue-router", () => ({ useRoute: () => route }));
vi.mock("@/stores/authStore", () => ({
  useAuthStore: () => ({ userId: "admin" }),
}));
vi.mock("@/stores/roleStore", () => ({
  useRoleStore: () => ({ ensureLoaded: vi.fn(), roleIdToName: {} }),
}));
vi.mock("@/stores/userStore", () => ({
  useUserStore: () => ({
    accountChangeRequests: [],
    fetchUsers,
    fetchAccountChangeRequests,
    getCachedUsers,
    getCachedChangeRequests,
  }),
}));
vi.mock("@/services/approvalService", () => ({
  approveChangeRequest: vi.fn(),
  rejectChangeRequest: vi.fn(),
}));
vi.mock("@/services/userService", () => ({
  disableUser: vi.fn(),
  exportUsers: vi.fn(),
  getUserById: vi.fn(),
  resetUserPassword: vi.fn(),
  searchUsersByKeyword: vi.fn(),
  updateUser: vi.fn(),
}));

import AccountStatusListView from "@/views/accounts/AccountStatusListView.vue";

async function mountRoute(name, status) {
  route.name = name;
  route.meta = { title: name, status };
  shallowMount(AccountStatusListView, {
    global: {
      stubs: { BaseModal: true, ConfirmDialog: true, RejectReasonDialog: true },
    },
  });
  await flushPromises();
}

beforeEach(() => {
  fetchUsers.mockClear();
  fetchAccountChangeRequests.mockClear();
  getCachedUsers.mockClear();
  getCachedChangeRequests.mockClear();
  getCachedUsers.mockReturnValue([]);
  getCachedChangeRequests.mockReturnValue([]);
});

describe("AccountStatusListView route data sources", () => {
  it("fetches every user without a status filter for AccountAll", async () => {
    await mountRoute("AccountAll", "ALL");

    expect(fetchUsers).toHaveBeenCalledWith(
      expect.objectContaining({ status: null, size: 100 }),
    );
  });

  it("fetches rejected change requests without fetching users", async () => {
    await mountRoute("AccountRejected", "REJECTED");

    expect(fetchAccountChangeRequests).toHaveBeenCalledWith(
      { status: "REJECTED" },
      expect.any(Object),
    );
    expect(fetchUsers).not.toHaveBeenCalled();
  });

  it("renders normalized rejected change-request rows", async () => {
    getCachedChangeRequests.mockReturnValue([
      {
        id: 23,
        targetId: "A001",
        targetType: "USER",
        action: "UPDATE",
        status: "REJECTED",
        createdAt: "2026-07-10T08:00:00",
        closedAt: "2026-07-10T09:00:00",
        remark: "資料不完整",
        requesterName: "申請人甲",
        reviewerName: "覆核人乙",
        payload: {
          after: { id: "A001", userName: "王小明", orgName: "資訊科", roles: ["USER"] },
        },
      },
    ]);
    route.name = "AccountRejected";
    route.meta = { title: "已駁回帳號", status: "REJECTED" };

    const wrapper = shallowMount(AccountStatusListView);
    await flushPromises();

    expect(wrapper.text()).toContain("申請日期");
    expect(wrapper.text()).toContain("員工編號");
    expect(wrapper.text()).toContain("申請動作");
    expect(wrapper.text()).toContain("申請人");
    expect(wrapper.text()).toContain("覆核人");
    expect(wrapper.text()).toContain("駁回原因");
    expect(wrapper.text()).toContain("A001");
    expect(wrapper.text()).toContain("王小明");
    expect(wrapper.text()).toContain("資訊科");
    expect(wrapper.text()).toContain("UPDATE");
    expect(wrapper.text()).toContain("申請人甲");
    expect(wrapper.text()).toContain("覆核人乙");
    expect(wrapper.text()).toContain("資料不完整");
    expect(wrapper.text()).toContain("2026-07-10");
  });
});
