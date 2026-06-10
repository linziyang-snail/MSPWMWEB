import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import CopyCard from "@/components/copies/CopyCard.vue";

const base = {
  code: "C1",
  title: "標題",
  content: "內容",
  status: "PENDING",
  submittedBy: "u1",
  submittedAt: "2026-01-01T08:00:00",
};

const mountCard = (copy, mode = "editor") =>
  mount(CopyCard, {
    props: { copy, mode },
    global: { stubs: { StatusBadge: true } },
  });

describe("CopyCard rendering by role/status", () => {
  it("editor + PENDING shows 取消送審 and no approve/reject", () => {
    const w = mountCard({ ...base });
    expect(w.text()).toContain("取消送審");
    expect(w.text()).not.toContain("核准");
  });

  it("reviewer + PENDING + canReview shows 核准 and 駁回", () => {
    const w = mountCard({ ...base, canReview: true }, "reviewer");
    expect(w.text()).toContain("核准");
    expect(w.text()).toContain("駁回");
  });

  it("reviewer + PENDING + canReview=false shows the waiting note, no buttons", () => {
    const w = mountCard({ ...base, canReview: false }, "reviewer");
    expect(w.text()).toContain("等待其他管理員審核");
    expect(w.text()).not.toContain("核准");
  });

  it("REJECTED with rejectReason shows the 駁回原因 block", () => {
    const w = mountCard(
      { ...base, status: "REJECTED", rejectReason: "理由X", rejectedBy: "r1" },
      "editor",
    );
    expect(w.text()).toContain("駁回原因");
    expect(w.text()).toContain("理由X");
  });

  it("editor + APPROVED shows 複製新建", () => {
    const w = mountCard({ ...base, status: "APPROVED", approvedBy: "r1" }, "editor");
    expect(w.text()).toContain("複製新建");
  });
});

describe("CopyCard events", () => {
  it("emits cancel-submission when 取消送審 is clicked", async () => {
    const w = mountCard({ ...base });
    const button = w
      .findAll("button")
      .find((b) => b.text().includes("取消送審"));
    await button.trigger("click");
    expect(w.emitted("cancel-submission")).toBeTruthy();
  });

  it("emits approve-copy / reject-copy in reviewer mode", async () => {
    const w = mountCard({ ...base, canReview: true }, "reviewer");
    const approve = w.findAll("button").find((b) => b.text().includes("核准"));
    const reject = w.findAll("button").find((b) => b.text().includes("駁回"));
    await approve.trigger("click");
    await reject.trigger("click");
    expect(w.emitted("approve-copy")).toBeTruthy();
    expect(w.emitted("reject-copy")).toBeTruthy();
  });
});
