export function required(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

export function validateUserId(value) {
  if (!required(value)) return "帳號必填";
  return "";
}

export function validateRequired(value, label) {
  return required(value) ? "" : `${label}必填`;
}

export function validateCopyForm(form) {
  const errors = {};
  ["number", "title", "content", "clickAction", "expirationType"].forEach(
    (key) => {
      if (!required(form[key])) errors[key] = "此欄位必填";
    },
  );

  if (form.clickAction === "OPEN_URL" && !required(form.url))
    errors.url = "開啟網址時必填";
  if (form.expirationType === "RETENTION_MONTHS") {
    const months = Number(form.retentionMonths);
    if (!months || months < 1 || months > 12)
      errors.retentionMonths = "請輸入 1-12 個月";
  }
  if (form.expirationType === "EXPIRED_AT" && !required(form.expiredAt))
    errors.expiredAt = "請選擇到期時間";

  return errors;
}

export function normalizeEmployeeId(value) {
  return String(value || "").trim().padStart(7, "0");
}

export function validateEmployeeId(value) {
  const rawValue = String(value || "").trim();
  if (!rawValue) return "請輸入員編";
  if (!/^\d+$/.test(rawValue)) return "員編限輸入數字";
  if (rawValue.length > 7) return "員編最多7碼";
  return "";
}

export function validatePassword(value, accountId) {
  if (!value || value.length < 12) return "密碼必須至少12個字元";
  const categoryCount = [
    /[a-z]/.test(value),
    /[A-Z]/.test(value),
    /\d/.test(value),
    /[^A-Za-z0-9]/.test(value),
  ].filter(Boolean).length;
  if (categoryCount < 3) return "密碼須包含英文大小寫、數字、符號其中三項";
  if (accountId && value.toLowerCase().includes(accountId.toLowerCase())) {
    return "密碼不可包含帳號";
  }
  return "";
}
