<template>
  <div>
    <PageTitle title="操作歷程查詢記錄" eyebrow="操作記錄" />
    <SearchFilterBar class="mb-5">
      <FormField class="min-w-filter-lg" label="關鍵字">
        <BaseInput v-model="filters.keyword" placeholder="請輸入操作者或異動對象" />
      </FormField>
      <FormField class="min-w-filter-sm" label="類型">
        <BaseSelect v-model="filters.targetType" :options="targetTypeOptions" placeholder="全部類型" />
      </FormField>
      <FormField class="min-w-filter-sm" label="動作">
        <BaseSelect v-model="filters.action" :options="actionOptions" placeholder="全部動作" />
      </FormField>
      <FormField class="min-w-filter-sm" label="狀態">
        <BaseSelect v-model="filters.status" :options="statusOptions" placeholder="全部狀態" />
      </FormField>
      <FormField class="min-w-filter-sm" label="起日">
        <BaseDateInput v-model="filters.startDate" placeholder="年/月/日" :max="filters.endDate" />
      </FormField>
      <FormField class="min-w-filter-sm" label="迄日">
        <BaseDateInput v-model="filters.endDate" placeholder="年/月/日" :min="filters.startDate" />
      </FormField>
      <div class="flex gap-2">
        <BaseButton @click="loadOperationLogs">查詢</BaseButton>
        <BaseButton variant="secondary" @click="reset">重設</BaseButton>
      </div>
    </SearchFilterBar>

    <p
      v-if="historyWarning"
      class="mb-4 rounded-lg border border-warning-border bg-warning-bg px-4 py-3 text-sm font-medium text-warning-text"
    >
      {{ historyWarning }}
    </p>
    <p
      v-if="historyLoadFailed"
      class="mb-4 rounded-lg border border-danger-text bg-danger-bg px-4 py-3 text-sm font-medium text-danger-text"
    >
      操作歷程載入失敗，請稍後重試。
    </p>

    <BaseTable :columns="columns" :rows="pagedRows" row-key="rowKey">
      <template #cell-displayDate="{ row }">
        {{ formatDateTime(row.displayDate) }}
      </template>
      <template #cell-displayTargetId="{ row }">
        <span class="block whitespace-normal break-words" :title="row.displayTargetId">
          {{ row.displayTargetId }}
        </span>
      </template>
      <template #cell-status="{ row }">
        <BaseBadge :status="row.status" :label="row.statusLabel" />
      </template>
      <template #cell-action="{ row }">
        <BaseBadge :status="row.action" :label="row.actionLabel" />
      </template>
      <template #cell-changedFieldsLabel="{ row }">
        <span class="block whitespace-normal break-words" :title="row.changedFieldsLabel">
          {{ row.changedFieldsLabel || "-" }}
        </span>
      </template>
      <template #cell-rejectReason="{ row }">
        <span class="block whitespace-normal break-words" :title="row.rejectReason">
          {{ row.rejectReason || "-" }}
        </span>
      </template>
      <template #empty><EmptyState v-if="rows.length === 0 && !historyLoadFailed" /></template>
    </BaseTable>
    <BasePagination
      :page="currentPage"
      :total="rows.length"
      :size="PAGE_SIZE"
      @update:page="currentPage = $event"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";

import BaseBadge from "@/components/base/BaseBadge.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseDateInput from "@/components/base/BaseDateInput.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import BasePagination from "@/components/base/BasePagination.vue";
import BaseSelect from "@/components/base/BaseSelect.vue";
import EmptyState from "@/components/common/EmptyState.vue";
import PageTitle from "@/components/common/PageTitle.vue";
import SearchFilterBar from "@/components/common/SearchFilterBar.vue";
import FormField from "@/components/forms/FormField.vue";
import BaseTable from "@/components/tables/BaseTable.vue";
import { GetOperationHistory } from "@/services/operationHistoryService";
import {
  getChangeRequestActionLabel,
  getChangeRequestTargetTypeLabel,
  getOperationHistoryStatusLabel,
} from "@/utils/changeRequestUtils";
import { formatDateTime } from "@/utils/formatDate";

