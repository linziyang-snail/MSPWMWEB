<template>
  <div class="min-h-screen bg-background-page font-sans text-text-primary">
    <Sidebar
      :open="sidebarOpen"
      @change-password="showChangePassword = true"
      @close="sidebarOpen = false"
      @logout="showLogout = true"
      @operation-logs="openOperationLogs"
    />
    <div class="min-h-screen transition-[padding] lg:pl-sidebar">
      <Header
        @change-password="showChangePassword = true"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
      />
      <main class="px-5 pb-8 pt-6 lg:px-8">
        <RouterView />
      </main>
    </div>
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-30 bg-background-overlay backdrop-blur-sm lg:hidden"
      @click="sidebarOpen = false"
    />

    <ConfirmDialog
      v-model="showLogout"
      title="確認登出"
      message="確定要登出系統嗎？如有未儲存的資料可能會遺失。"
      confirm-text="確認登出"
      @confirm="handleLogout"
    />
    <PasswordUpdateNotice
      v-model="showPasswordNotice"
      :message="passwordNoticeMessage"
      @confirm="handlePasswordNoticeConfirm"
    />
    <PasswordChangeModal
      v-model="showChangePassword"
      :subtitle="passwordSubtitle"
      @submitted="handlePasswordChanged"
    />
    <div
      v-if="appStore.isLoading"
      class="fixed inset-0 z-50 grid place-items-center bg-background-overlay"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        class="flex items-center gap-3 rounded-lg bg-background-surface px-5 py-4 text-sm font-medium text-text-secondary shadow-popup"
      >
        <span
          class="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent"
        />
        載入中
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";

import ConfirmDialog from "@/components/common/ConfirmDialog.vue";
import PasswordChangeModal from "@/components/dialogs/PasswordChangeModal.vue";
import PasswordUpdateNotice from "@/components/dialogs/PasswordUpdateNotice.vue";
import Header from "@/components/layout/Header.vue";
import Sidebar from "@/components/layout/Sidebar.vue";
import { useAppStore } from "@/stores/appStore";
import { useAuthStore } from "@/stores/authStore";

const sidebarOpen = ref(false);
const showLogout = ref(false);
const showChangePassword = ref(false);
const showPasswordNotice = ref(false);
const passwordNoticeDismissed = ref(false);

const appStore = useAppStore();
const auth = useAuthStore();
const router = useRouter();

const passwordSubtitle = computed(() => {
  const employeeId = auth.employeeId || auth.userId || "";
  return employeeId ? `員編：${employeeId}` : "";
});

const passwordNoticeMessage = computed(() => {
  if (auth.passwordNoticeType === "expired") {
    return "您的密碼已超過30天未修改，基於帳戶安全，請聯繫超級管理員重新設定密碼後再繼續使用系統。";
  }
  return "為確保您的帳戶安全，請立即於左下方「修改個人密碼」設定新的登入密碼，完成後方可繼續使用系統。";
});

watch(
  () => auth.shouldShowPasswordNotice,
  (shouldShow) => {
    showPasswordNotice.value = shouldShow && !passwordNoticeDismissed.value;
  },
  { immediate: true },
);

const handlePasswordNoticeConfirm = () => {
  const noticeType = auth.passwordNoticeType;
  passwordNoticeDismissed.value = true;
  showPasswordNotice.value = false;
  if (noticeType === "required" || noticeType === "reminder") {
    showChangePassword.value = true;
  }
};

const handlePasswordChanged = () => {
  auth.markPasswordChanged();
  passwordNoticeDismissed.value = false;
  showPasswordNotice.value = false;
};

const openOperationLogs = () => {
  router.push("/operation-logs");
};

const handleLogout = async () => {
  try {
    await auth.logout();
    router.push("/login");
  } catch (error) {
    console.error(error);
  } finally {
    showLogout.value = false;
  }
};
</script>
