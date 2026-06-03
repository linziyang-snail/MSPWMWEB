<template>
  <BaseModal :model-value="modelValue" title="編輯人員權限" :subtitle="subtitle" size="sm" panel-class="shadow-popup"
    header-class="h-24 px-6 py-6 border-b border-white bg-background-page" body-class="px-6 py-5"
    footer-class="h-20 gap-6 px-6 py-6 border-t-0 bg-background-page" icon-container-class="bg-copy-table-border"
    @update:model-value="$emit('update:modelValue', $event)">
    <template #icon>
      <UserCogIcon class="size-6 text-primary" />
    </template>

    <form class="space-y-6" @submit.prevent="submit">
      <div class="grid grid-cols-2 gap-6">
        <div>
          <label class="block mb-2 text-sm font-bold leading-normal text-natural">員編</label>
          <BaseInput :model-value="form.id" readonly input-class="!bg-background-surface !text-text-grey" />
        </div>
        <div>
          <label class="block mb-2 text-sm font-bold leading-normal text-natural">科別</label>
          <BaseSelect v-model="form.orgId" :options="departmentOptions" />
        </div>
      </div>

      <div>
        <label class="block mb-2 text-sm font-bold leading-normal text-natural">人員姓名</label>
        <BaseInput v-model="form.userName" />
      </div>

      <div class="grid grid-cols-2 gap-6">
        <div>
          <label class="block mb-2 text-sm font-bold leading-normal text-natural">權限等級</label>
          <BaseSelect v-model="form.role" :options="roleOptions" />
        </div>
        <div>
          <label class="block mb-2 text-sm font-bold leading-normal text-natural">帳號狀態</label>
          <div
            class="flex h-10 items-center rounded-lg border border-border bg-background-surface px-3 text-base font-normal leading-normal text-text-grey"
          >
            啟用
          </div>
        </div>
      </div>
      <p v-if="formError" class="text-sm font-medium leading-normal text-danger-text">
        {{ formError }}
      </p>
    </form>

    <template #footer>
      <BaseButton class="w-48" variant="secondary" @click="close">取消</BaseButton>
      <BaseButton class="w-48" @click="submit">儲存變更</BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, h, reactive, ref, watch } from "vue";

import userCogIcon from "@/assets/useredit.svg";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import BaseSelect from "@/components/base/BaseSelect.vue";
import { getOrganizations } from "@/services/organizationService";
import { isActiveSectionOrganization, roleLabelMap } from "@/utils/constants";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  account: { type: Object, default: null },
});

const emit = defineEmits(["update:modelValue", "submitted"]);

const roleOptions = [
  { label: "經辦人員", value: "USER" },
  { label: "覆核主管", value: "MANAGER" },
  { label: "超級管理員", value: "ADMIN" },
];
const roleValueMap = {
  經辦: "USER",
  經辦人員: "USER",
  一般經辦: "USER",
  覆核主管: "MANAGER",
  超級管理員: "ADMIN",
};

const form = reactive({
  id: "",
  orgId: "",
  userName: "",
  role: "USER",
});
const organizations = ref([]);
const formError = ref("");

const departmentOptions = computed(() => {
  const rows = Array.isArray(organizations.value) ? organizations.value : [];
  return rows
    .filter(isActiveSectionOrganization)
    .map((org) => ({ label: org.orgName, value: org.id }));
});

const selectedOrganization = computed(() =>
  (Array.isArray(organizations.value) ? organizations.value : []).find(
    (org) => Number(org.id) === Number(form.orgId),
  ),
);

const subtitle = computed(() => `員編：${props.account?.id || ""}`);

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    syncForm();
    fetchOrganizations();
  },
);

function syncForm() {
  formError.value = "";
  Object.assign(form, {
    id: props.account?.id || "",
    orgId: props.account?.orgId != null ? Number(props.account.orgId) : "",
    userName: props.account?.userName || "",
    role: roleValueMap[props.account?.roleLabel] || props.account?.roles?.[0] || "USER",
  });
}

function submit() {
  formError.value = "";
  if (!form.orgId) {
    formError.value = "原科別已不存在，請重新選擇科別";
    return;
  }
  if (!hasProfileChanges()) {
    formError.value = "資料未異動";
    return;
  }
  emit("submitted", {
    id: form.id,
    userName: form.userName,
    orgId: Number(form.orgId),
    orgName: selectedOrganization.value?.orgName || props.account?.orgName || "",
    roles: [form.role],
    roleLabel: roleLabelMap[form.role],
  });
  close();
}

function hasProfileChanges() {
  const originalOrgId = props.account?.orgId;
  const orgChanged = hasOriginalOrgId()
    ? Number(originalOrgId) !== Number(form.orgId)
    : normalizeText(props.account?.orgName) !== normalizeText(selectedOrganization.value?.orgName || props.account?.orgName);
  return (
    normalizeText(props.account?.userName) !== normalizeText(form.userName) ||
    orgChanged ||
    getOriginalRole() !== form.role
  );
}

function hasOriginalOrgId() {
  return props.account?.orgId != null && props.account?.orgId !== "";
}

function getOriginalRole() {
  return roleValueMap[props.account?.roleLabel] || props.account?.roles?.[0] || "USER";
}

function normalizeText(value) {
  return String(value || "").trim();
}

async function fetchOrganizations() {
  try {
    organizations.value = normalizeOrganizationRows(await getOrganizations({ status: "ACTIVE" }));
    if (!form.orgId) {
      const originalOrganization = departmentOptions.value.find(
        (option) => normalizeText(option.label) === normalizeText(props.account?.orgName),
      );
      form.orgId = originalOrganization?.value || "";
    }
  } catch (error) {
    console.error(error);
  }
}

function normalizeOrganizationRows(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.body)) return response.body;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.body?.content)) return response.body.content;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.content)) return response.data.content;
  return [];
}

function close() {
  emit("update:modelValue", false);
}

const UserCogIcon = (_props = {}, context = {}) =>
  h("img", { ...(context?.attrs || {}), src: userCogIcon, alt: "", "aria-hidden": "true" });
</script>
