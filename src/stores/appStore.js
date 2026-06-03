import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => ({
    isLoading: false,
    alertState: {
      open: false,
      title: "錯誤",
      message: "",
      confirmText: "我知道了",
      variant: "error",
    },
  }),
  actions: {
    setLoading(value) {
      this.isLoading = Boolean(value);
    },
    showAlert(payload = {}) {
      this.alertState = {
        open: true,
        title: payload.title || "錯誤",
        message: payload.message || payload.content || "系統錯誤",
        confirmText: payload.confirmText || "我知道了",
        variant: payload.variant || payload.type || "error",
      };
    },
    hideAlert() {
      this.alertState = {
        ...this.alertState,
        open: false,
      };
    },
  },
});
