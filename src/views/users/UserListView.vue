<template>
  <div>
    <PageTitle
      title="使用者管理"
      description="查詢、建立、編輯、停用、解鎖與重設密碼。"
      eyebrow="Users"
    >
      <template #actions>
        <RouterLink to="/users/create"
          ><BaseButton>新增使用者</BaseButton></RouterLink
        >
      </template>
    </PageTitle>
    <SearchFilterBar class="mb-4">
      <FormField label="關鍵字">
        <BaseInput v-model="keyword" placeholder="搜尋帳號或姓名" />
      </FormField>
      <FormField label="狀態">
        <BaseSelect
          v-model="status"
          :options="statusOptions"
          placeholder="全部狀態"
        />
      </FormField>
    </SearchFilterBar>
    <BaseTable :columns="columns" :rows="filteredUsers">
      <template #cell-status="{ row }"
        ><BaseBadge :status="row.status"
      /></template>
      <template #cell-roles="{ row }">{{ formatRoles(row.roles) }}</template>
      <template #cell-createdAt="{ row }">{{
        formatDateTime(row.createdAt)
      }}</template>
      <template #cell-lastLoginAt="{ row }">{{
        formatDateTime(row.lastLoginAt)
      }}</template>
      <template #actions="{ row }">
        <div class="flex flex-wrap justify-end gap-2">
          <RouterLink class="text-primary" :to="`/users/${row.id}`"
            >查看</RouterLink
          >
          <RouterLink class="text-primary" :to="`/users/${row.id}/edit`"
            >編輯</RouterLink
          >
          <button class="text-amber-700" @click="confirmAction(row, 'unlock')">
            解鎖
          </button>
          <button class="text-primary" @click="confirmAction(row, 'reset')">
            重設
          </button>
          <button
            class="text-danger-text"
            @click="confirmAction(row, 'disable')"
          >
            停用
          </button>
        </div>
      </template>
      <template #empty
        ><EmptyState v-if="filteredUsers.length === 0"
      /></template>
    </BaseTable>
    <BasePagination :page="1" :total="filteredUsers.length" :size="20" />
    <ConfirmDialog
      v-model="dialog.open"
      :title="dialog.title"
      :message="dialog.message"
      :danger="dialog.danger"
      @confirm="dialog.open = false"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";

import BaseBadge from "@/components/base/BaseBadge.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import BasePagination from "@/components/base/BasePagination.vue";
import BaseSelect from "@/components/base/BaseSelect.vue";
import ConfirmDialog from "@/components/common/ConfirmDialog.vue";
import EmptyState from "@/components/common/EmptyState.vue";
import PageTitle from "@/components/common/PageTitle.vue";
import SearchFilterBar from "@/components/common/SearchFilterBar.vue";
import FormField from "@/components/forms/FormField.vue";
import BaseTable from "@/components/tables/BaseTable.vue";
import { getUsers } from "@/services/userService";
import { roleLabelMap, statusLabelMap } from "@/utils/constants";
import { formatDateTime } from "@/utils/formatDate";

const keyword = ref("");
const status = ref("");
const dialog = ref({ open: false });
const users = ref([]);
const columns = [
  { key: "id", label: "帳號" },
  { key: "userName", label: "姓名" },
  { key: "status", label: "狀態" },
  { key: "roles", label: "角色" },
  { key: "createdAt", label: "建立時間" },
  { key: "lastLoginAt", label: "最後登入" },
];
const statusOptions = ["ACTIVE", "DISABLED", "LOCKED", "PENDING"].map(
  (value) => ({ label: statusLabelMap[value] || value, value }),
);
const filteredUsers = computed(() =>
  users.value.filter((user) => {
    const matchKeyword =
      !keyword.value ||
      `${user.id}${user.userName}`
        .toLowerCase()
        .includes(keyword.value.toLowerCase());
    const matchStatus = !status.value || user.status === status.value;
    return matchKeyword && matchStatus;
  }),
);

onMounted(async () => {
  const response = await getUsers({ page: 1, size: 100 });
  users.value = response?.content ?? (Array.isArray(response) ? response : []);
});

function confirmAction(row, action) {
  const map = {
    unlock: ["解鎖使用者", `確認解鎖 ${row.userName}？`, false],
    reset: [
      "重設密碼",
      `確認重設 ${row.userName} 的密碼？此操作依 Figma 註解直接生效。`,
      false,
    ],
    disable: ["停用使用者", `確認送出停用 ${row.userName} 的審核申請？`, true],
  };
  const [title, message, danger] = map[action];
  dialog.value = { open: true, title, message, danger };
}

function formatRoles(roles = []) {
  return roles.map((role) => roleLabelMap[role] || role).join(", ");
}
</script>
