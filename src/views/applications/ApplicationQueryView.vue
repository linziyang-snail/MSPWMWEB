<template>
  <div v-if="isCategoryPage" class="space-y-5">
    <CategoryCreateModal
      v-model="categoryCreateOpen"
      :category="selectedCategory"
      @submitted="onCategoryCreated"
    />

    <section
      v-if="isPendingCategoryPage"
      class="flex items-center justify-between gap-4 px-6 py-6 border-t min-h-32 rounded-2xl border-border-muted bg-background-surface"
    >
      <div class="items-center gap-4">
        <div class="flex">
          <span class="grid size-7 place-items-center text-primary">
            <img :src="buildingIcon" alt="" class="size-7" />
          </span>
          <h1 class="pl-2 text-2xl font-bold leading-normal text-text-heading">
            {{ categoryTitle }}
          </h1>
        </div>
        <div class="py-1">
          <p class="text-sm font-normal leading-normal text-natural">
            審核超級管理員建立的科別申請
          </p>
        </div>
      </div>
      <div
        class="grid gap-2 px-6 py-3 text-center min-h-20 min-w-28 place-items-center rounded-2xl bg-primary text-text-inverse"
      >
        <p class="text-xs font-normal leading-normal">待審核數量</p>
        <p class="text-3xl font-bold leading-tight tracking-wide">
          {{ categoryRows.length }}
        </p>
      </div>
    </section>

    <div v-if="isActiveCategoryPage" class="flex justify-end">
      <BaseButton @click="openCreateCategory">
        <PlusIcon /> 新增科別
      </BaseButton>
    </div>

    <section
      v-if="isActiveCategoryPage"
      class="rounded-xl border border-border bg-background-surface px-7 py-6"
    >
      <div class="mb-6 flex items-center gap-3">
        <span class="grid size-10 place-items-center rounded-lg bg-primary-soft">
          <img :src="buildingIcon" alt="" class="size-6" />
        </span>
        <div>
          <h1 class="text-2xl font-bold text-text-primary">
            {{ categoryTitle }}
          </h1>
          <p class="mt-1 text-sm font-medium text-text-secondary">
            所有可用的文案分類列表
          </p>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="category in categoryRows"
          :key="category.rowKey"
          class="flex h-header items-center justify-between rounded-xl border border-border bg-background-page px-5 transition hover:shadow-card-soft"
        >
          <div class="flex items-center gap-4">
            <span
              class="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-base font-bold text-text-inverse"
            >
              {{ category.categoryName.slice(0, 1) }}
            </span>
            <span class="text-base font-bold text-text-primary">
              {{ category.categoryName }}
            </span>
          </div>
          <button
            class="grid size-8 place-items-center text-danger-text transition hover:scale-110"
            type="button"
            aria-label="刪除科別"
            @click="openDeleteCategory(category)"
          >
            <TrashIcon />
          </button>
        </article>
      </div>

      <EmptyState v-if="!categoryRows.length" class="py-12" />
    </section>

    <section
      v-if="isTableCategoryPage"
      class="px-4 py-4 border rounded-2xl border-border bg-background-surface shadow-control"
    >
      <div class="flex items-center gap-6 max-xl:flex-wrap">
        <BaseSearchInput
          v-model="categoryKeyword"
          class="flex-1 min-w-80"
          placeholder="請輸入科別名稱、科別 ID"
          size="md"
          @submit="applyCategoryFilters"
        />
        <div class="flex items-center gap-4">
          <BaseDateInput v-model="categoryStartDate" class="w-36" placeholder="年/月/日" :max="categoryEndDate" />
          <span class="text-base font-normal text-text-placeholder">~</span>
          <BaseDateInput v-model="categoryEndDate" class="w-36" placeholder="年/月/日" :min="categoryStartDate" />
        </div>
        <button
          class="inline-flex items-center justify-center h-10 py-2 text-sm font-medium leading-normal transition rounded-lg min-w-20 bg-primary px-7 text-text-inverse shadow-control hover:bg-primary-hover"
          type="button"
          @click="applyCategoryFilters"
        >
          查詢
        </button>
        <button
          class="inline-flex items-center justify-center h-10 px-4 py-2 text-base font-medium leading-normal transition border rounded-lg min-w-16 border-border-strong bg-background-surface text-natural hover:bg-background-hover"
          type="button"
          @click="resetCategoryFilters"
        >
          清除
        </button>
      </div>
    </section>

    <div
      v-if="isTableCategoryPage"
      class="overflow-x-auto overflow-y-hidden border rounded-xl border-border bg-background-surface"
    >
      <div class="flex min-w-modal-xl justify-end gap-4 px-4 py-4 border-b min-h-header border-border-muted bg-background-page/50">
        <button
          class="inline-flex h-10 w-40 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-base font-medium leading-normal text-text-inverse transition hover:bg-primary-hover"
          type="button"
        >
          <FileIcon /> 匯出（CSV）
        </button>
        <button
          class="inline-flex h-10 w-32 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-base font-medium leading-normal text-text-inverse transition hover:bg-primary-hover"
          type="button"
          @click="openCreateCategory"
        >
          <PlusIcon /> 新增科別
        </button>
      </div>

      <table class="min-w-modal-xl w-full text-sm table-fixed">
        <thead>
          <tr class="h-16 border-b border-border bg-background-hover">
            <th
              v-for="col in categoryColumns"
              :key="col.key"
              class="px-4 py-4 text-base font-bold leading-normal text-left text-natural xl:px-5"
              :class="col.class"
            >
              <button class="inline-flex items-center gap-2 text-left font-bold transition hover:text-primary" type="button" @click="toggleCategorySort(col.key)">
                {{ col.label }}
                <SortIcon />
              </button>
            </th>
            <th class="w-60 min-w-60 px-4 py-4 text-base font-bold leading-normal text-center text-natural xl:px-5">
              {{ categoryTrailingColumnLabel }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="category in displayedCategoryRows"
            :key="category.rowKey"
            class="h-20 border-b border-border-muted last:border-0 hover:bg-background-hover"
          >
            <td class="px-4 py-4 text-base font-normal leading-normal text-natural xl:px-5">
              {{ formatCategoryDate(category) }}
            </td>
            <td class="px-4 py-4 text-base font-normal leading-normal text-natural xl:px-5">
              {{ category.categoryName }}
            </td>
            <td class="px-4 py-4 text-base font-normal leading-normal text-natural xl:px-5">
              {{ category.actorName }}
            </td>
            <td class="px-4 py-4 text-base font-normal leading-normal text-natural xl:px-5">
              <span
                v-if="isOwnPendingCategory(category)"
                class="inline-flex h-8 items-center whitespace-nowrap rounded-3xl bg-danger-bg px-3 py-0.5 text-sm font-medium leading-normal text-danger-text"
              >
                等待其他管理員審核
              </span>
              <BaseBadge v-else :status="category.badgeStatus" :label="category.statusLabel" />
            </td>
            <td class="min-w-60 px-3 py-4 xl:px-5">
              <div
                v-if="isPendingCategoryPage"
                class="flex flex-nowrap items-center justify-center gap-6 whitespace-nowrap"
              >
                <span v-if="isOwnPendingCategory(category)" aria-hidden="true"></span>
                <template v-else-if="canReviewCategory(category)">
                  <button
                    class="inline-flex h-10 w-24 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-base font-medium text-text-inverse hover:bg-primary-hover"
                    type="button"
                    @click="confirmApproveCategory(category)"
                  >
                    <CheckIcon /> <span>核准</span>
                  </button>
                  <button
                    class="inline-flex h-10 w-24 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-text-grey bg-background-surface px-4 py-2.5 text-base font-medium text-natural hover:bg-background-hover"
                    type="button"
                    @click="openRejectCategory(category)"
                  >
                    <XIcon /> <span>駁回</span>
                  </button>
                </template>
                <span v-else class="text-base font-normal leading-normal text-center text-natural">-</span>
              </div>
              <button v-else-if="isRejectedCategoryPage" class="block mx-auto text-base font-bold leading-normal transition text-danger-text hover:text-danger" type="button">
                {{ category.rejectReason || "-" }}
              </button>
              <p v-else class="text-base font-normal leading-normal text-center text-natural">
                -
              </p>
            </td>
          </tr>
          <tr v-if="!displayedCategoryRows.length">
            <td :colspan="categoryColumns.length + 1" class="py-16 text-center">
              <EmptyState />
            </td>
          </tr>
        </tbody>
      </table>

      <div class="flex min-w-modal-xl items-center justify-between h-16 px-6 text-xs font-normal leading-normal bg-background-page text-natural">
        <span>顯示共 {{ displayedCategoryRows.length }} 筆</span>
        <div class="flex items-center gap-2 text-xs font-bold leading-normal text-natural">
          <button class="px-4 text-center transition border rounded h-7 border-text-grey bg-background-surface hover:bg-background-hover disabled:opacity-60" type="button" disabled>
            上頁
          </button>
          <span class="grid px-4 border rounded h-7 min-w-10 place-items-center border-primary bg-primary text-text-inverse">
            1
          </span>
          <button class="px-4 text-center transition border rounded h-7 border-text-grey bg-background-surface hover:bg-background-hover disabled:opacity-60" type="button" disabled>
            下頁
          </button>
        </div>
      </div>
    </div>

    <ConfirmDialog
      v-model="deleteCategoryDialogOpen"
      title="確認刪除科別"
      :message="deleteCategoryMessage"
      danger
      confirm-text="確認刪除"
      :loading="deletingCategory"
      @confirm="confirmDeleteCategory"
    />
    <ConfirmDialog
      v-model="approveCategoryDialogOpen"
      title="核准科別"
      :subtitle="selectedCategory ? `科別：${selectedCategory.categoryName}` : ''"
      message="確定要核准此科別申請嗎？"
      success
      confirm-text="確認核准"
      :loading="reviewingCategory"
      @confirm="approveSelectedCategory"
    />
    <RejectReasonDialog
      v-model="rejectCategoryDialogOpen"
      title="駁回科別"
      :subtitle="selectedCategory ? `科別：${selectedCategory.categoryName}` : ''"
      :loading="reviewingCategory"
      @confirm="rejectSelectedCategory"
    />
  </div>

  <div v-else>
    <PageTitle title="申請單資訊查詢" eyebrow="申請單資訊查詢" />
    <SearchFilterBar class="mb-5">
      <FormField class="min-w-filter-md" label="申請單編號">
        <BaseInput v-model="filters.id" placeholder="請輸入申請單編號" />
      </FormField>
      <FormField class="min-w-filter-sm" label="類型">
        <BaseSelect
          v-model="filters.targetType"
          :options="targetTypeOptions"
          placeholder="全部類型"
        />
      </FormField>
      <FormField class="min-w-filter-sm" label="狀態">
        <BaseSelect
          v-model="filters.status"
          :options="statusOptions"
          placeholder="全部狀態"
        />
      </FormField>
      <div class="flex gap-2">
        <BaseButton @click="noop">查詢</BaseButton>
        <BaseButton variant="secondary" @click="reset">重設</BaseButton>
      </div>
    </SearchFilterBar>

    <BaseTable :columns="columns" :rows="rows" row-key="id">
      <template #cell-targetType="{ row }">{{
        TARGET_TYPE_LABEL_MAP[row.targetType]
      }}</template>
      <template #cell-action="{ row }">{{
        ACTION_LABEL_MAP[row.action]
      }}</template>
      <template #cell-status="{ row }"
        ><BaseBadge :status="row.status"
      /></template>
      <template #cell-createdAt="{ row }">{{
        formatDateTime(row.createdAt)
      }}</template>
      <template #cell-closedAt="{ row }">{{
        formatDateTime(row.closedAt)
      }}</template>
      <template #empty><EmptyState v-if="rows.length === 0" /></template>
    </BaseTable>
    <BasePagination :page="1" :total="rows.length" :size="20" />
  </div>
