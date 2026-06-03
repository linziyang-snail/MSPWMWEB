<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[1000] grid place-items-center bg-background-overlay px-4"
      role="presentation"
    >
      <section
        class="w-full max-w-md overflow-hidden rounded-2xl bg-background-surface shadow-popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="system-alert-title"
      >
        <header class="flex h-24.5 items-center gap-4 border-b border-white bg-background-page px-6">
          <div :class="['grid size-12 shrink-0 place-items-center rounded-full', iconContainerClass]">
            <AlertIcon class="text-primary" />
          </div>
          <h2 id="system-alert-title" class="flex-1 text-xl font-bold leading-7 text-text-secondary">
            {{ title }}
          </h2>
        </header>

        <div class="px-8 pt-8">
          <p class="text-sm font-normal leading-5 text-text-secondary">
            {{ message }}
          </p>
        </div>

        <footer class="mt-8 h-sidebar-logo rounded-b-2xl bg-background-page px-6 pt-6">
          <button
            type="button"
            class="h-10 w-full rounded-lg bg-primary px-6 text-center text-sm font-bold leading-5 text-text-inverse shadow-control transition hover:bg-primary-hover"
            @click="close"
          >
            {{ confirmText }}
          </button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, h } from "vue";

import alertIcon from "@/assets/alert.svg";
import errorIcon from "@/assets/icon-x-circle.svg";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: "系統提示" },
  message: { type: String, required: true },
  type: { type: String, default: "info" },
  confirmText: { type: String, default: "確認" },
});

const emit = defineEmits(["update:modelValue", "confirm"]);

const normalizedType = computed(() => String(props.type || "info").toLowerCase());
const iconContainerClass = computed(() =>
  normalizedType.value === "error" ? "bg-danger-bg" : "bg-copy-table-border",
);

function close() {
  emit("confirm");
  emit("update:modelValue", false);
}

const AlertIcon = (_props = {}, context = {}) =>
  h("img", {
    ...(context?.attrs || {}),
    src: normalizedType.value === "error" ? errorIcon : alertIcon,
    alt: "",
    "aria-hidden": "true",
  });
</script>
