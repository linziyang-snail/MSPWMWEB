import { defineStore } from "pinia";

import {
  getAccountChangeRequests,
  getUsers,
} from "@/services/userService";

export const useUserStore = defineStore("users", {
  state: () => ({
    users: [],
    totalElements: 0,
    page: 1,
    size: 20,
    accountChangeRequests: [],
    loaded: false,
    loadingPromise: null,
    loading: false,
    error: "",
  }),
  getters: {
    pendingNewCount: (state) => {
      const pendingIds = new Set(
        state.users
          .filter((user) => user.status === "PENDING")
          .map((user) => String(user.id)),
      );
      state.accountChangeRequests.forEach((item) => {
        const targetType = item?.targetType || "USER";
        const status = item?.status || "PENDING";
        const action = String(item?.action || "").toUpperCase();
        if (targetType === "USER" && status === "PENDING" && action === "CREATE") {
          pendingIds.add(String(item.targetId || item.userId || item.id));
        }
      });
      return pendingIds.size;
    },
    pendingChangeCount: (state) =>
      state.accountChangeRequests.filter((item) => {
        const targetType = item?.targetType || "USER";
        const status = item?.status || "PENDING";
        const action = String(item?.action || "").toUpperCase();
        return targetType === "USER" && status === "PENDING" && action !== "CREATE";
      }).length,
  },
  actions: {
    async ensureLoaded(params = {}) {
      if (this.loaded) return;
      if (this.loadingPromise) return this.loadingPromise;
      this.loadingPromise = Promise.all([
        this.fetchUsers({ size: 100, ...params }),
        this.fetchAccountChangeRequests(),
      ]).then(() => {
        this.loaded = true;
      }).finally(() => {
        this.loadingPromise = null;
      });
      return this.loadingPromise;
    },
    async refreshAll(params = {}) {
      this.loaded = false;
      this.loadingPromise = null;
      await this.ensureLoaded(params);
    },
    async fetchUsers(params = {}) {
      this.loading = true;
      this.error = "";
      try {
        const response = await getUsers({
          page: this.page,
          size: this.size,
          ...params,
        });
        this.users = response?.content || [];
        this.totalElements = response?.totalElements || 0;
        this.page = response?.page || params.page || this.page;
        this.size = response?.size || Math.min(params.size || this.size, 100);
      } catch (error) {
        this.error = "查詢使用者失敗";
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    async fetchAccountChangeRequests() {
      try {
        this.accountChangeRequests = await getAccountChangeRequests();
      } catch (error) {
        this.error = "查詢帳號異動失敗";
        console.error(error);
      }
    },
  },
});
