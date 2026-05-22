<template>
  <div
    class="flex flex-wrap items-center justify-between gap-3 border-t border-border-muted bg-background-surface px-5 py-4 text-sm font-medium text-text-muted"
  >
    <span>共 {{ total }} 筆，第 {{ page }} / {{ totalPages }} 頁</span>
    <div class="flex items-center gap-2">
      <BaseButton
        variant="secondary"
        :disabled="page <= 1"
        @click="$emit('update:page', page - 1)"
        >上一頁</BaseButton
      >
      <BaseButton
        variant="secondary"
        :disabled="page >= totalPages"
        @click="$emit('update:page', page + 1)"
        >下一頁</BaseButton
      >
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

import BaseButton from "./BaseButton.vue";

const props = defineProps({
  page: { type: Number, default: 1 },
  size: { type: Number, default: 20 },
  total: { type: Number, default: 0 },
});

defineEmits(["update:page"]);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.total / props.size)),
);
</script>
