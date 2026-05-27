<template>
  <BaseModal
    v-model="open"
    :title="appStore.alertState.title"
    size="sm"
    body-class="px-6 pt-4 pb-2"
    footer-class="px-6 py-4"
    icon-container-class="bg-danger-bg"
    overlay-class="z-[1000]"
  >
    <template #icon>
      <AlertIcon class="size-6 text-danger-text" />
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

const AlertIcon = (_props = {}, context = {}) =>
  h("img", { ...(context?.attrs || {}), src: alertIcon, alt: "", "aria-hidden": "true" });
</script>
