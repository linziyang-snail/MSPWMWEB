import { normalizeRoles } from "@/utils/authRoles";
import { roleLabelMap } from "@/utils/constants";

export const sidebarSections = [
  {
    label: "文案管理",
    to: "/copies/all",
    icon: "filetext",
    match: "/copies",
    roles: ["USER", "MANAGER"],
    children: [
      { label: "全部文案", to: "/copies/all" },
      { label: "待審核文案", to: "/copies/pending", countKey: "pending" },
      { label: "已核准文案", to: "/copies/approved" },
      { label: "已駁回文案", to: "/copies/rejected" },
      { label: "已取消文案", to: "/copies/cancelled", roles: ["USER"] },
    ],
  },
  {
    label: "人員管理",
    to: "/accounts/pending-changes",
    icon: "users",
    match: "/accounts",
    roles: ["ADMIN"],
    children: [
      { label: "待審核新帳號", to: "/accounts/pending-changes", countKey: "AccountPendingChanges" },
      { label: "待審核帳號異動", to: "/accounts/pending-review", countKey: "AccountPendingReview" },
      { label: "已啟用帳號", to: "/accounts/active" },
      { label: "已停用帳號", to: "/accounts/disabled" },
      { label: "已刪除帳號", to: "/accounts/deleted" },
    ],
  },
  {
    label: "科別管理",
    to: "/categories/all",
    icon: "application",
    match: ["/applications", "/categories"],
    roles: ["ADMIN"],
    highlightActive: false,
    children: [
      { label: "全部科別", to: "/categories/all" },
      { label: "待審核科別", to: "/categories/pending", count: 4 },
      { label: "已駁回科別", to: "/categories/rejected" },
      { label: "已刪除科別", to: "/categories/deleted" },
    ],
  },
];

/* 左側下方共用按鈕 (操作歷程 / 修改密碼) — 登出永遠最底 */
export const sidebarBottomItems = [
  { label: "查看操作記錄", action: "operationLogs", icon: "history" },
  { label: "修改個人密碼", action: "changePassword", icon: "password" },
  { label: "登出系統", action: "logout", icon: "logout", danger: true },
];

export const breadcrumbMap = {
  CopyAll: ["推播文案管理"],
  CopyPending: ["推播文案管理", "待審核文案"],
  CopyApproved: ["推播文案管理", "已核准文案"],
  CopyRejected: ["推播文案管理", "已駁回文案"],
  CopyCancelled: ["推播文案管理", "已取消文案"],
  AccountPendingChanges: ["推播人員管理", "待審核新帳號"],
  AccountPendingReview: ["推播人員管理", "待審核帳號異動"],
  AccountActive: ["推播人員管理", "已啟用帳號"],
  AccountDisabled: ["推播人員管理", "已停用帳號"],
  AccountDeleted: ["推播人員管理", "已刪除帳號"],
  ApplicationQuery: ["科別管理"],
  CategoryAll: ["科別管理", "全部科別"],
  CategoryPending: ["科別管理", "待審核科別"],
  CategoryRejected: ["科別管理", "已駁回科別"],
  CategoryDeleted: ["科別管理", "已刪除科別"],
  OperationLogs: ["查看操作記錄"],
  ChangePassword: ["修改個人密碼"],
};

export function getBreadcrumbItems(route) {
  const mappedItems = breadcrumbMap[route?.name];
  if (mappedItems) return mappedItems;

  const normalizedPath = normalizePath(route?.path);
  const matchedSection = sidebarSections.find((section) =>
    section.children.some((item) => normalizePath(item.to) === normalizedPath),
  );
  if (!matchedSection) return ["文案管理", "全部文案"];

  const matchedChild = matchedSection.children.find(
    (item) => normalizePath(item.to) === normalizedPath,
  );
  return [`推播${matchedSection.label}`, matchedChild?.label].filter(Boolean);
}

function normalizePath(path = "") {
  return String(path).replace(/\/+$/, "") || "/";
}

export function getRoleLabel(roles = []) {
  const role = normalizeRoles(roles).find((value) => roleLabelMap[value]);
  return role ? roleLabelMap[role] : "經辦人員";
}
