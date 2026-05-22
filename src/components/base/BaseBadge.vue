<template>
  <StatusBadge
    v-bind="attrs"
    :status="status"
    :label="label"
    :label-variant="labelVariant"
    :tone="tone"
  />
</template>

<script setup>
import { useAttrs } from "vue";

import StatusBadge from "@/components/base/StatusBadge.vue";

defineOptions({
  inheritAttrs: false,
});

const attrs = useAttrs();

defineProps({
  status: { type: String, default: "ACTIVE" },
  label: { type: String, default: "" },
  labelVariant: { type: String, default: "default" },
  tone: { type: String, default: "" },
});
</script>
