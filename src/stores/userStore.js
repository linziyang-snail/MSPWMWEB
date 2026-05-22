import { defineStore } from "pinia";

import {
  getAccountChangeRequests,
  getUsers,
} from "@/services/userService";

export const useUserStore = defineStore("users", {
  state: () => ({
    users: [],
    totalElements: 0,
    page: 1,
    size: 20,
    accountChangeRequests: [],
    loading: false,
    error: "",
  }),
  getters: {
    pendingNewCount: (state) =>
      state.users.filter((user) => user.status === "PENDING").length,
    pendingChangeCount: (state) => state.accountChangeRequests.length,
  },
  actions: {
    async fetchUsers(params = {}) {
      this.loading = true;
      this.error = "";
      try {
        const response = await getUsers({
          page: this.page,
          size: this.size,
          ...params,
        });
        this.users = response.content;
        this.totalElements = response.totalElements;
        this.page = response.page;
        this.size = response.size;
      } catch (error) {
        this.error = "查詢使用者失敗";
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    async fetchAccountChangeRequests() {
      try {
        this.accountChangeRequests = await getAccountChangeRequests();
      } catch (error) {
        this.error = "查詢帳號異動失敗";
        console.error(error);
      }
    },
  },
});
