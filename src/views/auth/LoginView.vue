<template>
  <main class="relative overflow-hidden font-sans h-dvh bg-auth-page text-text-primary">
    <div
      class="mx-auto grid h-full w-full max-w-7xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-[58fr_42fr] lg:px-12 xl:gap-20 xl:px-20">
      <section class="relative items-center justify-center hidden min-h-dvh lg:flex" aria-label="系統歡迎區">
        <div class="relative w-full max-w-2xl px-4">
          <div class="absolute top-0 rounded-full pointer-events-none -left-8 size-24 bg-primary/5" />
          <div class="absolute -rotate-45 border-2 pointer-events-none -left-2 top-20 size-20 border-primary/20" />
          <div class="absolute rounded-full pointer-events-none bottom-4 left-24 size-40 bg-accent/5" />

          <div class="relative mx-auto w-full max-w-xl rounded-3xl bg-auth-hero-border p-1.5">
            <div
              class="border-t min-h-96 rounded-3xl border-white/80 bg-auth-hero-surface px-14 py-14 shadow-auth-card backdrop-blur-sm">
              <div class="flex items-start gap-6">
                <img :src="loginBellIcon" alt="" aria-hidden="true" class="mt-1 size-15 shrink-0" />
                <div class="min-w-0">
                  <h1 class="text-4xl font-bold leading-10 whitespace-nowrap text-primary">
                    推播文案編輯系統
                  </h1>
                  <p class="mt-2 text-sm font-medium leading-5 text-primary/70">
                    Push Notification Management System
                  </p>
                </div>
              </div>

              <div class="mt-10 text-center">
                <h2
                  class="text-6xl font-bold leading-none text-transparent bg-auth-title-gradient bg-clip-text xl:text-7xl">
                  歡迎回來
                </h2>
                <div class="mx-auto mt-1 h-1.5 w-48 rounded-full bg-auth-title-line" />
                <p class="mt-4 text-xl font-medium leading-7 text-text-secondary">
                  請登入您的帳號以開始使用系統
                </p>
              </div>

              <img :src="loginSparkleIcon" alt="" aria-hidden="true" class="mt-10 size-6 opacity-20" />
            </div>
          </div>

          <div class="flex justify-center gap-4 mt-16" aria-hidden="true">
            <span class="rounded-full opacity-50 size-3 bg-primary" />
            <span class="rounded-full size-3 bg-info opacity-60" />
            <span class="rounded-full size-3 bg-accent opacity-80" />
          </div>
        </div>
      </section>

      <section class="flex items-center justify-center w-full h-full" aria-label="登入表單">
        <div
          class="w-full max-w-sm px-8 py-10 border-4 rounded-3xl border-white/50 bg-background-surface shadow-popup lg:min-h-auth-card lg:px-10">
          <div class="flex justify-center">
            <img :src="ubotLogo" alt="聯邦銀行" class="object-contain w-auto " />
          </div>

          <div class="p-5 border mt-7 rounded-2xl border-primary/15 bg-login-bg-1/70 lg:hidden">
            <div class="flex gap-3">
              <img :src="loginBellIcon" alt="" aria-hidden="true" class="size-10" />
              <div>
                <h1 class="text-2xl font-bold leading-tight text-primary">推播文案編輯系統</h1>
                <p class="mt-1 text-xs font-medium text-text-secondary">
                  Push Notification Management System
                </p>
              </div>
            </div>
            <h2 class="mt-5 text-4xl font-bold leading-none text-transparent bg-auth-title-gradient bg-clip-text">
              歡迎回來
            </h2>
            <p class="mt-1 text-xs font-medium text-text-secondary">請登入您的帳號以開始使用系統</p>
          </div>

          <form class="w-full mt-8 lg:mt-24" @submit.prevent="handleSubmit">
            <div v-if="loginMode === 'login'" class="space-y-5">
              <label class="block">
                <span class="block mb-1 text-sm font-bold leading-normal text-text-heading">員工編號</span>
                <span class="relative block">
                  <img :src="loginUserIcon" alt="" aria-hidden="true"
                    class="absolute z-10 -translate-y-1/2 pointer-events-none left-4 top-1/2 size-6" />
                  <input v-model.trim="form.userId" autocomplete="username"
                    class="w-full h-10 py-2 pl-12 pr-4 text-base leading-normal transition border rounded-lg outline-none border-primary/20 bg-background-surface text-natural placeholder:text-text-grey/20 focus:border-primary focus:shadow-control-focus"
                    placeholder="請輸入您的員工編號" type="text" />
                </span>
                <span v-if="errors.userId" class="block mt-1 text-xs leading-normal text-danger-text">
                  {{ errors.userId }}
                </span>
              </label>

              <label class="block">
                <span class="block mb-1 text-sm font-bold leading-normal text-text-heading">密碼</span>
                <span class="relative block">
                  <img :src="loginUserIcon" alt="" aria-hidden="true"
                    class="absolute z-10 -translate-y-1/2 pointer-events-none left-4 top-1/2 size-6" />
                  <input v-model="form.password" autocomplete="current-password"
                    class="w-full h-10 px-12 py-2 text-base leading-normal transition border rounded-lg outline-none border-primary/20 bg-background-surface text-natural placeholder:text-text-grey/20 focus:border-primary focus:shadow-control-focus"
                    placeholder="請輸入您的密碼" :type="showPassword ? 'text' : 'password'" />
                  <button :aria-label="showPassword ? '隱藏密碼' : '顯示密碼'"
                    class="absolute z-10 grid -translate-y-1/2 right-4 top-1/2 size-6 place-items-center text-natural"
                    type="button" @click="showPassword = !showPassword">
                    <img :src="showPassword ? loginEyeOpenIcon : loginEyeCloseIcon" alt="" aria-hidden="true"
                      class="size-6" />
                  </button>
                </span>
                <span v-if="errors.password" class="block mt-1 text-xs leading-normal text-danger-text">
                  {{ errors.password }}
                </span>
              </label>
            </div>
            <div v-else class="space-y-5">
              <label class="block">
                <span class="block mb-1 text-sm font-bold leading-normal text-text-heading">新密碼</span>
                <span class="relative block">
                  <img :src="loginUserIcon" alt="" aria-hidden="true"
                    class="absolute z-10 -translate-y-1/2 pointer-events-none left-4 top-1/2 size-6" />
                  <input v-model="changePasswordForm.newPassword" autocomplete="new-password"
                    class="w-full h-10 px-12 py-2 text-base leading-normal transition border rounded-lg outline-none border-primary/20 bg-background-surface text-natural placeholder:text-text-grey/20 focus:border-primary focus:shadow-control-focus"
                    placeholder="請輸入新密碼" :type="showNewPassword ? 'text' : 'password'" />
                  <button :aria-label="showNewPassword ? '隱藏新密碼' : '顯示新密碼'"
                    class="absolute z-10 grid -translate-y-1/2 right-4 top-1/2 size-6 place-items-center text-natural"
                    type="button" @click="showNewPassword = !showNewPassword">
                    <img :src="showNewPassword ? loginEyeOpenIcon : loginEyeCloseIcon" alt="" aria-hidden="true"
                      class="size-6" />
                  </button>
                </span>
                <span v-if="changePasswordErrors.newPassword" class="block mt-1 text-xs leading-normal text-danger-text">
                  {{ changePasswordErrors.newPassword }}
                </span>
              </label>

              <label class="block">
                <span class="block mb-1 text-sm font-bold leading-normal text-text-heading">再次輸入新密碼</span>
                <span class="relative block">
                  <img :src="loginUserIcon" alt="" aria-hidden="true"
                    class="absolute z-10 -translate-y-1/2 pointer-events-none left-4 top-1/2 size-6" />
                  <input v-model="changePasswordForm.confirmPassword" autocomplete="new-password"
                    class="w-full h-10 px-12 py-2 text-base leading-normal transition border rounded-lg outline-none border-primary/20 bg-background-surface text-natural placeholder:text-text-grey/20 focus:border-primary focus:shadow-control-focus"
                    placeholder="請再次輸入新密碼" :type="showConfirmPassword ? 'text' : 'password'" />
                  <button :aria-label="showConfirmPassword ? '隱藏確認密碼' : '顯示確認密碼'"
                    class="absolute z-10 grid -translate-y-1/2 right-4 top-1/2 size-6 place-items-center text-natural"
                    type="button" @click="showConfirmPassword = !showConfirmPassword">
                    <img :src="showConfirmPassword ? loginEyeOpenIcon : loginEyeCloseIcon" alt="" aria-hidden="true"
                      class="size-6" />
                  </button>
                </span>
                <span v-if="changePasswordErrors.confirmPassword" class="block mt-1 text-xs leading-normal text-danger-text">
                  {{ changePasswordErrors.confirmPassword }}
                </span>
              </label>
            </div>

            <p v-if="message" class="px-3 py-2 mt-4 text-sm font-medium rounded-lg bg-success-bg text-success-text">
              {{ message }}
            </p>

            <button
              class="mt-16 h-10 w-full rounded-lg bg-primary px-7 py-2 text-center text-sm font-medium leading-normal text-text-inverse shadow-control transition hover:brightness-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              :disabled="isSubmitting" type="submit">
              {{ submitButtonText }}
            </button>
          </form>
        </div>
      </section>
    </div>
    <PasswordUpdateNotice
      v-model="passwordNotice.open"
      :title="passwordNotice.title"
      :message="passwordNotice.message"
      @confirm="handlePasswordNoticeConfirm"
    />
  </main>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import loginBellIcon from "@/assets/loginBell.svg";