const operationLogs = ref([]);
const historyWarning = ref("");
const historyLoadFailed = ref(false);
const filters = reactive({
  keyword: "",
  targetType: "",
  action: "",
  status: "",
  startDate: "",
  endDate: "",
});

const currentPage = ref(1);
const PAGE_SIZE = 20;

const columns = [
  { key: "displayDate", label: "日期" },
  { key: "operator", label: "操作者" },
  { key: "displayTargetId", label: "異動對象" },
  { key: "status", label: "狀態" },
  { key: "action", label: "動作" },
  { key: "changedFieldsLabel", label: "異動欄位" },
  { key: "rejectReason", label: "駁回原因" },
];

const targetTypeOptions = ["USER", "ORGANIZATION"].map((value) => ({
  value,
  label: getChangeRequestTargetTypeLabel(value),
}));
const actionOptions = ["CREATE", "UPDATE", "DELETE"].map((value) => ({
  value,
  label: getChangeRequestActionLabel(value),
}));
const statusOptions = ["PENDING", "APPROVED", "REJECTED", "CANCELED"].map((value) => ({
  value,
  label: getOperationHistoryStatusLabel(value),
}));

const rows = computed(() =>
  operationLogs.value
    .map((row) => ({ ...row, rowKey: `${row.targetType}-${row.id}` }))
    .filter((row) => {
      const keyword = filters.keyword.trim().toLowerCase();
      const matchKeyword =
        !keyword ||
        [
          row.operator,
          row.displayTargetId,
          row.actionLabel,
          row.statusLabel,
          row.changedFieldsLabel,
          row.rejectReason,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword));
      const matchTargetType = !filters.targetType || row.targetType === filters.targetType;
      const matchAction = !filters.action || row.action === filters.action;
      const matchStatus = !filters.status || row.status === filters.status;
      return matchKeyword && matchTargetType && matchAction && matchStatus;
    }),
);

const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return rows.value.slice(start, start + PAGE_SIZE);
});

watch(
  () => [filters.keyword, filters.targetType, filters.action, filters.status],
  () => {
    currentPage.value = 1;
  },
);

watch(
  () => rows.value.length,
  () => {
    const totalPages = Math.max(1, Math.ceil(rows.value.length / PAGE_SIZE));
    if (currentPage.value > totalPages) currentPage.value = totalPages;
  },
);

onMounted(loadOperationLogs);

watch(
  () => filters.startDate,
  (startDate) => {
    if (startDate && filters.endDate && normalizeDate(filters.endDate) < normalizeDate(startDate)) {
      filters.endDate = startDate;
    }
  },
);

watch(
  () => filters.endDate,
  (endDate) => {
    if (endDate && filters.startDate && normalizeDate(filters.startDate) > normalizeDate(endDate)) {
      filters.startDate = endDate;
    }
  },
);

async function loadOperationLogs() {
  historyWarning.value = "";
  historyLoadFailed.value = false;
  try {
    const response = await GetOperationHistory({
      startDate: filters.startDate,
      endDate: filters.endDate,
      force: true,
    });
    operationLogs.value = response?.list ?? [];
    if (response?.partialFailure) {
      historyWarning.value = "部分操作歷程載入失敗，請稍後重試";
    }
  } catch (error) {
    operationLogs.value = [];
    historyLoadFailed.value = true;
    console.error(error);
  }
}

function reset() {
  filters.keyword = "";
  filters.targetType = "";
  filters.action = "";
  filters.status = "";
  filters.startDate = "";
  filters.endDate = "";
  loadOperationLogs();
}

function normalizeDate(value) {
  if (!value) return "";
  return String(value).replaceAll("/", "-").slice(0, 10);
}
</script>