</template>

<script setup>
import { computed, h, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";

import addIcon from "@/assets/add.svg";
import buildingIcon from "@/assets/building2.svg";
import editIcon from "@/assets/edit.svg";
import fileIcon from "@/assets/icon-file.svg";
import checkCircleBlueIcon from "@/assets/icon-check-circle-blue.svg";
import sortIcon from "@/assets/icon-sort.svg";
import trashIcon from "@/assets/icon-trash.svg";
import xCircleBlackIcon from "@/assets/icon-x-circle-black.svg";
import BaseBadge from "@/components/base/BaseBadge.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseDateInput from "@/components/base/BaseDateInput.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import BasePagination from "@/components/base/BasePagination.vue";
import BaseSearchInput from "@/components/base/BaseSearchInput.vue";
import BaseSelect from "@/components/base/BaseSelect.vue";
import CategoryCreateModal from "@/components/dialogs/CategoryCreateModal.vue";
import EmptyState from "@/components/common/EmptyState.vue";
import ConfirmDialog from "@/components/common/ConfirmDialog.vue";
import PageTitle from "@/components/common/PageTitle.vue";
import RejectReasonDialog from "@/components/common/RejectReasonDialog.vue";
import SearchFilterBar from "@/components/common/SearchFilterBar.vue";
import FormField from "@/components/forms/FormField.vue";
import BaseTable from "@/components/tables/BaseTable.vue";
import {
  approveChangeRequest,
  getPendingChangeRequests,
  rejectChangeRequest,
  searchChangeRequests,
} from "@/services/approvalService";
import {
  disableOrganization,
  getOrganizations,
} from "@/services/organizationService";
import { useAuthStore } from "@/stores/authStore";
import {
  ACTION_LABEL_MAP,
  STATUS_LABEL_MAP,
  TARGET_TYPE_LABEL_MAP,
  normalizeOrganizationStatusValue,
  normalizeOrgTypeValue,
  isSectionOrganization,
  orgTypeLabelMap,
  statusLabelMap,
} from "@/utils/constants";
import { formatDateTime } from "@/utils/formatDate";

const route = useRoute();
const auth = useAuthStore();
const filters = reactive({ id: "", targetType: "", status: "" });
const categoryCreateOpen = ref(false);
const deleteCategoryDialogOpen = ref(false);
const approveCategoryDialogOpen = ref(false);
const rejectCategoryDialogOpen = ref(false);
const selectedCategory = ref(null);
const deletingCategory = ref(false);
const reviewingCategory = ref(false);
const approvals = ref([]);
const organizations = ref([]);
const categoryChangeRequests = ref([]);
const categoryKeyword = ref("");
const categoryStartDate = ref("");
const categoryEndDate = ref("");
const committedCategoryFilters = ref({ keyword: "", startDate: "", endDate: "" });
const categorySortState = ref({ key: "date", direction: "desc" });

onMounted(async () => {
  try {
    if (isCategoryPage.value) await refreshCategoryData();
  } catch (error) {
    console.error(error);
  }
});

watch(categoryStartDate, (startDate) => {
  if (startDate && categoryEndDate.value && normalizeDate(categoryEndDate.value) < normalizeDate(startDate)) {
    categoryEndDate.value = startDate;
  }
});

watch(categoryEndDate, (endDate) => {
  if (endDate && categoryStartDate.value && normalizeDate(categoryStartDate.value) > normalizeDate(endDate)) {
    categoryStartDate.value = endDate;
  }
});

watch(
  () => route.name,
  async () => {
    if (isCategoryPage.value) await refreshCategoryData();
  },
);

const onCategoryCreated = async () => {
  await refreshCategoryData();
  selectedCategory.value = null;
};

const categoryStatusByRoute = {
  CategoryAll: "ACTIVE",
  CategoryPending: "PENDING",
  CategoryRejected: "REJECTED",
  CategoryDeleted: "DISABLED",
};

const categoryTitleByRoute = {
  CategoryAll: "已核准科別",
  CategoryPending: "待審核科別",
  CategoryRejected: "已駁回科別",
  CategoryDeleted: "已刪除科別",
};

const isCategoryPage = computed(() => route.name?.startsWith("Category"));
const categoryTitle = computed(
  () => categoryTitleByRoute[route.name] || "全部科別",
);
const deleteCategoryMessage = computed(
  () =>
    `確定要刪除「${selectedCategory.value?.categoryName || ""}」嗎？刪除請求將送交其他管理員審核。`,
);
const categoryRows = computed(() => {
  const status = categoryStatusByRoute[route.name];
  const sourceRows = isPendingCategoryPage.value || isRejectedCategoryPage.value
    ? getPendingCategoryRows()
    : getOrganizationCategoryRows();
  return sourceRows
    .filter((item) => !status || normalizeStatus(item.status) === status);
});

const displayedCategoryRows = computed(() =>
  sortCategoryRows(filterCategoryRows(categoryRows.value)),
);

const isActiveCategoryPage = computed(() => route.name === "CategoryAll");
const isPendingCategoryPage = computed(() => route.name === "CategoryPending");
const isRejectedCategoryPage = computed(() => route.name === "CategoryRejected");
const isTableCategoryPage = computed(() => isCategoryPage.value && !isActiveCategoryPage.value);
const categoryTrailingColumnLabel = computed(() =>
  isRejectedCategoryPage.value ? "駁回原因" : "操作",
);

const categoryColumns = computed(() => {
  const dateLabelMap = {
    CategoryPending: "建立日期",
    CategoryRejected: "駁回日期",
    CategoryDeleted: "刪除日期",
  };
  const actorLabelMap = {
    CategoryPending: "建立人",
    CategoryRejected: "駁回人",
    CategoryDeleted: "刪除人",
  };
  return [
    { key: "date", label: dateLabelMap[route.name] || "建立日期", class: "w-[20%]" },
    { key: "categoryName", label: "科別", class: "w-[20%]" },
    { key: "actorName", label: actorLabelMap[route.name] || "建立人", class: "w-[20%]" },
    { key: "status", label: "狀態", class: "w-[20%]" },
  ];
});

const openCreateCategory = () => {
  selectedCategory.value = null;
  categoryCreateOpen.value = true;
};

const openEditCategory = (category) => {
  selectedCategory.value = category;
  categoryCreateOpen.value = true;
};

const openDeleteCategory = (category) => {
  selectedCategory.value = category;
  deleteCategoryDialogOpen.value = true;
};

const confirmDeleteCategory = async () => {
  if (!selectedCategory.value?.id) return;
  deletingCategory.value = true;
  try {
    await disableOrganization({ id: selectedCategory.value.id });
    await refreshCategoryData();
  } catch (error) {
    console.error(error);
  } finally {
    deleteCategoryDialogOpen.value = false;
    selectedCategory.value = null;
    deletingCategory.value = false;
  }
};

async function refreshCategoryData() {
  if (isPendingCategoryPage.value) {
    await Promise.all([
      refreshOrganizations({ status: "PENDING" }),
      refreshCategoryChangeRequests("PENDING"),
    ]);
    return;
  }
  if (isRejectedCategoryPage.value) {
    await refreshCategoryChangeRequests("REJECTED");
    return;
  }
  await refreshOrganizations({ status: categoryStatusByRoute[route.name] || "ACTIVE" });
}

async function refreshOrganizations(params = {}) {
  organizations.value = normalizeOrganizationRows(await getOrganizations(params));
}

async function refreshCategoryChangeRequests(status = "PENDING") {
  categoryChangeRequests.value = await getPendingChangeRequests({ targetType: "ORGANIZATION", status }) ?? [];
}

function normalizeOrganizationRows(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.body)) return response.body;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.body?.content)) return response.body.content;
  return [];
}

