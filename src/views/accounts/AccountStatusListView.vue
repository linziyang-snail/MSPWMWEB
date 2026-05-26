<template>
  <div class="space-y-6">
    <!-- 頁面標題摘要區 -->
    <section v-if="!isActivePage"
      class="flex items-center justify-between gap-4 px-6 py-6 border-t min-h-32 rounded-2xl border-border-muted bg-background-surface">
      <div class="items-center gap-4">
        <div class="flex">
          <span class="grid size-7 place-items-center text-primary">
            <UsersIcon class="size-7" />
          </span>
          <h1 class="pl-2 text-2xl font-bold leading-normal text-text-heading">
            {{ pageTitle }}
          </h1>
        </div>

        <div class="py-1">
          <p class="text-sm font-normal leading-normal text-natural">
            {{ pageDescription }}
          </p>
        </div>
      </div>
      <div v-if="isPendingPage"
        class="grid gap-2 px-6 py-3 text-center min-h-20 min-w-28 place-items-center rounded-2xl bg-primary text-text-inverse">
        <p class="text-xs font-normal leading-normal">待審核數量</p>
        <p class="text-3xl font-bold leading-tight tracking-wide">{{ pendingCount }}</p>
      </div>
    </section>

    <!-- 待審核帳號異動卡片 -->
    <section v-if="isChangeReviewPage" class="space-y-6">
      <div class="flex justify-end gap-4 px-4 py-4 border-b min-h-header border-border-muted bg-background-page/50">
        <button
          class="inline-flex h-10 w-40 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-base font-medium leading-normal text-text-inverse transition hover:bg-primary-hover"
          type="button">
          <FileIcon /> 匯出（CSV）
        </button>
        <button
          class="inline-flex h-10 w-32 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-base font-medium leading-normal text-text-inverse transition hover:bg-primary-hover"
          type="button" @click="createDialogOpen = true">
          <UserPlusIcon /> 新增人員
        </button>
      </div>

      <article v-for="request in accountChangeRows" :key="request.id"
        class="p-6 rounded-2xl bg-background-surface shadow-card">
        <header class="flex items-start justify-between gap-4 pb-5 border-b border-border">
          <h2 class="text-2xl font-bold leading-normal text-text-heading">
            員編：{{ request.userId }} - {{ request.userName }}
          </h2>
          <button
            class="inline-flex items-center gap-2 text-base font-bold leading-normal text-primary hover:text-primary-hover"
            type="button" @click="toggleOriginal(request.id)">
            <EyeIcon />
            {{ expandedChangeIds.includes(request.id) ? "隱藏修改前資料" : "查看修改前資料" }}
          </button>
        </header>

        <div v-if="expandedChangeIds.includes(request.id)" class="pb-6 mt-6 space-y-4 border-b border-border">
          <div
            class="px-4 py-3 text-sm font-medium border rounded-lg border-warning-border bg-warning-bg text-warning-text">
            <span class="mr-2">ⓘ</span>修改前的原始資料
          </div>
          <AccountInfoTable :item="request" :data="request.before" />
        </div>

        <div
          :class="['mt-6 rounded-2xl border border-primary-border bg-primary-subtle/60 p-6', request.type === 'DELETE' && 'border-danger-text']">
          <div class="grid grid-cols-12 gap-6 max-xl:grid-cols-12">
            <div class="col-span-1">
              <span class="grid rounded-full size-8 place-items-center bg-primary text-text-inverse">
                !
              </span>
            </div>
            <div class="min-w-0 col-span-9 max-xl:col-span-11">
              <h3 class="text-base font-bold leading-6 text-primary">{{ request.title }}</h3>
              <p v-if="request.type === 'PERMISSION' && expandedChangeIds.includes(request.id)"
                class="mt-3 text-xs font-bold leading-normal text-primary">
                變更後的完整人員資訊
              </p>
              <div class="mt-4 overflow-hidden border rounded-lg border-copy-table-border bg-background-surface">
                <div v-if="request.type === 'DELETE'"
                  class="px-4 py-3 text-sm font-medium leading-normal bg-danger-bg text-danger-text">
                  ⓘ 此操作將永久刪除此人員
                </div>
                <AccountInfoTable :item="request" :data="request.after" :connected="true" />
              </div>
              <p class="mt-2 text-xs leading-5 text-text-grey">
                提交者：{{ request.createdByName }}｜提交時間：{{ formatMetaDateTime(request.createdAt) }}
              </p>
            </div>
            <aside
              class="flex flex-col justify-center col-span-2 gap-6 max-xl:col-span-12 max-xl:ml-16 max-xl:flex-row max-xl:justify-start">
              <template v-if="canReviewRequest(request)">
                <button
                  class="inline-flex h-10 w-24 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-base font-medium text-text-inverse hover:bg-primary-hover"
                  type="button" @click="confirm(request, 'approve')">
                  <CheckIcon /> <span>核准</span>
                </button>
                <button
                  class="inline-flex h-10 w-24 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-text-grey bg-background-surface px-4 py-2.5 text-base font-medium text-natural hover:bg-background-hover"
                  type="button" @click="confirm(request, 'reject')">
                  <XIcon /> <span>駁回</span>
                </button>
              </template>
              <div v-else class="flex flex-col items-center justify-center gap-4">
                <div
                  class="grid w-24 px-3 text-sm font-bold leading-normal text-center border rounded-lg min-h-20 place-items-center border-danger-text bg-danger-bg text-danger-text">
                  等待其他<br />管理員審核
                </div>
                <button
                  class="inline-flex h-10 w-24 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-text-grey bg-background-surface px-4 py-2.5 text-base font-medium text-natural hover:bg-background-hover"
                  type="button">
                  <XIcon /> <span>取消</span>
                </button>
              </div>
            </aside>
          </div>
        </div>
      </article>
    </section>

    <!-- 帳號搜尋列 -->
    <section v-if="showAccountFilters"
      class="px-4 py-4 border rounded-2xl border-border bg-background-surface shadow-control">
      <div class="flex items-center gap-6 max-xl:flex-wrap">
        <BaseSearchInput v-model="accountKeyword" class="flex-1 min-w-80" placeholder="請輸入員編、人員姓名" size="md"
          @submit="applyActiveFilters" />
        <div class="flex items-center gap-4">
          <BaseDateInput v-model="activeStartDate" class="w-36" placeholder="年/月/日" />
          <span class="text-base font-normal text-text-placeholder">~</span>
          <BaseDateInput v-model="activeEndDate" class="w-36" placeholder="年/月/日" />
        </div>
        <button
          class="inline-flex items-center justify-center h-10 py-2 text-sm font-medium leading-normal transition rounded-lg min-w-20 bg-primary px-7 text-text-inverse shadow-control hover:bg-primary-hover"
          type="button" @click="applyActiveFilters">
          查詢
        </button>
        <button
          class="inline-flex items-center justify-center h-10 px-4 py-2 text-base font-medium leading-normal transition border rounded-lg min-w-16 border-border-strong bg-background-surface text-natural hover:bg-background-hover"
          type="button" @click="resetActiveFilters">
          清除
        </button>
      </div>
    </section>

    <!-- 表格 -->
    <div v-if="!isChangeReviewPage" class="overflow-hidden border rounded-xl border-border bg-background-surface">
      <div class="flex justify-end gap-4 px-4 py-4 border-b min-h-header border-border-muted bg-background-page/50">
        <button
          class="inline-flex h-10 w-40 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-base font-medium leading-normal text-text-inverse transition hover:bg-primary-hover"
          type="button">
          <FileIcon /> 匯出（CSV）
        </button>
        <button
          class="inline-flex h-10 w-32 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-base font-medium leading-normal text-text-inverse transition hover:bg-primary-hover"
          type="button" @click="createDialogOpen = true">
          <UserPlusIcon /> 新增人員
        </button>
      </div>
      <table class="w-full text-sm table-fixed">
        <thead>
          <tr class="h-16 border-b border-border bg-background-hover">
            <th v-for="col in tableColumns" :key="col.key"
              class="px-4 py-4 text-base font-bold leading-normal text-left text-natural xl:px-5" :class="col.class">
              <button class="inline-flex items-center gap-2 text-left font-bold transition hover:text-primary" type="button"
                @click="toggleSort(col.key)">
                {{ col.label }}
                <SortIcon :active="sortState.key === col.key" :direction="sortState.direction" />
              </button>
            </th>
            <th class="w-[22%] px-4 py-4 text-base font-bold leading-normal text-center text-natural xl:px-5">
              {{ trailingColumnLabel }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in filteredRows" :key="row.id"
            class="h-20 border-b border-border-muted last:border-0 hover:bg-background-hover">
            <td class="px-4 py-4 text-base font-normal leading-normal break-words text-natural xl:px-5">
              {{ formatDate(row.createdAt) }}
            </td>
            <td class="px-4 py-4 text-base font-bold leading-normal break-words text-natural xl:px-5">{{ row.id }}</td>
            <td class="px-4 py-4 text-base font-normal leading-normal break-words text-natural xl:px-5">{{ row.userName }}</td>
            <td class="px-4 py-4 text-base font-normal leading-normal break-words text-natural xl:px-5">{{ row.orgName }}</td>
            <td class="px-4 py-4 text-base font-normal leading-normal break-words text-natural xl:px-5">
              {{ row.roleLabel || row.roles.join(", ") }}
            </td>
            <td class="px-4 py-4 xl:px-5">
              <span v-if="row.status === 'PENDING_MULTI'"
                class="inline-flex h-8 items-center whitespace-nowrap rounded-3xl bg-danger-bg px-3 py-0.5 text-sm font-medium leading-normal text-danger-text">
                等待其他管理員審核
              </span>
              <span v-else-if="row.status === 'PENDING'"
                class="inline-flex h-8 items-center whitespace-nowrap rounded-3xl bg-danger-bg px-3 py-0.5 text-sm font-medium leading-normal text-danger-text">
                待審核
              </span>
              <StatusBadge v-else :status="row.status" />
            </td>
            <td class="px-3 py-4 xl:px-5">
              <p v-if="routeStatus === 'DELETED'" class="text-base font-normal leading-normal text-center text-natural">
                -
              </p>
              <button v-else-if="routeStatus === 'REJECTED'"
                class="block mx-auto text-base font-bold leading-normal transition text-danger-text hover:text-danger"
                type="button" @click="openRejectReason(row)">
                {{ row.rejectReason || "權限選擇錯誤" }}
              </button>
              <div v-else-if="isActivePage" class="flex flex-wrap items-center justify-center gap-4 2xl:gap-8">
                <button
                  class="grid transition rounded size-8 place-items-center text-natural hover:bg-background-hover hover:text-primary"
                  type="button" aria-label="重設密碼" @click="openPasswordReset(row)">
                  <img :src="accountKeyIcon" alt="" class="size-6" />
                </button>
                <button
                  class="grid transition rounded size-8 place-items-center text-natural hover:bg-background-hover hover:text-primary"
                  type="button" aria-label="編輯帳號" @click="openEditPermission(row)">
                  <img :src="accountEditIcon" alt="" class="size-6" />
                </button>
                <button
                  class="grid transition rounded size-8 place-items-center text-natural hover:bg-background-hover hover:text-danger-text"
                  type="button" aria-label="刪除帳號" @click="confirm(row, 'delete')">
                  <img :src="accountDeleteIcon" alt="" class="size-6" />
                </button>
              </div>
              <div v-else class="flex flex-wrap items-center justify-center gap-2 2xl:gap-4">
                <template v-if="row.status === 'PENDING'">
                  <button
                    class="inline-flex h-10 w-24 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-base font-medium leading-normal text-text-inverse transition hover:bg-primary-hover"
                    type="button" @click="confirm(row, 'approve')">
                    <CheckIcon /> <span>核准</span>
                  </button>
                  <button
                    class="inline-flex h-10 w-24 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-text-grey bg-background-surface px-4 py-2.5 text-base font-medium leading-normal text-natural transition hover:bg-background-hover"
                    type="button" @click="confirm(row, 'reject')">
                    <XIcon /> <span>駁回</span>
                  </button>
                </template>
                <BaseButton v-if="row.status === 'LOCKED'" variant="text" size="sm" @click="confirm(row, 'unlock')">
                  解鎖
                </BaseButton>
                <BaseButton v-if="row.status === 'ACTIVE'" variant="text" size="sm" @click="confirm(row, 'disable')">
                  停用
                </BaseButton>
                <BaseButton v-if="['ACTIVE', 'LOCKED'].includes(row.status)" variant="text" size="sm"
                  @click="confirm(row, 'reset')">
                  重設密碼
                </BaseButton>
              </div>
            </td>
          </tr>
          <tr v-if="!filteredRows.length">
            <td :colspan="tableColumns.length + 1" class="py-16 text-center">
              <EmptyState />
            </td>
          </tr>
        </tbody>
      </table>

      <div
        class="flex items-center justify-between h-16 px-6 text-xs font-normal leading-normal bg-background-page text-natural">
        <span>顯示共 {{ filteredRows.length }} 筆</span>
        <div class="flex items-center gap-2 text-xs font-bold leading-normal text-natural">
          <button
            class="px-4 text-center transition border rounded h-7 border-text-grey bg-background-surface hover:bg-background-hover disabled:opacity-60"
            type="button" disabled>
            上頁
          </button>
          <span
            class="grid px-4 border rounded h-7 min-w-10 place-items-center border-primary bg-primary text-text-inverse">
            1
          </span>
          <button
            class="px-4 text-center transition border rounded h-7 border-text-grey bg-background-surface hover:bg-background-hover disabled:opacity-60"
            type="button" disabled>
            下頁
          </button>
        </div>
      </div>
    </div>

    <!-- 帳號詳情 Modal -->
    <BaseModal v-model="detailOpen" title="帳號資訊" size="md">
      <div v-if="selected" class="grid grid-cols-2 text-sm leading-6 gap-y-4">
        <span class="font-bold text-text-secondary">員工編號</span>
        <span class="text-text-primary">{{ selected.id }}</span>
        <span class="font-bold text-text-secondary">姓名</span>
        <span class="text-text-primary">{{ selected.userName }}</span>
        <span class="font-bold text-text-secondary">科別</span>
        <span class="text-text-primary">{{ selected.orgName }}</span>
        <span class="font-bold text-text-secondary">角色</span>
        <span class="text-text-primary">{{
          selected.roleLabel || selected.roles.join(", ")
        }}</span>
        <span class="font-bold text-text-secondary">狀態</span>
        <StatusBadge :status="selected.status" />
        <span class="font-bold text-text-secondary">最後登入</span>
        <span class="text-text-primary">{{
          selected.lastLoginAt ? formatDateTime(selected.lastLoginAt) : "-"
        }}</span>
        <span class="font-bold text-text-secondary">登入 IP</span>
        <span class="text-text-primary">{{ selected.loginIp || "-" }}</span>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="detailOpen = false">關閉</BaseButton>
      </template>
    </BaseModal>

    <!-- 一般確認 Dialog -->
    <ConfirmDialog v-model="dialog.open" :title="dialog.title" :subtitle="dialog.subtitle" :message="dialog.message"
      :danger="dialog.danger" :success="dialog.success" :confirm-text="dialog.confirmText"
      @confirm="dialog.open = false" />

    <!-- 駁回原因 Dialog -->
    <RejectReasonDialog v-model="rejectDialog.open" :title="rejectDialog.title" :subtitle="rejectDialog.subtitle"
      @confirm="onRejectConfirm" />
    <AccountCreateModal v-model="createDialogOpen" @submitted="onCreateAccount" />
    <AccountPasswordResetModal v-model="passwordResetOpen" :account="selected" />
    <AccountEditPermissionModal v-model="editPermissionOpen" :account="selected" @submitted="onEditPermission" />
  </div>
</template>

<script setup>
import { computed, h, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import accountDeleteIcon from "@/assets/account-delete.svg";
import accountEditIcon from "@/assets/account-edit.svg";
import accountKeyIcon from "@/assets/account-key.svg";
import checkCircleBlueIcon from "@/assets/icon-check-circle-blue.svg";
import eyeIcon from "@/assets/icon-eye.svg";
import fileIcon from "@/assets/icon-file.svg";
import sortIcon from "@/assets/icon-sort.svg";
import userPlusIcon from "@/assets/icon-user-plus.svg";
import usersIcon from "@/assets/icon-users.svg";
import xCircleBlackIcon from "@/assets/icon-x-circle-black.svg";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseDateInput from "@/components/base/BaseDateInput.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import BaseSearchInput from "@/components/base/BaseSearchInput.vue";
import StatusBadge from "@/components/base/StatusBadge.vue";
import ConfirmDialog from "@/components/common/ConfirmDialog.vue";
import EmptyState from "@/components/common/EmptyState.vue";
import RejectReasonDialog from "@/components/common/RejectReasonDialog.vue";
import AccountCreateModal from "@/components/dialogs/AccountCreateModal.vue";
import AccountEditPermissionModal from "@/components/dialogs/AccountEditPermissionModal.vue";
import AccountPasswordResetModal from "@/components/dialogs/AccountPasswordResetModal.vue";
import {
  GetAccountChangeRequests,
  GetUsers,
} from "@/services/userService";
import { useAuthStore } from "@/stores/authStore";
import { formatDateTime } from "@/utils/formatDate";

const route = useRoute();
const auth = useAuthStore();
const selected = ref(null);
const dialog = ref({
  open: false,
  title: "",
  subtitle: "",
  message: "",
  danger: false,
  success: false,
  confirmText: "確認",
});
const rejectDialog = ref({ open: false, title: "", subtitle: "" });
const detailOpen = ref(false);
const createDialogOpen = ref(false);
const passwordResetOpen = ref(false);
const editPermissionOpen = ref(false);
const users = ref([]);
const accountChangeRows = ref([]);
const expandedChangeIds = ref([]);
const sortState = ref({ key: "createdAt", direction: "desc" });
const accountKeyword = ref("");
const activeStartDate = ref("");
const activeEndDate = ref("");
const committedActiveFilters = ref({
  keyword: "",
  startDate: "",
  endDate: "",
});

const columns = [
  { key: "createdAt", label: "建立日期", class: "w-[12%]" },
  { key: "id", label: "員編", class: "w-[13%]" },
  { key: "userName", label: "姓名", class: "w-[13%]" },
  { key: "orgName", label: "科別", class: "w-[14%]" },
  { key: "roles", label: "權限", class: "w-[10%]" },
  { key: "status", label: "狀態", class: "w-[16%]" },
];
const tableColumns = computed(() => {
  const dateLabelMap = {
    DISABLED: "停用日期",
    REJECTED: "駁回日期",
    DELETED: "刪除日期",
  };
  return columns.map((column) =>
    column.key === "createdAt"
      ? { ...column, label: dateLabelMap[routeStatus.value] || "建立日期" }
      : column,
  );
});
const trailingColumnLabel = computed(() => (routeStatus.value === "REJECTED" ? "駁回原因" : "操作"));

const routeStatus = computed(() => route.meta.status || "");

const isPendingPage = computed(() => routeStatus.value === "PENDING");
const isChangeReviewPage = computed(() => route.name === "AccountPendingReview");
const isActivePage = computed(() => routeStatus.value === "ACTIVE");
const showAccountFilters = computed(() => !isChangeReviewPage.value);

onMounted(async () => {
  try {
    const [userResponse, changeRequests] = await Promise.all([
      GetUsers(1, 200),
      GetAccountChangeRequests(),
    ]);
    users.value = userResponse.content ?? [];
    accountChangeRows.value = changeRequests ?? [];
  } catch (error) {
    console.error(error);
  }
});

const filteredRows = computed(() => {
  let rows = [];
  if (!routeStatus.value) return users.value;
  if (routeStatus.value === "PENDING") {
    rows = users.value.filter(
      (u) => u.status === "PENDING" || u.status === "PENDING_MULTI",
    );
    return sortRows(filterRowsByAccountFilters(rows));
  }
  rows = users.value.filter((u) => u.status === routeStatus.value);
  rows = filterRowsByAccountFilters(rows);
  return sortRows(rows);
});

function filterRowsByAccountFilters(rows) {
  if (!showAccountFilters.value) return rows;
  const keyword = committedActiveFilters.value.keyword.trim().toLowerCase();
  const startDate = normalizeDate(committedActiveFilters.value.startDate);
  const endDate = normalizeDate(committedActiveFilters.value.endDate);

  return rows.filter((row) => {
    const rowDate = normalizeDate(formatDate(row.createdAt));
    const textMatched =
      !keyword ||
      [row.id, row.userName, row.orgName, row.roleLabel, ...(row.roles || [])]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));
    const startMatched = !startDate || rowDate >= startDate;
    const endMatched = !endDate || rowDate <= endDate;
    return textMatched && startMatched && endMatched;
  });
}

