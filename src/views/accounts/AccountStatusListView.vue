<template>
  <div class="space-y-6">
    <!-- 頁面標題摘要區 -->
    <section
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
          class="inline-flex h-10 w-32 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-base font-medium leading-normal text-text-inverse transition hover:bg-primary-hover"
          type="button" @click="createDialogOpen = true">
          <UserPlusIcon /> 新增人員
        </button>
      </div>

      <article v-for="request in pendingAccountChangeRows" :key="request.id"
        class="p-6 rounded-2xl bg-background-surface shadow-card">
        <header class="flex items-start justify-between gap-4 pb-5 border-b border-border">
          <h2 class="text-2xl font-bold leading-normal text-text-heading">
            員編：{{ request.userId }} - {{ request.userName }}
          </h2>
          <button
            v-if="canViewOriginal(request)"
            class="inline-flex items-center gap-2 text-base font-bold leading-normal text-primary hover:text-primary-hover"
            type="button" @click="toggleOriginal(request.id)">
            <EyeIcon />
            {{ expandedChangeIds.includes(request.id) ? "隱藏修改前資料" : "查看修改前資料" }}
          </button>
        </header>

        <div v-if="canViewOriginal(request) && expandedChangeIds.includes(request.id)" class="pb-6 mt-6 space-y-4 border-b border-border">
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
              </div>
            </aside>
          </div>
        </div>
      </article>
    </section>

    <!-- 帳號搜尋列 -->
    <section v-if="canShowKeywordSearch"
      class="px-4 py-4 border rounded-2xl border-border bg-background-surface shadow-control">
      <div class="flex items-center gap-6 max-xl:flex-wrap">
        <BaseSearchInput v-model="accountKeyword" class="flex-1 min-w-80" placeholder="請輸入員編、人員姓名" size="md"
          @submit="applyActiveFilters" />
        <div class="flex items-center gap-4">
          <BaseDateInput v-model="activeStartDate" class="w-36" placeholder="年/月/日" :max="activeEndDate" />
          <span class="text-base font-normal text-text-placeholder">~</span>
          <BaseDateInput v-model="activeEndDate" class="w-36" placeholder="年/月/日" :min="activeStartDate" />
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
          v-if="canShowExportExcel"
          class="inline-flex h-10 w-40 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-base font-medium leading-normal text-text-inverse transition hover:bg-primary-hover"
          type="button" @click="handleExportUsers">
          <FileIcon /> 匯出 Excel
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
            <th v-if="routeStatus === 'DELETED'" class="w-[12%] px-4 py-4 text-base font-bold leading-normal text-center text-natural xl:px-5">
              刪除申請人
            </th>
            <th class="w-[22%] px-4 py-4 text-base font-bold leading-normal text-center text-natural xl:px-5">
              {{ trailingColumnLabel }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in filteredRows" :key="row.id"
            class="h-20 border-b border-border-muted last:border-0 hover:bg-background-hover">
            <td class="px-4 py-4 text-base font-normal leading-normal wrap-break-word text-natural xl:px-5">
              {{ formatDate(row.createdAt) }}
            </td>
            <td class="px-4 py-4 text-base font-bold leading-normal wrap-break-word text-natural xl:px-5">{{ row.id }}</td>
            <td class="px-4 py-4 text-base font-normal leading-normal wrap-break-word text-natural xl:px-5">{{ row.userName }}</td>
            <td class="px-4 py-4 text-base font-normal leading-normal wrap-break-word text-natural xl:px-5">{{ row.orgName }}</td>
            <td class="px-4 py-4 text-base font-normal leading-normal wrap-break-word text-natural xl:px-5">
              {{ formatAccountRoles(row) }}
            </td>
            <td class="px-4 py-4 xl:px-5">
              <span v-if="isOwnPendingAccount(row) || row.status === 'PENDING_MULTI'"
                class="inline-flex h-8 items-center whitespace-nowrap rounded-3xl bg-danger-bg px-3 py-0.5 text-sm font-medium leading-normal text-danger-text">
                等待其他管理員審核
              </span>
              <span v-else-if="row.status === 'PENDING'"
                class="inline-flex h-8 items-center whitespace-nowrap rounded-3xl bg-danger-bg px-3 py-0.5 text-sm font-medium leading-normal text-danger-text">
                待審核
              </span>
              <StatusBadge v-else :status="row.status" :label="getAccountBadgeLabel(row.status)" />
            </td>
            <td v-if="routeStatus === 'DELETED'" class="px-4 py-4 text-base font-normal leading-normal text-center wrap-break-word text-natural xl:px-5">
              {{ row.requesterId || "-" }}
            </td>
            <td class="px-3 py-4 xl:px-5">
              <p v-if="routeStatus === 'DELETED'" class="text-base font-normal leading-normal text-center text-natural">
                {{ row.reviewerId || "-" }}
              </p>
              <div v-else-if="['ACTIVE', 'LOCKED'].includes(row.status)" class="flex flex-wrap items-center justify-center gap-4 2xl:gap-8">
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
                <span v-if="isOwnPendingAccount(row)" aria-hidden="true"></span>
                <template v-else-if="row.status === 'PENDING' && canReviewAccount(row)">
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
                <span v-else-if="row.status === 'PENDING_MULTI'"
                  class="inline-flex min-h-10 items-center whitespace-nowrap rounded-lg border border-danger-text bg-danger-bg px-3 text-sm font-bold leading-normal text-danger-text">
                  等待其他管理員審核
                </span>
                <span v-else-if="row.status === 'PENDING'" class="text-base font-normal leading-normal text-center text-natural">
                  {{ missingReviewText(row) }}
                </span>
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
            <td :colspan="tableColumns.length + (routeStatus === 'DELETED' ? 2 : 1)" class="py-16 text-center">
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
            {{ currentPage }}
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
        <span class="text-text-primary">{{ formatAccountRoles(selected) }}</span>
        <span class="font-bold text-text-secondary">狀態</span>
        <StatusBadge :status="selected.status" :label="getAccountBadgeLabel(selected.status)" />
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
      @confirm="onDialogConfirm" />

    <!-- 駁回原因 Dialog -->
    <RejectReasonDialog v-model="rejectDialog.open" :title="rejectDialog.title" :subtitle="rejectDialog.subtitle"
      @confirm="onRejectConfirm" />
    <AccountCreateModal v-model="createDialogOpen" @submitted="onCreateAccount" />
    <AccountPasswordResetModal v-model="passwordResetOpen" :account="selected" @submitted="onPasswordReset" />
    <AccountEditPermissionModal v-model="editPermissionOpen" :account="selected" @submitted="onEditPermission" />
  </div>
</template>

<script setup>
import { computed, h, ref, watch } from "vue";
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
  approveChangeRequest,
  getChangeRequestHistory,
  rejectChangeRequest,
} from "@/services/approvalService";
import {
  disableUser,
  exportUsers,
  getUserById,
  resetUserPassword,
  searchUsersByKeyword,
  updateUser,
} from "@/services/userService";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import { roleIdMap, roleLabelMap, statusLabelMap } from "@/utils/constants";
import { formatDateTime } from "@/utils/formatDate";

