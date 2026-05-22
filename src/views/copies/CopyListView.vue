<template>
  <div>
    <PageTitle
      title="全部文案"
      description="對應 Figma 經辦區的全部文案卡片/列表，先以 mock data 呈現。"
      eyebrow="Copy"
    >
      <template #actions>
        <RouterLink to="/copies/submit"
          ><BaseButton>新增文案送審</BaseButton></RouterLink
        >
      </template>
    </PageTitle>
    <div class="space-y-4">
      <article
        v-for="copy in rows"
        :key="copy.number"
        class="rounded-lg border border-border-muted bg-background-surface p-5"
      >
        <div
          class="flex flex-col gap-3 border-b border-border-muted pb-4 md:flex-row md:items-start md:justify-between"
        >
          <div>
            <div class="flex items-center gap-3">
              <h2 class="text-xl font-semibold text-text-primary">
                {{ copy.title }}
              </h2>
              <BaseBadge :status="copy.status" />
            </div>
            <p class="mt-1 text-sm text-text-muted">
              文案編號：{{ copy.number }}
            </p>
          </div>
          <button
            class="text-sm font-medium text-primary"
            @click="selected = copy"
          >
            查看文案內容
          </button>
        </div>
        <div class="mt-4 grid gap-4 md:grid-cols-12">
          <div
            class="grid h-8 w-8 place-items-center rounded-full bg-primary-subtle text-primary"
          >
            i
          </div>
          <div>
            <h3 class="text-sm font-semibold text-text-secondary">文案資訊</h3>
            <div
              class="mt-3 overflow-hidden rounded-md border border-border-muted"
            >
              <div
                class="grid grid-cols-4 border-b border-border-muted text-sm"
              >
                <div class="bg-background-subtle px-4 py-2 font-medium">
                  文案編號
                </div>
                <div class="px-4 py-2">{{ copy.number }}</div>
              </div>
              <div
                class="grid grid-cols-4 border-b border-border-muted text-sm"
              >
                <div class="bg-background-subtle px-4 py-2 font-medium">
                  文案標題
                </div>
                <div class="px-4 py-2">{{ copy.title }}</div>
              </div>
              <div class="grid grid-cols-4 text-sm">
                <div class="bg-background-subtle px-4 py-2 font-medium">
                  文案內容
                </div>
                <div class="px-4 py-2">{{ copy.content }}</div>
              </div>
            </div>
            <p class="mt-3 text-xs text-text-muted">
              提交者：{{ copy.requester }} | 提交時間：{{ copy.createdAt }}
            </p>
          </div>
        </div>
      </article>
    </div>
    <BaseModal v-model="modalOpen" title="文案內容">
      <pre
        class="whitespace-pre-wrap rounded-md bg-background-subtle p-4 text-sm text-text-secondary"
        >{{ selected }}</pre
      >
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

import BaseBadge from "@/components/base/BaseBadge.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import PageTitle from "@/components/common/PageTitle.vue";

const selected = ref(null);
const modalOpen = computed({
  get: () => Boolean(selected.value),
  set: (value) => !value && (selected.value = null),
});
const rows = [
  {
    number: "INFO202603180003",
    title: "APP更新通知",
    content:
      "親愛的客戶您好，聯邦銀行 APP 已推出新版本，新增多項功能，請更新至最新版。",
    status: "PENDING",
    requester: "陳小華",
    createdAt: "2026/03/18 11:30",
  },
  {
    number: "INFO202603150001",
    title: "登入成功通知",
    content:
      "親愛的客戶您好，您已成功登入網路銀行，如非本人操作請立即聯繫客服。",
    status: "APPROVED",
    requester: "張主任",
    createdAt: "2026/03/15 14:00",
  },
  {
    number: "INFO202603160001",
    title: "交易限額異常警示",
    content: "您的交易限額設定發生異動，請登入確認帳戶安全。",
    status: "APPROVED",
    requester: "李專員",
    createdAt: "2026/03/16 09:20",
  },
];
</script>