import loginEyeCloseIcon from "@/assets/loginEyeClose.svg";
import loginEyeOpenIcon from "@/assets/loginEyeOpen.svg";
import loginSparkleIcon from "@/assets/loginSparkle.svg";
import loginUserIcon from "@/assets/loginUser.svg";
import ubotLogo from "@/assets/ubotLogo.svg";
import PasswordUpdateNotice from "@/components/dialogs/PasswordUpdateNotice.vue";
import { changeMyPassword } from "@/services/authService";
import { useAppStore } from "@/stores/appStore";
import { useAuthStore } from "@/stores/authStore";
import {
  getDefaultEntryPathForRoles,
  hasAdminRole,
  normalizeRoles,
} from "@/utils/authRoles";
import { validateRequired, validateUserId } from "@/utils/validators";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const appStore = useAppStore();
const showPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const message = ref("");
const loginMode = ref("login");
const form = reactive({ userId: "", password: "" });
const errors = reactive({ userId: "", password: "" });
const changePasswordForm = reactive({ newPassword: "", confirmPassword: "" });
const changePasswordErrors = reactive({ newPassword: "", confirmPassword: "" });
const pendingPasswordChange = reactive({ userId: "", oldPassword: "" });
const passwordNotice = reactive({
  open: false,
  title: "請更新您的密碼",
  message: "為確保您的帳戶安全，請立即更新登入密碼。密碼更新完成後，請使用新密碼重新登入系統。",
  mode: "changePassword",
});
const changingPassword = ref(false);
const authRoles = computed(() => normalizeRoles(auth.roles));
const isSubmitting = computed(() => auth.loading || changingPassword.value);
const submitButtonText = computed(() => {
  if (loginMode.value === "changePassword") return changingPassword.value ? "修改中..." : "修改密碼";
  return auth.loading ? "登入中..." : "立即登入";
});

