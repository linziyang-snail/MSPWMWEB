<template>
  <div class="grid min-h-screen place-items-center bg-background-subtle px-5">
    <div
      class="max-w-md rounded-lg border border-border-muted bg-background-surface p-8 text-center"
    >
      <p class="text-sm font-semibold text-danger-text">403</p>
      <h1 class="mt-2 text-2xl font-semibold text-text-primary">沒有權限</h1>
      <p class="mt-3 text-sm text-text-muted">目前角色無法存取此功能。</p>
      <RouterLink
        :to="homePath"
        class="mt-6 inline-block text-sm font-medium text-primary"
        >回首頁</RouterLink
      >
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

import { useAuthStore } from "@/stores/authStore";
import { getDefaultEntryPathForRoles } from "@/utils/authRoles";

const auth = useAuthStore();
const homePath = computed(() => getDefaultEntryPathForRoles(auth.roles));
</script>