const route = useRoute();
const auth = useAuthStore();
const userStore = useUserStore();
const currentUserId = computed(() => auth.userId || "");
const selected = ref(null);
const dialog = ref({
  open: false,
  action: "",
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
const accountHistoryCache = new Map();
const currentPage = ref(1);
const sortState = ref({ key: "createdAt", direction: "desc" });
const accountKeyword = ref("");
const activeStartDate = ref("");
const activeEndDate = ref("");
const committedActiveFilters = ref({
  keyword: "",
  startDate: "",
  endDate: "",
});

watch(activeStartDate, (startDate) => {
  if (startDate && activeEndDate.value && normalizeDate(activeEndDate.value) < normalizeDate(startDate)) {
    activeEndDate.value = startDate;
  }
});

watch(activeEndDate, (endDate) => {
  if (endDate && activeStartDate.value && normalizeDate(activeStartDate.value) > normalizeDate(endDate)) {
    activeStartDate.value = endDate;
  }
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
    LOCKED: "停用日期",
    DELETED: "刪除日期",
  };
  return columns.map((column) =>
    column.key === "createdAt"
      ? { ...column, label: dateLabelMap[routeStatus.value] || "建立日期" }
      : column,
  );
});
const trailingColumnLabel = computed(() =>
  routeStatus.value === "DELETED" ? "刪除審核人" : "操作",
);

const routeStatus = computed(() => route.meta.status || "");

const isPendingPage = computed(() => routeStatus.value === "PENDING");
const isPendingAccountPage = computed(() => route.name === "AccountPendingChanges");
const isChangeReviewPage = computed(() => route.name === "AccountPendingReview");
const isActivePage = computed(() => routeStatus.value === "ACTIVE");
const canShowKeywordSearch = computed(() => route.name === "AccountActive");
const canShowExportExcel = computed(() => route.name === "AccountActive");
const isServerKeywordSearchActive = computed(() =>
  Boolean(canShowKeywordSearch.value && committedActiveFilters.value.keyword.trim()),
);
const pendingAccountChangeRows = computed(() =>
  accountChangeRows.value.filter((row) => row.action !== "CREATE"),
);

const filteredRows = computed(() => {
  let rows = [];
  if (!routeStatus.value) return users.value;
  if (routeStatus.value === "PENDING") {
    rows = getPendingCreateRows();
    return sortRows(filterRowsByAccountFilters(rows));
  }
  if (routeStatus.value === "DELETED") {
    rows = getApprovedDeleteRows();
    return sortRows(filterRowsByAccountFilters(rows));
  }
  const targetStatus = routeStatus.value === "DELETED" ? "DISABLED" : routeStatus.value;
  rows = users.value.filter((u) => u.status === targetStatus);
  rows = filterRowsByAccountFilters(rows);
  return sortRows(rows);
});

function filterRowsByAccountFilters(rows) {
  const keyword = isServerKeywordSearchActive.value
    ? ""
    : committedActiveFilters.value.keyword.trim().toLowerCase();
  const startTime = getStartOfDayTime(committedActiveFilters.value.startDate);
  const endTime = getEndOfDayTime(committedActiveFilters.value.endDate);
  const hasDateFilter = startTime !== null || endTime !== null;

  return rows.filter((row) => {
    const textMatched =
      !keyword ||
      [row.id, row.userName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));
    if (!textMatched) return false;
    if (!hasDateFilter) return true;

    const createdAtTime = getDateTime(row.createdAt);
    if (createdAtTime === null) return false;

    const startMatched = startTime === null || createdAtTime >= startTime;
    const endMatched = endTime === null || createdAtTime <= endTime;
    return textMatched && startMatched && endMatched;
  });
}

