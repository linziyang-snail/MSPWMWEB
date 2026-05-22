<template>
  <BaseModal :model-value="modelValue" :title="title" :subtitle="subtitle" size="sm" body-class="px-6 pt-4 pb-2"
    footer-class="h-sidebar-logo gap-4 rounded-b-2xl border-t-0 bg-background-page px-6 py-6"
    :icon-container-class="iconBg" @update:model-value="$emit('update:modelValue', $event)">
    <template #icon>
      <img :src="iconSrc" alt="" aria-hidden="true" class="size-6" />
    </template>

    <p class="text-sm leading-6 text-text-secondary">{{ message }}</p>

    <template #footer>
      <BaseButton class="h-10 w-48 gap-2.5 border-text-grey bg-background-surface px-4 py-2.5" variant="secondary"
        @click="$emit('update:modelValue', false)">
        取消
      </BaseButton>
      <BaseButton class="h-10 w-48 px-7 py-2 shadow-control" :variant="danger ? 'danger' : 'primary'" :loading="loading"
        @click="$emit('confirm')">
        {{ confirmText }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed } from "vue";

import infoCircleIcon from "@/assets/alertcircle.svg";
import checkCircleBlueIcon from "@/assets/icon-check-circle-blue.svg";
import xCircleIcon from "@/assets/icon-x-circle.svg";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseModal from "@/components/base/BaseModal.vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: "確認操作" },
  subtitle: { type: String, default: "" },
  message: { type: String, default: "請確認是否執行此操作。" },
  confirmText: { type: String, default: "確認" },
  /** danger — 紅色驚嘆 icon + 紅色確認按鈕 */
  danger: { type: Boolean, default: false },
  /** success — 綠色勾 icon (e.g. 核准) */
  success: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
});

defineEmits(["update:modelValue", "confirm"]);

const iconBg = computed(() => {
  if (props.danger) return "bg-danger-bg";
  if (props.success) return "bg-success-bg";
  return "bg-primary-soft";
});

const iconSrc = computed(() => {
  if (props.danger) return xCircleIcon;
  if (props.success) return checkCircleBlueIcon;
  return infoCircleIcon;
});
</script>
