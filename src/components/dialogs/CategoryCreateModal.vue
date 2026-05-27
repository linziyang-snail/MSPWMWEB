<template>
  <BaseModal
    :model-value="modelValue"
    :title="modalTitle"
    subtitle="提交後需另一位超級管理員審核"
    size="sm"
    body-class="px-6 pt-4 pb-2"
    footer-class="px-6 py-4"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #icon>
      <img :src="buildingIcon" alt="" class="size-7" />
    </template>

    <label class="block">
      <span class="mb-2 block text-sm font-bold text-text-primary">
        科別名稱
      </span>
      <input
        v-model="name"
        class="h-10 w-full rounded-lg border border-border-strong bg-background-surface px-4 text-sm text-text-primary outline-none placeholder:text-text-placeholder focus:border-border-focus focus:ring-2 focus:ring-primary/15"
        :class="{ 'border-border-error': errorMsg }"
        placeholder="請輸入科別名稱"
        type="text"
        @keydown.enter.prevent
      />
      <p v-if="errorMsg" class="mt-1.5 text-xs text-state-red">
        {{ errorMsg }}
      </p>
    </label>

    <template #footer>
      <BaseButton
        class="min-w-20"
        variant="secondary"
        @click="$emit('update:modelValue', false)"
      >
        取消
      </BaseButton>
      <BaseButton class="min-w-24" :loading="submitting" @click="submit">
        確認提交
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, ref, watch } from "vue";

import buildingIcon from "@/assets/building2.svg";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import {
  createOrganization,
  updateOrganization,
} from "@/services/organizationService";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  category: { type: Object, default: null },
});

const emit = defineEmits(["update:modelValue", "submitted"]);

const name = ref("");
const errorMsg = ref("");
const submitting = ref(false);
const isEditMode = computed(() => Boolean(props.category?.id));
const modalTitle = computed(() => (isEditMode.value ? "修改科別" : "新增科別"));

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      name.value = props.category?.categoryName || props.category?.orgName || "";
      errorMsg.value = "";
    }
  },
);

async function submit() {
  if (!name.value.trim()) {
    errorMsg.value = "請輸入科別名稱";
    return;
  }
  errorMsg.value = "";
  try {
    submitting.value = true;
    if (isEditMode.value) {
      await updateOrganization({
        id: props.category.id,
        orgName: name.value.trim(),
      });
    } else {
      await createOrganization({
        orgName: name.value.trim(),
        orgType: "SECTION",
      });
    }
    emit("submitted", {
      id: props.category?.id,
      name: name.value.trim(),
      mode: isEditMode.value ? "edit" : "create",
    });
    emit("update:modelValue", false);
  } catch (error) {
    console.error(error);
  } finally {
    submitting.value = false;
  }
}
</script>
