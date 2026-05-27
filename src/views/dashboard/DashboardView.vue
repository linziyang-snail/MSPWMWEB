<template>
  <div>
    <PageTitle
      title="首頁總覽"
      description="依 Figma 角色區塊整理：最近、覆核主管、超級管理員。"
      eyebrow="Dashboard"
    />
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="card in cards"
        :key="card.label"
        class="rounded-lg border border-border-muted bg-background-surface p-5"
      >
        <p class="text-sm text-text-muted">{{ card.label }}</p>
        <p class="mt-2 text-3xl font-semibold text-text-primary">
          {{ card.value }}
        </p>
        <p class="mt-2 text-xs text-text-muted">{{ card.hint }}</p>
      </div>
    </div>
    <div class="mt-6 grid gap-6 xl:grid-cols-3">
      <section
        class="rounded-lg border border-border-muted bg-background-surface p-5"
      >
        <h2 class="text-base font-semibold text-text-primary">待辦審核</h2>
        <div class="mt-4 space-y-3">
          <div
            v-for="item in approvals"
            :key="item.id"
            class="flex items-center justify-between rounded-md border border-border-muted p-3"
          >
            <div>
              <p class="text-sm font-medium text-text-primary">
                {{ targetMap[item.targetType] }} {{ item.targetId }}
              </p>
              <p class="text-xs text-text-muted">
                {{ item.action }} · {{ formatDateTime(item.createdAt) }}
              </p>
            </div>
            <RouterLink
              class="text-sm font-medium text-primary"
              :to="`/approvals/${item.id}`"
              >查看</RouterLink
            >
          </div>
        </div>
      </section>
      <section
        class="rounded-lg border border-border-muted bg-background-surface p-5"
      >
        <h2 class="text-base font-semibold text-text-primary">
          Figma 設計觀察
        </h2>
        <ul class="mt-4 space-y-3 text-sm leading-6 text-text-secondary">
          <li>左側導覽固定，內容以表格與表單為主。</li>
          <li>註解提到：重設密碼直接生效，使用者/組織異動需送審。</li>
          <li>角色差異：一般送審、覆核主管、超級管理員。</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";

import PageTitle from "@/components/common/PageTitle.vue";
import { getPendingChangeRequests } from "@/services/approvalService";
import { getOrganizations } from "@/services/organizationService";
import { getUsers } from "@/services/userService";
import { TARGET_TYPE_LABEL_MAP } from "@/utils/constants";
import { formatDateTime } from "@/utils/formatDate";

const approvals = ref([]);
const users = ref([]);
const organizations = ref([]);
const targetMap = TARGET_TYPE_LABEL_MAP;
const cards = computed(() => [
  { label: "使用者", value: users.value.length, hint: "含待審與鎖定帳號" },
  { label: "組織", value: organizations.value.length, hint: "可管理組織" },
  {
    label: "待審核",
    value: approvals.value.length,
    hint: "待主管或管理員處理",
  },
  { label: "正式 API", value: "ON", hint: "已停用前端 mock" },
]);

onMounted(async () => {
  const [approvalRows, userPage, organizationRows] = await Promise.all([
    getPendingChangeRequests({}),
    getUsers({ page: 1, size: 100 }),
    getOrganizations(),
  ]);
  approvals.value = Array.isArray(approvalRows) ? approvalRows : [];
  users.value = userPage?.content ?? (Array.isArray(userPage) ? userPage : []);
  organizations.value = Array.isArray(organizationRows) ? organizationRows : [];
});
</script>
