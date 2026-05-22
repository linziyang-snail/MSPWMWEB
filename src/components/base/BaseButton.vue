<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium leading-6 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 active:scale-95',
      sizeClass,
      variantClasses[variant] || variantClasses.primary,
      block && 'w-full',
      (disabled || loading) && 'cursor-not-allowed opacity-60 active:scale-100',
    ]"
  >
    <span
      v-if="loading"
      class="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
    <slot />
  </button>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  type: { type: String, default: "button" },
  /** primary / secondary / outline / outline-primary / danger / success / ghost / text / icon */
  variant: { type: String, default: "primary" },
  /** sm / md / lg */
  size: { type: String, default: "md" },
  block: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
});

const sizeClass = computed(
  () =>
    ({
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-base",
      lg: "h-12 px-6 text-base",
    })[props.size] || "h-10 px-4 text-base",
);

const variantClasses = {
  primary:
    "bg-primary text-text-inverse hover:bg-primary-hover [&>img]:shrink-0 [&>img]:brightness-0 [&>img]:invert [&>svg]:size-6 [&>svg]:shrink-0",
  secondary:
    "border border-text-grey bg-background-surface text-natural hover:bg-background-hover [&>svg]:size-6 [&>svg]:shrink-0",
  outline:
    "border border-text-grey bg-background-surface text-natural hover:bg-background-hover [&>svg]:size-6 [&>svg]:shrink-0",
  "outline-primary":
    "border border-primary bg-background-surface text-primary hover:bg-primary-subtle",
  danger: "bg-danger text-text-inverse hover:opacity-90 [&>img]:brightness-0 [&>img]:invert",
  success: "bg-success text-text-inverse hover:opacity-90 [&>img]:brightness-0 [&>img]:invert",
  ghost:
    "bg-transparent text-text-secondary hover:bg-background-hover hover:text-primary",
  text: "h-auto bg-transparent px-1 text-primary hover:text-primary-hover",
  icon: "size-10 px-0 border border-border bg-background-surface text-text-secondary hover:bg-background-hover",
};
</script>
