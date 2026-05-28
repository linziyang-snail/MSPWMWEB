<!--
 * @FileDescription: 經辦角色查看文案內容 Modal
 * 對應 Figma：
 *   1.2.1 待審核查看文案內容
 *   1.3.1 已核准查看文案內容
 *   1.5.1 已駁回查看文案內容
 *   1.6.2 查看文案內容 (取消)
 * 共用 BaseModal shell；以 section card 排版，狀態決定送審資訊與底部提示
-->
<template>
  <BaseModal :model-value="modelValue" :icon="docIcon" :title="copy?.title || '文案內容'"
    :subtitle="copy ? `文案編號：${copy.code}` : ''" size="copyDetail" panel-class="shadow-popup"
    header-class="h-24 border-b border-white bg-background-page px-6 py-6 [&_h2]:text-text-heading [&_h2]:leading-normal [&_h2]:tracking-wide"
    body-class="px-8 py-8" footer-class="px-8 py-5 border-t border-copy-table-border bg-background-surface"
    icon-container-class="bg-copy-table-border" @update:model-value="$emit('update:modelValue', $event)">
    <template #icon>
      <img :src="docIcon" alt="" class="size-6" />
    </template>

    <div v-if="copy" class="space-y-4">
      <!-- 1. APP 對應之推播分類 -->
      <SectionCard>
        <SectionTitle icon="hash" title="選取APP對應之推播分類" />
        <div class="grid grid-cols-2 mt-5 gap-x-12 gap-y-3">
          <KeyValueRow label="行動銀行" :value="copy.nnbCategory || '個人'" />
          <KeyValueRow label="NewNew" :value="copy.wbkCategory || '消費'" />
        </div>
      </SectionCard>

      <!-- 2. 文案基本資訊 -->
      <SectionCard>
        <SectionTitle icon="hash" title="文案基本資訊" />
        <div class="mt-5 space-y-4">
          <FieldRow label="文案編號">
            <span
              class="flex h-10 items-center rounded-lg border border-copy-table-border bg-background-surface px-4 text-base font-normal leading-normal text-natural">
              {{ copy.code }}
            </span>
          </FieldRow>
          <FieldRow label="文案時效">
            <span class="inline-flex items-center gap-2 text-sm font-bold leading-normal text-natural">
              <span class="grid size-5 rounded-full border border-2 border-primary place-items-center">
                <span class="size-2.5 rounded-full bg-primary" />
              </span>
              {{ retentionLabel }}
            </span>
          </FieldRow>
        </div>
      </SectionCard>

      <!-- 3. 文案標題 / 內容 -->
      <SectionCard>
        <div class="space-y-4">
          <FieldRow label="文案標題">
            <span
              class="flex h-10 items-center rounded-lg border border-copy-table-border bg-background-surface px-4 text-base font-normal leading-normal text-natural">
              {{ copy.title }}
            </span>
          </FieldRow>
          <FieldRow label="文案內容">
            <p
              class="flex min-h-10 items-center whitespace-pre-wrap rounded-lg border border-copy-table-border bg-background-surface px-4 py-2 text-base font-normal leading-normal text-natural">
              {{ copy.content }}
            </p>
          </FieldRow>
          <div>
            <BaseButton variant="outline" size="md" @click="previewOpen = true">
              <EyeIcon /> 預覽效果
            </BaseButton>
          </div>
        </div>
      </SectionCard>

      <!-- 4. 備註 -->
      <SectionCard>
        <SectionTitle title="備註" />
        <p class="mt-3 whitespace-pre-wrap text-base font-normal leading-normal text-natural">
          {{ copy.note || "—" }}
        </p>
      </SectionCard>

      <!-- 5. 送審資訊 -->
      <SectionCard>
        <SectionTitle icon="people-check" title="送審資訊" />

        <div class="mt-5 space-y-3">
          <PersonRow tone="primary" label="送審人" :name="copy.submittedBy || copy.createdBy"
            :time="copy.submittedAt || copy.createdAt">
            <template #avatar>
              <UserIcon />
            </template>
          </PersonRow>

          <PersonRow v-if="copy.status === 'APPROVED'" tone="success" label="覆核主管" :name="copy.approvedBy"
            :time="copy.approvedAt">
            <template #avatar>
              <CheckIcon />
            </template>
          </PersonRow>

          <PersonRow v-if="copy.status === 'REJECTED'" tone="danger" label="覆核主管" :name="copy.rejectedBy"
            :time="copy.rejectedAt">
            <template #avatar>
              <AlertIcon />
            </template>
          </PersonRow>

          <PersonRow v-if="copy.status === 'CANCELED'" tone="natural" label="取消人" :name="copy.cancelledBy"
            :time="copy.cancelledAt">
            <template #avatar>
              <CancelIcon />
            </template>
          </PersonRow>

          <div v-if="copy.status === 'PENDING'"
            class="flex items-center gap-2 px-4 py-3 border rounded-lg border-danger bg-danger-bg">
            <ClockIcon class="shrink-0 text-danger" />
            <p class="text-sm font-medium text-danger">
              此文案正在等待主管審核中...
            </p>
          </div>

          <div v-if="copy.status === 'REJECTED' && copy.rejectReason"
            class="flex flex-col gap-1 rounded-lg border border-danger bg-danger-bg p-6">
            <p class="inline-flex items-center gap-1.5 text-xs font-normal leading-normal text-danger">
              <AlertIcon class="size-3.5" /> 駁回原因
            </p>
            <p class="text-sm font-medium leading-normal text-danger">
              {{ copy.rejectReason }}
            </p>
          </div>
        </div>
      </SectionCard>
    </div>

    <template #footer>
      <BaseButton class="border-border-strong" variant="secondary" @click="close">關閉</BaseButton>
    </template>

    <CopyPreviewModal v-model="previewOpen" :title="copy?.title || ''" :content="copy?.content || ''" />
  </BaseModal>
