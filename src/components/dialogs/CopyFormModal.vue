<template>
  <BaseModal :model-value="modelValue" :icon="docIcon" :title="modalTitle" :subtitle="props.mode === 'copy' && form.code
    ? `文案編號：${form.code}`
    : ''
    " size="copyDetail" body-class="px-8 py-8"
    footer-class="flex-row justify-end gap-3 px-0 py-6 mx-8 mt-6 border-t flex-nowrap border-copy-table-border bg-background-surface"
    @update:model-value="$emit('update:modelValue', $event)">
    <form class="space-y-5" @submit.prevent="submit">
      <section class="p-6 border rounded-2xl border-copy-table-border bg-background-page">
        <SectionTitle title="選取APP對應之推播分類" />
        <div class="grid gap-8 mt-5 md:grid-cols-2">
          <FormField label="行動銀行">
            <BaseSelect v-model="form.wbkCategory" :options="wbkOptions" />
          </FormField>
          <FormField label="NewNew">
            <BaseSelect v-model="form.nnbCategory" :options="nnbOptions" />
          </FormField>
        </div>
      </section>

      <section class="p-6 border rounded-2xl border-copy-table-border bg-background-page">
        <SectionTitle title="文案基本資訊" hint="(文案時效與文案到期日，請則一選填)" />
        <div class="mt-5 space-y-5">
          <FormField label="文案編號" required :error="errors.code">
            <BaseInput v-model="form.code" placeholder="C123456789012" :error="!!errors.code" />
          </FormField>

          <div class="grid gap-8 md:grid-cols-2">
            <FormField label="文案時效" :error="errors.retentionMonths">
              <label class="flex items-center gap-3">
                <input v-model="expirationMode" class="size-4 accent-primary" type="radio" value="RETENTION_MONTHS" />
                <BaseSelect v-model="form.retentionMonths" :options="retentionOptions" />
              </label>
            </FormField>
            <FormField label="文案到期日" :error="errors.expiredAt">
              <label class="flex items-center gap-3">
                <input v-model="expirationMode" class="size-4 accent-primary" type="radio" value="EXPIRED_AT" />
                <BaseDateInput v-model="form.expiredAt" :disabled="expirationMode !== 'EXPIRED_AT'" />
              </label>
            </FormField>
          </div>
        </div>
      </section>

      <section class="p-6 border rounded-2xl border-copy-table-border bg-background-page">
        <div class="space-y-5">
          <SectionTitle title="文案標題" icon="doc" />
          <FormField label="文案標題" required :error="errors.title">
            <BaseInput v-model="form.title" placeholder="請輸入文案標題" :error="!!errors.title" />
          </FormField>

          <FormField label="文案內容" required :error="errors.content">
            <div class="flex justify-end mb-3">
              <BaseButton type="button" variant="secondary" @click.stop="insertParameter">
                <PlusIcon /> 插入參數
              </BaseButton>
            </div>
            <BaseTextarea ref="contentTextareaRef" v-model="form.content" :rows="7" :show-count="true"
              placeholder="請輸入推播文案內容..." :error="!!errors.content" />
          </FormField>

          <div class="grid gap-8 md:grid-cols-2">
            <FormField label="URL" :error="errors.url">
              <BaseInput v-model="form.url" placeholder="請輸入" :disabled="form.clickAction === 'NONE'" :error="!!errors.url" />
            </FormField>
            <FormField label="動作行為">
              <BaseSelect v-model="form.clickAction" :options="clickActionOptions" placeholder="請選擇" />
            </FormField>
          </div>

          <BaseButton type="button" variant="secondary" @click="previewOpen = true">
            <EyeIcon /> 預覽效果
          </BaseButton>
          <CopyPreviewModal v-model="previewOpen" :title="form.title" :content="form.content" />
        </div>
      </section>

      <section class="p-6 border rounded-2xl border-copy-table-border bg-background-page">
        <FormField label="備註">
          <BaseTextarea v-model="form.note" :rows="3" placeholder="請輸入文案備註..." />
        </FormField>
      </section>
    </form>

    <template #footer>
      <BaseButton
        class="h-10 w-16 shrink-0 whitespace-nowrap border-text-grey px-4 py-2.5 text-base leading-normal text-natural"
        variant="secondary" @click="close">取消</BaseButton>
      <BaseButton
        class="h-10 w-28 shrink-0 whitespace-nowrap px-7 py-2 !text-sm leading-normal shadow-control"
        size="sm" :loading="submitting" @click="submit">送出審核</BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, h, reactive, ref, watch } from "vue";

