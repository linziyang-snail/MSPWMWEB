<template>
  <div>
    <PageTitle
      title="組織管理"
      description="管理可操作組織與停用申請。"
      eyebrow="Organizations"
    >
      <template #actions
        ><RouterLink to="/organizations/create"
          ><BaseButton>新增組織</BaseButton></RouterLink
        ></template
      >
    </PageTitle>
    <BaseTable :columns="columns" :rows="organizations">
      <template #cell-orgType="{ row }">{{
        orgTypeLabelMap[row.orgType] || row.orgType
      }}</template>
      <template #cell-status="{ row }"
        ><BaseBadge :status="row.status"
      /></template>
      <template #actions="{ row }">
        <div class="flex flex-wrap justify-end gap-2">
          <RouterLink class="text-primary" :to="`/organizations/${row.id}/edit`"
            >編輯</RouterLink
          >
          <button class="text-danger-text" @click="selected = row">停用</button>
        </div>
      </template>
    </BaseTable>
    <ConfirmDialog
      v-model="confirmOpen"
      title="停用組織"
      :message="`確認送出停用 ${selected?.orgName || ''} 的審核申請？`"
      danger
      @confirm="selected = null"
    />
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

import BaseBadge from "@/components/base/BaseBadge.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import ConfirmDialog from "@/components/common/ConfirmDialog.vue";
import PageTitle from "@/components/common/PageTitle.vue";
import BaseTable from "@/components/tables/BaseTable.vue";
import { mockOrganizations } from "@/mocks/organizations.mock";
import { orgTypeLabelMap } from "@/utils/constants";

const organizations = mockOrganizations;
const selected = ref(null);
const confirmOpen = computed({
  get: () => Boolean(selected.value),
  set: (value) => {
    if (!value) selected.value = null;
  },
});
const columns = [
  { key: "id", label: "ID" },
  { key: "orgName", label: "組織名稱" },
  { key: "parentId", label: "上層組織" },
  { key: "orgType", label: "類型" },
  { key: "status", label: "狀態" },
];
</script>
