<template>
  <div>
    <PageTitle title="查看操作記錄" eyebrow="操作記錄" />
    <SearchFilterBar class="mb-5">
      <FormField class="min-w-filter-lg" label="關鍵字">
        <BaseInput v-model="keyword" placeholder="請輸入帳號、姓名或描述" />
      </FormField>
      <FormField class="min-w-filter-sm" label="模組">
        <BaseSelect
          v-model="module"
          :options="moduleOptions"
          placeholder="全部模組"
        />
      </FormField>
      <div class="flex gap-2">
        <BaseButton @click="noop">查詢</BaseButton>
        <BaseButton variant="secondary" @click="reset">重設</BaseButton>
      </div>
    </SearchFilterBar>

    <BaseTable :columns="columns" :rows="rows">
      <template #cell-action="{ row }">{{
        ACTION_LABEL_MAP[row.action] || row.action
      }}</template>
      <template #cell-createdAt="{ row }">{{
        formatDateTime(row.createdAt)
      }}</template>
      <template #empty><EmptyState v-if="rows.length === 0" /></template>
    </BaseTable>
    <BasePagination :page="1" :total="rows.length" :size="20" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";

import BaseButton from "@/components/base/BaseButton.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import BasePagination from "@/components/base/BasePagination.vue";
import BaseSelect from "@/components/base/BaseSelect.vue";
import EmptyState from "@/components/common/EmptyState.vue";
import PageTitle from "@/components/common/PageTitle.vue";
import SearchFilterBar from "@/components/common/SearchFilterBar.vue";
import FormField from "@/components/forms/FormField.vue";
import BaseTable from "@/components/tables/BaseTable.vue";
import { GetOperationHistory } from "@/services/operationHistoryService";
import { ACTION_LABEL_MAP } from "@/utils/constants";
import { formatDateTime } from "@/utils/formatDate";

const keyword = ref("");
const module = ref("");
const operationLogs = ref([]);
const columns = [
  { key: "userId", label: "帳號" },
  { key: "userName", label: "姓名" },
  { key: "module", label: "模組" },
  { key: "action", label: "動作" },
  { key: "description", label: "操作內容" },
  { key: "ip", label: "IP" },
  { key: "createdAt", label: "操作時間" },
];
const moduleOptions = ["AUTH", "COPY", "ACCOUNT"].map((value) => ({
  label: value,
  value,
}));

onMounted(async () => {
  try {
    const response = await GetOperationHistory();
    operationLogs.value = response.list ?? [];
  } catch (error) {
    console.error(error);
  }
});

const rows = computed(() =>
  operationLogs.value.filter((item) => {
    const matchKeyword =
      !keyword.value ||
      `${item.userId}${item.userName}${item.description}`
        .toLowerCase()
        .includes(keyword.value.toLowerCase());
    const matchModule = !module.value || item.module === module.value;
    return matchKeyword && matchModule;
  }),
);

const reset = () => {
  keyword.value = "";
  module.value = "";
};

const noop = () => {};
</script>
