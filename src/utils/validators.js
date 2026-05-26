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