const pendingCount = computed(
  () =>
    isChangeReviewPage.value
      ? pendingAccountChangeRows.value.length
      : filteredRows.value.filter((u) => ["PENDING", "PENDING_APPROVAL"].includes(u.status)).length,
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

function getDateTime(value) {
  if (!value) return null;
  const date = new Date(String(value));
  const time = date.getTime();
  return Number.isNaN(time) ? null : time;
}

function getStartOfDayTime(value) {
  const normalizedDate = normalizeDate(value);
  if (!normalizedDate) return null;
  return getDateTime(`${normalizedDate}T00:00:00`);
}

function getEndOfDayTime(value) {
  const normalizedDate = normalizeDate(value);
  if (!normalizedDate) return null;
  return getDateTime(`${normalizedDate}T23:59:59.999`);
}

async function applyActiveFilters() {
  currentPage.value = 1;
  committedActiveFilters.value = {
    keyword: accountKeyword.value,
    startDate: activeStartDate.value,
    endDate: activeEndDate.value,
  };
  await reloadAccountData({ forceUsers: true });
}

async function resetActiveFilters() {
  currentPage.value = 1;
  accountKeyword.value = "";
  activeStartDate.value = "";
  activeEndDate.value = "";
  committedActiveFilters.value = {
    keyword: "",
    startDate: "",
    endDate: "",
  };
  await reloadAccountData({ forceUsers: true });
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
  if (key === "roles") return formatAccountRoles(row);
  if (key === "createdAt") return row.createdAt || "";
  if (key === "status") return getStatusSortLabel(row.status);
  return row[key] ?? "";
}

function getStatusSortLabel(status) {
  const normalizedStatus = String(status || "").toUpperCase();
  return getAccountStatusLabel(normalizedStatus);
}

function compareSortValue(a, b) {
  const valueA = String(a).toLowerCase();
  const valueB = String(b).toLowerCase();
  return valueA.localeCompare(valueB, "zh-Hant", { numeric: true, sensitivity: "base" });
}

async function normalizeAccountChangeRows(rows = []) {
  const normalizedRows = rows.map((row) => {
    if (row.before || row.after || row.userId || row.userName) {
      return {
        ...row,
        changeRequestId: row.changeRequestId ?? row.id,
        action: String(row.action || "UPDATE").toUpperCase(),
        requesterId: getRequesterId(row),
        reviewerId: row.reviewerId || "",
        closedAt: row.closedAt,
        targetId: row.targetId,
        targetType: row.targetType || "USER",
        before: normalizeAccountInfo(row.before || {}, row.status),
        after: normalizeAccountInfo(row.after || row, row.status),
      };
    }

    const payload = parseChangePayload(row.payload);
    const before = payload.before || payload.oldData || payload.original || {};
    const after = payload.after || payload.newData || payload.data || payload;
    const action = String(row.action || payload.action || "UPDATE").toUpperCase();
    const userId = row.targetId || payload.id || payload.userId || after.id || before.id || "";
    const userName = after.userName || before.userName || payload.userName || "";

    return {
      ...row,
      changeRequestId: row.id,
      userId,
      userName,
      targetId: row.targetId,
      action,
      type: normalizeChangeType(action),
      title: getChangeRequestTitle(action),
      createdBy: row.requesterId,
      requesterId: row.requesterId,
      reviewerId: row.reviewerId,
      createdByName: row.requesterName || row.requesterId || "-",
      closedAt: row.closedAt,
      before: normalizeAccountInfo(before, row.status),
      after: normalizeAccountInfo(after, row.status),
    };
  });
  return normalizedRows;
}

async function hydrateAccountChangeHistory(row) {
  if (row.action === "CREATE" || hasMeaningfulAccountInfo(row.before)) return row;
  const targetType = "USER";
  const targetId = row.targetId || row.userId;
  if (!targetId) return row;
  const cacheKey = `${targetType}:${targetId}`;
  try {
    const historyRows = accountHistoryCache.has(cacheKey)
      ? accountHistoryCache.get(cacheKey)
      : await getChangeRequestHistory({ targetType, targetId });
    accountHistoryCache.set(cacheKey, historyRows);
    const previousPayload = findPreviousAccountPayload(historyRows, row.id);
    if (!previousPayload) return row;
    return {
      ...row,
      before: normalizeAccountInfo(previousPayload, previousPayload.reviewStatus),
    };
  } catch (error) {
    console.error(error);
    return row;
  }
}

function findPreviousAccountPayload(historyRows = [], currentId) {
  if (!Array.isArray(historyRows)) return null;
  const previousRows = historyRows
    .filter((item) => String(item.id) !== String(currentId))
    .filter((item) => item.status !== "PENDING")
    .sort((a, b) => String(b.closedAt || b.createdAt || "").localeCompare(String(a.closedAt || a.createdAt || "")));
  const previous = previousRows[0];
  if (!previous) return null;
  const payload = parseChangePayload(previous.payload);
  return payload.after || payload.newData || payload.data || payload;
}

function hasMeaningfulAccountInfo(info = {}) {
  return Boolean(info.orgName && info.orgName !== "-") ||
    Boolean(info.roleLabel && info.roleLabel !== "-") ||
    Boolean(info.statusLabel && info.statusLabel !== "-");
}

function getPendingCreateRows(existingRows = []) {
  const existingIds = new Set(existingRows.map((row) => String(row.id)));
  return accountChangeRows.value
    .filter((row) => row.action === "CREATE")
    .filter((row) => !existingIds.has(String(row.userId)))
    .map((row) => ({
      id: row.userId,
      userName: row.userName,
      orgId: row.orgId,
      orgName: row.after?.orgName || row.before?.orgName || "-",
      status: "PENDING",
      passwordAttempts: 0,
      lastLoginAt: "",
      loginIp: "",
      createdBy: row.requesterId,
      requesterId: row.requesterId,
      createdAt: row.createdAt,
      roles: extractRolesFromAccountInfo(row.after),
      roleLabel: row.after?.roleLabel,
      targetType: row.targetType,
      action: row.action,
      changeRequestId: row.id,
    }));
}

function getApprovedDeleteRows() {
  return accountChangeRows.value
    .filter((row) => row.action === "DELETE")
    .map((row) => ({
      id: row.userId || row.targetId || row.id,
      userId: row.userId || row.targetId || row.id,
      userName: row.userName,
      orgName: row.after?.orgName || row.before?.orgName || "-",
      status: "DISABLED",
      createdAt: row.closedAt || row.createdAt,
      requestedAt: row.createdAt,
      closedAt: row.closedAt,
      requesterId: row.requesterId || row.createdBy || "",
      reviewerId: row.reviewerId || "",
      roles: extractRolesFromAccountInfo(row.after),
      roleLabel: row.after?.roleLabel,
      targetType: row.targetType,
      action: row.action,
      changeRequestId: row.id,
    }));
}

function extractRolesFromAccountInfo(info = {}) {
  if (Array.isArray(info.roles)) return info.roles;
  const role = Object.entries(roleLabelMap).find(([, label]) => label === info.roleLabel)?.[0];
  return role ? [role] : [];
}

function parseChangePayload(payload) {
  if (!payload) return {};
  if (typeof payload === "object") return payload;
  try {
    return JSON.parse(payload);
  } catch {
    return {};
  }
}

function normalizeChangeType(action = "") {
  const normalizedAction = String(action).toUpperCase();
  if (["DELETE", "DISABLE"].includes(normalizedAction)) return "DELETE";
  if (normalizedAction === "CREATE") return "CREATE";
  return "PERMISSION";
}

function getChangeRequestTitle(action = "") {
  const normalizedAction = String(action).toUpperCase();
  return (
    {
      CREATE: "待覆核新增帳號",
      UPDATE: "待覆核帳號異動",
      DELETE: "待覆核刪除帳號",
      DISABLE: "待覆核停用帳號",
    }[normalizedAction] || "待覆核帳號異動"
  );
}

function normalizeAccountInfo(data = {}) {
  const roleValue = data.roles?.[0] || data.role || data.roleName;
  const accountStatus = data.userStatus || data.accountStatus || data.status;
  return {
    roles: Array.isArray(data.roles) ? data.roles : roleValue ? [roleValue] : [],
    orgName: data.orgName || data.organizationName || data.orgId || "-",
    roleLabel: data.roleLabel
      ? normalizeAccountRoleLabel(data.roleLabel)
      : getAccountRoleLabel(roleValue) || formatRoleIds(data.roleIds),
    statusLabel: data.statusLabel || getAccountStatusLabel(accountStatus),
  };
}

function getAccountStatusLabel(status) {
  const normalizedStatus = String(status || "").toUpperCase();
  return (
    {
      ACTIVE: "啟用",
      PENDING_APPROVAL: "待審核",
      LOCKED: "停用",
      DISABLED: "刪除",
      PASSWORD_INVALID: "密碼失效",
    }[normalizedStatus] || statusLabelMap[normalizedStatus] || status || "-"
  );
}

function getAccountBadgeLabel(status) {
  return getAccountStatusLabel(status);
}

function formatRoleIds(roleIds = []) {
  if (!Array.isArray(roleIds) || !roleIds.length) return "-";
  return roleIds
    .map((id) => Object.entries(roleIdMap).find(([, roleId]) => roleId === Number(id))?.[0])
    .map((role) => getAccountRoleLabel(role))
    .filter(Boolean)
    .join(", ") || "-";
}

function formatAccountRoles(account = {}) {
  if (Array.isArray(account.roles) && account.roles.length) {
    return account.roles.map((role) => getAccountRoleLabel(role)).filter(Boolean).join(", ");
  }
  if (account.roleLabel) return normalizeAccountRoleLabel(account.roleLabel);
  return "-";
}

function getAccountRoleLabel(role) {
  const normalizedRole = String(role || "").toUpperCase();
  return (
    {
      USER: "經辦",
      MANAGER: "覆核主管",
      ADMIN: "超級管理員",
    }[normalizedRole] || roleLabelMap[normalizedRole] || role || ""
  );
}

function normalizeAccountRoleLabel(label) {
  if (label === "經辦人員") return "經辦";
  return label || "-";
}

function openDetail(row) {
  selected.value = row;
  detailOpen.value = true;
}

function openPasswordReset(row) {
  selected.value = row;
  passwordResetOpen.value = true;
}

async function openEditPermission(row) {
  try {
    const latestUser = await getUserById({ id: row.id });
    selected.value = {
      ...row,
      ...latestUser,
      roles: latestUser?.roles?.length ? latestUser.roles : row.roles,
      roleLabel: latestUser?.roleLabel || row.roleLabel,
      orgName: latestUser?.orgName || row.orgName,
    };
    editPermissionOpen.value = true;
  } catch (error) {
    console.error(error);
  }
}

function confirm(row, action) {
  selected.value = row;
  const isReviewAction = ["approve", "reject"].includes(action);
  const canReview = isChangeReviewPage.value
    ? canReviewRequest(row)
    : canReviewAccount(row);
  if (isReviewAction && !canReview) return;
  const targetLabel = getReviewTargetLabel(row);
  if (action === "reject") {
    const isDeleteReview = getNormalizedAction(row) === "DELETE";
    const displayName = getDisplayUserName(row);
    rejectDialog.value = {
      open: true,
      title: `駁回${targetLabel}`,
      subtitle: isDeleteReview
        ? `確定要駁回帳號刪除「${displayName}」嗎？`
        : `員編：${getDisplayUserId(row)}`,
    };
    return;
  }
  const configs = {
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
      title: `核准${targetLabel}`,
      subtitle: `員編：${getDisplayUserId(row)}`,
      message: `確定要核准${targetLabel}「${getDisplayUserName(row)}」嗎？`,
      danger: false,
      success: true,
      confirmText: "確認核准",
    },
  };
  const cfg = configs[action];
  if (cfg) {
    dialog.value = { open: true, action, ...cfg };
  }
}

