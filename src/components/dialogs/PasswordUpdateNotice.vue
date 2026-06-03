<template>
  <SystemAlertDialog
    :model-value="modelValue"
    :title="title"
    :message="message"
    type="info"
    confirm-text="確認"
    @update:model-value="$emit('update:modelValue', $event)"
    @confirm="$emit('confirm')"
  />
</template>

<script setup>
import SystemAlertDialog from "@/components/common/SystemAlertDialog.vue";

defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: "請更新您的密碼" },
  message: {
    type: String,
    default:
      "為確保您的帳戶安全，請立即更新登入密碼。密碼更新完成後，請使用新密碼重新登入系統。",
  },
});

defineEmits(["update:modelValue", "confirm"]);
</script>
