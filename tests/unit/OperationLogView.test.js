import { flushPromises, shallowMount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { GetOperationHistory } = vi.hoisted(() => ({ GetOperationHistory: vi.fn() }));

vi.mock("@/services/operationHistoryService", () => ({ GetOperationHistory }));

import OperationLogView from "@/views/operationLogs/OperationLogView.vue";

beforeEach(() => {
  GetOperationHistory.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("OperationLogView history loading", () => {
  it("shows a warning while retaining rows after a partial failure", async () => {
    GetOperationHistory.mockResolvedValue({
      list: [{ id: 1, targetType: "USER", targetDisplay: "A001" }],
      partialFailure: true,
      failedTargetTypes: ["ORGANIZATION"],
    });

    const wrapper = shallowMount(OperationLogView);
    await flushPromises();

    expect(wrapper.text()).toContain("部分操作歷程載入失敗，請稍後重試");
    expect(wrapper.findComponent({ name: "BaseTable" }).props("rows")).toHaveLength(1);
  });

  it("does not show the empty state when the history request completely fails", async () => {
    GetOperationHistory.mockRejectedValue(new Error("history failed"));

    const wrapper = shallowMount(OperationLogView);
    await flushPromises();

    expect(wrapper.findComponent({ name: "EmptyState" }).exists()).toBe(false);
    expect(wrapper.text()).toContain("操作歷程載入失敗，請稍後重試。");
    expect(wrapper.text()).not.toContain("部分操作歷程載入失敗，請稍後重試");
    expect(console.error).toHaveBeenCalled();
  });

  it("clears stale rows when a subsequent load completely fails", async () => {
    GetOperationHistory
      .mockResolvedValueOnce({ list: [{ id: 1 }], partialFailure: false })
      .mockRejectedValueOnce(new Error("history failed"));
    const wrapper = shallowMount(OperationLogView);
    await flushPromises();

    await wrapper.vm.loadOperationLogs();
    await flushPromises();

    expect(wrapper.findComponent({ name: "BaseTable" }).props("rows")).toEqual([]);
  });
});