function getReviewTargetLabel(row) {
  if (getNormalizedAction(row) === "DELETE") return "帳號刪除";
  if (row?.action === "CREATE") return "新帳號";
  if (isChangeRequestRow(row) || isChangeReviewPage.value) return "帳號異動";
  return "新帳號";
}

function getNormalizedAction(row = {}) {
  return String(row.action || row.changeRequestAction || "").toUpperCase();
}

function getDisplayUserId(row = {}) {
  return row.userId || row.id || "-";
}

function getDisplayUserName(row = {}) {
  return row.userName || row.targetId || row.userId || row.id || "-";
}

async function onDialogConfirm() {
  const action = dialog.value.action;
  try {
    if (action === "approve") {
      const changeRequestId = getChangeRequestId(selected.value);
      if (!changeRequestId) return;
      await approveChangeRequest({ id: changeRequestId });
      await reloadAccountDataAfterReview();
      return;
    }
    if (["delete", "disable"].includes(action) && selected.value?.id) {
      await disableUser({ id: selected.value.id });
      await reloadAccountData({ forceUsers: true, forceRequests: true });
      return;
    }
  } catch (error) {
    console.error(error);
  } finally {
    dialog.value.open = false;
  }
}

async function onEditPermission(payload) {
  try {
    await updateUser({
      id: payload.id,
      userName: payload.userName,
      orgId: Number(payload.orgId),
      roleIds: payload.roles.map((role) => roleIdMap[role]).filter(Boolean),
    });
    await reloadAccountData({ forceUsers: routeNeedsUsers.value, forceRequests: true });
  } catch (error) {
    console.error(error);
  }
}

