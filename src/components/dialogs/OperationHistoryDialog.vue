<template>
  <BaseModal
    :model-value="modelValue"
    :icon="historyIcon"
    title="操作歷程查詢"
    subtitle="查看系統所有操作記錄"
    size="history"
    body-class="flex min-h-0 flex-col overflow-hidden p-0"
    header-class="border-b border-border-muted bg-background-surface"
    footer-class="px-8 py-4"
    panel-class="shadow-popup"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="shrink-0 border-b border-border-muted px-6 py-5">
      <div class="flex items-center gap-4 max-lg:flex-wrap">
        <BaseSearchInput
          v-model="draftFilters.keyword"
          class="min-w-72 flex-1 lg:max-w-modal-history-search"
          placeholder="搜尋操作者、異動對象、狀態或動作..."
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

    <div class="flex min-h-0 flex-1 flex-col px-6 py-5">
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
      <div v-else class="min-h-0 flex-1 overflow-y-auto rounded-lg border border-border-muted">
        <div data-test="history-desktop-table" class="hidden lg:block">
          <table class="w-full table-fixed text-left text-sm text-text-secondary">
            <thead class="sticky top-0 z-10 h-12 bg-background-subtle text-sm font-bold text-text-heading">
              <tr>
                <th class="w-[16%] px-3 xl:px-4">日期</th>
                <th class="w-[12%] px-3 xl:px-4">操作者</th>
                <th class="w-[16%] px-3 xl:px-4">異動對象</th>
                <th class="w-[10%] px-3 text-center xl:px-4">狀態</th>
                <th class="w-[10%] px-3 text-center xl:px-4">動作</th>
                <th class="w-[18%] px-3 xl:px-4">異動欄位</th>
                <th class="w-[18%] px-3 xl:px-4">駁回原因</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in filteredRows"
                :key="row.rowKey"
                class="min-h-14 border-b border-border-muted align-top last:border-b-0"
              >
                <td class="px-3 py-4 break-words xl:px-4">{{ formatDateTime(row.date) }}</td>
                <td class="px-3 py-4 font-medium break-words xl:px-4">{{ row.requesterId }}</td>
                <td class="px-3 py-4 break-words xl:px-4" :title="row.displayTargetId">
                  {{ row.displayTargetId }}
                </td>
                <td class="px-3 py-4 text-center xl:px-4">
                  <BaseBadge :status="row.status" :label="row.statusLabel" />
                </td>
                <td class="px-3 py-4 text-center xl:px-4">
                  <BaseBadge :status="row.action" :label="row.actionLabel" />
                </td>
                <td class="px-3 py-4 whitespace-normal break-words xl:px-4" :title="row.changedFields">
                  {{ row.changedFields || "-" }}
                </td>
                <td class="px-3 py-4 whitespace-normal break-words xl:px-4" :title="row.rejectReason">
                  {{ row.rejectReason || "-" }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div data-test="history-responsive-cards" class="grid gap-4 p-4 lg:hidden">
          <article
            v-for="row in filteredRows"
            :key="`card-${row.rowKey}`"
            class="rounded-lg border border-border-muted bg-background-surface p-4 shadow-sm"
          >
            <dl class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              <div>
                <dt class="text-xs font-bold text-text-grey">日期</dt>
                <dd class="mt-1 break-words text-sm text-text-secondary">{{ formatDateTime(row.date) }}</dd>
              </div>
              <div>
                <dt class="text-xs font-bold text-text-grey">操作者</dt>
                <dd class="mt-1 break-words text-sm font-medium text-text-secondary">{{ row.requesterId }}</dd>
              </div>
              <div>
                <dt class="text-xs font-bold text-text-grey">異動對象</dt>
                <dd class="mt-1 break-words text-sm text-text-secondary">{{ row.displayTargetId }}</dd>
              </div>
              <div>
                <dt class="text-xs font-bold text-text-grey">狀態</dt>
                <dd class="mt-1"><BaseBadge :status="row.status" :label="row.statusLabel" /></dd>
              </div>
              <div>
                <dt class="text-xs font-bold text-text-grey">動作</dt>
                <dd class="mt-1"><BaseBadge :status="row.action" :label="row.actionLabel" /></dd>
              </div>
              <div>
                <dt class="text-xs font-bold text-text-grey">異動欄位</dt>
                <dd class="mt-1 whitespace-normal break-words text-sm text-text-secondary">{{ row.changedFields || "-" }}</dd>
              </div>
              <div class="sm:col-span-2">
                <dt class="text-xs font-bold text-text-grey">駁回原因</dt>
                <dd class="mt-1 whitespace-normal break-words text-sm text-text-secondary">{{ row.rejectReason || "-" }}</dd>
              </div>
            </dl>
          </article>
        </div>

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
    if (open) {
      resetUiState();
      loadRowsOnce();
    } else {
      resetUiState();
    }
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

function resetUiState() {
  draftFilters.keyword = "";
  draftFilters.startDate = "";
  draftFilters.endDate = "";
  appliedFilters.keyword = "";
  appliedFilters.startDate = "";
  appliedFilters.endDate = "";
  errorMessage.value = "";
  loading.value = false;
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
    row.statusLabel,
    row.changedFields,
    row.remark,
    row.comment,
    row.rejectReason,
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
