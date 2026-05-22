<template>
  <BaseModal
    :model-value="modelValue"
    title="修改密碼"
    :subtitle="subtitle"
    size="sm"
    panel-class="shadow-popup"
    header-class="h-24 border-b border-white bg-background-page px-6 py-6"
    body-class="px-6 py-5"
    footer-class="h-20 gap-6 border-t-0 bg-background-page px-6 py-6"
    icon-container-class="bg-copy-table-border"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #icon>
      <KeyIcon class="size-6 text-primary" />
    </template>

    <form class="space-y-6" @submit.prevent="submit">
      <div>
        <label class="mb-2 block text-sm font-bold leading-normal text-natural">設定新密碼 *</label>
        <span class="relative block">
          <input v-model="form.password" :type="show.password ? 'text' : 'password'" placeholder="請輸入目前密碼" :class="[
            'h-10 w-full rounded-lg border bg-background-surface px-4 py-2 pr-12 text-base font-normal leading-normal text-natural outline-none transition placeholder:text-text-grey focus:border-border-focus focus:ring-2 focus:ring-primary/15',
            errors.password ? 'border-border-error' : 'border-copy-table-border',
          ]" />
          <button
            class="absolute grid -translate-y-1/2 right-3 top-1/2 size-6 place-items-center text-text-grey hover:text-primary"
            type="button" tabindex="-1" @click="show.password = !show.password">
            <EyeIcon :open="show.password" />
          </button>
        </span>
      </div>

      <div>
        <label class="mb-2 block text-sm font-bold leading-normal text-natural">確認新密碼 *</label>
        <span class="relative block">
          <input v-model="form.confirm" :type="show.confirm ? 'text' : 'password'" placeholder="至少12個字元（必填)" :class="[
            'h-10 w-full rounded-lg border bg-background-surface px-4 py-2 pr-12 text-base font-normal leading-normal text-natural outline-none transition placeholder:text-text-grey focus:border-border-focus focus:ring-2 focus:ring-primary/15',
            errors.confirm ? 'border-border-error' : 'border-copy-table-border',
          ]" />
          <button
            class="absolute grid -translate-y-1/2 right-3 top-1/2 size-6 place-items-center text-text-grey hover:text-primary"
            type="button" tabindex="-1" @click="show.confirm = !show.confirm">
            <EyeIcon :open="show.confirm" />
          </button>
        </span>
        <p v-if="errors.confirm" class="mt-1.5 text-xs leading-normal text-danger">
          {{ errors.confirm }}
        </p>
      </div>

      <div class="pt-2 text-sm font-normal leading-normal text-text-grey">
        <p>密碼規則：</p>
        <ol class="pl-6 list-decimal">
          <li>組成有英文大小寫、數字、符號，前面組成 4 選 3。</li>
          <li>密碼最少12碼。</li>
          <li>不可以和前四代密碼一樣。</li>
          <li>密碼30天需更換。</li>
        </ol>
      </div>
    </form>

    <template #footer>
      <BaseButton class="w-48" variant="secondary" @click="close">取消</BaseButton>
      <BaseButton class="w-48" @click="submit">確認修改</BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, h, reactive, watch } from "vue";

import eyeCloseIcon from "@/assets/loginEyeClose.svg";
import eyeOpenIcon from "@/assets/loginEyeOpen.svg";
import keyIcon from "@/assets/icon-key.svg";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseModal from "@/components/base/BaseModal.vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  account: { type: Object, default: null },
});

const emit = defineEmits(["update:modelValue", "submitted"]);

const form = reactive({ password: "", confirm: "" });
const errors = reactive({ password: "", confirm: "" });
const show = reactive({ password: false, confirm: false });

const subtitle = computed(() => `員編：${props.account?.id || "1193285"}`);

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return;
    form.password = "";
    form.confirm = "";
    errors.password = "";
    errors.confirm = "";
    show.password = false;
    show.confirm = false;
  },
);

function validate() {
  errors.password = !form.password
    ? "密碼必須至少12個字元"
    : form.password.length < 12
      ? "密碼必須至少12個字元"
      : "";
  errors.confirm = !form.confirm
    ? "請再次輸入新密碼"
    : form.confirm !== form.password
      ? "兩次輸入的密碼不一致"
      : "";
  return !errors.password && !errors.confirm;
}

function submit() {
  if (!validate()) return;
  emit("submitted", { account: props.account, password: form.password });
  close();
}

function close() {
  emit("update:modelValue", false);
}

const KeyIcon = (_props = {}, context = {}) =>
  h("img", { ...(context?.attrs || {}), src: keyIcon, alt: "", "aria-hidden": "true" });

const EyeIcon = (props) =>
  h("img", { src: props.open ? eyeOpenIcon : eyeCloseIcon, alt: "", "aria-hidden": "true", class: "size-6" });
</script>
