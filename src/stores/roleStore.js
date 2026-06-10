import { defineStore } from "pinia";

import { getRoles } from "@/services/roleService";
import { roleIdMap as FALLBACK_ROLE_ID_MAP, roleLabelMap } from "@/utils/constants";

// ADMIN accounts are created by the backend; the frontend never assigns ADMIN.
const NON_ASSIGNABLE_ROLES = ["ADMIN"];
// Preferred display order for the assignable-role dropdowns.
const ASSIGNABLE_ROLE_ORDER = ["USER", "MANAGER"];

// Used before GET /api/roles has loaded so role <-> id mapping always works.
const FALLBACK_ROLES = Object.entries(FALLBACK_ROLE_ID_MAP).map(
  ([roleName, id]) => ({ id: Number(id), roleName }),
);

export const useRoleStore = defineStore("roles", {
  state: () => ({ roles: [], loaded: false, loading: false }),
  getters: {
    rolesOrFallback: (state) =>
      state.roles.length ? state.roles : FALLBACK_ROLES,
    roleNameToId() {
      const map = {};
      this.rolesOrFallback.forEach((role) => {
        if (role?.roleName != null && role?.id != null) {
          map[role.roleName] = Number(role.id);
        }
      });
      return map;
    },
    roleIdToName() {
      const map = {};
      this.rolesOrFallback.forEach((role) => {
        if (role?.roleName != null && role?.id != null) {
          map[Number(role.id)] = role.roleName;
        }
      });
      return map;
    },
    assignableRoleOptions() {
      return this.rolesOrFallback
        .filter((role) => !NON_ASSIGNABLE_ROLES.includes(role.roleName))
        .map((role) => ({
          label: roleLabelMap[role.roleName] || role.roleName,
          value: role.roleName,
        }))
        .sort(
          (a, b) =>
            ASSIGNABLE_ROLE_ORDER.indexOf(a.value) -
            ASSIGNABLE_ROLE_ORDER.indexOf(b.value),
        );
    },
  },
  actions: {
    resetState() {
      this.roles = [];
      this.loaded = false;
      this.loading = false;
    },
    async fetchRoles(options = {}) {
      const { force = false } = options;
      this.loading = true;
      try {
        this.roles = (await getRoles({ force })) || [];
        this.loaded = true;
      } finally {
        this.loading = false;
      }
      return this.roles;
    },
    async ensureLoaded() {
      if (this.loaded) return this.roles;
      return this.fetchRoles();
    },
  },
});
