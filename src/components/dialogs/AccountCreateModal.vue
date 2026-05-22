<template>
  <BaseModal :model-value="modelValue" title="新增人員" subtitle="員編：1193285" size="sm" panel-class="shadow-popup"
    header-class="h-24 border-b border-white bg-background-page px-6 py-6" body-class="px-6 py-5"
    footer-class="h-sidebar-logo gap-6 border-t-0 bg-background-page px-6 py-6"
    icon-container-class="bg-copy-table-border" @update:model-value="$emit('update:modelValue', $event)">
    <template #icon>
      <UserPlusIcon class="size-6 text-primary" />
    </template>

    <form class="space-y-5" @submit.prevent="submit">
      <div class="grid grid-cols-2 gap-6">
        <div>
          <label class="mb-2 block text-sm font-bold leading-normal text-natural">員編</label>
          <BaseInput v-model="form.id" placeholder="請輸入員編(限數字)" :error="Boolean(errors.id)" />
          <p v-if="errors.id" class="mt-1.5 text-xs leading-normal text-danger">{{ errors.id }}</p>
        </div>
        <div>
          <label class="mb-2 block text-sm font-bold leading-normal text-natural">科別</label>
          <BaseSelect v-model="form.orgName" :options="departmentOptions" placeholder="話務科"
            :error="Boolean(errors.orgName)" />
          <p v-if="errors.orgName" class="mt-1.5 text-xs leading-normal text-danger">{{ errors.orgName }}</p>
        </div>
      </div>

      <div>
        <label class="mb-2 block text-sm font-bold leading-normal text-natural">設定密碼 *</label>
        <span class="relative block">
          <input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="至少12個字元（必填)" :class="[
            'h-10 w-full rounded-lg border bg-background-surface px-4 py-2 pr-12 text-base font-normal leading-normal text-natural outline-none transition placeholder:text-text-grey focus:border-border-focus focus:ring-2 focus:ring-primary/15',
            errors.password ? 'border-border-error' : 'border-copy-table-border',
          ]" />
          <button
            class="absolute grid -translate-y-1/2 right-3 top-1/2 size-6 place-items-center text-text-grey hover:text-primary"
            type="button" tabindex="-1" @click="showPassword = !showPassword">
            <EyeIcon :open="showPassword" />
          </button>
        </span>
        <p class="mt-1.5 text-xs leading-normal" :class="errors.password ? 'text-danger' : 'text-text-grey'">
          {{ errors.password || "密碼必須至少12個字元" }}
        </p>
      </div>

      <div>
        <label class="mb-2 block text-sm font-bold leading-normal text-natural">人員姓名</label>
        <BaseInput v-model="form.userName" placeholder="請輸入中文姓名" :error="Boolean(errors.userName)" />
        <p v-if="errors.userName" class="mt-1.5 text-xs leading-normal text-danger">{{ errors.userName }}</p>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <div>
          <label class="mb-2 block text-sm font-bold leading-normal text-natural">權限等級</label>
          <BaseSelect v-model="form.role" :options="roleOptions" placeholder="經辦" :error="Boolean(errors.role)" />
          <p v-if="errors.role" class="mt-1.5 text-xs leading-normal text-danger">{{ errors.role }}</p>
        </div>
        <div>
          <label class="mb-2 block text-sm font-bold leading-normal text-natural ">帳號狀態</label>
          <BaseInput model-value="啟用" readonly input-class="!bg-background-field-muted !text-text-grey" />
        </div>
      </div>

      <div class="pt-6 text-sm font-normal leading-normal text-text-grey">
        <p>密碼規則：</p>
        <ol class="pl-6 list-decimal">
          <li>組成有英文大小寫、數字、符號，前面組成 4 選 3。</li>
          <li>密碼最少12碼。</li>
          <li>不可以和前四代密碼一樣。</li>
          <li>密碼30天需要換。</li>
        </ol>
      </div>
    </form>

    <template #footer>
      <BaseButton class="w-48" variant="secondary" @click="close">取消</BaseButton>
      <BaseButton class="w-48" @click="submit">建立帳號</BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { h, reactive, ref, watch } from "vue";

import eyeCloseIcon from "@/assets/loginEyeClose.svg";
import eyeOpenIcon from "@/assets/loginEyeOpen.svg";
import userPlusIcon from "@/assets/userplus.svg";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import BaseSelect from "@/components/base/BaseSelect.vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
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
const roleLabelMap = {
  EDITOR: "經辦",
  REVIEWER: "覆核主管",
  ADMIN: "超級管理員",
};

const form = reactive({
  id: "",
  orgName: "話務科",
  password: "",
  userName: "",
  role: "EDITOR",
});
const errors = reactive({ id: "", orgName: "", password: "", userName: "", role: "" });
const showPassword = ref(false);

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    Object.assign(form, {
      id: "",
      orgName: "話務科",
      password: "",
      userName: "",
      role: "EDITOR",
    });
    clearErrors();
    showPassword.value = false;
  },
);

function clearErrors() {
  Object.assign(errors, { id: "", orgName: "", password: "", userName: "", role: "" });
}

function validate() {
  clearErrors();
  errors.id = form.id ? (/^\d+$/.test(form.id) ? "" : "員編限輸入數字") : "請輸入員編";
  errors.orgName = form.orgName ? "" : "請選擇科別";
  errors.password = !form.password
    ? "密碼必須至少12個字元"
    : form.password.length < 12
      ? "密碼必須至少12個字元"
      : "";
  errors.userName = form.userName ? "" : "請輸入人員姓名";
  errors.role = form.role ? "" : "請選擇權限等級";
  return !errors.id && !errors.orgName && !errors.password && !errors.userName && !errors.role;
}

function submit() {
  if (!validate()) return;
  emit("submitted", {
    id: form.id,
    userName: form.userName,
    orgName: form.orgName,
    password: form.password,
    status: "PENDING",
    role: form.role,
    roleLabel: roleLabelMap[form.role],
  });
  close();
}

function close() {
  emit("update:modelValue", false);
}

const UserPlusIcon = (_props = {}, context = {}) =>
  h("img", { ...(context?.attrs || {}), src: userPlusIcon, alt: "", "aria-hidden": "true" });

const EyeIcon = (props) =>
  h("img", { src: props.open ? eyeOpenIcon : eyeCloseIcon, alt: "", "aria-hidden": "true", class: "size-6" });
</script>
