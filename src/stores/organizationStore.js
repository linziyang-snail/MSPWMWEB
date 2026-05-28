import { defineStore } from "pinia";

import { getOrganizations } from "@/services/organizationService";

export const useOrganizationStore = defineStore("organizations", {
  state: () => ({ organizations: [], loading: false }),
  actions: {
    resetState() {
      this.organizations = [];
      this.loading = false;
    },
    async fetchOrganizations(params = {}) {
      this.loading = true;
      try {
        this.organizations = await getOrganizations(params);
      } finally {
        this.loading = false;
      }
    },
  },
});
