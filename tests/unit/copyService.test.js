import { beforeEach, describe, expect, it, vi } from "vitest";

const post = vi.fn(() => Promise.resolve({ code: "0000", desc: "成功", body: {} }));
const getChangeRequests = vi.fn();

vi.mock("@/services/apiRequest", () => ({
  default: { post: (...args) => post(...args) },
  unwrapApiBody: (response) => response,
}));

vi.mock("@/services/approvalService", () => ({
  getChangeRequests: (...args) => getChangeRequests(...args),
  approveChangeRequest: vi.fn(),
  rejectChangeRequest: vi.fn(),
  cancelChangeRequest: vi.fn(),
}));

import { getCopyChangeRequests, submitCopy } from "@/services/copyService";

describe("submitCopy payload (NNB/WBK + 備註)", () => {
  beforeEach(() => post.mockClear());

  it("sends WBK value in wbkCategory, NNB value in nnbCategory, and note as remark", async () => {
    await submitCopy({
      number: "C1",
      title: "t",
      content: "c",
      nnbCategory: "帳務",
      wbkCategory: "優惠",
      note: "作者備註",
      clickAction: "NONE",
      expirationType: "RETENTION_MONTHS",
      retentionMonths: 1,
    });
    expect(post).toHaveBeenCalledTimes(1);
    const [url, body] = post.mock.calls[0];
    expect(url).toBe("/api/copies");
    expect(body.nnbCategory).toBe("帳務");
    expect(body.wbkCategory).toBe("優惠");
    expect(body.remark).toBe("作者備註");
    expect(body.retentionMonths).toBe(1);
    expect(body.expiredAt).toBeUndefined();
  });

  it("uses expiredAt only for EXPIRED_AT and drops retentionMonths", async () => {
    await submitCopy({
      number: "C2",
      title: "t",
      content: "c",
      expirationType: "EXPIRED_AT",
      expiredAt: "2026-06-30",
    });
    const body = post.mock.calls.at(-1)[1];
    expect(body.expiredAt).toBe("2026-06-30T00:00:00");
    expect(body.retentionMonths).toBeUndefined();
  });
});

describe("getCopyChangeRequests normalization", () => {
  it("maps payload.remark -> note and the top-level remark -> rejectReason", async () => {
    getChangeRequests.mockResolvedValueOnce({
      content: [
        {
          id: 9,
          action: "create",
          status: "rejected",
          payload: JSON.stringify({
            number: "C9",
            title: "T",
            nnbCategory: "帳務",
            wbkCategory: "優惠",
            remark: "作者備註",
          }),
          requesterId: "u1",
          reviewerId: "r1",
          remark: "駁回原因",
          createdAt: "2026-01-01T00:00:00",
          closedAt: "2026-01-02T00:00:00",
        },
      ],
      totalElements: 1,
    });

    const result = await getCopyChangeRequests({ status: "REJECTED" });
    const row = result.content[0];

    expect(getChangeRequests).toHaveBeenCalledWith(
      expect.objectContaining({ targetType: "COPY", status: "REJECTED" }),
    );
    expect(row.changeRequestId).toBe(9);
    expect(row.code).toBe("C9");
    expect(row.note).toBe("作者備註"); // payload.remark -> note
    expect(row.rejectReason).toBe("駁回原因"); // top-level remark -> rejectReason
    expect(row.nnbCategory).toBe("帳務");
    expect(row.wbkCategory).toBe("優惠");
    expect(row.status).toBe("REJECTED");
    expect(row.rejectedBy).toBe("r1");
    expect(result.totalElements).toBe(1);
  });
});
