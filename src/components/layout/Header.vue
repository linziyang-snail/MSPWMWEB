<template>
  <header
    class="sticky top-0 z-20 flex items-center justify-between px-5 border-b h-header border-border-muted bg-background-surface/95 backdrop-blur lg:px-8">
    <div class="flex items-center min-w-0 gap-3">
      <button
        class="grid transition border rounded-lg size-10 place-items-center border-border-muted text-primary hover:bg-primary-subtle lg:hidden"
        type="button" @click="$emit('toggle-sidebar')">
        <span class="text-xl leading-none">≡</span>
      </button>
      <Breadcrumb />
    </div>

    <div class="relative shrink-0" @click.stop>

      目前使用者：<span class="font-bold text-text-primary">{{
        currentUserName
      }}</span>



      <div v-if="open"
        class="absolute right-0 z-30 mt-2 overflow-hidden border rounded-lg w-user-menu border-border-muted bg-background-surface shadow-popup">
        <button
          class="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium leading-6 text-text-secondary transition hover:bg-primary-subtle hover:text-primary"
          type="button" @click="onChangePassword">
          <img :src="keyIcon" alt="" aria-hidden="true" class="size-4" />
          修改個人密碼
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

import Breadcrumb from "@/components/layout/Breadcrumb.vue";
import keyIcon from "@/assets/icon-key.svg";
import { useAuthStore } from "@/stores/authStore";
import { getRoleLabel } from "@/utils/navigation";

const emit = defineEmits(["change-password", "toggle-sidebar"]);

const auth = useAuthStore();
const open = ref(false);

const currentUserName = computed(
  () => auth.userName || getRoleLabel(auth.roles) || "陳小華",
);

function onChangePassword() {
  open.value = false;
  emit("change-password");
}

function onDocClick() {
  open.value = false;
}

onMounted(() => document.addEventListener("click", onDocClick));
onBeforeUnmount(() => document.removeEventListener("click", onDocClick));
</script>
