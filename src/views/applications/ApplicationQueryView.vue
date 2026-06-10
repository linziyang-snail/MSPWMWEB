<template>
  <div v-if="isCategoryPage" class="space-y-5">
    <CategoryCreateModal v-model="categoryCreateOpen" :category="selectedCategory" @submitted="onCategoryCreated" />

    <section v-if="isPendingCategoryPage"
      class="flex items-center justify-between gap-4 px-6 py-6 border-t min-h-32 rounded-2xl border-border-muted bg-background-surface">
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
        class="grid gap-2 px-6 py-3 text-center min-h-20 min-w-28 place-items-center rounded-2xl bg-primary text-text-inverse">
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

    <section v-if="isActiveCategoryPage" class="py-6 border rounded-xl border-border bg-background-surface px-7">
      <div class="flex items-center gap-3 mb-6">
        <span class="grid rounded-lg size-10 place-items-center bg-primary-soft">
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
        <article v-for="category in categoryRows" :key="category.rowKey"
          class="flex items-center justify-between px-5 transition border h-header rounded-xl border-border bg-background-page hover:shadow-card-soft">
          <div class="flex items-center gap-4">
            <span
              class="grid text-base font-bold rounded-lg size-10 shrink-0 place-items-center bg-primary text-text-inverse">
              {{ category.categoryName.slice(0, 1) }}
            </span>
            <span class="text-base font-bold text-text-primary">
              {{ category.categoryName }}
            </span>
          </div>
          <button class="grid transition size-8 place-items-center text-danger-text hover:scale-110" type="button"
            aria-label="刪除科別" @click="openDeleteCategory(category)">
            <TrashIcon />
          </button>
        </article>
      </div>

      <EmptyState v-if="!categoryRows.length" class="py-12" />
    </section>

    <div v-if="isTableCategoryPage" class="overflow-hidden border rounded-xl border-border bg-background-surface">
      <div class="flex justify-end gap-4 px-4 py-4 border-b min-h-header border-border-muted bg-background-page/50">
        <button
          class="inline-flex h-10 w-32 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-base font-medium leading-normal text-text-inverse transition hover:bg-primary-hover"
          type="button" @click="openCreateCategory">
          <PlusIcon /> 新增科別
        </button>
      </div>

      <table class="w-full text-sm table-fixed">
        <thead>
          <tr class="h-16 border-b border-border bg-background-hover">
            <th v-for="col in categoryColumns" :key="col.key"
              class="px-4 py-4 text-base font-bold leading-normal text-left text-natural xl:px-5" :class="col.class">
              <button class="inline-flex items-center gap-2 font-bold text-left transition hover:text-primary"
                type="button" @click="toggleCategorySort(col.key)">
                {{ col.label }}
                <SortIcon />
              </button>
            </th>
            <th class="w-[22%] px-4 py-4 text-base font-bold leading-normal text-center text-natural xl:px-5">
              {{ categoryTrailingColumnLabel }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in pagedCategoryRows" :key="category.rowKey"
            class="h-20 border-b border-border-muted last:border-0 hover:bg-background-hover">
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
              <span v-if="isOwnPendingCategory(category)"
                class="inline-flex h-8 items-center whitespace-nowrap rounded-3xl bg-danger-bg px-3 py-0.5 text-sm font-medium leading-normal text-danger-text">
                等待其他管理員審核
              </span>
              <BaseBadge v-else :status="category.badgeStatus" :label="category.statusLabel" />
            </td>
            <td class="px-3 py-4 xl:px-5">
              <div v-if="isPendingCategoryPage" class="flex flex-wrap items-center justify-center gap-2 2xl:gap-4">
                <span v-if="isOwnPendingCategory(category)" aria-hidden="true"></span>
                <template v-else-if="canReviewCategory(category)"
                  class="flex flex-wrap items-center justify-center gap-2 2xl:gap-4">
                  <button
                    class="inline-flex items-center justify-center w-24 h-10 gap-2 px-4 py-2 text-base font-medium leading-normal transition rounded-lg shrink-0 whitespace-nowrap bg-primary text-text-inverse hover:bg-primary-hover"
                    type="button" @click="confirmApproveCategory(category)">
                    <CheckIcon /> <span>核准</span>
                  </button>
                  <button
                    class="inline-flex h-10 w-24 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-text-grey bg-background-surface px-4 py-2.5 text-base font-medium leading-normal text-natural transition hover:bg-background-hover"
                    type="button" @click="openRejectCategory(category)">
                    <XIcon /> <span>駁回</span>
                  </button>
                </template>
                <span v-else class="text-base font-normal leading-normal text-center text-natural">-</span>
              </div>
              <button v-else-if="isRejectedCategoryPage"
                class="block mx-auto text-base font-bold leading-normal transition text-danger-text hover:text-danger"
                type="button">
                {{ category.rejectReason || "-" }}
              </button>
              <p v-else-if="route.name === 'CategoryDeleted'"
                class="text-base font-normal leading-normal text-center text-natural">
                {{ category.reviewerName || "-" }}
              </p>
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

      <div
        class="flex items-center justify-between h-16 px-6 text-xs font-normal leading-normal bg-background-page text-natural">
        <span>顯示共 {{ displayedCategoryRows.length }} 筆</span>
        <div class="flex items-center gap-2 text-xs font-bold leading-normal text-natural">
          <button
            class="px-4 text-center transition border rounded h-7 border-text-grey bg-background-surface hover:bg-background-hover disabled:opacity-60"
            type="button" :disabled="currentPage <= 1" @click="currentPage -= 1">
            上頁
          </button>
          <span
            class="grid px-4 border rounded h-7 min-w-10 place-items-center border-primary bg-primary text-text-inverse">
            {{ currentPage }} / {{ categoryTotalPages }}
          </span>
          <button
            class="px-4 text-center transition border rounded h-7 border-text-grey bg-background-surface hover:bg-background-hover disabled:opacity-60"
            type="button" :disabled="currentPage >= categoryTotalPages" @click="currentPage += 1">
            下頁
          </button>
        </div>
      </div>
    </div>

    <ConfirmDialog v-model="deleteCategoryDialogOpen" title="確認刪除科別" :message="deleteCategoryMessage" danger
      confirm-text="確認刪除" :loading="deletingCategory" @confirm="confirmDeleteCategory" />
    <ConfirmDialog v-model="approveCategoryDialogOpen" title="核准科別" :subtitle="selectedCategory ? `科別：${selectedCategory.categoryName}` : ''
      " message="確定要核准此科別申請嗎？" success confirm-text="確認核准" :loading="reviewingCategory"
      @confirm="approveSelectedCategory" />
    <RejectReasonDialog v-model="rejectCategoryDialogOpen" title="駁回科別" :subtitle="selectedCategory ? `科別：${selectedCategory.categoryName}` : ''
      " :loading="reviewingCategory" @confirm="rejectSelectedCategory" />
  </div>

  <div v-else>
    <PageTitle title="科別管理" eyebrow="科別管理" />
    <SearchFilterBar class="mb-5">
      <FormField class="min-w-filter-md" label="申請單編號">
        <BaseInput v-model="filters.id" placeholder="請輸入申請單編號" />
      </FormField>
      <FormField class="min-w-filter-sm" label="類型">
        <BaseSelect v-model="filters.targetType" :options="targetTypeOptions" placeholder="全部類型" />
      </FormField>
      <FormField class="min-w-filter-sm" label="狀態">
        <BaseSelect v-model="filters.status" :options="statusOptions" placeholder="全部狀態" />
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
      <template #cell-status="{ row }">
        <BaseBadge :status="row.status" />
      </template>
      <template #cell-createdAt="{ row }">{{
        formatDateTime(row.createdAt)
      }}</template>
      <template #cell-closedAt="{ row }">{{
        formatDateTime(row.closedAt)
      }}</template>
      <template #empty>
        <EmptyState v-if="rows.length === 0" />
      </template>
    </BaseTable>
    <BasePagination :page="1" :total="rows.length" :size="20" />
  </div>