async function onPasswordReset(payload) {
  try {
    await resetUserPassword({
      id: payload.account?.id,
      newPassword: payload.password,
    });
    userStore.invalidateUsers("ACTIVE");
    userStore.invalidateUsers("LOCKED");
    await reloadAccountData({ forceUsers: true, forceRequests: false });
  } catch (error) {
    console.error(error);
  }
}

async function onRejectConfirm(reason) {
  try {
    const changeRequestId = getChangeRequestId(selected.value);
    if (!changeRequestId) return;
    await rejectChangeRequest({ id: changeRequestId, remark: reason });
    await reloadAccountDataAfterReview();
  } catch (error) {
    console.error(error);
  } finally {
    rejectDialog.value = { open: false, title: "", subtitle: "" };
  }
}

async function onCreateAccount(payload) {
  try {
    await reloadAccountData({
      forceUsers: true,
      forceRequests: true,
      usersStatus: "PENDING_APPROVAL",
      requestQuery: { status: "PENDING", action: ["CREATE"] },
    });
  } catch (error) {
    console.error(error);
  }
}

async function handleExportUsers() {
  try {
    await exportUsers();
  } catch (error) {
    console.error(error);
  }
}

function canReviewRequest(request) {
  const requesterId = getRequesterId(request);
  const changeRequestId = getChangeRequestId(request);
  return Boolean(
    changeRequestId &&
    requesterId &&
    currentUserId.value &&
    String(requesterId) !== String(currentUserId.value),
  );
}

