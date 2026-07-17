import { describe, expect, it } from "vitest";

import {
  getChangeRequestActionLabel,
  getChangeRequestStatusLabel,
  getChangeRequestTargetName,
  getChangeRequestTargetTypeLabel,
  normalizeChangeRequestForHistory,
  safeParsePayload,
  sortChangeRequestsByDisplayDateDesc,
} from "@/utils/changeRequestUtils";

describe("safeParsePayload", () => {
  it("parses JSON strings, passes objects, defaults to {}", () => {
    expect(safeParsePayload('{"a":1}')).toEqual({ a: 1 });
    expect(safeParsePayload({ a: 1 })).toEqual({ a: 1 });
    expect(safeParsePayload("not json")).toEqual({});
    expect(safeParsePayload("")).toEqual({});
    expect(safeParsePayload(null)).toEqual({});
  });
});

describe("label maps", () => {
  it("action labels (case-insensitive)", () => {
    expect(getChangeRequestActionLabel("create")).toBe("新增");
    expect(getChangeRequestActionLabel("UPDATE")).toBe("編輯");
    expect(getChangeRequestActionLabel("DELETE")).toBe("刪除");
  });
  it("status labels", () => {
    expect(getChangeRequestStatusLabel("pending")).toBe("待審核");
    expect(getChangeRequestStatusLabel("CANCELED")).toBe("已取消");
  });
  it("target type labels", () => {
    expect(getChangeRequestTargetTypeLabel("USER")).toBe("帳號");
    expect(getChangeRequestTargetTypeLabel("ORGANIZATION")).toBe("科別");
  });
});

describe("getChangeRequestTargetName", () => {
  it("USER uses userName", () => {
    expect(
      getChangeRequestTargetName({ targetType: "USER" }, { userName: "王曉明" }),
    ).toBe("王曉明");
  });
  it("ORGANIZATION falls back orgName -> name -> categoryName", () => {
    expect(
      getChangeRequestTargetName({ targetType: "ORGANIZATION" }, { orgName: "資料科" }),
    ).toBe("資料科");
    expect(
      getChangeRequestTargetName({ targetType: "ORGANIZATION" }, { name: "數8科" }),
    ).toBe("數8科");
  });
});

describe("normalizeChangeRequestForHistory", () => {
  it("normalizes a USER row with labels and display", () => {
    const row = normalizeChangeRequestForHistory({
      id: 5,
      targetType: "user",
      action: "update",
      status: "approved",
      payload: JSON.stringify({ userId: "1126580", userName: "林子洋" }),
      requesterId: "admin01",
      reviewerId: "admin02",
      createdAt: "2026-06-08",
      closedAt: "2026-06-09",
    });
    expect(row.targetTypeLabel).toBe("帳號");
    expect(row.actionLabel).toBe("編輯");
    expect(row.statusLabel).toBe("核准");
    expect(row.targetDisplay).toBe("1126580 / 林子洋");
    expect(row.displayTargetId).toBe("1126580");
    expect(row.date).toBe("2026-06-09"); // closedAt preferred over createdAt
  });

  it("uses payload orgName as the organization display instead of targetId", () => {
    const row = normalizeChangeRequestForHistory({
      id: 44,
      targetType: "ORGANIZATION",
      targetId: "14",
      action: "CREATE",
      payload: '{"orgName":"數三科","orgType":"SECTION"}',
      requesterId: "1150251",
      status: "APPROVED",
      reviewerId: "1134540",
      remark: "科別名稱、科別類型",
      comment: null,
      closedAt: "2026-07-17T10:50:06",
      createdAt: "2026-07-17T10:49:55",
    });

    expect(row.displayTargetId).toBe("數三科");
    expect(row.targetDisplay).toBe("數三科");
    expect(row.statusLabel).toBe("核准");
    expect(row.changedFields).toBe("科別名稱、科別類型");
    expect(row.rejectReason).toBe("");
  });

  it("maps rejected status and reads its reason from comment", () => {
    const row = normalizeChangeRequestForHistory({
      id: 45,
      targetType: "USER",
      targetId: "A001",
      action: "UPDATE",
      status: "REJECTED",
      remark: "權限",
      comment: "申請資料不完整",
    });

    expect(row.statusLabel).toBe("駁回");
    expect(row.changedFields).toBe("權限");
    expect(row.rejectReason).toBe("申請資料不完整");
  });
});

describe("sortChangeRequestsByDisplayDateDesc", () => {
  it("sorts newest first without mutating the input", () => {
    const rows = [
      { displayDate: "2026-06-01" },
      { displayDate: "2026-06-10" },
      { displayDate: "2026-06-05" },
    ];
    const sorted = sortChangeRequestsByDisplayDateDesc(rows);
    expect(sorted.map((r) => r.displayDate)).toEqual([
      "2026-06-10",
      "2026-06-05",
      "2026-06-01",
    ]);
    expect(rows[0].displayDate).toBe("2026-06-01"); // original untouched
  });
});
