<template>
  <SystemAlertDialog
    v-model="open"
    :title="appStore.alertState.title"
    :message="appStore.alertState.message"
    :type="appStore.alertState.variant"
    :confirm-text="appStore.alertState.confirmText"
    @confirm="appStore.hideAlert"
  />
</template>

<script setup>
import { computed } from "vue";

import SystemAlertDialog from "@/components/common/SystemAlertDialog.vue";
import { useAppStore } from "@/stores/appStore";

const appStore = useAppStore();

const open = computed({
  get: () => appStore.alertState.open,
  set: (value) => {
    if (!value) appStore.hideAlert();
  },
});
</script>
