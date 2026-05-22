<template>
  <BaseModal
    :model-value="modelValue"
    title="編輯人員權限"
    :subtitle="subtitle"
    size="sm"
    panel-class="shadow-popup"
    header-class="h-24 border-b border-white bg-background-page px-6 py-6"
    body-class="px-6 py-5"
    footer-class="h-20 gap-6 border-t-0 bg-background-page px-6 py-6"
    icon-container-class="bg-copy-table-border"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #icon>
      <UserCogIcon class="size-6 text-primary" />
    </template>

    <form class="space-y-6" @submit.prevent="submit">
      <div class="grid grid-cols-2 gap-6">
        <div>
          <label class="mb-2 block text-sm font-bold leading-normal text-natural">員編(唯讀)</label>
          <BaseInput :model-value="form.id" readonly input-class="!bg-background-surface !text-text-grey" />
        </div>
        <div>
          <label class="mb-2 block text-sm font-bold leading-normal text-natural">科別</label>
          <BaseSelect v-model="form.orgName" :options="departmentOptions" />
        </div>
      </div>

      <div>
        <label class="mb-2 block text-sm font-bold leading-normal text-natural">人員姓名</label>
        <BaseInput v-model="form.userName" />
      </div>

      <div class="grid grid-cols-2 gap-6">
        <div>
          <label class="mb-2 block text-sm font-bold leading-normal text-natural">權限等級</label>
          <BaseSelect v-model="form.role" :options="roleOptions" />
        </div>
        <div>
          <label class="mb-2 block text-sm font-bold leading-normal text-natural">帳號狀態</label>
          <BaseSelect v-model="form.status" :options="statusOptions" />
        </div>
      </div>
    </form>

    <template #footer>
      <BaseButton class="w-48" variant="secondary" @click="close">取消</BaseButton>
      <BaseButton class="w-48" @click="submit">儲存變更</BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, h, reactive, watch } from "vue";

import userCogIcon from "@/assets/useredit.svg";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import BaseSelect from "@/components/base/BaseSelect.vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  account: { type: Object, default: null },
});

const emit = defineEmits(["update:modelValue", "submitted"]);

const departmentOptions = [
  { label: "話務科", value: "話務科" },
  { label: "聯合行銷科", value: "聯合行銷科" },
  { label: "消費促進科", value: "消費促進科" },
];
const roleOptions = [
  { label: "一般經辦", value: "EDITOR" },
  { label: "覆核主管", value: "REVIEWER" },
  { label: "超級管理員", value: "ADMIN" },
];
const statusOptions = [
  { label: "啟用", value: "ACTIVE" },
  { label: "停用", value: "DISABLED" },
];
const roleLabelMap = {
  EDITOR: "經辦",
  REVIEWER: "覆核主管",
  ADMIN: "超級管理員",
};
const roleValueMap = {
  經辦: "EDITOR",
  一般經辦: "EDITOR",
  覆核主管: "REVIEWER",
  超級管理員: "ADMIN",
};

const form = reactive({
  id: "",
  orgName: "話務科",
  userName: "",
  role: "EDITOR",
  status: "ACTIVE",
});

const subtitle = computed(() => `員編：${props.account?.id || "1193285"}`);

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    syncForm();
  },
);

function syncForm() {
  Object.assign(form, {
    id: props.account?.id || "1193285",
    orgName: props.account?.orgName || "話務科",
    userName: props.account?.userName || "王吳王",
    role: roleValueMap[props.account?.roleLabel] || props.account?.roles?.[0] || "EDITOR",
    status: props.account?.status || "ACTIVE",
  });
}

function submit() {
  emit("submitted", {
    id: form.id,
    userName: form.userName,
    orgName: form.orgName,
    status: form.status,
    originalStatus: props.account?.status || "",
    roles: [form.role],
    roleLabel: roleLabelMap[form.role],
  });
  close();
}

function close() {
  emit("update:modelValue", false);
}

const UserCogIcon = (_props = {}, context = {}) =>
  h("img", { ...(context?.attrs || {}), src: userCogIcon, alt: "", "aria-hidden": "true" });
</script>
