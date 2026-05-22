import { defineStore } from "pinia";

import { getOrganizations } from "@/services/organizationService";

export const useOrganizationStore = defineStore("organizations", {
  state: () => ({ organizations: [], loading: false }),
  actions: {
    async fetchOrganizations() {
      this.loading = true;
      try {
        this.organizations = await getOrganizations();
      } finally {
        this.loading = false;
      }
    },
  },
});
