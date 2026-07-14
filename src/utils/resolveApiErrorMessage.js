export const resolveApiErrorMessage = (error) => {
  const status = error?.status || error?.response?.status;
  const data = error?.raw?.response?.data || error?.response?.data;

  if (error?.desc) return error.desc;
  if (data?.desc) return data.desc;
  if (data?.returnMsg) return data.returnMsg;
  if (data?.message) return data.message;

  if (
    error?.raw?.code === "ECONNABORTED" ||
    error?.raw?.message?.includes("timeout") ||
    error?.desc?.includes("timeout")
  ) {
    return "連線逾時，請稍後再試";
  }
  if (
    error?.raw?.message === "Network Error" ||
    (typeof window !== "undefined" && !window.navigator.onLine)
  ) {
    return "網路異常，請稍後再試";
  }

  if (status === 400) return "請求資料格式不正確";
  if (status === 401) return "帳號或密碼錯誤，或登入狀態已失效";
  if (status === 403) return "您沒有權限執行此操作";
  if (status === 404) return "找不到服務或資料";
  if (status >= 500) return "系統忙碌中，請稍後再試";

  return "系統發生錯誤，請稍後再試";
};

export function resolveDeletedDuplicateMessage(error, targetType) {
  const source = [
    error?.code,
    error?.desc,
    error?.response?.data?.code,
    error?.response?.data?.desc,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const isDeletedDuplicate =
    /deleted|已刪除/.test(source) && /duplicate|unique|重複|已存在/.test(source);

  if (!isDeletedDuplicate) return "";

  return targetType === "ACCOUNT"
    ? "此員編曾被刪除，目前後端尚未開放重新建立，請聯絡系統管理人員恢復或解除限制。"
    : "此科別曾被刪除，目前後端尚未開放重新建立，請聯絡系統管理人員恢復或解除限制。";
}