import addIcon from "@/assets/add.svg";
import docIcon from "@/assets/filetext.svg";
import eyeIcon from "@/assets/icon-eye.svg";
import fileTextIcon from "@/assets/icon-file-text.svg";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseDateInput from "@/components/base/BaseDateInput.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import BaseSelect from "@/components/base/BaseSelect.vue";
import BaseTextarea from "@/components/base/BaseTextarea.vue";
import CopyPreviewModal from "@/components/dialogs/CopyPreviewModal.vue";
import {
  CLICK_ACTION_OPTIONS,
  NNB_CATEGORY_OPTIONS,
  RETENTION_OPTIONS,
  WBK_CATEGORY_OPTIONS,
} from "@/services/copyOptions";
import { useCopyStore } from "@/stores/copyStore";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  mode: { type: String, default: "create" },
  source: { type: Object, default: null },
});

const emit = defineEmits(["update:modelValue", "submitted"]);

const copyStore = useCopyStore();
const submitting = ref(false);
const expirationMode = ref("RETENTION_MONTHS");
const previewOpen = ref(false);
const contentTextareaRef = ref(null);

const nnbOptions = NNB_CATEGORY_OPTIONS;
const wbkOptions = WBK_CATEGORY_OPTIONS;
const retentionOptions = RETENTION_OPTIONS;
const clickActionOptions = CLICK_ACTION_OPTIONS;

const form = reactive({
  code: "",
  title: "",
  nnbCategory: "消費",
  wbkCategory: "個人",
  content: "",
  clickAction: "NONE",
  url: "",
  retentionMonths: "1",
  expiredAt: "",
  note: "",
});

const errors = reactive({
  code: "",
  title: "",
  content: "",
  url: "",
  retentionMonths: "",
  expiredAt: "",
});

const modalTitle = computed(() =>
  props.mode === "copy" && props.source
    ? `${props.source.title}（副本）`
    : "新增推播文案",
);

watch(
  () => [props.modelValue, props.source, props.mode],
  ([open, source, mode]) => {
    if (!open) return;
    resetForm();
    if (mode === "copy" && source) {
      Object.assign(form, {
        code: source.code,
        title: `${source.title}（副本）`,
        nnbCategory: source.nnbCategory || source.category || "消費",
        wbkCategory: source.wbkCategory || "個人",
        content: source.content || "",
        clickAction: source.clickAction || "NONE",
        url: source.url || "",
        retentionMonths: String(source.retentionMonths || "1"),
        expiredAt: source.expiredAt || "",
        note: source.note || "",
      });
      expirationMode.value = source.expiredAt
        ? "EXPIRED_AT"
        : "RETENTION_MONTHS";
    }
  },
  { immediate: true },
);

const resetForm = () => {
  Object.assign(form, {
    code: "",
    title: "",
    nnbCategory: "消費",
    wbkCategory: "個人",
    content: "",
    clickAction: "NONE",
    url: "",
    retentionMonths: "1",
    expiredAt: "",
    note: "",
  });
  expirationMode.value = "RETENTION_MONTHS";
  errors.code = "";
  errors.title = "";
  errors.content = "";
};

const validate = () => {
  errors.code = form.code.trim() ? "" : "請輸入文案編號";
  errors.title = form.title.trim() ? "" : "請輸入文案標題";
  errors.content = form.content.trim() ? "" : "請輸入文案內容";
  errors.url = form.clickAction === "OPEN_URL" && !form.url.trim() ? "請輸入 URL" : "";
  const months = Number(form.retentionMonths);
  errors.retentionMonths =
    expirationMode.value === "RETENTION_MONTHS" && (!months || months < 1 || months > 12)
      ? "請選擇 1-12 個月"
      : "";
  errors.expiredAt =
    expirationMode.value === "EXPIRED_AT" && !form.expiredAt ? "請選擇到期日" : "";
  return !errors.code && !errors.title && !errors.content && !errors.url && !errors.retentionMonths && !errors.expiredAt;
};