</template>

<script setup>
import { computed, h, ref } from "vue";

import alertCircleIcon from "@/assets/alertcircle.svg";
import checkIcon from "@/assets/check.svg";
import clockIcon from "@/assets/clock.svg";
import docIcon from "@/assets/filetext.svg";
import eyeIcon from "@/assets/icon-eye.svg";
import userIcon from "@/assets/UserLineIcon.svg";
import userCheckIcon from "@/assets/useredit.svg";
import xCircleIcon from "@/assets/icon-x-circle.svg";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import CopyPreviewModal from "@/components/dialogs/CopyPreviewModal.vue";
import { formatDateTime } from "@/utils/formatDate";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  copy: { type: Object, default: null },
});
const emit = defineEmits(["update:modelValue"]);

const previewOpen = ref(false);

const retentionLabel = computed(() => {
  const m = props.copy?.retentionMonths;
  if (props.copy?.expiredAt) return formatDateTime(props.copy.expiredAt);
  if (m === 1 || m === "1") return "一個月";
  if (m === 3 || m === "3") return "三個月";
  if (m === 6 || m === "6") return "六個月";
  if (m) return `${m} 個月`;
  return "一個月";
});

const close = () => emit("update:modelValue", false);

/* ---------- 內部小元件 ---------- */
const SectionCard = (_p, { slots }) =>
  h(
    "section",
    {
      class: "rounded-2xl border border-copy-table-border bg-background-page p-6",
    },
    slots.default?.(),
  );

const SectionTitle = (props) => {
  const icon =
    props.icon === "hash"
      ? h(
        "span",
        {
          class:
            "inline-flex size-5 items-center justify-center text-lg font-bold leading-none text-primary",
        },
        "#",
      )
      : props.icon === "people-check"
        ? h(PeopleCheckIcon)
        : null;

  return h("div", { class: "flex items-center gap-1" }, [
    icon,
    h("h3", { class: "text-sm font-bold leading-6 text-natural" }, props.title),
  ]);
};
SectionTitle.props = ["icon", "title"];

const FieldRow = (props, { slots }) =>
  h("div", {}, [
    h(
      "span",
      { class: "block mb-2 text-sm font-bold leading-normal text-natural" },
      props.label,
    ),
    slots.default?.(),
  ]);
FieldRow.props = ["label"];

const KeyValueRow = (props) =>
  h("div", { class: "flex items-center gap-4" }, [
    h(
      "span",
      { class: "w-20 text-sm font-bold leading-normal text-natural" },
      props.label,
    ),
    h(
      "div",
      {
        class:
          "flex h-10 flex-1 items-center rounded-lg border border-copy-table-border bg-background-surface px-4 text-base font-normal leading-normal text-natural",
      },
      props.value,
    ),
  ]);
KeyValueRow.props = ["label", "value"];

const PersonRow = (props, { slots }) => {
  const toneText = {
    primary: "text-natural",
    success: "text-success-text",
    danger: "text-danger",
    natural: "text-natural-text",
  };
  const iconBg = {
    primary: "bg-info-avatar",
    success: "bg-primary-soft",
    danger: "bg-danger-bg",
    natural: "bg-natural-bg",
  };
  const iconText = {
    primary: "text-primary",
    success: "text-primary",
    danger: "text-danger",
    natural: "text-natural",
  };
  const contentText = toneText[props.tone] || "text-natural";
  return h(
    "div",
    {
      class: `flex items-center gap-3 rounded-lg border border-copy-table-border bg-background-surface px-4 py-3`,
    },
    [
      h(
        "div",
        {
          class: `grid size-8 shrink-0 place-items-center rounded-full ${iconBg[props.tone] || "bg-background-surface"} ${iconText[props.tone] || "text-text-muted"} [&>svg]:size-4`,
        },
        slots.avatar?.(),
      ),
      h("div", { class: "flex-1 min-w-0" }, [
        h(
          "div",
          {
            class: `text-xs font-normal leading-normal ${contentText}`,
          },
          props.label,
        ),
        h(
          "div",
          { class: `mt-0.5 text-sm font-bold leading-normal ${contentText}` },
          props.name || "-",
        ),
      ]),
      h(
        "div",
        {
          class: `inline-flex items-center gap-1.5 text-xs font-normal leading-normal text-natural`,
        },
        [
          h(ClockIcon),
          h("span", {}, props.time ? formatDateTime(props.time) : "-"),
        ],
      ),
    ],
  );
};
PersonRow.props = ["tone", "label", "name", "time"];

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
const UserIcon = assetIcon(userIcon, "size-4");
const CheckIcon = assetIcon(checkIcon, "size-4");
const PeopleCheckIcon = assetIcon(userCheckIcon, "size-5");
const AlertIcon = assetIcon(alertCircleIcon, "size-4");
const CancelIcon = assetIcon(xCircleIcon, "size-4");
const ClockIcon = assetIcon(clockIcon, "size-4");
</script>
