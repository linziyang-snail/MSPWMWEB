<template>
  <label class="block">
    <span class="mb-1 block text-sm font-medium leading-5 text-text-secondary">
      {{ label }}
      <span v-if="required" class="text-danger-text">*</span>
    </span>
    <slot />
    <span v-if="error" class="mt-1 block text-xs font-medium text-danger-text">
      {{ error }}
    </span>
  </label>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  error: { type: String, default: "" },
  required: { type: Boolean, default: false },
});
</script>