const pendingCount = computed(
  () =>
    isChangeReviewPage.value
      ? accountChangeRows.value.filter((item) => canReviewRequest(item)).length
      : filteredRows.value.filter((u) => u.status === "PENDING").length,
);

const pageTitle = computed(() => route.meta.title || "帳號列表");
const pageDescription = computed(() =>
  isChangeReviewPage.value
    ? "審核超級管理員提交的人員權限與資料異動申請"
    : routeStatus.value === "PENDING"
      ? "審核超級管理員建立的新帳號申請"
      : `${pageTitle.value}列表`,
);

const formatDate = (dt) => {
  if (!dt) return "-";
  return dt.slice(0, 10).replace(/-/g, "-");
};

function normalizeDate(value) {
  if (!value || value === "-") return "";
  return String(value).replaceAll("/", "-").slice(0, 10);
}

function applyActiveFilters() {
  committedActiveFilters.value = {
    keyword: accountKeyword.value,
    startDate: activeStartDate.value,
    endDate: activeEndDate.value,
  };
}

function resetActiveFilters() {
  accountKeyword.value = "";
  activeStartDate.value = "";
  activeEndDate.value = "";
  committedActiveFilters.value = {
    keyword: "",
    startDate: "",
    endDate: "",
  };
}

function toggleSort(key) {
  sortState.value = {
    key,
    direction: sortState.value.key === key && sortState.value.direction === "asc" ? "desc" : "asc",
  };
}

