import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/organizationService", () => ({
  getOrganizations: vi.fn(() => Promise.resolve([])),
}));
vi.mock("@/services/userService", () => ({
  createUser: vi.fn(() => Promise.resolve({ code: "0000" })),
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

// Render the modal content inline (avoid Teleport / body-scroll-lock in jsdom).
const stubs = {
  BaseModal: {
    template: '<div><slot /><slot name="footer" /></div>',
  },
};

beforeEach(() => setActivePinia(createPinia()));

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
