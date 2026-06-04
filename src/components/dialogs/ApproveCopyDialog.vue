<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-50 grid px-4 place-items-center bg-background-overlay">
      <section class="w-full max-w-md overflow-hidden rounded-2xl bg-background-surface shadow-popup" role="dialog"
        aria-modal="true" aria-labelledby="approve-copy-title">
        <header class="flex items-center h-24 gap-4 p-6 border-b border-white bg-background-page">
          <div class="grid rounded-full size-12 shrink-0 place-items-center bg-success-bg">
            <CheckIcon class="size-6 text-primary" />
          </div>
          <div>
            <h2 id="approve-copy-title" class="text-xl font-bold leading-normal tracking-wide text-text-heading">
              核准文案
            </h2>
            <p class="mt-1 text-xs font-normal leading-5 text-text-grey">
              文案編號：{{ copyCode }}
            </p>
          </div>
        </header>

        <div class="px-8 py-8">
          <p class="text-sm font-medium leading-normal text-natural">
            確定要核准文案「{{ copyTitle }}」（{{ copyCode }}）嗎？
          </p>
        </div>

        <footer class="p-6 h-sidebar-logo rounded-b-2xl bg-background-page">
          <div class="grid grid-cols-2 gap-6">
            <button type="button"
              class="h-10 px-4 text-base font-medium leading-normal text-center transition border rounded-lg border-text-grey bg-background-surface text-natural hover:bg-background-hover"
              @click="$emit('update:modelValue', false)">
              取消
            </button>
            <button type="button"
              class="h-10 py-2 text-sm font-bold leading-5 text-center transition rounded-lg bg-primary px-7 text-text-inverse shadow-control hover:bg-primary-hover"
              @click="$emit('confirm')">
              確認核准
            </button>
          </div>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { h } from "vue";

import checkCircleIcon from "@/assets/icon-check-circle-blue.svg";
import { useBodyScrollLock } from "@/composables/useBodyScrollLock";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  copyTitle: { type: String, default: "" },
  copyCode: { type: String, default: "" },
});

defineEmits(["update:modelValue", "confirm"]);

useBodyScrollLock(() => props.modelValue);

const CheckIcon = (_props = {}, context = {}) =>
  h("img", { ...(context?.attrs || {}), src: checkCircleIcon, alt: "", "aria-hidden": "true" });
</script>
