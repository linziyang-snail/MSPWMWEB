<template>
  <span ref="rootRef" class="relative block w-full">
    <button
      type="button"
      :disabled="disabled"
      :class="[
        'flex h-10 w-full items-center justify-between rounded-lg border bg-background-surface px-4 text-left text-base font-medium outline-none shadow-control transition',
        'focus:border-border-focus focus:ring-2 focus:ring-primary/15',
        'disabled:bg-background-disabled disabled:text-text-disabled',
        error ? 'border-border-error' : 'border-border-strong',
        modelValue ? 'text-text-secondary' : 'text-text-placeholder',
      ]"
      @click="togglePicker"
      @keydown.esc.prevent="closePicker"
    >
      <span>{{ displayValue || placeholder }}</span>
      <img :src="calendarIcon" alt="" class="size-5 shrink-0" />
    </button>

    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="pickerRef"
        class="z-50 rounded-lg bg-background-surface px-4 py-6 shadow-popup"
        :style="floatingStyle"
        @click.stop
        @mousedown.stop
        @pointerdown.capture="markPickerInteraction"
      >
        <div class="flex flex-col gap-6">
          <div class="flex h-10 items-center justify-between">
            <button
              type="button"
              class="grid size-6 place-items-center text-natural hover:text-primary"
              @click.stop="goPrevious"
            >
              <img :src="chevronLeftIcon" alt="" aria-hidden="true" class="size-6" />
            </button>

            <button
              type="button"
              :class="[
                'rounded px-4 py-1 text-xl font-bold leading-normal tracking-wide text-text-heading',
                mode === 'month' && 'bg-copy-table-border',
              ]"
              @click.stop="handleHeaderClick"
            >
              {{ headerLabel }}
            </button>

            <button
              type="button"
              class="grid size-6 place-items-center text-natural hover:text-primary"
              @click.stop="goNext"
            >
              <img :src="chevronRightIcon" alt="" aria-hidden="true" class="size-6" />
            </button>
          </div>

          <template v-if="mode === 'date'">
            <div class="grid grid-cols-7 gap-y-4">
              <div
                v-for="day in weekDays"
                :key="day"
                class="text-center text-base font-normal leading-normal text-text-heading"
              >
                {{ day }}
              </div>
              <button
                v-for="day in calendarDays"
                :key="day.key"
                type="button"
                :class="[
                  'grid h-6 place-items-center rounded text-base font-semibold leading-tight transition',
                  day.inCurrentMonth ? 'text-text-heading' : 'text-text-heading',
                  isSameDate(day.date, draftDate) && 'bg-primary text-text-inverse',
                ]"
                @click.stop="selectDate(day.date)"
              >
                {{ day.date.getDate() }}
              </button>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <button
                type="button"
                class="h-14 rounded-lg border border-text-grey bg-background-surface px-7 py-2.5 text-base font-medium leading-normal text-natural"
                @click.stop="cancel"
              >
                取消
              </button>
              <button
                type="button"
                class="h-14 rounded-lg bg-primary px-7 py-2.5 text-base font-medium leading-normal text-text-inverse"
                @click.stop="confirm"
              >
                確認
              </button>
            </div>
          </template>

          <template v-else-if="mode === 'month'">
            <div class="grid grid-cols-4 gap-x-3 gap-y-4">
              <button
                v-for="(month, index) in monthLabels"
                :key="month"
                type="button"
                :class="[
                  'h-8 rounded px-2 py-1 text-center text-base font-normal leading-normal text-text-heading',
                  index === viewMonth && 'bg-primary text-text-inverse',
                ]"
                @click.stop="selectMonth(index)"
              >
                {{ month }}
              </button>
            </div>
          </template>

          <template v-else>
            <div class="grid grid-cols-4 gap-x-3 gap-y-4">
              <button
                v-for="year in yearRange"
                :key="year"
                type="button"
                :class="[
                  'h-7 rounded px-2 py-1 text-center text-base font-semibold leading-tight text-text-heading',
                  year === viewYear && 'bg-primary text-text-inverse',
                ]"
                @click.stop="selectYear(year)"
              >
                {{ year }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </Teleport>
  </span>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

import calendarIcon from "@/assets/calendar.svg";
import chevronLeftIcon from "@/assets/icon-chevron-left.svg";
import chevronRightIcon from "@/assets/icon-chevron-right.svg";
import { useFloatingPosition } from "@/composables/useFloatingPosition";

const props = defineProps({
  modelValue: { type: String, default: "" },
  type: { type: String, default: "text" },
  placeholder: { type: String, default: "年/月/日" },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "blur"]);

const rootRef = ref(null);
const pickerRef = ref(null);
const isOpen = ref(false);
const mode = ref("date");
let isPickerInteraction = false;
const today = new Date();
const viewYear = ref(today.getFullYear());
const viewMonth = ref(today.getMonth());
const draftDate = ref(new Date(today.getFullYear(), today.getMonth(), today.getDate()));

const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
const monthLabels = [
  "一月",
  "二月",
  "三月",
  "四月",
  "五月",
  "六月",
  "七月",
  "八月",
  "九月",
  "十月",
  "十一月",
  "十二月",
];

const pickerHeight = computed(() => (mode.value === "date" ? 450 : mode.value === "month" ? 238 : 223));
const { floatingStyle, updateFloatingPosition, resetFloatingPosition } = useFloatingPosition(rootRef, pickerRef, {
  width: 344,
  minWidth: 344,
  maxHeight: 450,
});

const displayValue = computed(() => props.modelValue);

const headerLabel = computed(() => {
  if (mode.value === "date") return `${monthLabels[viewMonth.value]} ${viewYear.value}`;
  if (mode.value === "month") return String(viewYear.value);
  const start = decadeStart.value;
  return `${start}-${start + 9}`;
});

const decadeStart = computed(() => Math.floor(viewYear.value / 10) * 10);

const yearRange = computed(() => {
  const start = decadeStart.value;
  return Array.from({ length: 12 }, (_, index) => start + index - 1);
});

const calendarDays = computed(() => {
  const firstDay = new Date(viewYear.value, viewMonth.value, 1);
  const start = new Date(viewYear.value, viewMonth.value, 1 - firstDay.getDay());
  return Array.from({ length: 35 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      key: date.toISOString(),
      date,
      inCurrentMonth: date.getMonth() === viewMonth.value,
    };
  });
});