function isSectionOrg(org = {}) {
  return isSectionOrganization(org);
}

function toCategoryRow(org = {}) {
  const normalizedOrgType = normalizeOrgTypeValue(org.orgType);
  const normalizedStatus = normalizeOrganizationStatusValue(org.status);
  const displayStatus = getCategoryStatusLabel(normalizedStatus);
  return {
    ...org,
    rowKey: `org-${org.id}`,
    categoryName: org.orgName || "",
    departmentId: org.parentId,
    orgType: normalizedOrgType,
    status: normalizedStatus,
    badgeStatus: normalizedStatus,
    orgTypeLabel: orgTypeLabelMap[org.orgType] || orgTypeLabelMap[normalizedOrgType] || org.orgType || "-",
    statusLabel: displayStatus || statusLabelMap[org.status] || statusLabelMap[normalizedStatus] || org.status || "-",
    actorName: org.createdBy || org.requesterId || "-",
  };
}

function normalizeStatus(status) {
  return normalizeOrganizationStatusValue(status);
}

function getCategoryStatusLabel(status) {
  return (
    {
      ACTIVE: "啟用",
      PENDING: "待審核",
      DISABLED: "刪除",
      REJECTED: "駁回",
    }[status] || ""
  );
}

function getOrganizationCategoryRows() {
  return organizations.value
    .filter((item) => isSectionOrg(item))
    .map(toCategoryRow);
}

