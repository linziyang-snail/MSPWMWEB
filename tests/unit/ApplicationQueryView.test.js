import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

const route = { name: "CategoryAll" };
const getUsers = vi.fn();
const disableOrganization = vi.fn();
const getOrganizations = vi.fn();

vi.mock("vue-router", () => ({ useRoute: () => route }));
vi.mock("@/services/userService", () => ({
  getUsers: (...args) => getUsers(...args),
}));
vi.mock("@/services/organizationService", () => ({
  disableOrganization: (...args) => disableOrganization(...args),
  getOrganizations: (...args) => getOrganizations(...args),
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
    props: ["modelValue", "title", "message"],
    emits: ["confirm"],
    template: '<div v-if="modelValue" data-test="confirm-dialog">{{ title }} {{ message }}<button data-test="confirm-delete" @click="$emit(\'confirm\')">confirm</button></div>',
  },
};

async function mountView() {
  const wrapper = mount(ApplicationQueryView, { global: { stubs } });
  await flushPromises();
  await wrapper.get('[aria-label="刪除科別"]').trigger("click");
  await flushPromises();
  return wrapper;
}

describe("ApplicationQueryView category deletion", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    getUsers.mockReset();
    disableOrganization.mockReset();
    getOrganizations.mockReset();
    getOrganizations.mockResolvedValue({
      content: [
        { id: 7, orgName: "心臟科", orgType: "SECTION", status: "ACTIVE" },
      ],
    });
  });

  it("opens confirmation without querying users", async () => {
    const wrapper = await mountView();

    expect(getUsers).not.toHaveBeenCalled();
    expect(wrapper.find('[data-test="confirm-dialog"]').exists()).toBe(true);
  });

  it("completes a successful deletion and closes the confirmation", async () => {
    disableOrganization.mockResolvedValue();
    const wrapper = await mountView();

    await wrapper.get('[data-test="confirm-delete"]').trigger("click");
    await flushPromises();

    expect(disableOrganization).toHaveBeenCalledWith({ id: 7 });
    expect(wrapper.find('[data-test="confirm-dialog"]').exists()).toBe(false);
  });

  it("keeps deletion complete when refreshing the category list fails", async () => {
    disableOrganization.mockResolvedValue();
    getOrganizations
      .mockResolvedValueOnce({ content: [
        { id: 7, orgName: "心臟科", orgType: "SECTION", status: "ACTIVE" },
      ] })
      .mockRejectedValueOnce(new Error("refresh failed"));
    const wrapper = await mountView();

    await wrapper.get('[data-test="confirm-delete"]').trigger("click");
    await flushPromises();

    expect(disableOrganization).toHaveBeenCalledTimes(1);
    expect(wrapper.find('[data-test="confirm-dialog"]').exists()).toBe(false);
    expect(wrapper.vm.selectedCategory).toBeNull();
    expect(useAppStore().alertState).toMatchObject({
      title: "重新整理科別清單失敗",
      message: "科別已刪除，但清單重新整理失敗，請稍後再試。",
    });
  });

  it("keeps confirmation visible and translates a backend personnel conflict", async () => {
    disableOrganization.mockRejectedValue({
      response: { data: { message: "科別仍綁定人員" } },
    });
    const wrapper = await mountView();

    await wrapper.get('[data-test="confirm-delete"]').trigger("click");
    await flushPromises();

    expect(wrapper.find('[data-test="confirm-dialog"]').exists()).toBe(true);
    expect(wrapper.get('[data-test="confirm-dialog"]').text()).toContain("心臟科");
    expect(useAppStore().alertState.message).toBe(
      "此科別下仍有人員，請先刪除或移轉所有帳號。",
    );
  });

  it("keeps confirmation visible and resolves a general backend error", async () => {
    disableOrganization.mockRejectedValue({
      response: { data: { message: "目前無法建立刪除申請" } },
    });
    const wrapper = await mountView();

    await wrapper.get('[data-test="confirm-delete"]').trigger("click");
    await flushPromises();

    expect(wrapper.find('[data-test="confirm-dialog"]').exists()).toBe(true);
    expect(wrapper.get('[data-test="confirm-dialog"]').text()).toContain("心臟科");
    expect(useAppStore().alertState.message).toBe("目前無法建立刪除申請");
  });
});
