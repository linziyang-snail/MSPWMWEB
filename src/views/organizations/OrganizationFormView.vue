<template>
  <form
    class="max-w-2xl rounded-lg border border-border-muted bg-background-surface p-5"
    @submit.prevent="submit"
  >
    <div class="grid gap-4 md:grid-cols-2">
      <FormField label="組織名稱" required :error="errors.orgName"
        ><BaseInput v-model="form.orgName"
      /></FormField>
      <FormField
        label="組織類型"
        :required="mode === 'create'"
        :error="errors.orgType"
      >
        <BaseSelect
          v-model="form.orgType"
          :disabled="mode === 'edit'"
          :options="typeOptions"
        />
      </FormField>
    </div>
    <p
      v-if="message"
      class="mt-4 rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-700"
    >
      {{ message }}
    </p>
    <div class="mt-6 flex justify-end gap-3">
      <RouterLink to="/organizations"
        ><BaseButton variant="secondary">取消</BaseButton></RouterLink
      >
      <BaseButton type="submit" :loading="loading">儲存</BaseButton>
    </div>
  </form>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";

import BaseButton from "@/components/base/BaseButton.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import BaseSelect from "@/components/base/BaseSelect.vue";
import FormField from "@/components/forms/FormField.vue";
import { mockOrganizations } from "@/mocks/organizations.mock";
import {
  createOrganization,
  updateOrganization,
} from "@/services/organizationService";
import { validateRequired } from "@/utils/validators";

const props = defineProps({
  mode: { type: String, default: "create" },
  orgId: { type: [String, Number], default: "" },
});
const router = useRouter();
const source = mockOrganizations.find(
  (item) => String(item.id) === String(props.orgId),
);
const form = reactive({
  orgName: source?.orgName || "",
  orgType: source?.orgType || "",
});
const errors = reactive({});
const loading = ref(false);
const message = ref("");
const typeOptions = [
  { label: "總行", value: "HEAD_OFFICE" },
  { label: "部門", value: "DEPARTMENT" },
  { label: "分行", value: "BRANCH" },
];

async function submit() {
  errors.orgName = validateRequired(form.orgName, "組織名稱");
  errors.orgType =
    props.mode === "create" ? validateRequired(form.orgType, "組織類型") : "";
  if (Object.values(errors).some(Boolean)) return;
  loading.value = true;
  try {
    if (props.mode === "create") await createOrganization(form);
    else await updateOrganization({ id: props.orgId, orgName: form.orgName });
    message.value = "組織異動申請已送出。";
    setTimeout(() => router.push("/organizations"), 700);
  } finally {
    loading.value = false;
  }
}
</script>
