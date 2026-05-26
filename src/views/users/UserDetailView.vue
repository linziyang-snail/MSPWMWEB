<template>
  <div>
    <PageTitle
      title="使用者詳情"
      :description="user?.userName || '查無資料'"
      eyebrow="Users"
    />
    <div
      v-if="user"
      class="grid gap-4 rounded-lg border border-border-muted bg-background-surface p-5 md:grid-cols-2"
    >
      <div v-for="item in details" :key="item.label">
        <p class="text-xs text-text-muted">{{ item.label }}</p>
        <p class="mt-1 text-sm font-medium text-text-primary">
          {{ item.value }}
        </p>
      </div>
      <div>
        <p class="text-xs text-text-muted">狀態</p>
        <BaseBadge class="mt-1" :status="user.status" />
      </div>
    </div>
    <EmptyState v-else title="找不到使用者" />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

import BaseBadge from "@/components/base/BaseBadge.vue";
import EmptyState from "@/components/common/EmptyState.vue";
import PageTitle from "@/components/common/PageTitle.vue";
import { mockUsers } from "@/mocks/users.mock";
import { roleLabelMap } from "@/utils/constants";
import { formatDateTime } from "@/utils/formatDate";

const route = useRoute();
const user = computed(() =>
  mockUsers.find((item) => item.id === route.params.id),
);
const details = computed(() => [
  { label: "帳號", value: user.value?.id },
  { label: "姓名", value: user.value?.userName },
  { label: "組織 ID", value: user.value?.orgId },
  { label: "角色", value: formatRoles(user.value?.roles) },
  { label: "密碼錯誤次數", value: user.value?.passwordAttempts },
  { label: "最後登入", value: formatDateTime(user.value?.lastLoginAt) },
  { label: "登入 IP", value: user.value?.loginIp || "-" },
  {
    label: "建立資訊",
    value: `${user.value?.createdBy} / ${formatDateTime(user.value?.createdAt)}`,
  },
]);

function formatRoles(roles = []) {
  return roles.map((role) => roleLabelMap[role] || role).join(", ");
}
</script>
