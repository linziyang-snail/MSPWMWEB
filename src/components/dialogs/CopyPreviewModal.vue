<template>
  <BaseModal :model-value="modelValue" :icon="previewIcon" title="文案預覽" subtitle="輸入測試值以查看實際內容" size="preview"
    panel-class="shadow-popup"
    header-class="h-24 border-b border-white bg-background-page px-6 py-6 [&_h2]:text-text-heading [&_h2]:leading-normal [&_h2]:tracking-wide"
    body-class="px-8 pt-8 pb-0"
    footer-class="mx-8 mt-4 border-t border-copy-table-border bg-background-surface px-0 pb-6 pt-4"
    icon-container-class="bg-primary/20" @update:model-value="$emit('update:modelValue', $event)">
    <template #icon>
      <img :src="previewIcon" alt="" class="size-6" />
    </template>

    <div class="space-y-4">
      <!-- 測試參數 -->
      <section v-if="paramCount > 0" class="rounded-2xl border border-copy-table-border bg-background-page p-4">
        <p class="text-sm font-bold leading-normal text-text-heading">測試參數值</p>
        <p class="mt-2 text-xs font-bold leading-normal text-natural">
          請分別輸入參數值，用逗號分隔
        </p>
        <input v-model="paramsInput"
          class="mt-2 h-12 w-full rounded-lg border border-copy-table-border bg-background-surface px-4 py-3 text-sm text-natural outline-none placeholder:text-natural focus:border-border-focus focus:ring-2 focus:ring-primary/15"
          :placeholder="paramPlaceholder" type="text" />
        <p class="mt-2 text-xs font-normal leading-normal text-natural">
          提示：按照參數順序，用逗號分隔多個值
        </p>
      </section>

      <!-- 手機預覽框 -->
      <section
        class="rounded-2xl bg-linear-to-br from-slate-200 via-slate-300 to-slate-400 px-28 pt-8 pb-7">
        <div class="mb-5 flex items-center justify-between px-2 text-xs font-bold text-text-heading">
          <span>9:41</span>
          <span class="inline-flex items-center gap-1">
            <span class="h-2.5 w-4 rounded-full border border-text-heading"></span>
            <span class="size-1 rounded-full bg-text-heading"></span>
          </span>
        </div>

        <div
          class="h-40 w-96 overflow-hidden rounded-2xl bg-background-surface p-4 shadow-popup">
          <div class="flex items-start gap-3">
            <div
              class="grid size-10 shrink-0 place-items-center rounded-lg bg-background-surface shadow-md">
              <img :src="ubotLogoSmall" alt="" class="size-8" />
            </div>
            <div class="min-w-0 flex-1 overflow-hidden">
              <div class="flex items-center justify-between gap-2">
                <p class="text-sm font-bold leading-normal text-text-heading">聯邦銀行</p>
                <span class="text-xs font-normal leading-4 text-text-grey">現在</span>
              </div>
              <p v-if="title" class="mt-0.5 text-sm font-bold leading-normal text-text-heading">
                {{ title }}
              </p>
              <p
                class="mt-1 max-h-16 overflow-hidden wrap-break-word text-sm font-normal leading-normal text-text-heading">
                {{ renderedContent || "（請輸入文案內容）" }}
              </p>
            </div>
          </div>
        </div>

        <div class="mt-5 text-center text-xs text-natural">
          向上滑動以查看通知
        </div>
      </section>

      <!-- 參數對照表 (有參數且已輸入值時顯示) -->
      <section v-if="paramCount > 0 && paramValues.length"
        class="rounded-2xl border border-copy-table-border bg-background-page p-4">
        <p class="text-xs font-bold leading-normal text-natural">參數對照表</p>
        <div class="mt-3 space-y-2">
          <div v-for="(param, i) in paramMatches" :key="i"
            class="grid grid-cols-4 items-center gap-3 text-xs leading-normal">
            <span class="font-bold text-natural">參數{{ i + 1 }}</span>
            <span
              class="rounded border border-copy-table-border bg-background-surface px-2 py-1 font-normal text-natural">
              |$|{{ param }}|$|
            </span>
            <span class="text-center text-text-grey">→</span>
            <span class="font-bold text-primary">{{ paramValues[i] || "" }}</span>
          </div>
        </div>
      </section>
    </div>

    <template #footer>
      <BaseButton variant="secondary" @click="$emit('update:modelValue', false)">
        關閉
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, ref, watch } from "vue";

import previewIcon from "@/assets/eye.svg";
import ubotLogoSmall from "@/assets/ubotLogo_small.svg";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseModal from "@/components/base/BaseModal.vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: "" },
  content: { type: String, default: "" },
});

defineEmits(["update:modelValue"]);

const paramsInput = ref("");

watch(
  () => props.modelValue,
  (open) => {
    if (open) paramsInput.value = "";
  },
);

const paramMatches = computed(() => {
  if (!props.content) return [];
  return [...props.content.matchAll(/\|\$\|([^|]+)\|\$\|/g)].map((m) => m[1]);
});

const paramCount = computed(() => paramMatches.value.length);

const paramValues = computed(() =>
  paramsInput.value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean),
);

const paramPlaceholder = computed(() => {
  if (!paramMatches.value.length) return "";
  return `例如：${paramMatches.value.map((_, i) => `值${i + 1}`).join(", ")}`;
});

const renderedContent = computed(() => {
  return props.content || "";
});
</script>
