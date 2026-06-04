import { onBeforeUnmount, watch } from "vue";

const activeLocks = new Set();
let previousOverflow = "";
let previousPaddingRight = "";

export function useBodyScrollLock(source) {
  const lockId = Symbol("body-scroll-lock");

  const setLocked = (locked) => {
    if (locked) {
      lockBody(lockId);
      return;
    }
    unlockBody(lockId);
  };

  watch(source, setLocked, { immediate: true });

  onBeforeUnmount(() => {
    unlockBody(lockId);
  });
}

function lockBody(lockId) {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (activeLocks.has(lockId)) return;
  if (!activeLocks.size) {
    previousOverflow = document.body.style.overflow;
    previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      const currentPadding = Number.parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;
      document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }
  }
  activeLocks.add(lockId);
}

function unlockBody(lockId) {
  if (typeof document === "undefined") return;
  activeLocks.delete(lockId);
  if (activeLocks.size) return;
  document.body.style.overflow = previousOverflow;
  document.body.style.paddingRight = previousPaddingRight;
  previousOverflow = "";
  previousPaddingRight = "";
}
