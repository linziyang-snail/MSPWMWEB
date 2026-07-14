import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createUser, getOrganizations } = vi.hoisted(() => ({
  createUser: vi.fn(),
  getOrganizations: vi.fn(),
}));

vi.mock("@/services/organizationService", () => ({
  getOrganizations,
}));
vi.mock("@/services/userService", () => ({
  createUser,
}));
vi.mock("@/services/roleService", () => ({
  getRoles: vi.fn(() =>
    Promise.resolve([
      { id: 1, roleName: "ADMIN" },
      { id: 2, roleName: "MANAGER" },
      { id: 3, roleName: "USER" },
    ]),
  ),
}));

import BaseSelect from "@/components/base/BaseSelect.vue";
import AccountCreateModal from "@/components/dialogs/AccountCreateModal.vue";
import { useAppStore } from "@/stores/appStore";

// Render the modal content inline (avoid Teleport / body-scroll-lock in jsdom).
const stubs = {
  BaseModal: {
    template: '<div><slot /><slot name="footer" /></div>',
  },
};

beforeEach(() => {
  setActivePinia(createPinia());
  createUser.mockReset();
  getOrganizations.mockReset();
  getOrganizations.mockResolvedValue([
    { id: 9, orgName: "心臟科", orgType: "SECTION", status: "ACTIVE" },
  ]);
});

async function mountAndSubmit() {
  const wrapper = mount(AccountCreateModal, {
    props: { modelValue: false },
    global: { stubs },
  });
  await wrapper.setProps({ modelValue: true });
  await flushPromises();
  await wrapper.get('input[placeholder="請輸入員編(限數字)"]').setValue("123456");
  await wrapper.get('input[placeholder="至少12個字元（必填)"]').setValue("Abcdefghij1!");
  await wrapper.get('input[placeholder="請輸入中文姓名"]').setValue("王小明");
  await wrapper.get(".w-48:last-child").trigger("click");
  await flushPromises();
  return wrapper;
}

describe("AccountCreateModal role dropdown", () => {
  it("never offers ADMIN (frontend cannot assign ADMIN)", async () => {
    const wrapper = mount(AccountCreateModal, {
      props: { modelValue: false },
      global: { stubs },
    });
    await wrapper.setProps({ modelValue: true });
    await flushPromises();

    const optionValues = wrapper
      .findAllComponents(BaseSelect)
      .flatMap((c) => c.props("options") || [])
      .map((o) => o.value);

    expect(optionValues).toContain("USER");
    expect(optionValues).toContain("MANAGER");
    expect(optionValues).not.toContain("ADMIN");
  });
});

describe("AccountCreateModal API errors", () => {
  it("shows a dedicated message for a deleted duplicate employee ID", async () => {
    createUser.mockRejectedValue({
      response: { data: { code: "USER_DELETED_UNIQUE_CONFLICT" } },
    });

    await mountAndSubmit();

    expect(useAppStore().alertState.message).toBe(
      "此員編曾被刪除，目前後端尚未開放重新建立，請聯絡系統管理人員恢復或解除限制。",
    );
  });

  it("preserves the backend description for an unrelated create error", async () => {
    createUser.mockRejectedValue({ desc: "目前無法建立帳號" });

    await mountAndSubmit();

    expect(useAppStore().alertState.message).toBe("目前無法建立帳號");
  });
});