</template>

<script setup>
import { computed, h, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";

import addIcon from "@/assets/add.svg";
import buildingIcon from "@/assets/building2.svg";
import checkCircleBlueIcon from "@/assets/icon-check-circle-blue.svg";
import sortIcon from "@/assets/icon-sort.svg";
import trashIcon from "@/assets/icon-trash.svg";
import xCircleBlackIcon from "@/assets/icon-x-circle-black.svg";
import BaseBadge from "@/components/base/BaseBadge.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import BasePagination from "@/components/base/BasePagination.vue";
import BaseSelect from "@/components/base/BaseSelect.vue";
import ConfirmDialog from "@/components/common/ConfirmDialog.vue";
import EmptyState from "@/components/common/EmptyState.vue";
import PageTitle from "@/components/common/PageTitle.vue";
import RejectReasonDialog from "@/components/common/RejectReasonDialog.vue";
import SearchFilterBar from "@/components/common/SearchFilterBar.vue";
import CategoryCreateModal from "@/components/dialogs/CategoryCreateModal.vue";
import FormField from "@/components/forms/FormField.vue";
import BaseTable from "@/components/tables/BaseTable.vue";
import {
  approveChangeRequest,
  getChangeRequests,
  getPendingChangeRequests,
  invalidateChangeRequests,
  rejectChangeRequest,
  searchChangeRequests,
} from "@/services/approvalService";
import {
  disableOrganization,
  getOrganizations,
  invalidateOrganizations,
} from "@/services/organizationService";
import { useApprovalStore } from "@/stores/approvalStore";
import { useAuthStore } from "@/stores/authStore";
import {
  ACTION_LABEL_MAP,
  isSectionOrganization,
  normalizeOrganizationStatusValue,
  normalizeOrgTypeValue,
  orgTypeLabelMap,
  STATUS_LABEL_MAP,
  statusLabelMap,
  TARGET_TYPE_LABEL_MAP,
} from "@/utils/constants";
import { formatDateTime } from "@/utils/formatDate";

const route = useRoute();
const auth = useAuthStore();
const approvalStore = useApprovalStore();
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
const approvedDeleteCategoryRequests = ref([]);
const categorySortState = ref({ key: "date", direction: "desc" });
const currentPage = ref(1);
const PAGE_SIZE = 20;

onMounted(async () => {
  try {
    if (isCategoryPage.value)
      await refreshCategoryData({ forceOrganizations: true, forceRequests: true });
  } catch (error) {
    console.error(error);
  }
});

watch(
  () => route.name,
  async () => {
    currentPage.value = 1;
    if (isCategoryPage.value)
      await refreshCategoryData({ forceOrganizations: true, forceRequests: true });
  },
);

const onCategoryCreated = async () => {
  invalidateOrganizations("ACTIVE");
  invalidateOrganizations("PENDING");
  invalidateChangeRequests({ targetType: "ORGANIZATION", status: "PENDING" });
  approvalStore.fetchCategoryPendingCount({ force: true });
  if (isPendingCategoryPage.value) {
    await refreshCategoryData({
      forceOrganizations: true,
      forceRequests: true,
    });
  } else {
    await refreshCategoryChangeRequests("PENDING", { force: true });
  }
  selectedCategory.value = null;
};

const categoryStatusByRoute = {
  CategoryAll: "ACTIVE",
  CategoryPending: "PENDING",
  CategoryRejected: "REJECTED",
  CategoryDeleted: "DISABLED",
};

const categoryTitleByRoute = {
  CategoryAll: "全部科別",
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
  const sourceRows =
    isPendingCategoryPage.value || isRejectedCategoryPage.value
      ? getPendingCategoryRows()
      : getOrganizationCategoryRows();
  return sourceRows.filter(
    (item) => !status || normalizeStatus(item.status) === status,
  );
});