function sortRows(rows) {
  const { key, direction } = sortState.value;
  const multiplier = direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => compareSortValue(getSortValue(a, key), getSortValue(b, key)) * multiplier);
}

function getSortValue(row, key) {
  if (key === "roles") return row.roleLabel || row.roles?.join(", ") || "";
  if (key === "createdAt") return row.createdAt || "";
  if (key === "status") return getStatusSortLabel(row.status);
  return row[key] ?? "";
}

function getStatusSortLabel(status) {
  return (
    {
      ACTIVE: "已啟用",
      DISABLED: "停用",
      DELETED: "已刪除",
      REJECTED: "已駁回",
      PENDING: "待審核",
      PENDING_MULTI: "等待其他管理員審核",
    }[status] || status || ""
  );
}

function compareSortValue(a, b) {
  const valueA = String(a).toLowerCase();
  const valueB = String(b).toLowerCase();
  return valueA.localeCompare(valueB, "zh-Hant", { numeric: true, sensitivity: "base" });
}

function openDetail(row) {
  selected.value = row;
  detailOpen.value = true;
}

function openPasswordReset(row) {
  selected.value = row;
  passwordResetOpen.value = true;
}

function openEditPermission(row) {
  selected.value = row;
  editPermissionOpen.value = true;
}

