<template>
  <BaseModal :model-value="modelValue" :icon="passwordIcon" title="修改密碼" :subtitle="subtitle" size="sm"
    panel-class="shadow-popup" header-class="h-24 border-b border-white bg-background-page px-6 py-6"
    body-class="px-6 py-4" footer-class="h-20 gap-4 border-t-0 bg-background-page px-6 py-6"
    icon-container-class="bg-copy-table-border" @update:model-value="$emit('update:modelValue', $event)">
    <form class="space-y-5" @submit.prevent="submit">
      <div>
        <label class="mb-2 block text-sm font-bold leading-normal text-natural">目前密碼 *</label>
        <span class="relative block">
          <input v-model="form.current" :type="show.current ? 'text' : 'password'" placeholder="請輸入目前密碼" :class="[
            'h-10 w-full rounded-lg border bg-background-surface px-4 py-2 pr-12 text-base font-normal leading-normal text-natural outline-none transition placeholder:text-text-grey focus:border-border-focus focus:ring-2 focus:ring-primary/15',
            errors.current ? 'border-border-error' : 'border-copy-table-border',
          ]" />
          <button
            class="absolute grid -translate-y-1/2 right-3 top-1/2 size-6 place-items-center text-natural hover:text-primary"
            type="button" tabindex="-1" @click="show.current = !show.current">
            <EyeIcon :open="show.current" />
          </button>
        </span>
        <p v-if="errors.current" class="mt-1.5 text-sm font-normal leading-normal text-state-red">
          {{ errors.current }}
        </p>
      </div>

      <div>
        <label class="mb-2 block text-sm font-bold leading-normal text-natural">設定新密碼 *</label>
        <span class="relative block">
          <input v-model="form.password" :type="show.password ? 'text' : 'password'" placeholder="至少12個字元（必填)" :class="[
            'h-10 w-full rounded-lg border bg-background-surface px-4 py-2 pr-12 text-base font-normal leading-normal text-natural outline-none transition placeholder:text-text-grey focus:border-border-focus focus:ring-2 focus:ring-primary/15',
            errors.password ? 'border-border-error' : 'border-copy-table-border',
          ]" />
          <button
            class="absolute grid -translate-y-1/2 right-3 top-1/2 size-6 place-items-center text-natural hover:text-primary"
            type="button" tabindex="-1" @click="show.password = !show.password">
            <EyeIcon :open="show.password" />
          </button>
        </span>
        <p v-if="errors.password" class="mt-1.5 text-sm font-normal leading-normal text-state-red">
          {{ errors.password }}
        </p>
        <p v-else class="mt-1.5 text-xs font-normal leading-normal text-danger">
          密碼必須至少12個字元
        </p>
      </div>

      <div>
        <label class="mb-2 block text-sm font-bold leading-normal text-natural">確認新密碼 *</label>
        <span class="relative block">
          <input v-model="form.confirm" :type="show.confirm ? 'text' : 'password'" placeholder="請再次輸入新密碼" :class="[
            'h-10 w-full rounded-lg border bg-background-surface px-4 py-2 pr-12 text-base font-normal leading-normal text-natural outline-none transition placeholder:text-text-grey focus:border-border-focus focus:ring-2 focus:ring-primary/15',
            errors.confirm ? 'border-border-error' : 'border-copy-table-border',
          ]" />
          <button
            class="absolute grid -translate-y-1/2 right-3 top-1/2 size-6 place-items-center text-natural hover:text-primary"
            type="button" tabindex="-1" @click="show.confirm = !show.confirm">
            <EyeIcon :open="show.confirm" />
          </button>
        </span>
        <p v-if="errors.confirm" class="mt-1.5 text-sm font-normal leading-normal text-state-red">
          {{ errors.confirm }}
        </p>
      </div>

      <div class="text-sm font-normal leading-normal text-text-grey">
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
      <BaseButton class="w-48" :loading="submitting" @click="submit">確認修改</BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { h, reactive, ref, watch } from "vue";

import eyeCloseIcon from "@/assets/loginEyeClose.svg";
import eyeOpenIcon from "@/assets/loginEyeOpen.svg";
import passwordIcon from "@/assets/password.svg";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import { ChangeMyPassword } from "@/services/userService";
import { useAuthStore } from "@/stores/authStore";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  subtitle: { type: String, default: "員編：1193285" },
});

const emit = defineEmits(["update:modelValue", "submitted"]);

const form = reactive({ current: "", password: "", confirm: "" });
const errors = reactive({ current: "", password: "", confirm: "" });
const show = reactive({ current: false, password: false, confirm: false });
const submitting = ref(false);
const auth = useAuthStore();

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      form.current = "";
      form.password = "";
      form.confirm = "";
      errors.current = "";
      errors.password = "";
      errors.confirm = "";
    }
  },
);

const validate = () => {
  errors.current = form.current ? "" : "請輸入目前密碼";
  errors.password = !form.password
    ? "請輸入新密碼"
    : form.password.length < 12
      ? "密碼必須至少12個字元"
      : "";
  errors.confirm = !form.confirm
    ? "請再次輸入新密碼"
    : form.confirm !== form.password
      ? "兩次輸入的密碼不一致"
      : "";
  return !errors.current && !errors.password && !errors.confirm;
};

const submit = async () => {
  if (!validate()) return;
  try {
    submitting.value = true;
    await ChangeMyPassword({
      id: auth.userId,
      oldPassword: form.current,
      newPassword: form.password,
    });
    auth.markPasswordChanged();
    emit("submitted", { ...form });
    close();
  } catch (error) {
    console.error(error);
  } finally {
    submitting.value = false;
  }
};
const close = () => {
  emit("update:modelValue", false);
};

const EyeIcon = (props) =>
  h("img", { src: props.open ? eyeOpenIcon : eyeCloseIcon, alt: "", "aria-hidden": "true", class: "size-6" });
</script>