const displayedCategoryRows = computed(() =>
  sortCategoryRows(categoryRows.value),
);

const categoryTotalPages = computed(() =>
  Math.max(1, Math.ceil(displayedCategoryRows.value.length / PAGE_SIZE)),
);

const pagedCategoryRows = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return displayedCategoryRows.value.slice(start, start + PAGE_SIZE);
});

watch(
  () => displayedCategoryRows.value.length,
  () => {
    if (currentPage.value > categoryTotalPages.value) {
      currentPage.value = categoryTotalPages.value;
    }
  },
);

const isActiveCategoryPage = computed(() => route.name === "CategoryAll");
const isPendingCategoryPage = computed(() => route.name === "CategoryPending");
const isRejectedCategoryPage = computed(
  () => route.name === "CategoryRejected",
);
const isTableCategoryPage = computed(
  () => isCategoryPage.value && !isActiveCategoryPage.value,
);
const categoryTrailingColumnLabel = computed(() =>
  isRejectedCategoryPage.value
    ? "駁回原因"
    : route.name === "CategoryDeleted"
      ? "刪除審核人"
      : "操作",
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
    CategoryDeleted: "刪除申請人",
  };
  return [
    {
      key: "date",
      label: dateLabelMap[route.name] || "建立日期",
      class: "w-[20%]",
    },
    { key: "categoryName", label: "科別", class: "w-[20%]" },
    {
      key: "actorName",
      label: actorLabelMap[route.name] || "建立人",
      class: "w-[20%]",
    },
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
    invalidateOrganizations("ACTIVE");
    invalidateOrganizations("PENDING");
    invalidateChangeRequests({ targetType: "ORGANIZATION", status: "PENDING" });
    await refreshCategoryData({
      forceOrganizations: true,
      forceRequests: true,
    });
  } catch (error) {
    console.error(error);
  } finally {
    deleteCategoryDialogOpen.value = false;
    selectedCategory.value = null;
    deletingCategory.value = false;
  }
};

