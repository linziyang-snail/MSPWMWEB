import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

const route = { name: "CategoryAll" };
const getAllUsers = vi.fn();
const disableOrganization = vi.fn();

vi.mock("vue-router", () => ({ useRoute: () => route }));
vi.mock("@/services/userService", () => ({
  getAllUsers: (...args) => getAllUsers(...args),
  getUsersForOrganization: (users, id) =>
    users.filter((user) => String(user.orgId) === String(id)),
}));
vi.mock("@/services/organizationService", () => ({
  disableOrganization: (...args) => disableOrganization(...args),
  getOrganizations: vi.fn(() => Promise.resolve({ content: [
    { id: 7, orgName: "心臟科", orgType: "SECTION", status: "ACTIVE" },
  ] })),
  invalidateOrganizations: vi.fn(),
}));
vi.mock("@/services/approvalService", () => ({
  approveChangeRequest: vi.fn(),
  getChangeRequests: vi.fn(() => Promise.resolve({ content: [] })),
  getPendingChangeRequests: vi.fn(() => Promise.resolve([])),
  invalidateChangeRequests: vi.fn(),
  rejectChangeRequest: vi.fn(),
  searchChangeRequests: vi.fn(() => Promise.resolve([])),
}));

import ApplicationQueryView from "@/views/applications/ApplicationQueryView.vue";
import { useAppStore } from "@/stores/appStore";

const stubs = {
  CategoryCreateModal: true,
  ConfirmDialog: {
    props: ["modelValue", "title"],
    emits: ["confirm"],
    template: '<div v-if="modelValue" data-test="confirm-dialog">{{ title }}<button data-test="confirm-delete" @click="$emit(\'confirm\')">confirm</button></div>',
  },
};

async function mountView() {
  const wrapper = mount(ApplicationQueryView, { global: { stubs } });
  await flushPromises();
  await wrapper.get('[aria-label="刪除科別"]').trigger("click");
  await flushPromises();
  return wrapper;
}

describe("ApplicationQueryView category deletion guard", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    getAllUsers.mockReset();
    disableOrganization.mockReset();
  });

  it("does not open confirmation and reports the account count when users exist", async () => {
    getAllUsers.mockResolvedValue([{ orgId: 7 }, { orgId: "7" }]);

    const wrapper = await mountView();

    expect(wrapper.find('[data-test="confirm-dialog"]').exists()).toBe(false);
    expect(useAppStore().alertState.message).toBe(
      "此科別下仍有 2 個帳號，請先刪除或移轉該科別下所有帳號。",
    );
  });

  it("opens confirmation only when the organization has no users", async () => {
    getAllUsers.mockResolvedValue([{ orgId: 8 }]);

    const wrapper = await mountView();

    expect(wrapper.find('[data-test="confirm-dialog"]').exists()).toBe(true);
  });

  it("does not open confirmation and asks to retry when lookup fails", async () => {
    getAllUsers.mockRejectedValue(new Error("network"));

    const wrapper = await mountView();

    expect(wrapper.find('[data-test="confirm-dialog"]').exists()).toBe(false);
    expect(useAppStore().alertState.message).toBe(
      "無法確認科別人員資料，請稍後重試。",
    );
  });

  it("keeps confirmation visible and translates a backend personnel conflict", async () => {
    getAllUsers.mockResolvedValue([]);
    disableOrganization.mockRejectedValue({
      response: { data: { message: "科別仍綁定人員" } },
    });
    const wrapper = await mountView();

    await wrapper.get('[data-test="confirm-delete"]').trigger("click");
    await flushPromises();

    expect(wrapper.find('[data-test="confirm-dialog"]').exists()).toBe(true);
    expect(useAppStore().alertState.message).toBe(
      "此科別下仍有人員，請先刪除或移轉所有帳號。",
    );
  });
});
