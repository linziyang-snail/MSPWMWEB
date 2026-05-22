<template>
  <div>
    <PageTitle title="修改個人密碼" eyebrow="帳號設定" />
    <form
      class="max-w-form-card rounded-xl border border-border-muted bg-background-surface p-6 shadow-card"
      @submit.prevent="submit"
    >
      <div class="space-y-5">
        <FormField label="原密碼" required :error="errors.oldPassword">
          <BaseInput
            v-model="form.oldPassword"
            type="password"
            :error="Boolean(errors.oldPassword)"
            placeholder="請輸入原密碼"
          />
        </FormField>
        <FormField label="新密碼" required :error="errors.newPassword">
          <BaseInput
            v-model="form.newPassword"
            type="password"
            :error="Boolean(errors.newPassword)"
            placeholder="請輸入新密碼"
          />
        </FormField>
        <FormField label="確認新密碼" required :error="errors.confirmPassword">
          <BaseInput
            v-model="form.confirmPassword"
            type="password"
            :error="Boolean(errors.confirmPassword)"
            placeholder="請再次輸入新密碼"
          />
        </FormField>
      </div>
      <p
        v-if="message"
        class="mt-5 rounded-lg bg-success-bg px-4 py-3 text-sm font-bold text-success-text"
      >
        {{ message }}
      </p>
      <div class="mt-8 flex justify-end gap-3">
        <BaseButton variant="secondary" type="button" @click="reset"
          >取消</BaseButton
        >
        <BaseButton type="submit" :loading="loading">送出</BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";

import BaseButton from "@/components/base/BaseButton.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import PageTitle from "@/components/common/PageTitle.vue";
import FormField from "@/components/forms/FormField.vue";
import { changeMyPassword } from "@/services/userService";
import { validateRequired } from "@/utils/validators";

const form = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});
const errors = reactive({});
const loading = ref(false);
const message = ref("");

function reset() {
  form.oldPassword = "";
  form.newPassword = "";
  form.confirmPassword = "";
  message.value = "";
  errors.oldPassword = "";
  errors.newPassword = "";
  errors.confirmPassword = "";
}

async function submit() {
  errors.oldPassword = validateRequired(form.oldPassword, "原密碼");
  errors.newPassword = validateRequired(form.newPassword, "新密碼");
  errors.confirmPassword = validateRequired(form.confirmPassword, "確認新密碼");
  if (!errors.confirmPassword && form.newPassword !== form.confirmPassword)
    errors.confirmPassword = "兩次輸入的新密碼不一致";
  if (Object.values(errors).some(Boolean)) return;
  loading.value = true;
  try {
    await changeMyPassword({
      oldPassword: form.oldPassword,
      newPassword: form.newPassword,
    });
    message.value = "密碼已更新。";
  } finally {
    loading.value = false;
  }
}
</script>
