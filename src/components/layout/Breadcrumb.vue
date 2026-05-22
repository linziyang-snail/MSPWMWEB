<template>
  <nav
    class="flex min-w-0 items-center text-sm font-medium leading-normal text-text-grey"
    aria-label="breadcrumb"
  >
    <template v-for="(item, index) in crumbs" :key="`${item}-${index}`">
      <span class="truncate">
        {{ item }}
      </span>
      <span v-if="index < crumbs.length - 1" class="mx-2">›</span>
    </template>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

import { breadcrumbMap } from "@/utils/navigation";

const route = useRoute();
const crumbs = computed(
  () => breadcrumbMap[route.name] || ["文案管理", "全部文案"],
);
</script>
