<template>
  <form
    class="max-w-3xl rounded-lg border border-border-muted bg-background-surface p-5"
    @submit.prevent="submit"
  >
    <div class="grid gap-4 md:grid-cols-2">
      <FormField
        v-if="mode === 'create'"
        label="帳號"
        required
        :error="errors.id"
      >
        <BaseInput v-model="form.id" placeholder="1-7 碼英數字" />
      </FormField>
      <FormField
        v-if="mode === 'create'"
        label="密碼"
        required
        :error="errors.password"
      >
        <BaseInput v-model="form.password" type="password" />
      </FormField>
      <FormField label="使用者名稱" required :error="errors.userName">
        <BaseInput v-model="form.userName" />
      </FormField>
      <FormField label="組織" required :error="errors.orgId">
        <BaseSelect v-model="form.orgId" :options="orgOptions" />
      </FormField>
      <FormField label="角色">
        <div class="grid gap-2 rounded-md border border-border-muted p-3">
          <label
            v-for="role in roles"
            :key="role.id"
            class="flex items-center gap-2 text-sm"
          >
            <input v-model="form.roleIds" type="checkbox" :value="role.id" />
            {{ roleLabelMap[role.roleName] || role.roleName }}
          </label>
        </div>
      </FormField>
    </div>
    <p
      v-if="message"
      class="mt-4 rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-700"
    >
      {{ message }}
    </p>
    <div class="mt-6 flex justify-end gap-3">
      <RouterLink to="/users"
        ><BaseButton variant="secondary">取消</BaseButton></RouterLink
      >
      <BaseButton type="submit" :loading="loading">{{
        mode === "create" ? "送出新增審核" : "送出修改申請"
      }}</BaseButton>
    </div>
  </form>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import BaseButton from "@/components/base/BaseButton.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import BaseSelect from "@/components/base/BaseSelect.vue";
import FormField from "@/components/forms/FormField.vue";
import { getOrganizations } from "@/services/organizationService";
import { getRoles } from "@/services/roleService";
import { createUser, getUserById, updateUser } from "@/services/userService";
import { roleLabelMap } from "@/utils/constants";
import { validateRequired, validateUserId } from "@/utils/validators";

const props = defineProps({
  mode: { type: String, default: "create" },
  userId: { type: String, default: "" },
});

const router = useRouter();
const roles = ref([]);
const organizations = ref([]);
const orgOptions = computed(() =>
  organizations.value.map((org) => ({
    label: org.orgName,
    value: org.id,
  })),
);
const form = reactive({
  id: "",
  password: "",
  userName: "",
  orgId: "",
  roleIds: [],
});
const errors = reactive({});
const loading = ref(false);
const message = ref("");

onMounted(async () => {
  const [roleRows, organizationRows] = await Promise.all([
    getRoles(),
    getOrganizations(),
  ]);
  roles.value = Array.isArray(roleRows) ? roleRows : [];
  organizations.value = Array.isArray(organizationRows) ? organizationRows : [];
  if (props.mode !== "edit" || !props.userId) return;
  const source = await getUserById({ id: props.userId });
  form.id = source?.id || "";
  form.userName = source?.userName || "";
  form.orgId = source?.orgId || "";
  form.roleIds =
    source?.roles
      ?.map((role) => roles.value.find((item) => item.roleName === role)?.id)
      .filter(Boolean) || [];
});

async function submit() {
  errors.id = props.mode === "create" ? validateUserId(form.id) : "";
  errors.password =
    props.mode === "create" ? validateRequired(form.password, "密碼") : "";
  errors.userName = validateRequired(form.userName, "使用者名稱");
  errors.orgId = validateRequired(form.orgId, "組織");
  if (Object.values(errors).some(Boolean)) return;

  loading.value = true;
  try {
    if (props.mode === "create") await createUser(form);
    else await updateUser({ id: props.userId, ...form });
    message.value =
      props.mode === "create"
        ? "新增申請已送出，等待審核。"
        : "修改申請已送出，等待審核。";
    setTimeout(() => router.push("/users"), 700);
  } finally {
    loading.value = false;
  }
}
</script>