function canReviewAccount(account) {
  const requesterId = getRequesterId(account);
  if (account?.status === "PENDING") {
    return Boolean(
      account.reviewable &&
      requesterId &&
      currentUserId.value &&
      String(requesterId) !== String(currentUserId.value),
    );
  }
  return Boolean(
    requesterId &&
    currentUserId.value &&
    String(requesterId) !== String(currentUserId.value),
  );
}

function canViewOriginal(request = {}) {
  return getNormalizedAction(request) === "UPDATE";
}

function isOwnPendingAccount(account) {
  return (
    account?.status === "PENDING" &&
    getChangeRequestId(account) &&
    currentUserId.value &&
    String(getRequesterId(account)) === String(currentUserId.value)
  );
}

function missingReviewText(row = {}) {
  return "-";
}

function getRequesterId(item = {}) {
  return item.requesterId || item.createdBy || item.createdById || "";
}

function isChangeRequestRow(item = {}) {
  return item.targetType === "USER" && Number.isInteger(Number(getChangeRequestId(item)));
}

function getChangeRequestId(item = {}) {
  return item?.changeRequestId ?? null;
}

function removeAccountChangeRequest(id) {
  accountChangeRows.value = accountChangeRows.value.filter(
    (item) => String(item.id) !== String(id),
  );
  userStore.accountChangeRequests = userStore.accountChangeRequests.filter(
    (item) => String(item.id) !== String(id),
  );
}

