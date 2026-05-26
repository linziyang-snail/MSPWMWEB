import AppLayout from "@/layouts/AppLayout.vue";
import AuthLayout from "@/layouts/AuthLayout.vue";
import ChangePasswordView from "@/views/account/ChangePasswordView.vue";
import AccountStatusListView from "@/views/accounts/AccountStatusListView.vue";
import ApplicationQueryView from "@/views/applications/ApplicationQueryView.vue";
import LoginView from "@/views/auth/LoginView.vue";
import CopyStatusListView from "@/views/copies/CopyStatusListView.vue";
import CopySubmitView from "@/views/copies/CopySubmitView.vue";
import ForbiddenView from "@/views/errors/ForbiddenView.vue";
import NotFoundView from "@/views/errors/NotFoundView.vue";
import OperationLogView from "@/views/operationLogs/OperationLogView.vue";
import { getDefaultEntryPathForRoles } from "@/utils/authRoles";
import { readAuthStorage } from "@/utils/authStorage";

function getDefaultEntryPath() {
  const auth = readAuthStorage();
  return getDefaultEntryPathForRoles(auth?.roles);
}

export const routes = [
  {
    path: "/login",
    component: AuthLayout,
    meta: { public: true },
    children: [
      { path: "", name: "Login", component: LoginView, meta: { public: true } },
    ],
  },
  {
    path: "/",
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", redirect: getDefaultEntryPath },
      { path: "dashboard", redirect: getDefaultEntryPath },
      { path: "copies", redirect: "/copies/all" },
      {
        path: "copies/all",
        name: "CopyAll",
        component: CopyStatusListView,
        meta: { title: "全部文案", status: "", roles: ["USER", "MANAGER"] },
      },
      {
        path: "copies/pending",
        name: "CopyPending",
        component: CopyStatusListView,
        meta: { title: "待審核文案", status: "PENDING", roles: ["USER", "MANAGER"] },
      },
      {
        path: "copies/approved",
        name: "CopyApproved",
        component: CopyStatusListView,
        meta: { title: "已核准文案", status: "APPROVED", roles: ["USER", "MANAGER"] },
      },
      {
        path: "copies/rejected",
        name: "CopyRejected",
        component: CopyStatusListView,
        meta: { title: "已駁回文案", status: "REJECTED", roles: ["USER", "MANAGER"] },
      },
      {
        path: "copies/cancelled",
        name: "CopyCancelled",
        component: CopyStatusListView,
        meta: { title: "已取消文案", status: "CANCELLED", roles: ["USER"] },
      },
      {
        path: "copies/submit",
        name: "CopySubmit",
        component: CopySubmitView,
        meta: { roles: ["USER"] },
      },
      {
        path: "accounts/pending-changes",
        name: "AccountPendingChanges",
        component: AccountStatusListView,
        meta: { title: "待審核新帳號", status: "PENDING", roles: ["ADMIN"] },
      },
      {
        path: "accounts/pending-review",
        name: "AccountPendingReview",
        component: AccountStatusListView,
        meta: { title: "待審核帳號異動", status: "PENDING", roles: ["ADMIN"] },
      },
      {
        path: "accounts/active",
        name: "AccountActive",
        component: AccountStatusListView,
        meta: { title: "已啟用帳號", status: "ACTIVE", roles: ["ADMIN"] },
      },
      {
        path: "accounts/disabled",
        name: "AccountDisabled",
        component: AccountStatusListView,
        meta: { title: "已停用帳號", status: "DISABLED", roles: ["ADMIN"] },
      },
      {
        path: "accounts/rejected",
        name: "AccountRejected",
        component: AccountStatusListView,
        meta: { title: "已駁回帳號", status: "REJECTED", roles: ["ADMIN"] },
      },
      {
        path: "accounts/deleted",
        name: "AccountDeleted",
        component: AccountStatusListView,
        meta: { title: "已刪除帳號", status: "DELETED", roles: ["ADMIN"] },
      },
      {
        path: "applications/query",
        name: "ApplicationQuery",
        redirect: "/categories/all",
        component: ApplicationQueryView,
        meta: { roles: ["ADMIN"] },
      },
      {
        path: "categories/all",
        name: "CategoryAll",
        component: ApplicationQueryView,
        meta: { roles: ["ADMIN"] },
      },
      {
        path: "categories/pending",
        name: "CategoryPending",
        component: ApplicationQueryView,
        meta: { roles: ["ADMIN"] },
      },
      {
        path: "categories/rejected",
        name: "CategoryRejected",
        component: ApplicationQueryView,
        meta: { roles: ["ADMIN"] },
      },
      {
        path: "categories/deleted",
        name: "CategoryDeleted",
        component: ApplicationQueryView,
        meta: { roles: ["ADMIN"] },
      },
      {
        path: "operation-logs",
        name: "OperationLogs",
        component: OperationLogView,
        meta: { roles: ["ADMIN"] },
      },
      {
        path: "account/password",
        name: "ChangePassword",
        component: ChangePasswordView,
      },
    ],
  },
  { path: "/403", name: "Forbidden", component: ForbiddenView },
  { path: "/:pathMatch(.*)*", name: "NotFound", component: NotFoundView },
];