function getPendingCategoryRows() {
  const requestRows = categoryChangeRequests.value
    .filter((item) => item.targetType === "ORGANIZATION")
    .map(toPendingCategoryRow)
    .filter((item) => isSectionOrg(item) || item.orgType === "SECTION");
  if (requestRows.length) return requestRows;
  return getOrganizationCategoryRows().filter((item) => item.status === "PENDING");
}

function toPendingCategoryRow(row = {}) {
  const payload = parsePayload(row.payload);
  const after = payload.after || payload.newData || payload.data || payload;
  const sourceOrg = organizations.value.find((org) => String(org.id) === String(row.targetId));
  const orgName = after.orgName || after.categoryName || payload.orgName || payload.categoryName || row.targetId || "";
  const orgType = normalizeOrgTypeValue(after.orgType || payload.orgType || sourceOrg?.orgType || "");
  return {
    ...row,
    rowKey: `request-${row.id}`,
    id: row.targetId || row.id,
    changeRequestId: row.id,
    categoryName: orgName,
    orgName,
    orgType,
    status: row.status || "PENDING",
    badgeStatus: row.status || "PENDING",
    statusLabel: statusLabelMap[row.status] || "待審核",
    actorName: row.requesterName || row.requesterId || row.createdBy || "-",
    requesterId: row.requesterId || row.createdBy || "",
    createdAt: row.createdAt,
  };
}

