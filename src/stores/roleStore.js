import { defineStore } from "pinia";

import { getRoles } from "@/services/roleService";

export const useRoleStore = defineStore("roles", {
  state: () => ({ roles: [], loading: false }),
  actions: {
    async fetchRoles() {
      this.loading = true;
      try {
        this.roles = await getRoles();
      } finally {
        this.loading = false;
      }
    },
  },
});