async function reloadAccountData(options = {}) {
  const {
    forceUsers = false,
    forceRequests = false,
    usersStatus = accountRouteApiStatus.value,
    requestQuery = accountRouteRequestQuery.value,
  } = options;
  const tasks = [];
  let userRowsOverride = null;
  if (routeNeedsUsers.value) {
    if (shouldSearchUsersByKeyword()) {
      tasks.push(
        searchUsersByKeyword({
          page: 1,
          size: 20,
          status: usersStatus,
          keyword: committedActiveFilters.value.keyword,
        }).then((response) => {
          userRowsOverride = response?.content || [];
          return response;
        }),
      );
    } else {
      tasks.push(userStore.fetchUsers({ page: 1, size: 100, status: usersStatus, force: forceUsers }));
    }
  }
  if (routeNeedsChangeRequests.value) {
    tasks.push(userStore.fetchAccountChangeRequests(requestQuery, { force: forceRequests }));
  }
  await Promise.all(tasks);
  await syncAccountRowsFromStore({ usersStatus, requestQuery, userRowsOverride });
}

async function reloadAccountDataAfterReview() {
  userStore.invalidateUsers("PENDING_APPROVAL");
  userStore.invalidateUsers("ACTIVE");
  userStore.invalidateUsers("LOCKED");
  userStore.invalidateUsers("DISABLED");
  userStore.invalidateAccountChangeRequests({ status: "PENDING", action: ["CREATE"] });
  userStore.invalidateAccountChangeRequests({ status: "PENDING", action: ["UPDATE", "DELETE"] });
  userStore.invalidateAccountChangeRequests({ status: "APPROVED", action: ["DELETE"] });
  await reloadAccountData({
    forceUsers: routeNeedsUsers.value,
    forceRequests: true,
    usersStatus: accountRouteApiStatus.value,
    requestQuery: accountRouteRequestQuery.value,
  });
}

const accountRouteApiStatus = computed(() => {
  if (route.name === "AccountPendingChanges") return "PENDING_APPROVAL";
  if (route.name === "AccountDisabled" || route.name === "AccountLocked") return "LOCKED";
  if (route.name === "AccountDeleted") return "DISABLED";
  if (route.name === "AccountPasswordInvalid") return "PASSWORD_INVALID";
  if (route.name === "AccountActive") return "ACTIVE";
  return "ACTIVE";
});

const accountRouteRequestQuery = computed(() => {
  if (route.name === "AccountPendingChanges") {
    return { status: "PENDING", action: ["CREATE"] };
  }
  if (route.name === "AccountPendingReview") {
    return { status: "PENDING", action: ["UPDATE", "DELETE"] };
  }
  if (route.name === "AccountDeleted") {
    return { status: "APPROVED", action: ["DELETE"] };
  }
  return { status: "PENDING" };
});