async function refreshCategoryData(options = {}) {
  const { forceOrganizations = false, forceRequests = false } = options;
  if (isPendingCategoryPage.value) {
    organizations.value = [];
    await refreshCategoryChangeRequests("PENDING", { force: forceRequests });
    return;
  }
  if (isRejectedCategoryPage.value) {
    organizations.value = [];
    await refreshCategoryChangeRequests("REJECTED", { force: forceRequests });
    return;
  }
  if (route.name === "CategoryDeleted") {
    await Promise.all([
      refreshOrganizations({ status: "DISABLED", force: forceOrganizations }),
      refreshApprovedDeleteCategoryRequests({ force: forceRequests }),
    ]);
    return;
  }
  await refreshOrganizations({
    status: categoryStatusByRoute[route.name] || "ACTIVE",
    force: forceOrganizations,
  });
}

async function refreshOrganizations(params = {}) {
  organizations.value = normalizeOrganizationRows(
    await getOrganizations(params),
  );
}

// 1 request for <=100 rows; fetch further pages only when the dataset exceeds
// a page, so nothing is truncated past 100.
async function fetchAllChangeRequests(params = {}) {
  const size = 100;
  let page = 1;
  let content = [];
  for (let guard = 0; guard < 100; guard += 1) {
    const response = await getChangeRequests({ ...params, page, size });
    const rows = response?.content ?? (Array.isArray(response) ? response : []);
    content = content.concat(rows);
    if (rows.length < size) break;
    page += 1;
  }
  return content;
}

async function refreshCategoryChangeRequests(status = "PENDING", options = {}) {
  categoryChangeRequests.value = await fetchAllChangeRequests({
    targetType: "ORGANIZATION",
    status,
    force: Boolean(options.force),
  });
}

