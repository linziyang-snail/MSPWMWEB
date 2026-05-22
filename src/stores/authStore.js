import { defineStore } from "pinia";

import { login as loginApi, logout as logoutApi } from "@/services/authService";
import { getPermissionsByRoles, hasPermission } from "@/utils/permissions";

const STORAGE_KEY = "mspwm.auth";
const PASSWORD_REMINDER_DAYS = 25;
const PASSWORD_EXPIRED_DAYS = 30;

function readStoredAuth() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    accessToken:
      readStoredAuth()?.accessToken ||
      localStorage.getItem("mspwm.accessToken") ||
      "",
    userId: readStoredAuth()?.userId || "",
    employeeId: readStoredAuth()?.employeeId || "",
    userName: readStoredAuth()?.userName || "",
    roles: readStoredAuth()?.roles || [],
    mustChangePassword: readStoredAuth()?.mustChangePassword || false,
    passwordResetByAdmin: readStoredAuth()?.passwordResetByAdmin || false,
    passwordChangedAt: readStoredAuth()?.passwordChangedAt || "",
    loading: false,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.accessToken),
    permissions: (state) => getPermissionsByRoles(state.roles),
    passwordAgeDays: (state) => {
      if (!state.passwordChangedAt) return 0;
      const changedAt = new Date(state.passwordChangedAt);
      if (Number.isNaN(changedAt.getTime())) return 0;
      return Math.floor((Date.now() - changedAt.getTime()) / 86400000);
    },
    passwordNoticeType() {
      if (this.mustChangePassword || this.passwordResetByAdmin) return "required";
      if (this.passwordAgeDays > PASSWORD_EXPIRED_DAYS) return "expired";
      if (this.passwordAgeDays >= PASSWORD_REMINDER_DAYS) return "reminder";
      return "";
    },
    shouldShowPasswordNotice() {
      return Boolean(this.isAuthenticated && this.passwordNoticeType);
    },
  },
  actions: {
    can(permission) {
      return hasPermission(this.roles, permission);
    },
    persist() {
      const payload = {
        accessToken: this.accessToken,
        userId: this.userId,
        employeeId: this.employeeId,
        userName: this.userName,
        roles: this.roles,
        mustChangePassword: this.mustChangePassword,
        passwordResetByAdmin: this.passwordResetByAdmin,
        passwordChangedAt: this.passwordChangedAt,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      localStorage.setItem("mspwm.accessToken", this.accessToken);
    },
    async login(payload) {
      this.loading = true;
      try {
        const response = await loginApi(payload);
        this.accessToken = response.accessToken;
        this.userId = response.userId;
        this.employeeId = response.employeeId || response.userId;
        this.userName = response.userName;
        this.roles = response.roles;
        this.mustChangePassword = Boolean(response.mustChangePassword);
        this.passwordResetByAdmin = Boolean(response.passwordResetByAdmin);
        this.passwordChangedAt = response.passwordChangedAt || "";
        this.persist();
        return response;
      } finally {
        this.loading = false;
      }
    },
    async logout() {
      await logoutApi();
      this.accessToken = "";
      this.userId = "";
      this.employeeId = "";
      this.userName = "";
      this.roles = [];
      this.mustChangePassword = false;
      this.passwordResetByAdmin = false;
      this.passwordChangedAt = "";
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("mspwm.accessToken");
    },
    markPasswordChanged() {
      this.mustChangePassword = false;
      this.passwordResetByAdmin = false;
      this.passwordChangedAt = new Date().toISOString();
      this.persist();
    },
  },
});