const routeNeedsUsers = computed(() =>
  !["AccountPendingChanges", "AccountPendingReview", "AccountDeleted"].includes(route.name),
);

const routeNeedsChangeRequests = computed(() =>
  ["AccountPendingChanges", "AccountPendingReview", "AccountDeleted"].includes(route.name),
);

watch(
  () => route.name,
  async () => {
    try {
      await reloadAccountData();
    } catch (error) {
      console.error(error);
    }
  },
  { immediate: true },
);

async function syncAccountRowsFromStore(options = {}) {
  const {
    usersStatus = accountRouteApiStatus.value,
    requestQuery = accountRouteRequestQuery.value,
    userRowsOverride = null,
  } = options;
  const sourceUsers = Array.isArray(userRowsOverride)
    ? userRowsOverride
    : routeNeedsUsers.value
      ? userStore.getCachedUsers(usersStatus)
      : [];
  users.value = sourceUsers.map(normalizeAccountRowStatus);
  accountChangeRows.value = await normalizeAccountChangeRows(userStore.getCachedChangeRequests(requestQuery));
}

function shouldSearchUsersByKeyword() {
  return Boolean(canShowKeywordSearch.value && committedActiveFilters.value.keyword.trim());
}

function mergePendingUsersWithChangeRequests(pendingUsers = []) {
  const requestMap = createPendingUserChangeRequestMap();
  return pendingUsers.map((user) => {
    const request = requestMap.get(String(user.id));
    if (!request) {
      return {
        ...user,
        userId: user.id,
        targetType: "USER",
        changeRequestId: null,
        changeRequestTargetId: null,
        changeRequestAction: null,
        requesterId: user.createdBy || "",
        reviewable: false,
      };
    }
    return {
      ...user,
      userId: user.id,
      targetType: "USER",
      action: request.action,
      changeRequestId: request.id,
      changeRequestTargetId: request.targetId,
      changeRequestAction: request.action,
      requesterId: request.requesterId || request.createdBy || user.createdBy || "",
      createdBy: request.requesterId || user.createdBy,
      createdAt: user.createdAt || request.createdAt,
      reviewable: Boolean(request.id),
    };
  });
}

function createPendingUserChangeRequestMap() {
  return new Map(
    accountChangeRows.value
      .filter((request) => request.targetType === "USER" && request.status === "PENDING")
      .filter((request) => String(request.action || "").toUpperCase() === "CREATE")
      .map((request) => [String(request.targetId || request.userId), request]),
  );
}

function normalizeAccountRowStatus(row = {}) {
  return {
    ...row,
    status: row.status === "PENDING_APPROVAL" ? "PENDING" : row.status,
  };
}

function toggleOriginal(id) {
  if (expandedChangeIds.value.includes(id)) {
    expandedChangeIds.value = expandedChangeIds.value.filter((item) => item !== id);
    return;
  }
  expandedChangeIds.value = [...expandedChangeIds.value, id];
  loadOriginalAccountInfo(id);
}

async function loadOriginalAccountInfo(id) {
  const row = accountChangeRows.value.find((item) => String(item.id) === String(id));
  if (!row || !canViewOriginal(row) || hasMeaningfulAccountInfo(row.before)) return;
  const hydratedRow = await hydrateAccountChangeHistory(row);
  accountChangeRows.value = accountChangeRows.value.map((item) =>
    String(item.id) === String(id) ? hydratedRow : item,
  );
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
                label.includes("狀態")
                  ? h(
                    "span",
                    {
                      class: getInfoStatusClass(value),
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

function getInfoStatusClass(value) {
  if (["停用", "刪除", "已駁回", "密碼失效"].includes(value)) {
    return "inline-flex rounded-3xl bg-danger-bg px-3 py-0.5 text-sm font-medium text-danger-text";
  }
  if (["待審核"].includes(value)) {
    return "inline-flex rounded-3xl bg-warning-bg px-3 py-0.5 text-sm font-medium text-warning-text";
  }
  return "inline-flex rounded-3xl bg-success-bg px-3 py-0.5 text-sm font-medium text-success-text";
}

const SortIcon = () => h("img", { src: sortIcon, alt: "", "aria-hidden": "true", class: "h-4 w-2.5 shrink-0" });
SortIcon.props = ["active", "direction"];

const UsersIcon = assetIcon(usersIcon, "size-7");
</script>
