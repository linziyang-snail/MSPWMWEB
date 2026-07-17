import { flushPromises, shallowMount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

const { GetOperationHistory } = vi.hoisted(() => ({
  GetOperationHistory: vi.fn(),
}));

vi.mock("@/services/operationHistoryService", () => ({
  GetOperationHistory,
}));

import OperationHistoryDialog from "@/components/dialogs/OperationHistoryDialog.vue";

describe("OperationHistoryDialog responsive history layout", () => {
  it("renders seven columns on desktop and seven labeled fields in responsive cards", async () => {
    GetOperationHistory.mockResolvedValue({
      list: [{
        id: 1,
        targetType: "ORGANIZATION",
        date: "2026-07-17T10:50:06",
        requesterId: "1150251",
        displayTargetId: "數三科",
        status: "APPROVED",
        statusLabel: "核准",
        action: "CREATE",
        actionLabel: "新增",
        changedFields: "基本資料",
        rejectReason: "",
      }],
    });
    const wrapper = shallowMount(OperationHistoryDialog, {
      props: { modelValue: false },
      global: {
        stubs: {
          BaseModal: { template: "<div><slot /><slot name='footer' /></div>" },
        },
      },
    });
    await wrapper.setProps({ modelValue: true });
    await flushPromises();

    const desktop = wrapper.get('[data-test="history-desktop-table"]');
    const responsive = wrapper.get('[data-test="history-responsive-cards"]');
    const labels = [
      "日期",
      "操作者",
      "異動對象",
      "狀態",
      "動作",
      "異動欄位",
      "駁回原因",
    ];

    expect(desktop.classes()).toContain("lg:block");
    expect(desktop.classes()).not.toContain("overflow-x-auto");
    expect(desktop.findAll("th").map((cell) => cell.text())).toEqual(labels);
    expect(responsive.classes()).toContain("lg:hidden");
    labels.forEach((label) => expect(responsive.text()).toContain(label));
  });
});
