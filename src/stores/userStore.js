import { defineStore } from "pinia";

import {
  getAccountChangeRequests,
  getUsers,
} from "@/services/userService";

export const useUserStore = defineStore("users", {
  state: () => ({
    users: [],
    usersByStatus: {},
    totalElements: 0,
    page: 1,
    size: 20,
    accountChangeRequests: [],
    changeRequestsByStatus: {},
    inFlightByKey: {},
    lastFetchedAtByKey: {},
    loaded: false,
    loadingPromise: null,
    loading: false,
    error: "",
  }),
  getters: {
    pendingNewCount: (state) => {
      const pendingIds = new Set(
        (state.usersByStatus.PENDING_APPROVAL || state.users)
          .filter((user) => ["PENDING", "PENDING_APPROVAL"].includes(user.status))
          .map((user) => String(user.id)),
      );
      (state.changeRequestsByStatus.PENDING || state.accountChangeRequests).forEach((item) => {
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
      (state.changeRequestsByStatus.PENDING || state.accountChangeRequests).filter((item) => {
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
      this.loadingPromise = this.fetchAccountChangeRequests("PENDING", params).then(() => {
        this.loaded = true;
      }).finally(() => {
        this.loadingPromise = null;
      });
      return this.loadingPromise;
    },
    async refreshAll(params = {}) {
      this.loaded = false;
      this.loadingPromise = null;
      await Promise.all([
        this.fetchUsers({ size: 100, ...params, force: true }),
        this.fetchAccountChangeRequests("PENDING", { force: true }),
      ]);
      this.loaded = true;
    },
    async fetchUsers(params = {}) {
      const { force = false, ...requestParams } = params || {};
      const status = requestParams.status || "ACTIVE";
      const key = buildUsersKey({ ...requestParams, status });
      if (!force && this.usersByStatus[status]) {
        this.users = this.usersByStatus[status];
        return this.createPageFromCachedUsers(status, requestParams);
      }
      if (this.inFlightByKey[key]) return this.inFlightByKey[key];
      this.loading = true;
      this.error = "";
      this.inFlightByKey[key] = (async () => {
        const response = await getUsers({
          page: this.page,
          size: this.size,
          ...requestParams,
          status,
        });
        const rows = response?.content || [];
        this.users = rows;
        this.usersByStatus = { ...this.usersByStatus, [status]: rows };
        this.totalElements = response?.totalElements || 0;
        this.page = response?.page || requestParams.page || this.page;
        this.size = response?.size || Math.min(requestParams.size || this.size, 100);
        this.lastFetchedAtByKey = { ...this.lastFetchedAtByKey, [key]: Date.now() };
        return response;
      })();
      try {
        return await this.inFlightByKey[key];
      } catch (error) {
        this.error = "查詢使用者失敗";
        console.error(error);
        throw error;
      } finally {
        delete this.inFlightByKey[key];
        this.loading = false;
      }
    },
    async fetchAccountChangeRequests(status = "PENDING", options = {}) {
      const { force = false } = options || {};
      const key = buildChangeRequestsKey(status);
      if (!force && this.changeRequestsByStatus[status]) {
        this.accountChangeRequests = this.changeRequestsByStatus[status];
        return this.accountChangeRequests;
      }
      if (this.inFlightByKey[key]) return this.inFlightByKey[key];
      this.inFlightByKey[key] = (async () => {
        const rows = await getAccountChangeRequests(status);
        this.accountChangeRequests = rows;
        this.changeRequestsByStatus = { ...this.changeRequestsByStatus, [status]: rows };
        this.lastFetchedAtByKey = { ...this.lastFetchedAtByKey, [key]: Date.now() };
        return rows;
      })();
      try {
        return await this.inFlightByKey[key];
      } catch (error) {
        this.error = "查詢帳號異動失敗";
        console.error(error);
        throw error;
      } finally {
        delete this.inFlightByKey[key];
      }
    },
    getCachedUsers(status = "ACTIVE") {
      return this.usersByStatus[status] || [];
    },
    getCachedChangeRequests(status = "PENDING") {
      return this.changeRequestsByStatus[status] || [];
    },
    createPageFromCachedUsers(status, params = {}) {
      const rows = this.usersByStatus[status] || [];
      return {
        content: rows,
        totalElements: rows.length,
        page: params.page || this.page,
        size: params.size || this.size,
      };
    },
  },
});

function buildUsersKey(params = {}) {
  const normalizedParams = {
    page: params.page || 1,
    size: Math.min(Number(params.size || 20), 100),
    status: params.status || "ACTIVE",
  };
  return `users:${new URLSearchParams(normalizedParams).toString()}`;
}

function buildChangeRequestsKey(status = "PENDING") {
  return `changeRequests:USER:${status || "PENDING"}`;
}
