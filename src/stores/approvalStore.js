import { defineStore } from "pinia";

import {
  getChangeRequestHistory,
  getChangeRequests,
  getPendingChangeRequests,
} from "@/services/approvalService";

export const useApprovalStore = defineStore("approvals", {
  state: () => ({ pending: [], history: [], loading: false, categoryPendingCount: 0 }),
  actions: {
    resetState() {
      this.pending = [];
      this.history = [];
      this.loading = false;
      this.categoryPendingCount = 0;
    },
    async fetchCategoryPendingCount(options = {}) {
      const { force = false } = options;
      try {
        const page = await getChangeRequests({
          targetType: "ORGANIZATION",
          status: "PENDING",
          page: 1,
          size: 100,
          force,
        });
        this.categoryPendingCount = Number(
          page?.totalElements ?? page?.content?.length ?? 0,
        );
      } catch (error) {
        console.error(error);
      }
      return this.categoryPendingCount;
    },
    async fetchPending(params = {}) {
      this.loading = true;
      try {
        this.pending = await getPendingChangeRequests(params);
      } finally {
        this.loading = false;
      }
    },
    async fetchHistory(params = {}) {
      this.loading = true;
      try {
        this.history = await getChangeRequestHistory(params);
      } finally {
        this.loading = false;
      }
    },
  },
});