async function refreshApprovedDeleteCategoryRequests(options = {}) {
  approvedDeleteCategoryRequests.value = await fetchAllChangeRequests({
    targetType: "ORGANIZATION",
    status: ["APPROVED"],
    action: ["DELETE"],
    force: Boolean(options.force),
  });
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
  const approvedDeleteRequest =
    route.name === "CategoryDeleted"
      ? findApprovedDeleteRequestByTargetId(org.id)
      : null;
  const displayStatus = getCategoryStatusLabel(normalizedStatus);
  return {
    ...org,
    rowKey: `org-${org.id}`,
    categoryName: org.orgName || "",
    departmentId: org.parentId,
    orgType: normalizedOrgType,
    status: normalizedStatus,
    badgeStatus: normalizedStatus,
    orgTypeLabel:
      orgTypeLabelMap[org.orgType] ||
      orgTypeLabelMap[normalizedOrgType] ||
      org.orgType ||
      "-",
    statusLabel:
      displayStatus ||
      statusLabelMap[org.status] ||
      statusLabelMap[normalizedStatus] ||
      org.status ||
      "-",
    actorName:
      route.name === "CategoryDeleted"
        ? approvedDeleteRequest?.requesterId || "-"
        : org.createdBy || org.requesterId || "-",
    reviewerName:
      route.name === "CategoryDeleted"
        ? approvedDeleteRequest?.reviewerId || "-"
        : "",
    createdAt:
      route.name === "CategoryDeleted"
        ? approvedDeleteRequest?.createdAt || org.createdAt
        : org.createdAt,
    closedAt:
      route.name === "CategoryDeleted"
        ? approvedDeleteRequest?.closedAt || org.closedAt
        : org.closedAt,
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

function getPendingCategoryActionLabel(action = "") {
  const normalizedAction = String(action || "").toUpperCase();
  return (
    {
      CREATE: "待新增",
      UPDATE: "待修改",
      DELETE: "待刪除",
    }[normalizedAction] || "待審核"
  );
}

function getRejectedCategoryActionLabel(action = "") {
  const normalizedAction = String(action || "").toUpperCase();
  return (
    {
      CREATE: "駁回新增",
      UPDATE: "駁回修改",
      DELETE: "駁回刪除",
    }[normalizedAction] || "駁回"
  );
}

function getOrganizationCategoryRows() {
  return organizations.value
    .filter((item) => isSectionOrg(item))
    .map(toCategoryRow);
}

function getPendingCategoryRows() {
  if (isPendingCategoryPage.value || isRejectedCategoryPage.value) {
    return categoryChangeRequests.value
      .filter(isOrganizationChangeRequest)
      .map(toPendingCategoryRow)
      .filter((item) => isSectionOrg(item) || item.orgType === "SECTION");
  }
  return [];
}

function toPendingCategoryRow(row = {}, sourceOrg = null) {
  const payload = safeParsePayload(row.payload);
  const after = payload.after || payload.newData || payload.data || payload;
  const action = String(row.action || payload.action || "").toUpperCase();
  const orgName = resolveOrganizationName(row, payload, sourceOrg);
  const matchedOrg = sourceOrg || findOrganizationById(row.targetId);
  const orgType = normalizeOrgTypeValue(
    after.orgType || payload.orgType || matchedOrg?.orgType || "SECTION",
  );
  const reviewStatus = String(row.status || "PENDING").toUpperCase();
  const actionStatusLabel =
    reviewStatus === "REJECTED"
      ? getRejectedCategoryActionLabel(action)
      : getPendingCategoryActionLabel(action);
  return {
    ...row,
    rowKey: `request-${row.id}`,
    id: row.targetId || matchedOrg?.id || row.id,
    changeRequestId: row.id,
    categoryName: orgName,
    orgName,
    orgType,
    action,
    status: reviewStatus,
    badgeStatus: reviewStatus,
    statusLabel: actionStatusLabel,
    actorName: row.requesterName || row.requesterId || row.createdBy || "-",
    requesterId: row.requesterId || row.createdBy || "",
    createdAt: row.createdAt,
    closedAt: row.closedAt,
    rejectReason: row.remark || row.rejectReason || "-",
  };
}

function safeParsePayload(payload) {
  if (!payload) return {};
  if (typeof payload === "object") return payload;
  try {
    return JSON.parse(payload);
  } catch {
    return {};
  }
}

function resolveOrganizationName(
  row = {},
  payload = safeParsePayload(row.payload),
  sourceOrg = null,
) {
  const after = payload.after || payload.newData || payload.data || payload;
  const payloadName =
    after.orgName ||
    after.categoryName ||
    after.name ||
    payload.orgName ||
    payload.categoryName ||
    payload.name;
  if (payloadName) return payloadName;
  const targetId = row.targetId || sourceOrg?.id;
  return (
    sourceOrg?.orgName ||
    findOrganizationById(targetId)?.orgName ||
    (targetId ? `科別 ID：${targetId}` : "-")
  );
}

function findOrganizationById(id) {
  if (id === undefined || id === null || id === "") return null;
  return (
    organizations.value.find((org) => String(org.id) === String(id)) || null
  );
}

function findApprovedDeleteRequestByTargetId(id) {
  if (id === undefined || id === null || id === "") return null;
  return (
    approvedDeleteCategoryRequests.value.find(
      (request) =>
        isOrganizationChangeRequest(request) &&
        String(request.status || "").toUpperCase() === "APPROVED" &&
        String(request.action || "").toUpperCase() === "DELETE" &&
        String(request.targetId) === String(id),
    ) || null
  );
}

function isOrganizationChangeRequest(item = {}) {
  return String(item.targetType || "").toUpperCase() === "ORGANIZATION";
}

function toggleCategorySort(key) {
  categorySortState.value = {
    key,
    direction:
      categorySortState.value.key === key &&
        categorySortState.value.direction === "asc"
        ? "desc"
        : "asc",
  };
}

function sortCategoryRows(rows) {
  const { key, direction } = categorySortState.value;
  const multiplier = direction === "asc" ? 1 : -1;
  return [...rows].sort(
    (a, b) =>
      String(getCategorySortValue(a, key)).localeCompare(
        String(getCategorySortValue(b, key)),
        "zh-Hant",
        {
          numeric: true,
          sensitivity: "base",
        },
      ) * multiplier,
  );
}

function getCategorySortValue(row, key) {
  if (key === "date")
    return row.createdAt || row.closedAt || row.updatedAt || "";
  return row[key] || "";
}

function formatCategoryDate(row = {}) {
  const value =
    route.name === "CategoryRejected"
      ? row.closedAt || row.createdAt
      : row.createdAt || row.closedAt || row.updatedAt;
  if (!value) return "-";
  return String(value).slice(0, 10);
}

function isOwnPendingCategory(category = {}) {
  return (
    isPendingCategoryPage.value &&
    category.requesterId &&
    String(category.requesterId) === String(auth.userId)
  );
}

function canReviewCategory(category = {}) {
  return Boolean(
    category.changeRequestId &&
    category.requesterId &&
    String(category.requesterId) !== String(auth.userId),
  );
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
    const action = selectedCategory.value.action;
    await approveChangeRequest({ id: selectedCategory.value.changeRequestId });
    invalidateCategoryCachesAfterApprove(action);
    approvalStore.fetchCategoryPendingCount({ force: true });
    await refreshCategoryData({
      forceOrganizations: true,
      forceRequests: true,
    });
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
    await rejectChangeRequest({
      id: selectedCategory.value.changeRequestId,
      remark: reason,
    });
    invalidateCategoryCachesAfterReject();
    approvalStore.fetchCategoryPendingCount({ force: true });
    await refreshCategoryData({
      forceOrganizations: true,
      forceRequests: true,
    });
  } catch (error) {
    console.error(error);
  } finally {
    rejectCategoryDialogOpen.value = false;
    reviewingCategory.value = false;
  }
}

function invalidateCategoryCachesAfterApprove(action = "") {
  const normalizedAction = String(action || "").toUpperCase();
  invalidateOrganizations("PENDING");
  invalidateOrganizations("ACTIVE");
  invalidateOrganizations("DISABLED");
  invalidateChangeRequests({ targetType: "ORGANIZATION", status: "PENDING" });
  invalidateChangeRequests({ targetType: "ORGANIZATION", status: "REJECTED" });
  invalidateChangeRequests({ targetType: "ORGANIZATION", status: "APPROVED" });
  if (["CREATE", "UPDATE"].includes(normalizedAction)) {
    invalidateOrganizations("ACTIVE");
  }
  if (["DELETE", "DISABLE"].includes(normalizedAction)) {
    invalidateOrganizations("ACTIVE");
    invalidateOrganizations("DISABLED");
  }
  if (!normalizedAction) {
    invalidateOrganizations("ACTIVE");
    invalidateOrganizations("DISABLED");
  }
}

function invalidateCategoryCachesAfterReject() {
  invalidateOrganizations("PENDING");
  invalidateOrganizations("ACTIVE");
  invalidateOrganizations("DISABLED");
  invalidateChangeRequests({ targetType: "ORGANIZATION", status: "PENDING" });
  invalidateChangeRequests({ targetType: "ORGANIZATION", status: "REJECTED" });
  invalidateChangeRequests({ targetType: "ORGANIZATION", status: "APPROVED" });
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
  approvals.value =
    response?.content ?? (Array.isArray(response) ? response : []);
};

const PlusIcon = () =>
  h("img", {
    src: addIcon,
    alt: "",
    "aria-hidden": "true",
    class: "size-4 brightness-0 invert",
  });

const TrashIcon = () =>
  h("img", { src: trashIcon, alt: "", "aria-hidden": "true", class: "size-4" });
const CheckIcon = () =>
  h("img", {
    src: checkCircleBlueIcon,
    alt: "",
    "aria-hidden": "true",
    class: "size-6 brightness-0 invert",
  });
const XIcon = () =>
  h("img", {
    src: xCircleBlackIcon,
    alt: "",
    "aria-hidden": "true",
    class: "size-6 shrink-0",
  });
const SortIcon = () =>
  h("img", {
    src: sortIcon,
    alt: "",
    "aria-hidden": "true",
    class: "h-4 w-2.5 shrink-0",
  });
</script>
