import { describe, expect, it } from "vitest";

import {
  resolveApiErrorMessage,
  resolveDeletedDuplicateMessage,
} from "@/utils/resolveApiErrorMessage";

describe("resolveDeletedDuplicateMessage", () => {
  it.each([
    [{ code: "DELETED_DUPLICATE" }, "ACCOUNT"],
    [{ response: { data: { desc: "員編已刪除且已存在" } } }, "ACCOUNT"],
  ])("returns the account recreation message for a deleted duplicate conflict", (error, targetType) => {
    expect(resolveDeletedDuplicateMessage(error, targetType)).toBe(
      "此員編曾被刪除，目前後端尚未開放重新建立，請聯絡系統管理人員恢復或解除限制。",
    );
  });

  it.each([
    [{ desc: "organization deleted unique constraint" }, "ORGANIZATION"],
    [{ response: { data: { code: "科別已刪除_重複" } } }, "ORGANIZATION"],
  ])("returns the organization recreation message for a deleted duplicate conflict", (error, targetType) => {
    expect(resolveDeletedDuplicateMessage(error, targetType)).toBe(
      "此科別曾被刪除，目前後端尚未開放重新建立，請聯絡系統管理人員恢復或解除限制。",
    );
  });

  it.each([
    { status: 400, desc: "請求資料格式不正確" },
    { code: "DUPLICATE", desc: "資料已存在" },
    { code: "DELETED", desc: "資料已刪除" },
  ])("does not classify an unrelated or incomplete conflict", (error) => {
    expect(resolveDeletedDuplicateMessage(error, "ACCOUNT")).toBe("");
  });
});

describe("resolveApiErrorMessage", () => {
  it("preserves the backend description", () => {
    expect(resolveApiErrorMessage({ desc: "後端原始訊息" })).toBe("後端原始訊息");
  });
});
