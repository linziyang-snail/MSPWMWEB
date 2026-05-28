<template>
  <article
    class="flex flex-col gap-4 rounded-2xl border border-white bg-background-surface p-6 shadow-card">
    <header class="flex items-start justify-between gap-4 pb-4 border-b border-border">
      <div class="flex-1 min-w-0">
        <div class="flex flex-wrap items-start gap-x-14 gap-y-2">
          <div>
            <h3 class="text-xl font-bold leading-7 text-text-primary">
              {{ copy.title }}
            </h3>
            <p class="mt-1 text-sm leading-5 text-text-grey">
              文案編號：{{ copy.code }}
            </p>
          </div>
          <StatusBadge :status="copy.status" label-variant="copy" />

        </div>

      </div>
      <button
        class="inline-flex items-center gap-2 pt-1 text-base font-medium leading-6 transition shrink-0 text-primary hover:text-primary-hover"
        type="button" @click="$emit('view-copy', copy)">
        <EyeIcon /> 查看文案內容
      </button>
    </header>

    <div :class="reviewerMode && copy.status === 'PENDING' ? 'xl:grid xl:grid-cols-12 xl:gap-10' : ''">
      <div class="flex gap-4 rounded-xl border border-primary-border bg-primary-subtle/60 px-5 py-6 xl:col-span-11">
        <div class="pt-0.5">
          <span class="grid rounded-full size-8 place-items-center bg-primary text-text-inverse">
            <DocIcon class="size-4" />
          </span>
        </div>
        <div class="min-w-0">
          <h4 class="mb-4 text-base font-bold leading-6 text-primary">
            文案資訊
          </h4>
          <div class="overflow-hidden border rounded-lg border-copy-table-border bg-background-surface">
            <table class="w-full text-sm table-fixed">
              <tbody>
                <tr>
                  <td
                    class="w-32 border-r border-copy-table-border bg-primary-subtle/70 px-4 py-2.5 align-top text-sm font-medium leading-5 text-natural-text">
                    文案編號
                  </td>
                  <td class="px-4 py-2.5 align-top font-medium leading-5 text-text-primary">
                    {{ copy.code }}
                  </td>
                </tr>
                <tr class="border-t border-copy-table-border">
                  <td
                    class="w-32 border-r border-copy-table-border bg-primary-subtle/70 px-4 py-2.5 align-top text-sm font-medium leading-5 text-natural-text">
                    文案標題
                  </td>
                  <td class="px-4 py-2.5 align-top font-bold leading-5 text-text-primary">
                    {{ copy.title }}
                  </td>
                </tr>
                <tr class="border-t border-copy-table-border">
                  <td
                    class="w-32 border-r border-copy-table-border bg-primary-subtle/70 px-4 py-2.5 align-top text-sm font-medium leading-5 text-natural-text">
                    文案內容
                  </td>
                  <td class="px-4 py-2.5 align-top leading-5 text-text-primary">
                    {{ copy.content }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex flex-wrap items-center mt-2 text-xs leading-5 gap-x-1 gap-y-1 text-text-grey">
            <template v-if="copy.status === 'PENDING'">
              <span>提交者：{{ copy.submittedBy }}</span>
              <span>|</span>
              <span>提交時間：{{ formatMetaDateTime(copy.submittedAt) }}</span>
            </template>
            <template v-else-if="copy.status === 'APPROVED'">
              <span>覆核主管：{{ copy.approvedBy }}</span>
              <span>|</span>
              <span>核准時間：{{ formatMetaDateTime(copy.approvedAt) }}</span>
            </template>
            <template v-else-if="copy.status === 'REJECTED'">
              <span>覆核主管：{{ copy.rejectedBy }}</span>
              <span>|</span>
              <span>駁回時間：{{ formatMetaDateTime(copy.rejectedAt) }}</span>
            </template>
            <template v-else-if="copy.status === 'CANCELED'">
              <span>建立者：{{ copy.createdBy }}</span>
              <span>|</span>
              <span>建立時間：{{ formatMetaDateTime(copy.createdAt) }}</span>
            </template>
          </div>

          <div v-if="copy.status === 'REJECTED' && copy.rejectReason"
            class="flex flex-col gap-1 p-4 mt-4 border rounded-lg border-danger-text bg-danger-bg">
            <p class="flex items-center gap-1 text-xs font-normal leading-normal text-danger-text">
              <RejectCircleIcon /> 駁回原因
            </p>
            <p class="text-xs font-normal leading-normal text-danger-text">
              {{ copy.rejectReason }}
            </p>
          </div>
        </div>
      </div>
      <aside v-if="reviewerMode && copy.status === 'PENDING'" class="mt-4 flex w-full justify-end gap-4 xl:col-span-1 xl:mt-0 xl:w-24 xl:flex-col xl:justify-center xl:gap-6">
        <button
          type="button"
          class="inline-flex h-10 w-24 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-base font-bold leading-normal text-text-inverse transition hover:bg-primary-hover"
          @click="$emit('approve-copy', copy)"
        >
          <CheckIcon /> <span>核准</span>
        </button>
        <button
          type="button"
          class="inline-flex h-10 w-24 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-text-grey bg-background-surface px-4 py-2.5 text-base font-bold leading-normal text-natural transition hover:bg-background-hover"
          @click="$emit('reject-copy', copy)"
        >
          <CancelIcon /> <span>駁回</span>
        </button>
      </aside>
    </div>

    <footer v-if="hasAction" class="flex items-start justify-end pt-2 border-t min-h-12 border-border">
      <BaseButton v-if="copy.status === 'PENDING' && !reviewerMode" variant="outline" size="md"
        @click="$emit('cancel-submission', copy)">
        <CancelIcon /> 取消送審
      </BaseButton>
      <BaseButton v-else-if="canCopy" variant="primary" size="md" @click="$emit('copy-create', copy)">
        <CopyIcon /> 複製新建
      </BaseButton>
    </footer>
  </article>
</template>

<script setup>
import { computed, h } from "vue";

import BaseButton from "@/components/base/BaseButton.vue";
import StatusBadge from "@/components/base/StatusBadge.vue";
import checkCircleBlueIcon from "@/assets/icon-check-circle-blue.svg";
import copyIcon from "@/assets/copy.svg";
import docIcon from "@/assets/icon-file-text.svg";
import eyeIcon from "@/assets/icon-eye.svg";
import xCircleBlackIcon from "@/assets/icon-x-circle-black.svg";
import xCircleIcon from "@/assets/icon-x-circle.svg";

const props = defineProps({
  copy: { type: Object, required: true },
  mode: { type: String, default: "editor" },
});
defineEmits(["view-copy", "cancel-submission", "copy-create", "approve-copy", "reject-copy"]);

const canCopy = computed(() =>
  !reviewerMode.value && ["REJECTED", "CANCELED", "APPROVED"].includes(props.copy.status),
);
const hasAction = computed(
  () => (!reviewerMode.value && props.copy.status === "PENDING") || canCopy.value,
);
const reviewerMode = computed(() => props.mode === "reviewer");

function formatMetaDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const period = date.getHours() < 12 ? "上午" : "下午";
  const hour = date.getHours() % 12 || 12;
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${period}${hour}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

const assetIcon = (src, fallbackClass) => (_props = {}, context = {}) => {
  const attrs = context?.attrs || {};

  return h("img", {
    ...attrs,
    src,
    alt: "",
    "aria-hidden": "true",
    class: [fallbackClass, attrs.class].filter(Boolean).join(" "),
  });
};

const EyeIcon = assetIcon(eyeIcon, "size-4");
const DocIcon = assetIcon(docIcon, "size-4");
const CancelIcon = assetIcon(xCircleBlackIcon, "size-6 shrink-0");
const CheckIcon = assetIcon(checkCircleBlueIcon, "size-6 shrink-0 brightness-0 invert");
const CopyIcon = assetIcon(copyIcon, "size-4 brightness-0 invert");
const RejectCircleIcon = assetIcon(xCircleIcon, "size-3.5 shrink-0");
</script>