const handleSubmit = async () => {
  if (loginMode.value === "changePassword") {
    await handleChangePassword();
    return;
  }
  await handleLogin();
};

const handleLogin = async () => {
  errors.userId = validateUserId(form.userId);
  errors.password = validateRequired(form.password, "密碼");
  if (errors.userId || errors.password) return;

  try {
    await auth.login(form);
    message.value = "登入成功";
    router.push(getLoginRedirect());
  } catch (error) {
    if (isPasswordExpiredResponse(error)) {
      pendingPasswordChange.userId = form.userId;
      pendingPasswordChange.oldPassword = form.password;
      openPasswordChangeNotice();
      return;
    }
    if (isPendingApprovalResponse(error)) {
      showLoginError(getErrorDescription(error) || "帳號尚未審核通過");
      return;
    }
    if (isPasswordResetByAdminRequiredResponse(error)) {
      openPasswordExpiredNotice();
      return;
    }
    if (getErrorCode(error) === "1007") {
      showLoginError(getErrorDescription(error) || "登入失敗");
      return;
    }
    // 其他 API 錯誤由全站 interceptor 統一顯示。
    message.value = "";
  }
};

const handleChangePassword = async () => {
  if (!validateChangePassword()) return;
  try {
    changingPassword.value = true;
    await changeMyPassword({
      id: pendingPasswordChange.userId,
      oldPassword: pendingPasswordChange.oldPassword,
      newPassword: changePasswordForm.newPassword,
    });
    resetChangePasswordState();
    loginMode.value = "login";
    form.password = "";
    message.value = "";
    appStore.showAlert({
      title: "密碼已更新",
      message: "請使用新密碼重新登入系統。",
      confirmText: "確認",
      variant: "info",
    });
  } catch {
    message.value = "";
  } finally {
    changingPassword.value = false;
  }
};

