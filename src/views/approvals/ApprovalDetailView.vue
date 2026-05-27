<template>
  <div>
    <PageTitle
      title="審核詳情"
      :description="approval ? `案件 #${approval.id}` : '查無資料'"
      eyebrow="Approvals"
    />
    <div
      v-if="approval"
      class="space-y-4 rounded-lg border border-border-muted bg-background-surface p-5"
    >
      <div class="grid gap-4 md:grid-cols-3">
        <div v-for="item in details" :key="item.label">
          <p class="text-xs text-text-muted">{{ item.label }}</p>
          <p class="mt-1 text-sm font-medium text-text-primary">
            {{ item.value }}
          </p>
        </div>
        <div>
          <p class="text-xs text-text-muted">狀態</p>
          <BaseBadge class="mt-1" :status="approval.status" />
        </div>
      </div>
      <div>
        <p class="mb-2 text-sm font-medium text-text-secondary">Payload</p>
        <pre
          class="overflow-auto rounded-md bg-text-primary p-4 text-xs text-text-inverse"
          >{{ approval.payload }}</pre
        >
      </div>
      <div class="flex justify-end gap-3">
        <BaseButton variant="secondary" @click="modal = 'cancel'"
          >取消</BaseButton
        >
        <BaseButton variant="danger" @click="modal = 'reject'">駁回</BaseButton>
        <BaseButton @click="modal = 'approve'">放行</BaseButton>
      </div>
    </div>
    <EmptyState v-else title="找不到審核案件" />
    <BaseModal v-model="modalOpen" :title="modalTitle" @confirm="submitAction">
      <p class="text-sm text-text-secondary">
        確認送出此審核動作？
      </p>
      <FormField v-if="modal === 'reject'" class="mt-4" label="駁回原因"
        ><BaseTextarea v-model="remark"
      /></FormField>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import BaseBadge from "@/components/base/BaseBadge.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import BaseTextarea from "@/components/base/BaseTextarea.vue";
import EmptyState from "@/components/common/EmptyState.vue";
import PageTitle from "@/components/common/PageTitle.vue";
import FormField from "@/components/forms/FormField.vue";
import {
  approveChangeRequest,
  cancelChangeRequest,
  getPendingChangeRequests,
  rejectChangeRequest,
} from "@/services/approvalService";
import { ACTION_LABEL_MAP, TARGET_TYPE_LABEL_MAP } from "@/utils/constants";
import { formatDateTime } from "@/utils/formatDate";

const route = useRoute();
const modal = ref("");
const remark = ref("");
const approval = ref(null);
const modalOpen = computed({
  get: () => Boolean(modal.value),
  set: (value) => !value && (modal.value = ""),
});
const modalTitle = computed(
  () =>
    ({ approve: "放行案件", reject: "駁回案件", cancel: "取消案件" })[
      modal.value
    ] || "確認",
);
const details = computed(() => [
  { label: "類型", value: TARGET_TYPE_LABEL_MAP[approval.value?.targetType] },
  { label: "對象 ID", value: approval.value?.targetId },
  { label: "動作", value: ACTION_LABEL_MAP[approval.value?.action] },
  { label: "申請人", value: approval.value?.requesterId },
  { label: "審核人", value: approval.value?.reviewerId || "-" },
  { label: "申請時間", value: formatDateTime(approval.value?.createdAt) },
  { label: "結案時間", value: formatDateTime(approval.value?.closedAt) },
  { label: "備註", value: approval.value?.remark || "-" },
]);

onMounted(async () => {
  const rows = await getPendingChangeRequests({});
  approval.value = rows.find((item) => String(item.id) === String(route.params.id)) || null;
});

async function submitAction() {
  if (!approval.value) return;
  if (modal.value === "approve") await approveChangeRequest({ id: approval.value.id });
  if (modal.value === "reject") await rejectChangeRequest({ id: approval.value.id, remark: remark.value });
  if (modal.value === "cancel") await cancelChangeRequest({ id: approval.value.id });
  modal.value = "";
}
</script>
