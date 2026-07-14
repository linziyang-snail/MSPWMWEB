import { defineStore } from "pinia";

import {
  getAccountChangeRequests,
  getUsers,
} from "@/services/userService";
import { hasAdminRole, normalizeRoles } from "@/utils/authRoles";
import { readAuthStorage } from "@/utils/authStorage";

const USER_PENDING_CREATE_QUERY = { status: "PENDING", action: ["CREATE"] };
const USER_PENDING_CHANGES_QUERY = { status: "PENDING", action: ["UPDATE", "DELETE"] };

export const useUserStore = defineStore("users", {
  state: () => ({
    users: [],
    usersByStatus: {},
    totalElements: 0,
    page: 1,
    size: 20,
    accountChangeRequests: [],
    changeRequestsByStatus: {},
    changeRequestTotalsByStatus: {},
    inFlightByKey: {},
    lastFetchedAtByKey: {},
    loaded: false,
    loadingPromise: null,
    loading: false,
    error: "",
  }),
  getters: {
    pendingNewCount: (state) =>
      getChangeRequestTotalFromState(state, USER_PENDING_CREATE_QUERY),
    pendingChangeCount: (state) =>
      getChangeRequestTotalFromState(state, USER_PENDING_CHANGES_QUERY),
  },
  actions: {
    async ensureLoaded(params = {}) {
      if (!canLoadAdminUserData(params)) return;
      if (this.loaded) return;
      if (this.loadingPromise) return this.loadingPromise;
      this.loadingPromise = Promise.all([
        this.fetchAccountChangeRequests(USER_PENDING_CREATE_QUERY, params),
        this.fetchAccountChangeRequests(USER_PENDING_CHANGES_QUERY, params),
      ])
        .then(() => {
          this.loaded = true;
        })
        .finally(() => {
          this.loadingPromise = null;
        });
      return this.loadingPromise;
    },
    async refreshAll(params = {}) {
      if (!canLoadAdminUserData(params)) return;
      this.loaded = false;
      this.loadingPromise = null;
      await Promise.all([
        this.fetchUsers({ size: 100, ...params, force: true }),
        this.fetchAccountChangeRequests(USER_PENDING_CREATE_QUERY, { force: true }),
        this.fetchAccountChangeRequests(USER_PENDING_CHANGES_QUERY, { force: true }),
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
      this.changeRequestTotalsByStatus = {};
      this.inFlightByKey = {};
      this.lastFetchedAtByKey = {};
      this.loaded = false;
      this.loadingPromise = null;
      this.loading = false;
      this.error = "";
    },
    invalidateUsers(status) {
      if (status) {
        const statusKey = buildStatusKey(status);
        Object.keys(this.usersByStatus).forEach((key) => {
          if (key.split(",").some((item) => statusKey.split(",").includes(item))) {
            delete this.usersByStatus[key];
          }
        });
        Object.keys(this.inFlightByKey).forEach((key) => {
          if (key.includes(encodeURIComponent(statusKey)) || key.includes(statusKey)) {
            delete this.inFlightByKey[key];
          }
        });
        return;
      }
      this.usersByStatus = {};
    },
    invalidateAccountChangeRequests(params = "PENDING") {
      const key = buildChangeRequestsKey(params);
      delete this.changeRequestsByStatus[key];
      delete this.changeRequestTotalsByStatus[key];
      delete this.inFlightByKey[key];
      if (getChangeRequestStatus(params) === "PENDING") this.loaded = false;
    },
    async fetchUsers(params = {}) {
      const { force = false, ...requestParams } = params || {};
      const status = Object.hasOwn(requestParams, "status")
        ? requestParams.status
        : "ACTIVE";
      const statuses = normalizeStatusList(status);
      const statusKey = buildStatusKey(status);
      const key = buildUsersKey({ ...requestParams, status });
      if (!force && this.usersByStatus[statusKey]) {
        this.users = this.usersByStatus[statusKey];
        return this.createPageFromCachedUsers(statusKey, requestParams);
      }
      if (this.inFlightByKey[key]) return this.inFlightByKey[key];
      this.loading = true;
      this.error = "";
      this.inFlightByKey[key] = (async () => {
        const pages = statuses.length
          ? await Promise.all(
            statuses.map((singleStatus) =>
              fetchAllUsersForStatus(singleStatus, requestParams),
            ),
          )
          : [await fetchAllUsersForStatus(undefined, requestParams)];
        const response = mergeUserPages(pages, requestParams);
        const rows = response.content || [];
        this.users = rows;
        this.usersByStatus = { ...this.usersByStatus, [statusKey]: rows };
        if (statuses.length === 1) {
          this.usersByStatus = { ...this.usersByStatus, [statuses[0]]: rows };
        }
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
        this.changeRequestTotalsByStatus = {
          ...this.changeRequestTotalsByStatus,
          [key]: getRowsTotalElements(rows),
        };
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
      return this.usersByStatus[buildStatusKey(status)] || [];
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
  const status = normalizeStatusList(params.status);
  const normalizedParams = {
    page: params.page || 1,
    size: Math.min(Number(params.size || 20), 100),
    status: buildStatusKey(status),
  };
  return `users:${new URLSearchParams(normalizedParams).toString()}`;
}

function normalizeStatusList(status) {
  if (status === null || status === undefined || status === "") return [];
  if (Array.isArray(status)) return status.filter(Boolean).map(String);
  return [String(status)];
}

function buildStatusKey(status) {
  const statuses = normalizeStatusList(status);
  return statuses.length ? statuses.sort().join(",") : "ALL";
}

// Fetch every page for one status (1 request for <=100 rows; more only when
// the dataset exceeds a page) so client-side sort/filter/search see all rows.
async function fetchAllUsersForStatus(status, requestParams = {}) {
  const size = 100;
  let page = 1;
  let content = [];
  let totalElements = 0;
  const { status: _status, ...paramsWithoutStatus } = requestParams;
  for (let guard = 0; guard < 100; guard += 1) {
    const query = { ...paramsWithoutStatus, page, size };
    if (status !== undefined) query.status = status;
    const response = await getUsers(query);
    const rows = response?.content || [];
    content = content.concat(rows);
    totalElements = Number(response?.totalElements ?? content.length);
    if (rows.length < size) break;
    page += 1;
  }
  return { content, totalElements, page: 1, size: content.length };
}

function mergeUserPages(pages = [], params = {}) {
  const content = Array.from(
    pages
      .flatMap((pageData) => pageData?.content || [])
      .reduce((map, row) => {
        if (row?.id) map.set(String(row.id), row);
        return map;
      }, new Map()).values(),
  );
  return {
    content,
    totalElements: pages.reduce((sum, pageData) => sum + Number(pageData?.totalElements || 0), 0),
    page: params.page || 1,
    size: Math.min(Number(params.size || 100), 100),
  };
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

function getChangeRequestTotalFromState(state, params) {
  const key = buildChangeRequestsKey(params);
  const cachedTotal = state.changeRequestTotalsByStatus?.[key];
  if (Number.isFinite(Number(cachedTotal))) return Number(cachedTotal);
  return (state.changeRequestsByStatus?.[key] || []).length;
}

function getRowsTotalElements(rows = []) {
  const totalElements = rows?.totalElements;
  if (Number.isFinite(Number(totalElements))) return Number(totalElements);
  return Array.isArray(rows) ? rows.length : 0;
}

function canLoadAdminUserData(params = {}) {
  const roles = normalizeRoles(params.roles || readAuthStorage()?.roles || []);
  return hasAdminRole(roles);
}
