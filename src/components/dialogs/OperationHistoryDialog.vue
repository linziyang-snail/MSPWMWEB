<template>
  <BaseModal :model-value="modelValue" :icon="historyIcon" title="操作歷程查詢" subtitle="查看系統所有操作記錄" size="history"
    body-class="p-0" footer-class="px-8 py-4 border-primary-border"
    @update:model-value="$emit('update:modelValue', $event)">
    <div class="px-6 py-6 border-t border-border">
      <div class="flex items-center gap-6 max-lg:flex-wrap">
        <BaseSearchInput v-model="keyword" class="flex-1 min-w-80" placeholder="搜尋人員姓名、標題或動作..." size="md"
          @submit="loadRows" />

        <BaseDateInput v-model="startDate" class="w-modal-date shrink-0" placeholder="年/月/日" />
        <span class="text-lg font-medium text-text-disabled">~</span>
        <BaseDateInput v-model="endDate" class="w-modal-date shrink-0" placeholder="年/月/日" />

        <BaseButton class="w-24" :loading="loading" @click="loadRows">
          查詢
        </BaseButton>
        <BaseButton class="w-20" variant="secondary" @click="clearFilter">
          清除
        </BaseButton>
      </div>
    </div>

    <div class="px-12 pb-6 overflow-auto max-h-modal-history-table">
      <table class="w-full text-base text-left table-fixed text-text-secondary">
        <thead class="h-16 text-base font-bold bg-background-subtle">
          <tr>
            <th class="px-6 w-col-date">
              <button class="inline-flex items-center gap-2 font-bold text-text-secondary" type="button"
                @click="toggleDateSort">
                日期
                <SortIcon :direction="dateSortDirection" />
              </button>
            </th>
            <th class="px-6 w-col-operator">操作者</th>
            <th class="px-6 w-col-module">模組</th>
            <th class="px-0 text-center w-col-action">動作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in sortedRows" :key="row.id"
            :class="['h-16', index === 2 && 'border-b border-border-strong']">
            <td class="px-6">{{ formatOperationDateTime(row.createdAt) }}</td>
            <td class="px-6 font-bold">{{ row.userName }}</td>
            <td class="px-6">{{ row.module }}</td>
            <td class="px-0 text-sm font-medium text-center align-middle w-col-action">
              <StatusBadge :label="row.actionLabel" :status="row.action" />
            </td>
          </tr>
        </tbody>
      </table>

      <EmptyState v-if="!loading && !sortedRows.length" title="查無操作記錄" description="請調整查詢條件後再試一次。" />
    </div>

    <template #footer>
      <BaseButton class="w-20" variant="secondary" @click="$emit('update:modelValue', false)">
        關閉
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, h, ref, watch } from "vue";

import historyIcon from "@/assets/history.svg";
import sortIcon from "@/assets/icon-sort.svg";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseDateInput from "@/components/base/BaseDateInput.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import BaseSearchInput from "@/components/base/BaseSearchInput.vue";
import StatusBadge from "@/components/base/StatusBadge.vue";
import EmptyState from "@/components/common/EmptyState.vue";
import { GetOperationHistory } from "@/services/operationHistoryService";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});

defineEmits(["update:modelValue"]);

const keyword = ref("");
const startDate = ref("");
const endDate = ref("");
const loading = ref(false);
const rows = ref([]);
const dateSortDirection = ref("desc");

const sortedRows = computed(() =>
  [...rows.value].sort((a, b) => {
    const aTime = getTime(a.createdAt);
    const bTime = getTime(b.createdAt);
    return dateSortDirection.value === "asc" ? aTime - bTime : bTime - aTime;
  }),
);

const loadRows = async () => {
  try {
    loading.value = true;
    const response = await GetOperationHistory({
      keyword: keyword.value,
      startDate: startDate.value,
      endDate: endDate.value,
    });
    rows.value = response?.list ?? [];
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const clearFilter = () => {
  keyword.value = "";
  startDate.value = "";
  endDate.value = "";
  loadRows();
};

const toggleDateSort = () => {
  dateSortDirection.value = dateSortDirection.value === "desc" ? "asc" : "desc";
};

const getTime = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const formatOperationDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const SortIcon = () => h("img", { src: sortIcon, alt: "", "aria-hidden": "true", class: "h-4 w-2.5 shrink-0" });

watch(
  () => props.modelValue,
  (open) => {
    if (open) loadRows();
  },
  { immediate: true },
);
</script>