function parsePayload(payload) {
  if (!payload) return {};
  if (typeof payload === "object") return payload;
  try {
    return JSON.parse(payload);
  } catch {
    return {};
  }
}

function filterCategoryRows(rows) {
  const keyword = committedCategoryFilters.value.keyword.trim().toLowerCase();
  const startTime = getStartOfDayTime(committedCategoryFilters.value.startDate);
  const endTime = getEndOfDayTime(committedCategoryFilters.value.endDate);
  const hasDateFilter = startTime !== null || endTime !== null;
  return rows.filter((row) => {
    const textMatched =
      !keyword ||
      [row.id, row.categoryName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));
    if (!textMatched) return false;
    if (!hasDateFilter) return true;
    const rowTime = getDateTime(row.createdAt || row.closedAt || row.updatedAt);
    if (rowTime === null) return true;
    return (startTime === null || rowTime >= startTime) && (endTime === null || rowTime <= endTime);
  });
}

function applyCategoryFilters() {
  committedCategoryFilters.value = {
    keyword: categoryKeyword.value,
    startDate: categoryStartDate.value,
    endDate: categoryEndDate.value,
  };
}

function resetCategoryFilters() {
  categoryKeyword.value = "";
  categoryStartDate.value = "";
  categoryEndDate.value = "";
  committedCategoryFilters.value = { keyword: "", startDate: "", endDate: "" };
}