function openRejectReason(row) {
  rejectDialog.value = {
    open: true,
    title: "駁回原因",
    subtitle: `員編：${row.id}`,
  };
}

function confirm(row, action) {
  selected.value = row;
  if (action === "reject") {
    rejectDialog.value = {
      open: true,
      title: "駁回新帳號",
      subtitle: `員編：${row.id}`,
    };
    return;
  }
  const configs = {
    unlock: {
      title: "解鎖帳號",
      message: `確認解鎖 ${row.userName}？`,
      danger: false,
      success: false,
      confirmText: "確認解鎖",
    },
    reset: {
      title: "重設密碼",
      message: `確認重設 ${row.userName} 的密碼？`,
      danger: false,
      success: false,
      confirmText: "確認重設",
    },
    reactivate: {
      title: "確認重新啟用帳號",
      message: `確定要重新啟用此帳號嗎？重新啟用後，該帳號將可以正常登入系統。`,
      danger: false,
      success: false,
      confirmText: "確認重新啟用",
    },
    delete: {
      title: "確認刪除帳號",
      message: `確定要刪除「${row.userName}」嗎？刪除請求將送交其他管理員審核。`,
      danger: true,
      success: false,
      confirmText: "確認刪除",
    },
    disable: {
      title: "停用帳號",
      message: `確認送出停用 ${row.userName} 的申請？`,
      danger: true,
      success: false,
      confirmText: "確認停用",
    },
    approve: {
      title: "核准新帳號",
      subtitle: `員編：${row.id}`,
      message: `確定要核准新帳號「${row.userName}」嗎？`,
      danger: false,
      success: true,
      confirmText: "確認核准",
    },
  };
  const cfg = configs[action];
  if (cfg) {
    dialog.value = { open: true, ...cfg };
  }
}

