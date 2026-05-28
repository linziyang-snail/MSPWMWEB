<template>
  <div>
    <PageTitle
      title="審核管理"
      description="覆核主管與管理員處理待審核案件。"
      eyebrow="Approvals"
    />
    <SearchFilterBar class="mb-4">
      <FormField label="審核類型">
        <BaseSelect
          v-model="targetType"
          :options="targetOptions"
          placeholder="全部類型"
        />
      </FormField>
    </SearchFilterBar>
    <BaseTable :columns="columns" :rows="filteredApprovals">
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
      <template #actions="{ row }">
        <div class="flex flex-wrap justify-end gap-2">
          <RouterLink class="text-primary" :to="`/approvals/${row.id}`"
            >查看</RouterLink
          >
          <button
            class="text-success-text"
            :disabled="isOwnRequest(row)"
            :class="{ 'opacity-50': isOwnRequest(row) }"
            @click="openConfirm(row, 'approve')"
          >
            放行
          </button>
          <button
            class="text-danger-text"
            :disabled="isOwnRequest(row)"
            :class="{ 'opacity-50': isOwnRequest(row) }"
            @click="openConfirm(row, 'reject')"
          >
            駁回
          </button>
          <span v-if="isOwnRequest(row)" class="text-text-secondary">等待其他管理員審核</span>
        </div>
      </template>
    </BaseTable>
    <BaseModal
      v-model="confirm.open"
      :title="confirm.title"
      @confirm="submitConfirm"
    >
      <p class="text-sm text-text-secondary">{{ confirm.message }}</p>
      <FormField v-if="confirm.type === 'reject'" class="mt-4" label="駁回原因"
        ><BaseTextarea v-model="remark"
      /></FormField>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";

import BaseBadge from "@/components/base/BaseBadge.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import BaseSelect from "@/components/base/BaseSelect.vue";
import BaseTextarea from "@/components/base/BaseTextarea.vue";
import PageTitle from "@/components/common/PageTitle.vue";
import SearchFilterBar from "@/components/common/SearchFilterBar.vue";
import FormField from "@/components/forms/FormField.vue";
import BaseTable from "@/components/tables/BaseTable.vue";
import {
  approveChangeRequest,
  getPendingChangeRequests,
  rejectChangeRequest,
} from "@/services/approvalService";
import { useAuthStore } from "@/stores/authStore";
import { ACTION_LABEL_MAP, TARGET_TYPE_LABEL_MAP } from "@/utils/constants";
import { formatDateTime } from "@/utils/formatDate";

const targetType = ref("");
const auth = useAuthStore();
const remark = ref("");
const approvals = ref([]);
const targetMap = TARGET_TYPE_LABEL_MAP;
const actionMap = ACTION_LABEL_MAP;
const confirm = ref({ open: false });
const targetOptions = Object.entries(TARGET_TYPE_LABEL_MAP).map(
  ([value, label]) => ({ value, label }),
);
const columns = [
  { key: "id", label: "案件 ID" },
  { key: "targetType", label: "類型" },
  { key: "targetId", label: "對象 ID" },
  { key: "action", label: "動作" },
  { key: "requesterId", label: "申請人" },
  { key: "status", label: "狀態" },
  { key: "createdAt", label: "申請時間" },
];
const filteredApprovals = computed(() =>
  approvals.value.filter(
    (item) =>
      item.status === "PENDING" &&
      (!targetType.value || item.targetType === targetType.value),
  ),
);

onMounted(async () => {
  approvals.value = await getPendingChangeRequests({ status: "PENDING" });
});

function openConfirm(row, type) {
  if (isOwnRequest(row)) return;
  const map = {
    approve: ["放行案件", `確認放行案件 #${row.id}？`],
    reject: ["駁回案件", `請確認是否駁回案件 #${row.id}。`],
  };
  confirm.value = {
    open: true,
    row,
    type,
    title: map[type][0],
    message: map[type][1],
  };
}

async function submitConfirm() {
  const { row, type } = confirm.value;
  if (!row) return;
  try {
    if (type === "approve") await approveChangeRequest({ id: row.id });
    if (type === "reject") await rejectChangeRequest({ id: row.id, remark: remark.value });
    approvals.value = approvals.value.filter((item) => item.id !== row.id);
  } catch (error) {
    console.error(error);
  } finally {
    confirm.value = { open: false };
    remark.value = "";
  }
}

function isOwnRequest(row = {}) {
  return Boolean(row.requesterId && row.requesterId === auth.userId);
}
</script>
