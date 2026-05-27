<template>
  <Teleport to="body">
    <div v-if="modelValue" :class="[
      'fixed inset-0 flex items-center justify-center px-4 bg-background-overlay',
      overlayClass,
    ]"
      @click.self="handleOverlayClick">
      <section :class="[
        'flex max-h-modal-shell-max w-full flex-col overflow-hidden rounded-2xl bg-background-surface shadow-popup',
        widthClass,
        panelClass,
      ]">
        <header v-if="!hideHeader" :class="[
          'flex shrink-0 items-start justify-between gap-4 px-6 py-6 bg-background-hover',
          headerClass,
        ]">
          <div class="flex items-center gap-4">
            <div v-if="$slots.icon || icon" :class="[
              'grid rounded-full size-12 place-items-center',
              iconContainerClass || 'bg-primary-soft',
            ]">
              <slot name="icon">
                <img v-if="icon" :src="icon" alt="" class="size-7" />
              </slot>
            </div>
            <div class="min-w-0">
              <h2 class="text-xl font-bold leading-7 truncate text-text-secondary">
                {{ title }}
              </h2>
              <p v-if="subtitle" class="mt-1 text-xs leading-5 truncate text-text-grey">
                {{ subtitle }}
              </p>
            </div>
          </div>
          <button v-if="!hideClose"
            class="grid transition size-8 place-items-center text-text-muted hover:text-primary shrink-0" type="button"
            aria-label="關閉" @click="close">
            <img :src="closeIcon" alt="" aria-hidden="true" class="size-5" />
          </button>
        </header>

        <div :class="['min-h-0 flex-1 overflow-auto', bodyClass]">
          <slot />
        </div>

        <footer v-if="$slots.footer" :class="[
          'flex shrink-0 items-center justify-end gap-3 px-6 py-4 border-t border-border-muted bg-background-surface',
          footerClass,
        ]">
          <slot name="footer" />
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted } from "vue";

import closeIcon from "@/assets/icon-close.svg";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
  icon: { type: String, default: "" },
  /** sm = w-modal-password, md/lg/xl = shared modal width tokens, history = w-modal-history */
  size: { type: String, default: "md" },
  bodyClass: { type: String, default: "px-6 py-6" },
  panelClass: { type: String, default: "" },
  headerClass: { type: String, default: "" },
  footerClass: { type: String, default: "" },
  iconContainerClass: { type: String, default: "" },
  overlayClass: { type: String, default: "z-50" },
  hideHeader: { type: Boolean, default: false },
  hideClose: { type: Boolean, default: false },
  closeOnOverlay: { type: Boolean, default: false },
  closeOnEsc: { type: Boolean, default: true },
});

const emit = defineEmits(["update:modelValue", "close"]);

const widthClass = computed(
  () =>
    ({
      sm: "w-modal-password",
      md: "max-w-modal-md",
      lg: "w-modal-lg max-w-modal-max",
      xl: "w-modal-xl max-w-modal-max",
      copyDetail: "w-modal-copy-detail max-w-modal-max",
      preview: "w-modal-preview max-w-modal-max",
      history: "w-modal-history max-w-modal-max",
    })[props.size] || "max-w-modal-md",
);

const close = () => {
  emit("update:modelValue", false);
  emit("close");
};

const handleOverlayClick = () => {
  if (props.closeOnOverlay) close();
};

const handleKeydown = (event) => {
  if (!props.closeOnEsc || !props.modelValue || event.key !== "Escape") return;
  close();
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>
