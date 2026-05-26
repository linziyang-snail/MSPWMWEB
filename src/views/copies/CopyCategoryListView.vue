<template>
  <div>
    <PageTitle
      title="文案分類管理"
      description="此 API 目前標示 deprecated；Figma 有畫面時仍保留切版。"
      eyebrow="Copy Categories"
    >
      <template #actions
        ><RouterLink to="/copy-categories/create"
          ><BaseButton>新增分類</BaseButton></RouterLink
        ></template
      >
    </PageTitle>
    <BaseTable :columns="columns" :rows="categories">
      <template #cell-status="{ row }"
        ><BaseBadge :status="row.status"
      /></template>
      <template #actions="{ row }">
        <div class="flex flex-wrap justify-end gap-2">
          <RouterLink
            class="text-primary"
            :to="`/copy-categories/${row.id}/edit`"
            >編輯</RouterLink
          >
          <button class="text-danger-text" @click="selected = row">停用</button>
        </div>
      </template>
    </BaseTable>
    <ConfirmDialog
      v-model="confirmOpen"
      title="停用分類"
      :message="`確認停用 ${selected?.categoryName || ''}？`"
      danger
      @confirm="selected = null"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";

import BaseBadge from "@/components/base/BaseBadge.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import ConfirmDialog from "@/components/common/ConfirmDialog.vue";
import PageTitle from "@/components/common/PageTitle.vue";
import BaseTable from "@/components/tables/BaseTable.vue";
import { GetCompatibleCopyCategories } from "@/services/categoryCompatibilityService";

const categories = ref([]);
const selected = ref(null);
const confirmOpen = computed({
  get: () => Boolean(selected.value),
  set: (value) => !value && (selected.value = null),
});
const columns = [
  { key: "id", label: "ID" },
  { key: "categoryName", label: "分類名稱" },
  { key: "departmentId", label: "部門 ID" },
  { key: "status", label: "狀態" },
];

onMounted(async () => {
  try {
    categories.value = await GetCompatibleCopyCategories();
  } catch (error) {
    console.error(error);
  }
});
</script>
