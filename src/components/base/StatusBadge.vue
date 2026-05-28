<!--
 * @FileDescription: 狀態 Badge
 * Figma 規格：h-8 / r-24 / px-3 py-0.5 / 14px / 500 / leading-150
 *
 * 寬度：兩字 52px、三字 66px、其他 min-w-66
 * labelVariant：
 *   - default：Sidebar / 列表頁標準狀態（已核准 / 已駁回 / 已取消）
 *   - copy：文案卡片狀態（核准 / 駁回 / 取消）
 * 不可直排：whitespace-nowrap + [writing-mode:horizontal-tb]
-->
<template>
  <span :class="[
    'inline-flex h-8 shrink-0 items-center justify-center gap-2.5 rounded-3xl border px-3 py-0.5',
    'whitespace-nowrap [writing-mode:horizontal-tb] [text-orientation:mixed]',
    'font-sans text-sm font-medium leading-normal tracking-normal',
    sizeClass,
    toneClass,
  ]">
    {{ displayLabel }}
  </span>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  status: { type: String, default: "" },
  label: { type: String, default: "" },
  tone: { type: String, default: "" },
  labelVariant: { type: String, default: "default" },
});

/* 預設標籤 — Sidebar / 表格 */
const STATUS_LABELS_DEFAULT = {
  PENDING: "待審核",
  PENDING_APPROVAL: "審核中",
  APPROVED: "已核准",
  REJECTED: "已駁回",
  CANCELED: "已取消",
  ACTIVE: "已啟用",
  DISABLED: "已停用",
  DELETED: "已刪除",
  LOCKED: "已鎖定",
  CREATE: "新增",
  ADD: "新增",
  UPDATE: "編輯",
  EDIT: "編輯",
  DELETE: "刪除",
  AGREE: "同意",
  APPROVE: "核准",
  ENABLE: "啟用",
  REJECT: "駁回",
  REMOVE: "刪除",
  CANCEL: "取消",
  REVIEW: "待審核",
  啟用: "啟用",
  停用: "停用",
  審核中: "審核中",
};

/* 文案卡片用 — 核准 / 駁回 / 取消（無「已」） */
const STATUS_LABELS_COPY = {
  PENDING: "待審核",
  APPROVED: "核准",
  REJECTED: "駁回",
  CANCELED: "取消",
};

const displayLabel = computed(() => {
  if (props.label) return props.label;
  const map =
    props.labelVariant === "copy"
      ? { ...STATUS_LABELS_DEFAULT, ...STATUS_LABELS_COPY }
      : STATUS_LABELS_DEFAULT;
  return map[props.status] || props.status || "-";
});

const TONE_BY_STATUS = {
  PENDING: "danger",
  PENDING_APPROVAL: "warning",
  APPROVED: "success",
  REJECTED: "rejected",
  CANCELED: "natural",
  ACTIVE: "success",
  DISABLED: "natural",
  DELETED: "natural",
  LOCKED: "danger",
  CREATE: "info",
  ADD: "info",
  AGREE: "success",
  APPROVE: "success",
  ENABLE: "success",
  EDIT: "edit",
  UPDATE: "edit",
  REJECT: "rejected",
  REMOVE: "natural",
  DELETE: "natural",
  DISABLE: "natural",
  CANCEL: "natural",
  REVIEW: "danger",
  啟用: "success",
  停用: "natural",
  審核中: "warning",
};

const TONE_CLASSES = {
  success: "border-success-border bg-success-bg text-success-text",
  info: "border-info-border bg-info-bg text-info-text",
  edit: "border-edit-border bg-edit-bg text-edit-text",
  rejected: "border-rejected-border bg-rejected-bg text-rejected-text",
  danger: "border-danger-border bg-danger-bg text-danger-text",
  natural: "border-natural-border bg-natural-bg text-natural-text",
  warning: "border-warning-border bg-warning-bg text-warning-text",
};

const toneClass = computed(() => {
  const tone = props.tone || TONE_BY_STATUS[props.status] || "natural";
  return TONE_CLASSES[tone] || TONE_CLASSES.natural;
});

const sizeClass = computed(() => {
  const len = String(displayLabel.value || "").replace(/\s/g, "").length;
  if (len <= 2) return "w-13 min-w-13 max-w-13";
  if (len === 3) return "w-16 min-w-16 max-w-16";
  return "min-w-16 px-3";
});
</script>
