<template>
  <div>
    <PageTitle
      title="審核歷史"
      description="依類型與對象 ID 查詢審核軌跡。"
      eyebrow="Approvals"
    />
    <SearchFilterBar class="mb-4">
      <FormField label="類型"
        ><BaseSelect
          v-model="targetType"
          :options="targetOptions"
          placeholder="全部類型"
      /></FormField>
      <FormField label="對象 ID"
        ><BaseInput v-model="targetId" placeholder="輸入 targetId"
      /></FormField>
    </SearchFilterBar>
    <BaseTable :columns="columns" :rows="filteredHistory">
      <template #cell-targetType="{ row }">{{
        targetMap[row.targetType]
      }}</template>
      <template #cell-action="{ row }">{{ actionMap[row.action] }}</template>
      <template #cell-status="{ row }"
        ><BaseBadge :status="row.status"
      /></template>
      <template #cell-createdAt="{ row }">{{
        formatDateTime(row.createdAt)
      }}</template>
      <template #cell-closedAt="{ row }">{{
        formatDateTime(row.closedAt)
      }}</template>
    </BaseTable>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";

import BaseBadge from "@/components/base/BaseBadge.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import BaseSelect from "@/components/base/BaseSelect.vue";
import PageTitle from "@/components/common/PageTitle.vue";
import SearchFilterBar from "@/components/common/SearchFilterBar.vue";
import FormField from "@/components/forms/FormField.vue";
import BaseTable from "@/components/tables/BaseTable.vue";
import { getChangeRequestHistory } from "@/services/approvalService";
import { ACTION_LABEL_MAP, TARGET_TYPE_LABEL_MAP } from "@/utils/constants";
import { formatDateTime } from "@/utils/formatDate";

const targetType = ref("");
const targetId = ref("");
const history = ref([]);
const targetMap = TARGET_TYPE_LABEL_MAP;
const actionMap = ACTION_LABEL_MAP;
const targetOptions = Object.entries(TARGET_TYPE_LABEL_MAP).map(
  ([value, label]) => ({ value, label }),
);
const columns = [
  { key: "id", label: "案件 ID" },
  { key: "targetType", label: "類型" },
  { key: "targetId", label: "對象 ID" },
  { key: "action", label: "動作" },
  { key: "status", label: "狀態" },
  { key: "createdAt", label: "申請時間" },
  { key: "closedAt", label: "結案時間" },
];
const filteredHistory = computed(() =>
  history.value.filter((item) => {
    const matchType = !targetType.value || item.targetType === targetType.value;
    const matchId =
      !targetId.value || String(item.targetId).includes(targetId.value);
    return matchType && matchId;
  }),
);

onMounted(async () => {
  const rows = await getChangeRequestHistory({});
  history.value = Array.isArray(rows) ? rows : [];
});
</script>