watch(
  () => props.modelValue,
  () => {
    syncFromValue();
  },
  { immediate: true },
);

function parseValue(value) {
  if (!value) return null;
  const normalized = value.includes("/") ? value.replaceAll("/", "-") : value;
  const [year, month, day] = normalized.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function syncFromValue() {
  const parsed = parseValue(props.modelValue);
  const source = parsed || today;
  viewYear.value = source.getFullYear();
  viewMonth.value = source.getMonth();
  draftDate.value = new Date(source.getFullYear(), source.getMonth(), source.getDate());
}

function togglePicker() {
  if (props.disabled || props.readonly) return;
  if (isOpen.value) {
    closePicker();
    return;
  }
  syncFromValue();
  mode.value = "date";
  isOpen.value = true;
  nextTick(updatePickerPlacement);
}

function closePicker(event) {
  if (!isOpen.value) return;
  isOpen.value = false;
  mode.value = "date";
  resetFloatingPosition();
  emit("blur", event);
}

function handleHeaderClick() {
  if (mode.value === "date") {
    mode.value = "month";
  } else if (mode.value === "month") {
    mode.value = "year";
  }
  nextTick(updatePickerPlacement);
}

function goPrevious() {
  if (mode.value === "date") {
    const date = new Date(viewYear.value, viewMonth.value - 1, 1);
    viewYear.value = date.getFullYear();
    viewMonth.value = date.getMonth();
  } else if (mode.value === "month") {
    viewYear.value -= 1;
  } else {
    viewYear.value -= 10;
  }
}

function goNext() {
  if (mode.value === "date") {
    const date = new Date(viewYear.value, viewMonth.value + 1, 1);
    viewYear.value = date.getFullYear();
    viewMonth.value = date.getMonth();
  } else if (mode.value === "month") {
    viewYear.value += 1;
  } else {
    viewYear.value += 10;
  }
}

function selectDate(date) {
  draftDate.value = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  viewYear.value = date.getFullYear();
  viewMonth.value = date.getMonth();
}

function selectMonth(month) {
  viewMonth.value = month;
  mode.value = "date";
  nextTick(updatePickerPlacement);
}

function selectYear(year) {
  viewYear.value = year;
  mode.value = "month";
  nextTick(updatePickerPlacement);
}

function formatDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}/${month}/${day}`;
}

function cancel() {
  closePicker();
  syncFromValue();
}

function confirm() {
  emit("update:modelValue", formatDate(draftDate.value));
  closePicker();
}

function isSameDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function handleDocumentClick(event) {
  if (isPickerInteraction) {
    isPickerInteraction = false;
    return;
  }
  if (
    !rootRef.value ||
    rootRef.value.contains(event.target) ||
    pickerRef.value?.contains(event.target)
  ) {
    return;
  }
  closePicker(event);
}

function markPickerInteraction() {
  isPickerInteraction = true;
}

function updatePickerPlacement() {
  updateFloatingPosition({
    width: 344,
    minWidth: 344,
    height: pickerHeight.value,
    maxHeight: pickerHeight.value,
  });
}

onMounted(() => {
  document.addEventListener("click", handleDocumentClick);
  window.addEventListener("resize", updatePickerPlacement);
  document.addEventListener("scroll", updatePickerPlacement, true);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleDocumentClick);
  window.removeEventListener("resize", updatePickerPlacement);
  document.removeEventListener("scroll", updatePickerPlacement, true);
});
</script>
