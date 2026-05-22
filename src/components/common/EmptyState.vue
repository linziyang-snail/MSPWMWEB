<template>
  <div
    class="rounded-xl border border-dashed border-primary-border bg-background-surface px-6 py-10 text-center text-sm font-medium text-text-muted"
  >
    <div
      class="mx-auto mb-3 grid size-10 place-items-center rounded-full bg-primary-subtle text-primary"
    >
      -
    </div>
    <p class="font-bold text-text-primary">{{ title }}</p>
    <p class="mt-1">{{ description }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: "目前沒有資料" },
  description: {
    type: String,
    default: "調整篩選條件後會顯示在這裡。",
  },
});
</script>
