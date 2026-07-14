import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createOrganization } = vi.hoisted(() => ({ createOrganization: vi.fn() }));

vi.mock("@/services/organizationService", () => ({
  createOrganization,
  updateOrganization: vi.fn(),
}));

import CategoryCreateModal from "@/components/dialogs/CategoryCreateModal.vue";
import { useAppStore } from "@/stores/appStore";

const stubs = {
  BaseModal: {
    template: '<div><slot /><slot name="footer" /></div>',
  },
};

beforeEach(() => {
  setActivePinia(createPinia());
  createOrganization.mockReset();
});

async function mountAndSubmit() {
  const wrapper = mount(CategoryCreateModal, {
    props: { modelValue: true },
    global: { stubs },
  });
  await wrapper.get('input[placeholder="請輸入科別名稱"]').setValue("心臟科");
  await wrapper.get("button:last-child").trigger("click");
  await flushPromises();
  return wrapper;
}

describe("CategoryCreateModal API errors", () => {
  it("shows a dedicated message for a deleted duplicate category", async () => {
    createOrganization.mockRejectedValue({
      code: "ORGANIZATION_DELETED",
      desc: "科別名稱已存在",
    });

    await mountAndSubmit();

    expect(useAppStore().alertState.message).toBe(
      "此科別曾被刪除，目前後端尚未開放重新建立，請聯絡系統管理人員恢復或解除限制。",
    );
  });

  it("preserves the backend description for an unrelated create error", async () => {
    createOrganization.mockRejectedValue({ desc: "目前無法建立科別" });

    await mountAndSubmit();

    expect(useAppStore().alertState.message).toBe("目前無法建立科別");
  });
});