function onEditPermission(payload) {
  const isReactivation = payload.originalStatus && payload.originalStatus !== "ACTIVE" && payload.status === "ACTIVE";
  users.value = users.value.map((user) =>
    user.id === payload.id
      ? {
        ...user,
        userName: payload.userName,
        orgName: payload.orgName,
        status: payload.status,
        roles: payload.roles,
        roleLabel: payload.roleLabel,
      }
      : user,
  );
  if (isReactivation) {
    const updated = users.value.find((user) => user.id === payload.id) || selected.value;
    window.setTimeout(() => {
      confirm(updated, "reactivate");
    }, 0);
  }
}

function onRejectConfirm() {
  rejectDialog.value = { open: false, title: "", subtitle: "" };
}

function onCreateAccount(payload) {
  users.value = [
    {
      id: payload.id,
      userName: payload.userName,
      orgId: 0,
      orgName: payload.orgName,
      status: "PENDING",
      pendingType: "NEW",
      passwordAttempts: 0,
      lastLoginAt: "",
      loginIp: "",
      createdBy: "9993285",
      createdAt: new Date().toISOString(),
      roles: [payload.role],
      roleLabel: payload.roleLabel,
    },
    ...users.value,
  ];
}

function canReviewRequest(request) {
  return request.createdBy !== auth.userId;
}

