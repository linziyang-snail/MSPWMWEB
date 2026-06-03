<template>
  <BaseModal
    v-model="open"
    :title="appStore.alertState.title"
    size="sm"
    body-class="px-6 pt-4 pb-2"
    footer-class="px-6 py-4"
    :icon-container-class="iconContainerClass"
    overlay-class="z-[1000]"
  >
    <template #icon>
      <AlertIcon :class="iconClass" />
    </template>

    <p class="text-sm leading-6 text-text-secondary">
      {{ appStore.alertState.message }}
    </p>

    <template #footer>
      <BaseButton class="min-w-24" variant="primary" @click="appStore.hideAlert">
        {{ appStore.alertState.confirmText }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, h } from "vue";

import alertCircleIcon from "@/assets/alertcircle.svg";
import alertIcon from "@/assets/icon-x-circle.svg";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import { useAppStore } from "@/stores/appStore";

const appStore = useAppStore();

const open = computed({
  get: () => appStore.alertState.open,
  set: (value) => {
    if (!value) appStore.hideAlert();
  },
});

const isInfoAlert = computed(() => ["info", "success", "notice"].includes(appStore.alertState.variant));
const iconContainerClass = computed(() => isInfoAlert.value ? "bg-copy-table-border" : "bg-danger-bg");
const iconClass = computed(() => isInfoAlert.value ? "size-6 text-primary" : "size-6 text-danger-text");

const AlertIcon = (_props = {}, context = {}) =>
  h("img", {
    ...(context?.attrs || {}),
    src: isInfoAlert.value ? alertCircleIcon : alertIcon,
    alt: "",
    "aria-hidden": "true",
  });
</script>