function validateChangePassword() {
  changePasswordErrors.newPassword = !changePasswordForm.newPassword
    ? "請輸入新密碼"
    : changePasswordForm.newPassword === pendingPasswordChange.oldPassword
      ? "新密碼不可與原密碼相同"
      : changePasswordForm.newPassword.length < 12
        ? "密碼必須至少12個字元"
        : "";
  changePasswordErrors.confirmPassword = !changePasswordForm.confirmPassword
    ? "請再次輸入新密碼"
    : changePasswordForm.confirmPassword !== changePasswordForm.newPassword
      ? "兩次輸入的新密碼不一致"
      : "";
  return !changePasswordErrors.newPassword && !changePasswordErrors.confirmPassword;
}

function openPasswordChangeNotice() {
  passwordNotice.title = "請更新您的密碼";
  passwordNotice.message = "為確保您的帳戶安全，請立即更新登入密碼。密碼更新完成後，請使用新密碼重新登入系統。";
  passwordNotice.mode = "changePassword";
  passwordNotice.open = true;
  message.value = "";
}

function openPasswordExpiredNotice() {
  passwordNotice.title = "請聯絡系統管理員";
  passwordNotice.message = "您的密碼已逾期，請聯絡系統管理員重新設定密碼。";
  passwordNotice.mode = "expired";
  passwordNotice.open = true;
  message.value = "";
}

function handlePasswordNoticeConfirm() {
  if (passwordNotice.mode !== "changePassword") return;
  loginMode.value = "changePassword";
  clearChangePasswordForm();
}

function resetChangePasswordState() {
  clearChangePasswordForm();
  pendingPasswordChange.oldPassword = "";
}

function clearChangePasswordForm() {
  changePasswordForm.newPassword = "";
  changePasswordForm.confirmPassword = "";
  changePasswordErrors.newPassword = "";
  changePasswordErrors.confirmPassword = "";
  showNewPassword.value = false;
  showConfirmPassword.value = false;
}

function isPasswordExpiredResponse(error) {
  return getErrorCode(error) === "1007" && getErrorDescription(error).includes("密碼過期");
}

function isPendingApprovalResponse(error) {
  return getErrorCode(error) === "1007" && getErrorDescription(error).includes("帳號尚未審核通過");
}

function isPasswordResetByAdminRequiredResponse(error) {
  const code = getErrorCode(error);
  const desc = getErrorDescription(error);
  return code === "1008" || desc.includes("超級管理員重新設定密碼") || desc.includes("系統管理員重新設定密碼");
}

function getErrorCode(error) {
  return String(error?.code || error?.response?.data?.code || "");
}

function getErrorDescription(error) {
  return String(error?.desc || error?.message || error?.response?.data?.desc || "");
}

function showLoginError(messageText) {
  errors.password = messageText;
  message.value = "";
}

const getDefaultEntryPath = () => {
  return getDefaultEntryPathForRoles(authRoles.value);
};

const getLoginRedirect = () => {
  if (hasAdminRole(authRoles.value)) return getDefaultEntryPath();

  const redirect = typeof route.query.redirect === "string" ? route.query.redirect : "";
  if (!redirect) return getDefaultEntryPath();
  if (
    !redirect.startsWith("/") ||
    redirect.startsWith("/login") ||
    redirect.startsWith("/403")
  ) return getDefaultEntryPath();
  return redirect;
};

</script>