function toggleOriginal(id) {
  expandedChangeIds.value = expandedChangeIds.value.includes(id)
    ? expandedChangeIds.value.filter((item) => item !== id)
    : [...expandedChangeIds.value, id];
}

function formatMetaDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const period = date.getHours() < 12 ? "上午" : "下午";
  const hour = date.getHours() % 12 || 12;
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${period}${hour}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

const assetIcon = (src, fallbackClass) => (_props = {}, context = {}) => {
  const attrs = context?.attrs || {};

  return h("img", {
    ...attrs,
    src,
    alt: "",
    "aria-hidden": "true",
    class: [fallbackClass, attrs.class].filter(Boolean).join(" "),
  });
};

const FileIcon = assetIcon(fileIcon, "size-6 shrink-0");
const UserPlusIcon = assetIcon(userPlusIcon, "size-6");
const CheckIcon = assetIcon(checkCircleBlueIcon, "size-6 brightness-0 invert");
const XIcon = assetIcon(xCircleBlackIcon, "size-6 shrink-0");
const EyeIcon = assetIcon(eyeIcon, "size-4");

const AccountInfoTable = (props, context = {}) => {
  const attrs = context?.attrs || {};
  const rows = [
    ["員工編號", props.item.userId],
    ["姓名", props.item.userName],
    ["部門", props.data.orgName],
    ["權限", props.data.roleLabel],
    ["帳號狀態", props.data.statusLabel],
  ];
  return h(
    "div",
    {
      ...attrs,
      class: [
        props.connected !== undefined && props.connected !== false
          ? "bg-background-surface"
          : "overflow-hidden rounded-lg border border-copy-table-border bg-background-surface",
        attrs.class,
      ]
        .filter(Boolean)
        .join(" "),
    },
    [
      h(
        "table",
        { class: "w-full table-fixed text-sm" },
        h(
          "tbody",
          rows.map(([label, value]) =>
            h("tr", { class: "border-b border-copy-table-border last:border-b-0" }, [
              h(
                "td",
                {
                  class:
                    "w-32 border-r border-copy-table-border bg-primary-subtle/70 px-4 py-2.5 align-top font-medium leading-5 text-natural",
                },
                label,
              ),
              h(
                "td",
                { class: "px-4 py-2.5 align-top font-bold leading-5 text-text-heading" },
                label === "帳號狀態"
                  ? h(
                    "span",
                    {
                      class:
                        value === "刪除"
                          ? "inline-flex rounded-3xl bg-danger-bg px-3 py-0.5 text-sm font-medium text-danger-text"
                          : "inline-flex rounded-3xl bg-success-bg px-3 py-0.5 text-sm font-medium text-success-text",
                    },
                    value,
                  )
                  : value,
              ),
            ]),
          ),
        ),
      ),
    ],
  );
};
AccountInfoTable.props = ["item", "data", "connected"];

const SortIcon = () => h("img", { src: sortIcon, alt: "", "aria-hidden": "true", class: "h-4 w-2.5 shrink-0" });
SortIcon.props = ["active", "direction"];

const UsersIcon = assetIcon(usersIcon, "size-7");
</script>
