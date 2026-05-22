<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-50 grid place-items-center bg-background-overlay px-4"
      role="presentation">
      <section class="w-full max-w-md overflow-hidden rounded-2xl bg-background-surface shadow-popup" role="dialog"
        aria-modal="true" aria-labelledby="cancel-copy-title">
        <header class="flex h-24 items-center gap-4 border-b border-white bg-background-page p-6">
          <div class="grid size-12 shrink-0 place-items-center rounded-full bg-danger-bg">
            <XCircleIcon class="size-6 text-danger" />
          </div>
          <h2 id="cancel-copy-title" class="text-xl font-bold leading-normal tracking-wide text-text-heading">
            取消文案送審
          </h2>
        </header>

        <div class="px-6 py-8">
          <p class="text-sm font-medium leading-normal text-natural">
            您確定要取消文案「{{ copyTitle }}」（{{ copyCode }}）<br />
            的審核嗎？
          </p>
        </div>

        <footer class="h-sidebar-logo rounded-b-2xl bg-background-page p-6">
          <div class="grid grid-cols-2 gap-6">
            <button type="button"
              class="h-10 rounded-lg border border-text-grey bg-background-surface px-4 py-2.5 text-center text-base font-medium leading-normal text-natural transition hover:bg-background-hover"
              @click="$emit('update:modelValue', false)">
              取消
            </button>
            <button type="button"
              class="h-10 rounded-lg bg-danger px-7 py-2 text-center text-sm font-bold leading-5 text-text-inverse shadow-control transition hover:opacity-90"
              @click="$emit('confirm')">
              確認刪除
            </button>
          </div>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { h } from "vue";

import xCircleIcon from "@/assets/icon-x-circle.svg";

defineProps({
  modelValue: { type: Boolean, default: false },
  copyTitle: { type: String, default: "" },
  copyCode: { type: String, default: "" },
});

defineEmits(["update:modelValue", "confirm"]);

const XCircleIcon = (_props = {}, context = {}) =>
  h("img", { ...(context?.attrs || {}), src: xCircleIcon, alt: "", "aria-hidden": "true" });
</script>
