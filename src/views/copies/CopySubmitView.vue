<template>
  <div>
    <PageTitle
      title="文案送審"
      description="依 Swagger 欄位建立推播文案送審表單。"
      eyebrow="Copy"
    />
    <form
      class="max-w-5xl rounded-lg border border-border-muted bg-background-surface p-5"
      @submit.prevent="submit"
    >
      <div class="grid gap-4 md:grid-cols-2">
        <FormField label="文案編號" required :error="errors.number"
          ><BaseInput v-model="form.number"
        /></FormField>
        <FormField label="文案標題" required :error="errors.title"
          ><BaseInput v-model="form.title"
        /></FormField>
        <FormField label="數存訊息分類"
          ><BaseInput v-model="form.nnbCategory"
        /></FormField>
        <FormField label="行銀訊息分類"
          ><BaseInput v-model="form.wbkCategory"
        /></FormField>
        <FormField label="點擊行為" required :error="errors.clickAction"
          ><BaseSelect v-model="form.clickAction" :options="clickOptions"
        /></FormField>
        <FormField label="效期設定" required :error="errors.expirationType"
          ><BaseSelect
            v-model="form.expirationType"
            :options="expirationOptions"
        /></FormField>
        <FormField
          v-if="form.clickAction !== 'NONE'"
          label="超連結 / 頁面"
          :required="form.clickAction === 'OPEN_URL'"
          :error="errors.url"
          ><BaseInput v-model="form.url"
        /></FormField>
        <FormField
          v-if="form.expirationType === 'RETENTION_MONTHS'"
          label="保留月數"
          required
          :error="errors.retentionMonths"
          ><BaseInput v-model="form.retentionMonths" type="number"
        /></FormField>
        <FormField
          v-if="form.expirationType === 'EXPIRED_AT'"
          label="到期時間"
          required
          :error="errors.expiredAt"
          ><BaseInput v-model="form.expiredAt" type="datetime-local"
        /></FormField>
        <FormField
          class="md:col-span-2"
          label="文案內容"
          required
          :error="errors.content"
          ><BaseTextarea v-model="form.content" :rows="7"
        /></FormField>
      </div>
      <p
        v-if="message"
        class="mt-4 rounded-md bg-success-bg px-3 py-2 text-sm text-success-text"
      >
        {{ message }}
      </p>
      <div class="mt-6 flex justify-end gap-3">
        <BaseButton variant="secondary" @click="reset">清除</BaseButton>
        <BaseButton type="submit" :loading="loading">送出審核</BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";

import BaseButton from "@/components/base/BaseButton.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import BaseSelect from "@/components/base/BaseSelect.vue";
import BaseTextarea from "@/components/base/BaseTextarea.vue";
import PageTitle from "@/components/common/PageTitle.vue";
import FormField from "@/components/forms/FormField.vue";
import { submitCopy } from "@/services/copyService";
import {
  CLICK_ACTION_OPTIONS,
  EXPIRATION_TYPE_OPTIONS,
} from "@/utils/constants";
import { validateCopyForm } from "@/utils/validators";

const clickOptions = CLICK_ACTION_OPTIONS;
const expirationOptions = EXPIRATION_TYPE_OPTIONS;
const initial = {
  number: "",
  title: "",
  content: "",
  nnbCategory: "",
  wbkCategory: "",
  url: "",
  clickAction: "NONE",
  expirationType: "NONE",
  retentionMonths: "",
  expiredAt: "",
};
const form = reactive({ ...initial });
const errors = reactive({});
const loading = ref(false);
const message = ref("");

function reset() {
  Object.assign(form, initial);
  Object.keys(errors).forEach((key) => (errors[key] = ""));
}

async function submit() {
  Object.assign(errors, validateCopyForm(form));
  if (Object.values(errors).some(Boolean)) return;
  loading.value = true;
  try {
    await submitCopy(form);
    message.value = "文案已送出審核。";
    reset();
  } finally {
    loading.value = false;
  }
}
</script>
