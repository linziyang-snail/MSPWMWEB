<template>
  <BaseModal
    :model-value="modelValue"
    :icon="historyIcon"
    title="操作歷程查詢"
    subtitle="查看系統所有操作記錄"
    size="history"
    body-class="p-0"
    header-class="border-b border-border-muted bg-background-surface"
    footer-class="px-8 py-4"
    panel-class="shadow-popup"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="border-b border-border-muted px-6 py-5">
      <div class="flex items-center gap-4 max-lg:flex-wrap">
        <BaseSearchInput
          v-model="draftFilters.keyword"
          class="min-w-72 flex-1 lg:max-w-modal-history-search"
          placeholder="搜尋人員姓名、標題或動作..."
          size="md"
          @submit="applyFilters"
        />

        <BaseDateInput
          v-model="draftFilters.startDate"
          class="w-modal-date shrink-0"
          placeholder="年/月/日"
          :max="draftFilters.endDate"
        />
        <span class="text-lg font-medium text-text-disabled">~</span>
        <BaseDateInput
          v-model="draftFilters.endDate"
          class="w-modal-date shrink-0"
          placeholder="年/月/日"
          :min="draftFilters.startDate"
        />

        <BaseButton class="w-24" :loading="loading" @click="applyFilters">
          查詢
        </BaseButton>
        <BaseButton class="w-20" variant="secondary" @click="clearFilters">
          清除
        </BaseButton>
      </div>
    </div>

    <div class="min-h-0 px-6 py-5">
      <div
        v-if="loading"
        class="grid min-h-80 place-items-center text-sm font-medium text-text-secondary"
      >
        載入中
      </div>
      <div
        v-else-if="errorMessage"
        class="grid min-h-80 place-items-center text-sm font-medium text-danger-text"
      >
        {{ errorMessage }}
      </div>
      <div v-else class="max-h-[calc(100dvh-280px)] overflow-auto rounded-lg border border-border-muted">
        <table class="w-full min-w-[920px] table-fixed text-left text-sm text-text-secondary">
          <thead class="sticky top-0 z-10 h-12 bg-background-subtle text-sm font-bold text-text-heading">
            <tr>
              <th class="w-44 px-5">日期</th>
              <th class="w-36 px-5">操作者</th>
              <th class="px-5">被異動帳號</th>
              <th class="w-28 px-5 text-center">動作</th>
              <th class="w-48 px-5">異動欄位</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in filteredRows"
              :key="row.rowKey"
              class="h-14 border-b border-border-muted last:border-b-0"
            >
              <td class="px-5">{{ formatDateTime(row.date) }}</td>
              <td class="px-5 font-medium">{{ row.requesterId }}</td>
              <td class="px-5">
                <span class="block truncate" :title="row.displayTargetId">
                  {{ row.displayTargetId }}
                </span>
              </td>
              <td class="px-5 text-center">
                <BaseBadge :status="row.action" :label="row.actionLabel" />
              </td>
              <td class="px-5">
                <span class="block truncate" :title="row.changedFields">
                  {{ row.changedFields }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <EmptyState
          v-if="!filteredRows.length"
          title="查無操作記錄"
          description="請調整查詢條件後再試一次。"
        />
      </div>
    </div>

    <template #footer>
      <BaseButton class="w-20" variant="secondary" @click="$emit('update:modelValue', false)">
        關閉
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";

import historyIcon from "@/assets/history.svg";
import BaseBadge from "@/components/base/BaseBadge.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseDateInput from "@/components/base/BaseDateInput.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import BaseSearchInput from "@/components/base/BaseSearchInput.vue";
import EmptyState from "@/components/common/EmptyState.vue";
import { GetOperationHistory } from "@/services/operationHistoryService";
import { formatDateTime } from "@/utils/formatDate";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});

defineEmits(["update:modelValue"]);

const loading = ref(false);
const loaded = ref(false);
const errorMessage = ref("");
const rows = ref([]);

const draftFilters = reactive({
  keyword: "",
  startDate: "",
  endDate: "",
});

const appliedFilters = reactive({
  keyword: "",
  startDate: "",
  endDate: "",
});

const filteredRows = computed(() => {
  const keyword = appliedFilters.keyword.trim().toLowerCase();
  const startTime = getStartTime(appliedFilters.startDate);
  const endTime = getEndTime(appliedFilters.endDate);
  return rows.value.filter((row) => {
    const rowTime = getTime(row.date);
    const matchKeyword = !keyword || getSearchText(row).includes(keyword);
    const matchStart = !startTime || rowTime >= startTime;
    const matchEnd = !endTime || rowTime <= endTime;
    return matchKeyword && matchStart && matchEnd;
  });
});

watch(
  () => props.modelValue,
  (open) => {
    if (open) loadRowsOnce();
  },
);

watch(
  () => draftFilters.startDate,
  (value) => {
    if (value && draftFilters.endDate && normalizeDate(draftFilters.endDate) < normalizeDate(value)) {
      draftFilters.endDate = value;
    }
  },
);

watch(
  () => draftFilters.endDate,
  (value) => {
    if (value && draftFilters.startDate && normalizeDate(draftFilters.startDate) > normalizeDate(value)) {
      draftFilters.startDate = value;
    }
  },
);

async function loadRowsOnce() {
  if (loaded.value || loading.value) return;
  try {
    loading.value = true;
    errorMessage.value = "";
    const response = await GetOperationHistory();
    rows.value = (response?.list ?? []).map((row) => ({
      ...row,
      rowKey: `${row.targetType}-${row.id}`,
    }));
    loaded.value = true;
  } catch (error) {
    console.error(error);
    errorMessage.value = "操作歷程讀取失敗，請稍後再試";
  } finally {
    loading.value = false;
  }
}

function applyFilters() {
  appliedFilters.keyword = draftFilters.keyword;
  appliedFilters.startDate = draftFilters.startDate;
  appliedFilters.endDate = draftFilters.endDate;
}

function clearFilters() {
  draftFilters.keyword = "";
  draftFilters.startDate = "";
  draftFilters.endDate = "";
  applyFilters();
}

function getSearchText(row = {}) {
  return [
    row.requesterId,
    row.targetId,
    row.targetName,
    row.targetDisplay,
    row.payload?.userId,
    row.payload?.userName,
    row.payload?.orgName,
    row.actionLabel,
    row.changedFields,
    row.remark,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getStartTime(value) {
  if (!value) return 0;
  return getTime(`${normalizeDate(value)}T00:00:00`);
}

function getEndTime(value) {
  if (!value) return 0;
  return getTime(`${normalizeDate(value)}T23:59:59`);
}

function getTime(value) {
  if (!value) return 0;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function normalizeDate(value) {
  if (!value) return "";
  return String(value).replaceAll("/", "-").slice(0, 10);
}
</script>
