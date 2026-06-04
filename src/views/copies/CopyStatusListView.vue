<template>
  <div class="space-y-6">
    <!-- 搜尋 + 新增文案 -->
    <div class="flex items-center gap-4">
      <BaseSearchInput
        v-model="keyword"
        class="flex-1"
        placeholder="搜尋文案編號、標題或內容..."
      />
      <BaseButton v-if="!isReviewer" size="lg" @click="onCreate">
        <PlusIcon /> 新增文案
      </BaseButton>
    </div>

    <!-- 卡片列表 -->
    <section v-if="filtered.length" class="space-y-5">
      <CopyCard
        v-for="copy in filtered"
        :key="copy.id"
        :copy="copy"
        :mode="copyCardMode"
        @view-copy="onView"
        @cancel-submission="onCancel"
        @copy-create="onCopy"
        @approve-copy="onApprove"
        @reject-copy="onReject"
      />
    </section>
    <EmptyState v-else />

    <!-- Modals -->
    <CopyDetailModal v-model="detailOpen" :copy="selected" />
    <CopyFormModal
      v-model="formOpen"
      :mode="formMode"
      :source="formSource"
      @submitted="onSubmitted"
    />
    <CancelCopySubmissionDialog
      v-model="cancelDialog.open"
      :copy-title="cancelDialog.target?.title"
      :copy-code="cancelDialog.target?.code"
      @confirm="confirmCancel"
    />
    <ApproveCopyDialog
      v-model="approveDialog.open"
      :copy-title="approveDialog.target?.title"
      :copy-code="approveDialog.target?.code"
      @confirm="confirmApprove"
    />
    <RejectCopyDialog
      v-model="rejectDialog.open"
      :copy-code="rejectDialog.target?.code"
      @confirm="confirmReject"
    />
  </div>
</template>

<script setup>
import { computed, h, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

import addIcon from "@/assets/add.svg";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseSearchInput from "@/components/base/BaseSearchInput.vue";
import EmptyState from "@/components/common/EmptyState.vue";
import CopyCard from "@/components/copies/CopyCard.vue";
import ApproveCopyDialog from "@/components/dialogs/ApproveCopyDialog.vue";
import CancelCopySubmissionDialog from "@/components/dialogs/CancelCopySubmissionDialog.vue";
import CopyDetailModal from "@/components/dialogs/CopyDetailModal.vue";
import CopyFormModal from "@/components/dialogs/CopyFormModal.vue";
import RejectCopyDialog from "@/components/dialogs/RejectCopyDialog.vue";
import { useAuthStore } from "@/stores/authStore";
import { useCopyStore } from "@/stores/copyStore";
import { normalizeRoles } from "@/utils/authRoles";

const route = useRoute();
const copyStore = useCopyStore();
const auth = useAuthStore();

const keyword = ref("");
const selected = ref(null);
const detailOpen = ref(false);
const formOpen = ref(false);
const formMode = ref("create");
const formSource = ref(null);
const cancelDialog = ref({ open: false, target: null });
const approveDialog = ref({ open: false, target: null });
const rejectDialog = ref({ open: false, target: null });

const routeStatus = computed(() => route.meta.status || "");
const authRoles = computed(() => normalizeRoles(auth.roles));
const currentUserId = computed(() => auth.employeeId || auth.userId || "");
const isReviewer = computed(() => authRoles.value.includes("MANAGER"));
const copyCardMode = computed(() => (isReviewer.value ? "reviewer" : "editor"));

onMounted(loadCopies);

const filtered = computed(() => {
  const list = routeStatus.value
    ? copyStore.byStatus(routeStatus.value)
    : copyStore.byStatus(null);
  const roleScopedList = isReviewer.value
    ? list.filter((copy) => copy.status !== "CANCELED")
    : list;
  const kw = keyword.value.trim().toLowerCase();
  const visibleRows = roleScopedList.map(withReviewPermission);
  if (!kw) return visibleRows;
  return visibleRows.filter((c) =>
    `${c.code}${c.title}${c.content}`.toLowerCase().includes(kw),
  );
});

watch(
  () => route.path,
  () => {
    keyword.value = "";
    loadCopies();
  },
);

const onView = (copy) => {
  selected.value = copy;
  detailOpen.value = true;
};
const onCreate = () => {
  formMode.value = "create";
  formSource.value = null;
  formOpen.value = true;
};
const onCopy = (copy) => {
  formMode.value = "copy";
  formSource.value = copy;
  formOpen.value = true;
};
const onCancel = (copy) => {
  cancelDialog.value = {
    open: true,
    target: copy,
  };
};
const onApprove = (copy) => {
  approveDialog.value = {
    open: true,
    target: copy,
  };
};
const onReject = (copy) => {
  rejectDialog.value = {
    open: true,
    target: copy,
  };
};
const confirmCancel = async () => {
  try {
    if (cancelDialog.value.target) {
      await copyStore.cancelSubmission(cancelDialog.value.target.changeRequestId);
      await loadCopies({ force: true });
    }
  } catch (error) {
    console.error(error);
  } finally {
    cancelDialog.value = { open: false, target: null };
  }
};
const confirmApprove = async () => {
  try {
    if (approveDialog.value.target) {
      await copyStore.approveSubmission(approveDialog.value.target.changeRequestId);
      await loadCopies({ force: true });
    }
  } catch (error) {
    console.error(error);
  } finally {
    approveDialog.value = { open: false, target: null };
  }
};
const confirmReject = async (reason) => {
  try {
    if (rejectDialog.value.target) {
      await copyStore.rejectSubmission(rejectDialog.value.target.changeRequestId, reason);
      await loadCopies({ force: true });
    }
  } catch (error) {
    console.error(error);
  } finally {
    rejectDialog.value = { open: false, target: null };
  }
};
const onSubmitted = () => {
  loadCopies({ force: true });
};

function loadCopies(options = {}) {
  return copyStore.ensureLoaded({
    status: routeStatus.value || undefined,
    force: options.force,
  });
}

function withReviewPermission(copy) {
  const requesterId = copy.requesterId || copy.submittedBy || "";
  return {
    ...copy,
    canReview:
      !currentUserId.value ||
      !requesterId ||
      String(requesterId) !== String(currentUserId.value),
  };
}

const PlusIcon = () => h("img", { src: addIcon, alt: "", "aria-hidden": "true", class: "size-4" });
</script>