const submit = async () => {
  if (!validate()) return;
  try {
    submitting.value = true;
    const payload = {
      number: form.code,
      title: form.title,
      content: form.content,
      note: form.note || "",
      nnbCategory: form.nnbCategory || "",
      wbkCategory: form.wbkCategory || "",
      url: form.clickAction === "NONE" ? "" : form.url || "",
      clickAction: form.clickAction || "NONE",
      expirationType: expirationMode.value,
      retentionMonths:
        expirationMode.value === "RETENTION_MONTHS"
          ? Number(form.retentionMonths)
          : undefined,
      expiredAt: expirationMode.value === "EXPIRED_AT" ? toDateTimeString(form.expiredAt) : undefined,
    };
    const item =
      props.mode === "copy" && props.source
        ? await copyStore.copyAndCreate(props.source.id, payload)
        : await copyStore.create(payload);
    emit("submitted", item);
    close();
  } finally {
    submitting.value = false;
  }
};

const close = () => {
  emit("update:modelValue", false);
};

function toDateTimeString(value) {
  if (!value) return "";
  if (String(value).includes("T")) return String(value);
  return `${String(value).slice(0, 10)}T00:00:00`;
}

const normalizeParameterSpacing = (value) =>
  value
    .replace(/[ \t]*(\|\$\d+\|)[ \t]*/g, " $1 ")
    .replace(/[ \t]{2,}/g, " ")
    .trimStart();

const insertParameter = () => {
  const currentCount = [...form.content.matchAll(/\|\$\d+\|/g)].length;
  const nextParameterNumber = currentCount + 1;
  const token = `|$${nextParameterNumber}|`;
  const textarea = contentTextareaRef.value?.textareaRef;
  const start = textarea?.selectionStart ?? form.content.length;
  const end = textarea?.selectionEnd ?? start;
  const before = form.content.slice(0, start);
  const after = form.content.slice(end);
  const leadingSpace = before && !/\s$/.test(before) ? " " : "";
  const trailingSpace = after && !/^\s/.test(after) ? " " : "";
  const inserted = `${leadingSpace}${token}${trailingSpace}`;
  form.content = normalizeParameterSpacing(`${before}${inserted}${after}`);

  // Caret must be derived from the normalized string (normalizeParameterSpacing
  // trims/collapses spaces), otherwise it lands inside the token and the next
  // insert gets nested. Place it right after the inserted token + its space.
  const caret = normalizeParameterSpacing(`${before}${inserted}`).length;
  requestAnimationFrame(() => {
    textarea?.focus();
    const cursor = Math.min(caret, form.content.length);
    textarea?.setSelectionRange(cursor, cursor);
  });
};

const FormField = {
  props: {
    label: { type: String, required: true },
    required: { type: Boolean, default: false },
    error: { type: String, default: "" },
  },
  setup(props, { slots }) {
    return () =>
      h("div", { class: "block" }, [
        h(
          "div",
          { class: "mb-2 block text-sm font-bold text-text-secondary" },
          [
            props.label,
            props.required
              ? h("span", { class: "text-danger-text" }, "*")
              : null,
          ],
        ),
        slots.default?.(),
        props.error
          ? h(
            "p",
            { class: "mt-1.5 text-xs font-normal text-state-red" },
            props.error,
          )
          : null,
      ]);
  },
};

const assetIcon = (src, fallbackClass) => h("img", { src, alt: "", "aria-hidden": "true", class: fallbackClass });

const DocSmallIcon = () => assetIcon(fileTextIcon, "size-4");

const SectionTitle = {
  props: {
    title: { type: String, required: true },
    hint: { type: String, default: "" },
    icon: { type: String, default: "hash" },
  },
  setup(props) {
    return () =>
      h(
        "div",
        { class: "flex items-center gap-2 text-sm font-bold text-primary" },
        [
          props.icon === "doc" ? h(DocSmallIcon) : "#",
          h("span", props.title),
          props.hint
            ? h(
              "span",
              { class: "font-medium text-text-placeholder" },
              props.hint,
            )
            : null,
        ],
      );
  },
};

const PlusIcon = () => assetIcon(addIcon, "size-4");

const EyeIcon = () => assetIcon(eyeIcon, "size-4");
</script>