function toggleCategorySort(key) {
  categorySortState.value = {
    key,
    direction: categorySortState.value.key === key && categorySortState.value.direction === "asc" ? "desc" : "asc",
  };
}

function sortCategoryRows(rows) {
  const { key, direction } = categorySortState.value;
  const multiplier = direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) =>
    String(getCategorySortValue(a, key)).localeCompare(String(getCategorySortValue(b, key)), "zh-Hant", {
      numeric: true,
      sensitivity: "base",
    }) * multiplier,
  );
}

function getCategorySortValue(row, key) {
  if (key === "date") return row.createdAt || row.closedAt || row.updatedAt || "";
  return row[key] || "";
}

function formatCategoryDate(row = {}) {
  const value = row.createdAt || row.closedAt || row.updatedAt;
  if (!value) return "-";
  return String(value).slice(0, 10);
}

function getDateTime(value) {
  if (!value) return null;
  const time = new Date(String(value)).getTime();
  return Number.isNaN(time) ? null : time;
}

function normalizeDate(value) {
  if (!value || value === "-") return "";
  return String(value).replaceAll("/", "-").slice(0, 10);
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

function isOwnPendingCategory(category = {}) {
  return isPendingCategoryPage.value && category.requesterId && category.requesterId === auth.userId;
}

function canReviewCategory(category = {}) {
  return Boolean(category.changeRequestId && category.requesterId && category.requesterId !== auth.userId);
}

function confirmApproveCategory(category) {
  if (!canReviewCategory(category)) return;
  selectedCategory.value = category;
  approveCategoryDialogOpen.value = true;
}

function openRejectCategory(category) {
  if (!canReviewCategory(category)) return;
  selectedCategory.value = category;
  rejectCategoryDialogOpen.value = true;
}

async function approveSelectedCategory() {
  if (!selectedCategory.value?.changeRequestId) return;
  reviewingCategory.value = true;
  try {
    await approveChangeRequest({ id: selectedCategory.value.changeRequestId });
    await refreshCategoryData();
  } catch (error) {
    console.error(error);
  } finally {
    approveCategoryDialogOpen.value = false;
    reviewingCategory.value = false;
  }
}

async function rejectSelectedCategory(reason) {
  if (!selectedCategory.value?.changeRequestId) return;
  reviewingCategory.value = true;
  try {
    await rejectChangeRequest({ id: selectedCategory.value.changeRequestId, remark: reason });
    await refreshCategoryData();
  } catch (error) {
    console.error(error);
  } finally {
    rejectCategoryDialogOpen.value = false;
    reviewingCategory.value = false;
  }
}

const columns = [
  { key: "id", label: "申請單編號" },
  { key: "targetType", label: "類型" },
  { key: "targetId", label: "目標編號" },
  { key: "action", label: "動作" },
  { key: "status", label: "狀態" },
  { key: "requesterId", label: "申請人" },
  { key: "reviewerId", label: "審核人" },
  { key: "createdAt", label: "申請時間" },
  { key: "closedAt", label: "結案時間" },
];

const targetTypeOptions = Object.entries(TARGET_TYPE_LABEL_MAP).map(
  ([value, label]) => ({ value, label }),
);
const statusOptions = ["PENDING", "APPROVED", "REJECTED", "CANCELED"].map(
  (value) => ({
    value,
    label: STATUS_LABEL_MAP[value],
  }),
);
const rows = computed(() =>
  approvals.value.filter((item) => {
    const matchId = !filters.id || String(item.id).includes(filters.id);
    const matchType =
      !filters.targetType || item.targetType === filters.targetType;
    const matchStatus = !filters.status || item.status === filters.status;
    return matchId && matchType && matchStatus;
  }),
);

const reset = () => {
  filters.id = "";
  filters.targetType = "";
  filters.status = "";
  approvals.value = [];
};

const noop = async () => {
  const targetId = String(filters.id || "").trim();
  const response = await searchChangeRequests({
    targetId,
    page: 1,
    size: 100,
  });
  approvals.value = response?.content ?? (Array.isArray(response) ? response : []);
};

const PlusIcon = () => h("img", { src: addIcon, alt: "", "aria-hidden": "true", class: "size-4 brightness-0 invert" });

const TrashIcon = () => h("img", { src: trashIcon, alt: "", "aria-hidden": "true", class: "size-4" });
const EditIcon = () => h("img", { src: editIcon, alt: "", "aria-hidden": "true", class: "size-4" });
const FileIcon = () => h("img", { src: fileIcon, alt: "", "aria-hidden": "true", class: "size-6 shrink-0" });
const CheckIcon = () => h("img", { src: checkCircleBlueIcon, alt: "", "aria-hidden": "true", class: "size-6 brightness-0 invert" });
const XIcon = () => h("img", { src: xCircleBlackIcon, alt: "", "aria-hidden": "true", class: "size-6 shrink-0" });
const SortIcon = () => h("img", { src: sortIcon, alt: "", "aria-hidden": "true", class: "h-4 w-2.5 shrink-0" });
</script>
