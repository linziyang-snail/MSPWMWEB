<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-50 grid place-items-center bg-background-overlay px-4">
      <section class="w-full max-w-md overflow-hidden rounded-2xl bg-background-surface shadow-popup" role="dialog"
        aria-modal="true" aria-labelledby="reject-copy-title">
        <header class="flex h-24 items-center gap-4 border-b border-white bg-background-page p-6">
          <div class="grid rounded-full size-12 shrink-0 place-items-center bg-danger-bg">
            <XCircleIcon class="size-6 text-danger" />
          </div>
          <div>
            <h2 id="reject-copy-title" class="text-xl font-bold leading-normal tracking-wide text-text-heading">
              駁回文案
            </h2>
            <p class="mt-1 text-xs font-normal leading-5 text-text-grey">
              文案編號：{{ copyCode }}
            </p>
          </div>
        </header>

        <div class="px-8 py-8">
          <label class="mb-2 block text-sm font-bold leading-normal text-natural" for="reject-reason">
            駁回原因
          </label>
          <textarea id="reject-reason" v-model="reason"
            class="h-32 w-full resize-none rounded-lg border border-text-grey !bg-background-field-muted px-4 py-3 text-sm font-medium leading-normal text-natural outline-none transition placeholder:text-text-grey focus:border-border-focus focus:ring-2 focus:ring-primary/15"
            placeholder="請輸入駁回原因（至少5個字），以便經辦了解需要修正的內容..." />
          <p class="mt-2 text-xs font-normal leading-normal text-danger">
            ※ 駁回原因為必填項目（至少5個字）
          </p>
        </div>

        <footer class="p-6 h-sidebar-logo rounded-b-2xl bg-background-page">
          <div class="grid grid-cols-2 gap-6">
            <button type="button"
              class="h-10 rounded-lg border border-text-grey bg-background-surface px-4 text-center text-base font-medium leading-normal text-natural transition hover:bg-background-hover"
              @click="cancel">
              取消
            </button>
            <button type="button"
              class="h-10 rounded-lg bg-danger px-7 py-2 text-center text-sm font-bold leading-5 text-text-inverse shadow-control transition hover:opacity-90"
              @click="confirm">
              確認駁回
            </button>
          </div>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { h, ref, watch } from "vue";

import xCircleIcon from "@/assets/icon-x-circle.svg";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  copyCode: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue", "confirm"]);
const reason = ref("");

watch(
  () => props.modelValue,
  (open) => {
    if (open) reason.value = "";
  },
);

function cancel() {
  emit("update:modelValue", false);
}

function confirm() {
  if (reason.value.trim().length < 5) return;
  emit("confirm", reason.value.trim());
}

const XCircleIcon = (_props = {}, context = {}) =>
  h("img", { ...(context?.attrs || {}), src: xCircleIcon, alt: "", "aria-hidden": "true" });
</script>
