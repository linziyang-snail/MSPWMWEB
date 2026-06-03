<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-50 grid place-items-center bg-background-overlay px-4"
      role="presentation">
      <section class="w-full max-w-md overflow-hidden rounded-2xl bg-background-surface shadow-popup" role="dialog"
        aria-modal="true" aria-labelledby="password-update-title">
        <header class="flex h-24.5 items-center gap-4 border-b border-white bg-background-page px-6">
          <div class="grid rounded-full size-12 shrink-0 place-items-center bg-copy-table-border">
            <ExclamationIcon class="text-primary" />
          </div>
          <h2 id="password-update-title" class="flex-1  text-xl font-bold leading-7 text-text-secondary">
            {{ title }}
          </h2>
        </header>

        <div class="px-8 pt-8">
          <p class="text-sm font-normal leading-5 text-text-secondary">
            {{ message }}
          </p>
        </div>

        <footer class="mt-8 h-sidebar-logo rounded-b-2xl bg-background-page px-6 pt-6">
          <button type="button"
            class="h-10 w-full rounded-lg bg-primary px-6 text-center text-sm font-bold leading-5 text-text-inverse shadow-control transition hover:bg-primary-hover"
            @click="close">
            確認
          </button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { h } from "vue";

import exclamationIcon from "@/assets/alert.svg";

defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: "請更新您的密碼" },
  message: {
    type: String,
    default:
      "為確保您的帳戶安全，請立即於左下方「修改個人密碼」設定新的登入密碼，完成後方可繼續使用系統。",
  },
});

const emit = defineEmits(["update:modelValue", "confirm"]);

function close() {
  emit("confirm");
  emit("update:modelValue", false);
}

const ExclamationIcon = (_props = {}, context = {}) =>
  h("img", { ...(context?.attrs || {}), src: exclamationIcon, alt: "", "aria-hidden": "true" });
</script>
