import { defineStore } from "pinia";

import {
  approveCopyChangeRequest,
  cancelCopyChangeRequest,
  getCopyChangeRequests,
  rejectCopyChangeRequest,
  submitCopy,
} from "@/services/copyService";

const ALL_COPY_STATUSES = ["PENDING", "APPROVED", "REJECTED", "CANCELED"];

export const useCopyStore = defineStore("copies", {
  state: () => ({
    items: [],
    itemsByStatus: {},
    totalsByStatus: {},
    draft: null,
    loadedKeys: {},
    inFlightByKey: {},
    loading: false,
    error: "",
  }),

  getters: {
    counts: (state) => ({
      all: Object.values(state.totalsByStatus).reduce((sum, count) => sum + Number(count || 0), 0),
      pending: Number(state.totalsByStatus.PENDING || 0),
      approved: Number(state.totalsByStatus.APPROVED || 0),
      rejected: Number(state.totalsByStatus.REJECTED || 0),
      cancelled: Number(state.totalsByStatus.CANCELED || 0),
    }),
    byStatus: (state) => (status) =>
      status ? state.itemsByStatus[status] || [] : state.items,
  },

  actions: {
    async ensureLoaded(params = {}) {
      const status = params.status || ALL_COPY_STATUSES;
      const key = buildCopyStoreKey(status);
      if (this.loadedKeys[key] && !params.force) {
        this.items = getRowsForStatus(this.itemsByStatus, status);
        return this.items;
      }
      if (this.inFlightByKey[key] && !params.force) return this.inFlightByKey[key];
      this.loading = true;
      this.error = "";
      this.inFlightByKey[key] = getCopyChangeRequests({
        status,
        page: params.page || 1,
        size: params.size || 100,
        force: params.force,
      })
        .then((response) => {
          const rows = response.content || [];
          setRowsForStatus(this.itemsByStatus, this.totalsByStatus, status, rows, response.totalElements);
          this.items = getRowsForStatus(this.itemsByStatus, status);
          this.loadedKeys[key] = true;
          return this.items;
        })
        .catch((error) => {
          this.error = "文案資料載入失敗";
          console.error(error);
          throw error;
        })
        .finally(() => {
          delete this.inFlightByKey[key];
          this.loading = false;
        });
      return this.inFlightByKey[key];
    },

    async create(payload) {
      const response = await submitCopy(payload);
      this.invalidate("PENDING");
      return response;
    },

    async cancelSubmission(id) {
      await cancelCopyChangeRequest(id);
      this.invalidate(["PENDING", "CANCELED"]);
    },

    async approveSubmission(id) {
      await approveCopyChangeRequest(id);
      this.invalidate(["PENDING", "APPROVED"]);
    },

    async rejectSubmission(id, reason) {
      await rejectCopyChangeRequest(id, reason);
      this.invalidate(["PENDING", "REJECTED"]);
    },

    async copyAndCreate(_sourceId, overrides = {}) {
      return this.create(overrides);
    },

    invalidate(status) {
      normalizeStatusList(status || ALL_COPY_STATUSES).forEach((item) => {
        delete this.itemsByStatus[item];
        delete this.totalsByStatus[item];
      });
      this.items = getRowsForStatus(this.itemsByStatus, ALL_COPY_STATUSES);
      this.loadedKeys = {};
    },

    resetState() {
      this.items = [];
      this.itemsByStatus = {};
      this.totalsByStatus = {};
      this.draft = null;
      this.loadedKeys = {};
      this.inFlightByKey = {};
      this.loading = false;
      this.error = "";
    },
  },
});

function normalizeStatusList(status) {
  if (Array.isArray(status)) return status.filter(Boolean).map((item) => String(item));
  return status ? [String(status)] : [...ALL_COPY_STATUSES];
}

function buildCopyStoreKey(status) {
  return normalizeStatusList(status).sort().join(",");
}

function getRowsForStatus(itemsByStatus, status) {
  return normalizeStatusList(status)
    .flatMap((item) => itemsByStatus[item] || [])
    .sort((a, b) =>
      String(b.submittedAt || b.createdAt || "").localeCompare(String(a.submittedAt || a.createdAt || "")),
    );
}

function setRowsForStatus(itemsByStatus, totalsByStatus, status, rows, totalElements) {
  const statuses = normalizeStatusList(status);
  if (statuses.length === 1) {
    itemsByStatus[statuses[0]] = rows;
    totalsByStatus[statuses[0]] = Number(totalElements ?? rows.length);
    return;
  }
  statuses.forEach((singleStatus) => {
    const filteredRows = rows.filter((row) => row.status === singleStatus);
    itemsByStatus[singleStatus] = filteredRows;
    totalsByStatus[singleStatus] = filteredRows.length;
  });
}
