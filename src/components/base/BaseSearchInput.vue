<template>
  <label class="relative block w-full">
    <img
      :src="searchIcon"
      alt=""
      aria-hidden="true"
      class="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2"
    />

    <input
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="[
        'w-full rounded-full border bg-background-surface pl-12 pr-4 font-medium text-text-secondary outline-none shadow-control transition placeholder:text-text-placeholder',
        'focus:border-border-focus focus:ring-2 focus:ring-primary/15',
        'disabled:bg-background-disabled disabled:text-text-disabled',
        sizeClass,
        error ? 'border-border-error' : 'border-border-strong',
      ]"
      type="text"
      @input="handleInput"
      @keydown.enter="$emit('submit')"
    />
  </label>
</template>

<script setup>
import { computed, onBeforeUnmount } from "vue";

import searchIcon from "@/assets/icon-search.svg";

const props = defineProps({
  modelValue: { type: String, default: "" },
  placeholder: { type: String, default: "搜尋..." },
  size: { type: String, default: "lg" },
  disabled: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
  debounce: { type: Number, default: 0 },
});

const emit = defineEmits([
  "update:modelValue",
  "debounced-change",
  "submit",
]);

let debounceTimer = null;

const sizeClass = computed(
  () =>
    ({
      md: "h-10 text-sm",
      lg: "h-12 text-base",
    })[props.size] || "h-12 text-base",
);

const emitDebouncedChange = (value) => {
  if (!props.debounce) {
    emit("debounced-change", value);
    return;
  }
  window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => {
    emit("debounced-change", value);
  }, props.debounce);
};

const handleInput = (event) => {
  const value = event.target.value;
  emit("update:modelValue", value);
  emitDebouncedChange(value);
};

onBeforeUnmount(() => {
  window.clearTimeout(debounceTimer);
});
</script>
