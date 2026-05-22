<template>
  <textarea
    ref="textareaRef"
    :value="modelValue"
    :rows="rows"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :class="[
      'block w-full resize-y rounded-lg border bg-background-surface px-4 py-3 text-sm leading-6 text-text-primary outline-none transition placeholder:text-text-placeholder',
      'focus:border-border-focus focus:ring-2 focus:ring-primary/15',
      'disabled:bg-background-disabled disabled:text-text-disabled',
      error ? 'border-border-error' : 'border-border-strong',
    ]"
    @input="$emit('update:modelValue', $event.target.value)"
    @blur="$emit('blur', $event)"
  />
  <p
    v-if="showCount"
    class="mt-1 text-right text-xs font-medium text-text-placeholder"
  >
    {{ String(modelValue || "").length
    }}{{ maxLength ? ` / ${maxLength}` : "" }}
  </p>
</template>

<script setup>
import { ref } from "vue";

defineProps({
  modelValue: { type: String, default: "" },
  rows: { type: Number, default: 4 },
  placeholder: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
  showCount: { type: Boolean, default: false },
  maxLength: { type: Number, default: 0 },
});

defineEmits(["update:modelValue", "blur"]);

const textareaRef = ref(null);

defineExpose({
  textareaRef,
});
</script>
