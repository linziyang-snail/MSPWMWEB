<template>
  <div v-if="isCategoryPage" class="space-y-5">
    <!-- 新增科別按鈕 -->
    <div class="flex justify-end">
      <BaseButton @click="openCreateCategory">
        <PlusIcon /> 新增科別
      </BaseButton>
    </div>
    <CategoryCreateModal
      v-model="categoryCreateOpen"
      :category="selectedCategory"
      @submitted="onCategoryCreated"
    />

    <!-- 科別卡片區 -->
    <section
      class="rounded-xl border border-border bg-background-surface px-7 py-6"
    >
      <div class="mb-6 flex items-center gap-3">
        <span
          class="grid size-10 place-items-center rounded-lg bg-primary-soft"
        >
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
          :key="category.id"
          class="flex h-18 items-center justify-between rounded-xl border border-border bg-background-page px-5 transition hover:shadow-card-soft"
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
          <div class="flex items-center gap-2">
            <button
              class="grid size-8 place-items-center text-primary transition hover:scale-110"
              type="button"
              @click="openEditCategory(category)"
            >
              <EditIcon />
            </button>
            <button
              class="grid size-8 place-items-center text-danger-text transition hover:scale-110"
              type="button"
              @click="openDeleteCategory(category)"
            >
              <TrashIcon />
            </button>
          </div>
        </article>
      </div>

      <EmptyState v-if="!categoryRows.length" class="py-12" />
    </section>

    <ConfirmDialog
      v-model="deleteCategoryDialogOpen"
      title="確認刪除科別"
      :message="deleteCategoryMessage"
      danger
      confirm-text="確認刪除"
      :loading="deletingCategory"
      @confirm="confirmDeleteCategory"
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
import { computed, h, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import addIcon from "@/assets/add.svg";
import buildingIcon from "@/assets/building2.svg";
import editIcon from "@/assets/edit.svg";
import trashIcon from "@/assets/icon-trash.svg";
import BaseBadge from "@/components/base/BaseBadge.vue";
import CategoryCreateModal from "@/components/dialogs/CategoryCreateModal.vue";
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
import { GetChangeRequestHistory } from "@/services/approvalService";
import {
  disableOrganization,
  getOrganizations,
} from "@/services/organizationService";
import { useAppStore } from "@/stores/appStore";
import {
  ACTION_LABEL_MAP,
  STATUS_LABEL_MAP,
  TARGET_TYPE_LABEL_MAP,
  orgTypeLabelMap,
  statusLabelMap,
} from "@/utils/constants";
import { formatDateTime } from "@/utils/formatDate";

const route = useRoute();
const appStore = useAppStore();
const filters = reactive({ id: "", targetType: "", status: "" });
const categoryCreateOpen = ref(false);
const deleteCategoryDialogOpen = ref(false);
const selectedCategory = ref(null);
const deletingCategory = ref(false);
const approvals = ref([]);
const organizations = ref([]);

onMounted(async () => {
  try {
    const [approvalRows] = await Promise.all([GetChangeRequestHistory("", "")]);
    approvals.value = approvalRows ?? [];
    await refreshOrganizations();
  } catch (error) {
    console.error(error);
  }
});

const onCategoryCreated = async (payload) => {
  await refreshOrganizations();
  appStore.showAlert({
    title: "系統提示",
    message:
      payload?.mode === "edit"
        ? "已送出組織修改申請，等待審核"
        : "已送出新增組織申請，等待審核",
  });
  selectedCategory.value = null;
};

const categoryStatusByRoute = {
  CategoryAll: "ACTIVE",
  CategoryPending: "PENDING",
  CategoryRejected: "REJECTED",
  CategoryDeleted: "DELETED",
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
  return organizations.value
    .filter((item) => isSectionOrg(item))
    .map(toCategoryRow)
    .filter((item) => !status || normalizeStatus(item.status) === status);
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
    await refreshOrganizations();
    deleteCategoryDialogOpen.value = false;
    appStore.showAlert({
      title: "系統提示",
      message: "已送出停用組織申請，等待審核",
    });
    selectedCategory.value = null;
  } catch (error) {
    console.error(error);
  } finally {
    deletingCategory.value = false;
  }
};

async function refreshOrganizations() {
  organizations.value = normalizeOrganizationRows(await getOrganizations());
}

function normalizeOrganizationRows(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.body)) return response.body;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.body?.content)) return response.body.content;
  return [];
}

function isSectionOrg(org = {}) {
  return ["SECTION", "科別"].includes(org.orgType);
}

function toCategoryRow(org = {}) {
  return {
    ...org,
    categoryName: org.orgName || "",
    departmentId: org.parentId,
    orgTypeLabel: orgTypeLabelMap[org.orgType] || org.orgType || "-",
    statusLabel: statusLabelMap[org.status] || org.status || "-",
  };
}

function normalizeStatus(status) {
  if (["ACTIVE", "啟用"].includes(status)) return "ACTIVE";
  if (["PENDING", "PENDING_APPROVAL", "審核中"].includes(status)) return "PENDING";
  if (["REJECTED", "已駁回"].includes(status)) return "REJECTED";
  if (["DELETED", "DISABLED", "INACTIVE", "停用", "已刪除"].includes(status)) return "DELETED";
  return status;
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
};

const noop = () => {};

const PlusIcon = () => h("img", { src: addIcon, alt: "", "aria-hidden": "true", class: "size-4" });

const TrashIcon = () => h("img", { src: trashIcon, alt: "", "aria-hidden": "true", class: "size-4" });
const EditIcon = () => h("img", { src: editIcon, alt: "", "aria-hidden": "true", class: "size-4" });
</script>
