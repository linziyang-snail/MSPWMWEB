<template>
  <span ref="rootRef" class="relative block w-full">
    <button
      type="button"
      :disabled="disabled"
      :class="[
        'flex h-10 w-full items-center justify-between rounded-lg border bg-background-surface pl-4 pr-4 text-left text-sm leading-6 outline-none transition',
        'focus:border-border-focus focus:ring-2 focus:ring-primary/15',
        'disabled:bg-background-disabled disabled:text-text-disabled',
        error ? 'border-border-error' : 'border-border-strong',
        selectedOption ? 'text-text-primary' : 'text-text-placeholder',
      ]"
      @click="toggle"
      @keydown.down.prevent="openDropdown"
      @keydown.enter.prevent="toggle"
      @keydown.esc.prevent="closeDropdown"
    >
      <span class="truncate">{{ selectedOption?.label || placeholder }}</span>
      <img
        :src="chevronDownIcon"
        alt=""
        aria-hidden="true"
        :class="[
          'ml-3 size-4 shrink-0 text-text-muted transition-transform',
          isOpen && 'rotate-180',
        ]"
      />
    </button>

    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="dropdownRef"
        class="z-50 flex min-w-28 flex-col gap-4 rounded-2xl bg-background-surface px-4 py-6 shadow-popup"
        :style="floatingStyle"
        @click.stop
        @mousedown.stop
      >
        <button
          v-for="option in options"
          :key="option.value"
          type="button"
          :class="[
            'flex h-12 min-w-20 items-center justify-center whitespace-nowrap rounded-lg px-4 py-3 text-center text-base font-medium leading-normal text-natural transition hover:bg-copy-table-border/60',
            option.value === modelValue && 'bg-copy-table-border',
          ]"
          @click="selectOption(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </Teleport>
  </span>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";

import chevronDownIcon from "@/assets/icon-chevron-down.svg";
import { useFloatingPosition } from "@/composables/useFloatingPosition";

const props = defineProps({
  modelValue: { type: [String, Number], default: "" },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: "請選擇" },
  disabled: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "blur"]);

const isOpen = ref(false);
const rootRef = ref(null);
const dropdownRef = ref(null);

const dropdownHeight = computed(() => {
  if (!props.options.length) return 96;
  return props.options.length * 48 + Math.max(props.options.length - 1, 0) * 16 + 48;
});

const { floatingStyle, updateFloatingPosition, resetFloatingPosition } = useFloatingPosition(
  rootRef,
  dropdownRef,
  {
    minWidth: 110,
    maxHeight: 754,
  },
);

const selectedOption = computed(() =>
  props.options.find((option) => option.value === props.modelValue),
);

function openDropdown() {
  if (props.disabled) return;
  isOpen.value = true;
  nextTick(updateDropdownPlacement);
}

function closeDropdown(event) {
  if (!isOpen.value) return;
  isOpen.value = false;
  resetFloatingPosition();
  emit("blur", event);
}

function toggle() {
  if (props.disabled) return;
  isOpen.value ? closeDropdown() : openDropdown();
}

function selectOption(value) {
  emit("update:modelValue", value);
  closeDropdown();
}

function handleDocumentClick(event) {
  if (
    !rootRef.value ||
    rootRef.value.contains(event.target) ||
    dropdownRef.value?.contains(event.target)
  ) {
    return;
  }
  closeDropdown(event);
}

function updateDropdownPlacement() {
  const triggerWidth = rootRef.value?.getBoundingClientRect().width || 110;
  updateFloatingPosition({
    width: Math.max(110, triggerWidth),
    minWidth: Math.max(110, triggerWidth),
    height: dropdownHeight.value,
    maxHeight: 754,
  });
}

onMounted(() => {
  document.addEventListener("click", handleDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleDocumentClick);
});
</script>
