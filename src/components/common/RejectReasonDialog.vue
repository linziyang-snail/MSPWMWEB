<template>
  <BaseModal
    :model-value="modelValue"
    :title="title"
    :subtitle="subtitle"
    size="sm"
    body-class="px-6 pt-4 pb-2"
    footer-class="px-6 py-4"
    icon-container-class="bg-danger-bg"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #icon>
      <XCircleIcon class="size-6 text-danger-text" />
    </template>

    <div class="space-y-3">
      <label class="block">
        <span class="mb-2 block text-sm font-bold text-text-primary">
          駁回原因
        </span>
        <textarea
          v-model="reason"
          rows="4"
          :placeholder="`請輸入駁回原因（至少${minLength}個字），以便經辦了解需要修正的內容...`"
          :class="[
            'w-full resize-none rounded-lg border !bg-background-field-muted px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-placeholder focus:ring-2 focus:ring-primary/15',
            errorMsg
              ? 'border-border-error focus:border-border-error'
              : 'border-border-strong focus:border-border-focus',
          ]"
        />
      </label>
      <p v-if="errorMsg" class="text-xs font-medium text-state-red">
        ※ {{ errorMsg }}
      </p>
    </div>

    <template #footer>
      <BaseButton class="min-w-20" variant="secondary" @click="cancel">
        取消
      </BaseButton>
      <BaseButton
        class="min-w-24"
        variant="danger"
        :loading="loading"
        @click="submit"
      >
        確認駁回
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { h, ref, watch } from "vue";

import xCircleIcon from "@/assets/icon-x-circle.svg";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseModal from "@/components/base/BaseModal.vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: "駁回" },
  subtitle: { type: String, default: "" },
  minLength: { type: Number, default: 5 },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "confirm"]);

const reason = ref("");
const errorMsg = ref("");

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      reason.value = "";
      errorMsg.value = "";
    }
  },
);

function validate() {
  const trimmed = reason.value.trim();
  if (!trimmed) {
    errorMsg.value = `駁回原因為必填項目（至少${props.minLength}個字）`;
    return false;
  }
  if (trimmed.length < props.minLength) {
    errorMsg.value = `駁回原因為必填項目（至少${props.minLength}個字）`;
    return false;
  }
  errorMsg.value = "";
  return true;
}

function submit() {
  if (!validate()) return;
  emit("confirm", reason.value.trim());
}

function cancel() {
  emit("update:modelValue", false);
}

const XCircleIcon = (_props = {}, context = {}) =>
  h("img", { ...(context?.attrs || {}), src: xCircleIcon, alt: "", "aria-hidden": "true" });
</script>
