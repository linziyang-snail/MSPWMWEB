<!--
 * @FileDescription: 經辦後台左側導覽
 * - 依目前登入角色顯示可用主選單
 * - 不直接掛載彈窗，透過 emit 交給 AppLayout 統一管理
-->
<template>
  <aside
    :class="[
      'fixed inset-y-0 left-0 z-40 flex w-sidebar flex-col border-r border-border bg-background-surface transition-transform lg:translate-x-0',
      open ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <!-- Logo -->
    <div class="flex items-center px-sidebar-gutter h-header">
      <img
        :src="ubotLogo"
        alt="聯邦銀行"
        class="object-contain h-logo-bank-h w-logo-bank-w"
      />
    </div>

    <!-- 主選單 -->
    <nav class="flex-1 overflow-y-auto app-scrollbar px-sidebar-gutter pb-4">
      <section
        v-for="section in visibleSidebarSections"
        :key="section.label"
        class="mb-1"
      >
        <RouterLink
          :to="section.to"
          :class="[
            'relative flex h-sidebar-item items-center gap-2.5 rounded px-4 pr-3.5 text-sm font-medium leading-none text-text-secondary transition hover:bg-primary-soft hover:text-primary',
            isSectionActive(section) &&
              'bg-primary-soft font-bold text-primary',
          ]"
          @click="$emit('close')"
        >
          <SidebarAssetIcon :name="section.icon" />
          <span class="flex-1 min-w-0 truncate">{{ section.label }}</span>
          <span
            v-if="isSectionActive(section)"
            class="absolute top-0 right-0 w-1 rounded-full h-sidebar-item bg-primary"
          />
        </RouterLink>

        <div
          v-if="section.children.length && isSectionActive(section)"
          class="space-y-1 pt-1.5 pb-4 pl-4"
        >
          <RouterLink
            v-for="item in visibleChildren(section)"
            :key="item.to"
            :to="item.to"
            :class="[
              'flex h-sidebar-child items-center rounded px-4 text-sm font-medium leading-none text-text-secondary transition hover:bg-primary-soft hover:font-bold hover:text-primary',
              route.path === item.to &&
                'bg-primary-soft font-bold text-primary',
            ]"
            @click="$emit('close')"
          >
            <span class="flex-1 min-w-0 truncate">{{ item.label }}</span>
            <span v-if="childCount(item)" class="ml-2 font-medium text-current"
              >({{ childCount(item) }})</span
            >
          </RouterLink>
        </div>
      </section>
    </nav>

    <!-- 底部：操作紀錄 / 修改個人密碼 / 登出 -->
    <div class="px-sidebar-gutter pb-6">
      <div class="space-y-3">
        <button
          v-for="item in normalBottomItems"
          :key="item.label"
          class="flex h-sidebar-item w-full items-center gap-2.5 rounded-md border border-border-strong bg-background-surface px-sidebar-gutter text-sm font-medium leading-none text-text-secondary transition hover:border-primary hover:bg-primary-subtle hover:text-primary"
          type="button"
          @click="emitBottomAction(item.action)"
        >
          <SidebarAssetIcon :name="item.icon" />
          <span>{{ item.label }}</span>
        </button>
      </div>

      <div class="mt-6 border-t border-border pt-3.5">
        <button
          class="flex h-sidebar-item w-full items-center gap-2.5 rounded bg-primary-soft px-sidebar-gutter text-left text-sm font-medium leading-none text-primary transition hover:bg-primary-border"
          type="button"
          @click="$emit('logout')"
        >
          <SidebarAssetIcon :name="logoutItem.icon" />
          <span>{{ logoutItem.label }}</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";

import ubotLogo from "@/assets/ubotLogo.svg";
import SidebarAssetIcon from "@/components/layout/SidebarAssetIcon.vue";
import { useAuthStore } from "@/stores/authStore";
import { useCopyStore } from "@/stores/copyStore";
import { useUserStore } from "@/stores/userStore";
import { sidebarBottomItems, sidebarSections } from "@/utils/navigation";

defineProps({
  open: { type: Boolean, default: false },
});

const emit = defineEmits([
  "close",
  "logout",
  "operation-logs",
  "change-password",
]);

const route = useRoute();
const auth = useAuthStore();
const copyStore = useCopyStore();
const userStore = useUserStore();

onMounted(() => {
  copyStore.ensureLoaded();
  userStore.fetchUsers({ size: 200 });
  userStore.fetchAccountChangeRequests();
});

const visibleSidebarSections = computed(() =>
  sidebarSections.filter((section) => {
    if (!section.roles?.length) return true;
    return section.roles.some((role) => auth.roles.includes(role));
  }),
);

const normalBottomItems = computed(() =>
  sidebarBottomItems.filter((item) => {
    if (item.action === "logout") return false;
    if (auth.roles.includes("EDITOR") || auth.roles.includes("REVIEWER")) {
      return item.action === "changePassword";
    }
    return true;
  }),
);
const logoutItem = computed(() =>
  sidebarBottomItems.find((item) => item.action === "logout"),
);

const isSectionActive = (section) => {
  const matches = Array.isArray(section.match)
    ? section.match
    : [section.match];
  return matches.some((match) => route.path.startsWith(match));
};

const visibleChildren = (section) =>
  section.children.filter((item) => {
    if (!item.roles?.length) return true;
    return item.roles.some((role) => auth.roles.includes(role));
  });

const childCount = (item) => {
  if (!item.countKey) return 0;
  if (item.countKey === "accountPendingNew") {
    return userStore.pendingNewCount;
  }
  if (item.countKey === "accountPendingChange") {
    return userStore.pendingChangeCount;
  }
  return copyStore.counts[item.countKey] || 0;
};

const emitBottomAction = (action) => {
  if (action === "operationLogs") emit("operation-logs");
  if (action === "changePassword") emit("change-password");
};
</script>
