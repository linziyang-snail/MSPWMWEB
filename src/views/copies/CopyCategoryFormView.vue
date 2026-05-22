<template>
  <form
    class="max-w-xl rounded-lg border border-border-muted bg-background-surface p-5"
    @submit.prevent="submit"
  >
    <FormField label="分類名稱" required :error="error"
      ><BaseInput v-model="categoryName"
    /></FormField>
    <p
      v-if="message"
      class="mt-4 rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-700"
    >
      {{ message }}
    </p>
    <div class="mt-6 flex justify-end gap-3">
      <RouterLink to="/copy-categories"
        ><BaseButton variant="secondary">取消</BaseButton></RouterLink
      >
      <BaseButton type="submit" :loading="loading">儲存</BaseButton>
    </div>
  </form>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import BaseButton from "@/components/base/BaseButton.vue";
import BaseInput from "@/components/base/BaseInput.vue";
import FormField from "@/components/forms/FormField.vue";
import { GetCompatibleCopyCategories } from "@/services/categoryCompatibilityService";
import {
  createCopyCategory,
  updateCopyCategory,
} from "@/services/copyCategoryService";
import { validateRequired } from "@/utils/validators";

const props = defineProps({
  mode: { type: String, default: "create" },
  id: { type: [String, Number], default: "" },
});
const router = useRouter();
const categoryName = ref("");
const error = ref("");
const loading = ref(false);
const message = ref("");

onMounted(async () => {
  if (props.mode !== "edit") return;
  try {
    const categories = await GetCompatibleCopyCategories();
    const source = categories.find(
      (item) => String(item.id) === String(props.id),
    );
    categoryName.value = source?.categoryName || "";
  } catch (error) {
    console.error(error);
  }
});

const submit = async () => {
  error.value = validateRequired(categoryName.value, "分類名稱");
  if (error.value) return;
  loading.value = true;
  try {
    if (props.mode === "create")
      await createCopyCategory({ categoryName: categoryName.value });
    else
      await updateCopyCategory({
        copyCategoryId: props.id,
        categoryName: categoryName.value,
      });
    message.value = "分類異動已送出。";
    setTimeout(() => router.push("/copy-categories"), 700);
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};
</script>
