<template>
  <BaseModal :model-value="modelValue" title="新增人員" subtitle="" size="sm" panel-class="shadow-popup"
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
          <BaseSelect v-model="form.orgId" :options="departmentOptions" placeholder="請選擇科別"
            :error="Boolean(errors.orgId)" />
          <p v-if="errors.orgId" class="mt-1.5 text-xs leading-normal text-danger">{{ errors.orgId }}</p>
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
          <BaseSelect v-model="form.role" :options="roleOptions" placeholder="經辦人員" :error="Boolean(errors.role)" />
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
      <BaseButton class="w-48" :loading="submitting" @click="submit">建立帳號</BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, h, reactive, ref, watch } from "vue";

import eyeCloseIcon from "@/assets/loginEyeClose.svg";
import eyeOpenIcon from "@/assets/loginEyeOpen.svg";
import userPlusIcon from "@/assets/userplus.svg";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import BaseSelect from "@/components/base/BaseSelect.vue";
import { getOrganizations } from "@/services/organizationService";
import { createUser } from "@/services/userService";
import { useAppStore } from "@/stores/appStore";
import { useRoleStore } from "@/stores/roleStore";
import { isActiveSectionOrganization, roleLabelMap } from "@/utils/constants";
import {
  resolveApiErrorMessage,
  resolveDeletedDuplicateMessage,
} from "@/utils/resolveApiErrorMessage";
import {
  normalizeEmployeeId,
  validateEmployeeId,
  validatePassword,
} from "@/utils/validators";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "submitted"]);

const appStore = useAppStore();
const roleStore = useRoleStore();
const roleOptions = computed(() => roleStore.assignableRoleOptions);
const form = reactive({
  id: "",
  orgId: "",
  password: "",
  userName: "",
  role: "USER",
});
const errors = reactive({ id: "", orgId: "", password: "", userName: "", role: "" });
const showPassword = ref(false);
const organizations = ref([]);
const submitting = ref(false);

const departmentOptions = computed(() => {
  const organizationRows = Array.isArray(organizations.value) ? organizations.value : [];
  return organizationRows.filter(isActiveSectionOrganization).map((org) => ({
    label: org.orgName,
    value: org.id,
  }));
});

const selectedOrganization = computed(() =>
  (Array.isArray(organizations.value) ? organizations.value : []).find(
    (org) => Number(org.id) === Number(form.orgId),
  ),
);

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    Object.assign(form, {
      id: "",
      orgId: departmentOptions.value[0]?.value || "",
      password: "",
      userName: "",
      role: "USER",
    });
    clearErrors();
    showPassword.value = false;
    roleStore.ensureLoaded();
    fetchOrganizations();
  },
);

function clearErrors() {
  Object.assign(errors, { id: "", orgId: "", password: "", userName: "", role: "" });
}

function validate() {
  clearErrors();
  const normalizedId = normalizeEmployeeId(form.id);
  errors.id = validateEmployeeId(form.id);
  errors.orgId = form.orgId ? "" : "請選擇科別";
  errors.password = validatePassword(form.password, normalizedId);
  errors.userName = form.userName ? "" : "請輸入人員姓名";
  errors.role = form.role ? "" : "請選擇權限等級";
  return !errors.id && !errors.orgId && !errors.password && !errors.userName && !errors.role;
}

async function submit() {
  if (!validate()) return;
  const id = normalizeEmployeeId(form.id);
  const roleIds = [roleStore.roleNameToId[form.role]].filter(Boolean);
  const payload = {
    id,
    password: form.password,
    userName: form.userName,
    orgId: Number(form.orgId),
    roleIds,
  };
  submitting.value = true;
  try {
    await createUser(payload);
    emit("submitted", {
      ...payload,
      orgName: selectedOrganization.value?.orgName || "",
      status: "PENDING",
      role: form.role,
      roleLabel: roleLabelMap[form.role],
    });
    close();
  } catch (error) {
    console.error(error);
    appStore.showAlert({
      title: "建立帳號失敗",
      message:
        resolveDeletedDuplicateMessage(error, "ACCOUNT") || resolveApiErrorMessage(error),
    });
  } finally {
    submitting.value = false;
  }
}

function close() {
  emit("update:modelValue", false);
}

async function fetchOrganizations() {
  try {
    organizations.value = normalizeOrganizationRows(await getOrganizations({ status: "ACTIVE" }));
    if (!form.orgId) form.orgId = departmentOptions.value[0]?.value || "";
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

const UserPlusIcon = (_props = {}, context = {}) =>
  h("img", { ...(context?.attrs || {}), src: userPlusIcon, alt: "", "aria-hidden": "true" });

const EyeIcon = (props) =>
  h("img", { src: props.open ? eyeOpenIcon : eyeCloseIcon, alt: "", "aria-hidden": "true", class: "size-6" });
</script>
