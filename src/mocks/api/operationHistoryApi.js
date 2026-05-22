import { mockOperationLogs } from "@/mocks/approvals.mock";

const isWithinDateRange = (value, startDate, endDate) => {
  if (!startDate && !endDate) return true;
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return false;
  if (startDate && time < new Date(startDate).getTime()) return false;
  if (endDate && time > new Date(`${endDate}T23:59:59`).getTime()) {
    return false;
  }
  return true;
};

export const mockGetOperationHistory = async ({
  keyword = "",
  startDate = "",
  endDate = "",
} = {}) => {
  const normalizedKeyword = keyword.trim().toLowerCase();
  const list = mockOperationLogs.filter((item) => {
    const matchKeyword =
      !normalizedKeyword ||
      [item.userName, item.module, item.actionLabel, item.targetName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedKeyword));

    return (
      matchKeyword && isWithinDateRange(item.createdAt, startDate, endDate)
    );
  });

  return {
    list,
    total: list.length,
  };
};
