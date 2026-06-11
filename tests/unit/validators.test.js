import { describe, expect, it } from "vitest";

import {
  normalizeEmployeeId,
  required,
  validateCopyForm,
  validateEmployeeId,
  validatePassword,
  validateRequired,
  validateUserId,
} from "@/utils/validators";

describe("required / validateUserId / validateRequired", () => {
  it("required treats blank/whitespace/null as empty", () => {
    expect(required("x")).toBe(true);
    expect(required("  ")).toBe(false);
    expect(required("")).toBe(false);
    expect(required(null)).toBe(false);
  });
  it("validateUserId", () => {
    expect(validateUserId("")).toBe("帳號必填");
    expect(validateUserId("a")).toBe("");
  });
  it("validateRequired", () => {
    expect(validateRequired("", "密碼")).toBe("密碼必填");
    expect(validateRequired("x", "密碼")).toBe("");
  });
});

describe("validateEmployeeId / normalizeEmployeeId", () => {
  it("requires digits only, max 7", () => {
    expect(validateEmployeeId("")).toBe("請輸入員編");
    expect(validateEmployeeId("12a")).toBe("員編限輸入數字");
    expect(validateEmployeeId("12345678")).toBe("員編最多7碼");
    expect(validateEmployeeId("123")).toBe("");
  });
  it("pads to 7 digits", () => {
    expect(normalizeEmployeeId("123")).toBe("0000123");
    expect(normalizeEmployeeId("1126580")).toBe("1126580");
  });
});

describe("validatePassword", () => {
  it("requires at least 12 characters", () => {
    expect(validatePassword("Ab1!short")).toBe("密碼必須至少12個字元");
    expect(validatePassword("")).toBe("密碼必須至少12個字元");
  });
  it("requires at least 3 of 4 character classes", () => {
    // only lowercase -> 1 class
    expect(validatePassword("abcdefghijkl")).toBe(
      "密碼須包含英文大小寫、數字、符號其中三項",
    );
    // lower + upper + digit -> 3 classes
    expect(validatePassword("abcABC123def")).toBe("");
  });
  it("must not contain the account id", () => {
    expect(validatePassword("Abc123admin01", "admin01")).toBe("密碼不可包含帳號");
  });
  it("accepts a strong password", () => {
    expect(validatePassword("Ubotubot1234", "1126580")).toBe("");
  });
});

describe("validateCopyForm", () => {
  const base = {
    number: "C1",
    title: "t",
    content: "c",
    clickAction: "NONE",
    expirationType: "RETENTION_MONTHS",
    retentionMonths: 1,
  };
  it("passes a complete form", () => {
    expect(validateCopyForm({ ...base })).toEqual({});
  });
  it("flags missing required fields", () => {
    expect(validateCopyForm({ ...base, title: "" }).title).toBeTruthy();
    expect(validateCopyForm({ ...base, number: "" }).number).toBeTruthy();
  });
  it("requires url when clickAction is OPEN_URL", () => {
    // OPEN_URL requires a url; a blank url must be a validation error.
    expect(validateCopyForm({ ...base, clickAction: "OPEN_URL", url: "" }).url).toBeTruthy();
  });
  it("validates retentionMonths range 1-12", () => {
    expect(validateCopyForm({ ...base, retentionMonths: 13 }).retentionMonths).toBeTruthy();
    expect(validateCopyForm({ ...base, retentionMonths: 0 }).retentionMonths).toBeTruthy();
  });
  it("requires expiredAt for EXPIRED_AT", () => {
    const errors = validateCopyForm({
      number: "C1",
      title: "t",
      content: "c",
      clickAction: "NONE",
      expirationType: "EXPIRED_AT",
      expiredAt: "",
    });
    expect(errors.expiredAt).toBeTruthy();
  });
});
