import { defineStore } from "pinia";

import { login as loginApi, logout as logoutApi } from "@/services/authService";
import { normalizeRoles } from "@/utils/authRoles";
import {
  clearAuthStorage,
  readAccessToken,
  readAuthStorage,
  writeAuthStorage,
} from "@/utils/authStorage";
import { getPermissionsByRoles, hasPermission } from "@/utils/permissions";

const PASSWORD_REMINDER_DAYS = 25;
const PASSWORD_EXPIRED_DAYS = 30;

function readStoredAuth() {
  const storedAuth = readAuthStorage();
  const storedToken = readAccessToken();
  if (!storedAuth?.accessToken || !storedToken) {
    clearAuthStorage();
    return null;
  }
  return storedAuth;
}

const normalizeLoginResponse = (response) => response?.body || response?.data || response || {};

function createAuthError(response, desc) {
  return {
    status: response?.status,
    code: response?.code,
    desc,
    body: response?.body,
    raw: response,
  };
}

export const useAuthStore = defineStore("auth", {
  state: () => {
    const storedAuth = readStoredAuth();
    return {
      accessToken: storedAuth?.accessToken || "",
      userId: storedAuth?.userId || "",
      employeeId: storedAuth?.employeeId || "",
      userName: storedAuth?.userName || "",
      roles: normalizeRoles(storedAuth?.roles),
      mustChangePassword: storedAuth?.mustChangePassword || false,
      passwordResetByAdmin: storedAuth?.passwordResetByAdmin || false,
      passwordChangedAt: storedAuth?.passwordChangedAt || "",
      loading: false,
    };
  },
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
      writeAuthStorage(payload);
    },
    async login(payload) {
      this.loading = true;
      try {
        clearAuthStorage();
        const response = await loginApi(payload);
        if (response?.code && response.code !== "0000") {
          throw createAuthError(response, response.desc || "登入失敗");
        }
        const data = normalizeLoginResponse(response);
        if (!data.accessToken) {
          throw createAuthError(response, "登入成功回應缺少 accessToken");
        }
        const responseRoles = normalizeRoles(
          Array.isArray(data.roles) ? data.roles : data.user?.roles,
        );

        this.accessToken = data.accessToken || "";
        this.userId = data.userId || data.user?.userId || "";
        this.employeeId = data.employeeId || data.user?.employeeId || this.userId;
        this.userName = data.userName || data.user?.userName || "";
        this.roles = responseRoles;
        this.mustChangePassword = Boolean(data.mustChangePassword);
        this.passwordResetByAdmin = Boolean(data.passwordResetByAdmin);
        this.passwordChangedAt = data.passwordChangedAt || "";
        this.persist();
        return response;
      } finally {
        this.loading = false;
      }
    },
    async logout() {
      try {
        await logoutApi();
      } catch (error) {
        console.error(error);
      } finally {
        this.clearAuth();
      }
    },
    clearAuth() {
      this.accessToken = "";
      this.userId = "";
      this.employeeId = "";
      this.userName = "";
      this.roles = [];
      this.mustChangePassword = false;
      this.passwordResetByAdmin = false;
      this.passwordChangedAt = "";
      clearAuthStorage();
    },
    markPasswordChanged() {
      this.mustChangePassword = false;
      this.passwordResetByAdmin = false;
      this.passwordChangedAt = new Date().toISOString();
      this.persist();
    },
  },
});
