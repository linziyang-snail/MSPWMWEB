<template>
  <div
    class="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
  >
    <div>
      <p v-if="eyebrow" class="mb-1 text-xs font-medium leading-5 text-primary">
        {{ eyebrow }}
      </p>
      <h1 class="text-2xl font-semibold leading-9 text-text-primary">
        {{ title }}
      </h1>
      <p
        v-if="description"
        class="mt-1 text-sm font-medium leading-6 text-text-muted"
      >
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.actions" class="flex flex-wrap gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  eyebrow: { type: String, default: "" },
});
</script>
