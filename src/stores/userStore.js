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
      getPendingChangeRequestsFromState(state).forEach((item) => {
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
      getPendingChangeRequestsFromState(state).filter((item) => {
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
    resetState() {
      this.users = [];
      this.usersByStatus = {};
      this.totalElements = 0;
      this.page = 1;
      this.size = 20;
      this.accountChangeRequests = [];
      this.changeRequestsByStatus = {};
      this.inFlightByKey = {};
      this.lastFetchedAtByKey = {};
      this.loaded = false;
      this.loadingPromise = null;
      this.loading = false;
      this.error = "";
    },
    invalidateUsers(status) {
      if (status) {
        delete this.usersByStatus[status];
        delete this.inFlightByKey[buildUsersKey({ page: 1, size: 100, status })];
        return;
      }
      this.usersByStatus = {};
    },
    invalidateAccountChangeRequests(params = "PENDING") {
      const key = buildChangeRequestsKey(params);
      delete this.changeRequestsByStatus[key];
      delete this.inFlightByKey[key];
      if (getChangeRequestStatus(params) === "PENDING") this.loaded = false;
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
    async fetchAccountChangeRequests(params = "PENDING", options = {}) {
      const { force = false } = options || {};
      const key = buildChangeRequestsKey(params);
      if (!force && this.changeRequestsByStatus[key]) {
        this.accountChangeRequests = this.changeRequestsByStatus[key];
        return this.accountChangeRequests;
      }
      if (this.inFlightByKey[key]) return this.inFlightByKey[key];
      this.inFlightByKey[key] = (async () => {
        const rows = await getAccountChangeRequests(params);
        this.accountChangeRequests = rows;
        this.changeRequestsByStatus = { ...this.changeRequestsByStatus, [key]: rows };
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
    getCachedChangeRequests(params = "PENDING") {
      return this.changeRequestsByStatus[buildChangeRequestsKey(params)] || [];
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

function buildChangeRequestsKey(params = "PENDING") {
  const query = typeof params === "string" ? { status: params } : params || {};
  const normalized = {
    status: normalizeKeyPart(query.status || "PENDING"),
    action: normalizeKeyPart(query.action),
  };
  return `changeRequests:USER:${normalized.status}:${normalized.action || "ALL"}`;
}

function getChangeRequestStatus(params = "PENDING") {
  if (typeof params === "string") return params || "PENDING";
  return normalizeKeyPart(params?.status || "PENDING");
}

function normalizeKeyPart(value) {
  if (Array.isArray(value)) return value.map((item) => String(item)).sort().join(",");
  return value ? String(value) : "";
}

function getPendingChangeRequestsFromState(state) {
  const cachedRows = Object.entries(state.changeRequestsByStatus || {})
    .filter(([key]) => key.startsWith("changeRequests:USER:PENDING"))
    .flatMap(([, rows]) => rows || []);
  return cachedRows.length ? cachedRows : state.accountChangeRequests;
}
