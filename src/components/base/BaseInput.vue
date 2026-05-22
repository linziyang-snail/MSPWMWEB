<template>
  <span class="relative block w-full">
    <input
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :class="[
        'h-10 w-full rounded-lg border bg-background-surface px-4 text-sm leading-6 text-text-primary outline-none transition placeholder:text-text-placeholder',
        'focus:border-border-focus focus:ring-2 focus:ring-primary/15',
        'disabled:bg-background-disabled disabled:text-text-disabled',
        error ? 'border-border-error' : 'border-border-strong',
        (prefix || $slots.prefix) && 'pl-10',
        suffix && 'pr-10',
        inputClass,
      ]"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur', $event)"
    />
    <span
      v-if="prefix || $slots.prefix"
      class="absolute left-4 top-1/2 grid -translate-y-1/2 place-items-center text-text-muted"
    >
      <slot name="prefix">{{ prefix }}</slot>
    </span>
    <span
      v-if="suffix || $slots.suffix"
      class="absolute -translate-y-1/2 right-4 top-1/2 grid place-items-center text-text-muted"
    >
      <slot name="suffix">{{ suffix }}</slot>
    </span>
  </span>
</template>

<script setup>
defineProps({
  modelValue: { type: [String, Number], default: "" },
  type: { type: String, default: "text" },
  placeholder: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
  prefix: { type: String, default: "" },
  suffix: { type: String, default: "" },
  inputClass: { type: String, default: "" },
});

defineEmits(["update:modelValue", "blur"]);
</script>
