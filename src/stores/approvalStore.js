import { defineStore } from "pinia";

import {
  getChangeRequestHistory,
  getPendingChangeRequests,
} from "@/services/approvalService";

export const useApprovalStore = defineStore("approvals", {
  state: () => ({ pending: [], history: [], loading: false }),
  actions: {
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
