import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";

const DEFAULT_MARGIN = 16;
const DEFAULT_GAP = 8;

export function getFloatingPosition({
  triggerRect,
  floatingWidth,
  floatingHeight,
  minWidth = 0,
  maxHeight = 754,
  gap = DEFAULT_GAP,
  margin = DEFAULT_MARGIN,
}) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const boundaryLeft = margin;
  const boundaryRight = viewportWidth - margin;
  const boundaryTop = margin;
  const boundaryBottom = viewportHeight - margin;
  const availableBelow = Math.max(0, boundaryBottom - triggerRect.bottom - gap);
  const availableAbove = Math.max(0, triggerRect.top - boundaryTop - gap);
  const desiredWidth = Math.max(floatingWidth, minWidth, triggerRect.width);
  const width = Math.min(desiredWidth, boundaryRight - boundaryLeft);
  const desiredHeight = Math.min(floatingHeight, maxHeight);

  // Keep the floating layer visually anchored to the trigger. If neither side
  // can fit the full height, use the side with more room and let content scroll.
  const placement =
    availableBelow >= desiredHeight || availableBelow >= availableAbove ? "bottom" : "top";
  const availableHeight = placement === "bottom" ? availableBelow : availableAbove;
  const height = Math.max(0, Math.min(desiredHeight, availableHeight));
  const preferredTop =
    placement === "bottom" ? triggerRect.bottom + gap : triggerRect.top - height - gap;
  const preferredLeft =
    triggerRect.left + width > boundaryRight ? triggerRect.right - width : triggerRect.left;

  return {
    left: clamp(preferredLeft, boundaryLeft, boundaryRight - width),
    top: preferredTop,
    width,
    maxHeight: height,
    placement,
  };
}

export function useFloatingPosition(triggerRef, floatingRef, options = {}) {
  const floatingStyle = ref({});
  const placement = ref("bottom");
  let lastOverride = {};

  const updateFloatingPosition = async (override = {}) => {
    await nextTick();
    if (!triggerRef.value) return;
    lastOverride = override;

    const triggerRect = triggerRef.value.getBoundingClientRect();
    const floatingRect = floatingRef.value?.getBoundingClientRect();
    const preferredWidth = override.width ?? options.width ?? triggerRect.width;
    const desiredHeight = override.height ?? floatingRect?.height ?? options.height ?? 240;
    const position = getFloatingPosition({
      triggerRect,
      floatingWidth: preferredWidth,
      floatingHeight: desiredHeight,
      minWidth: override.minWidth ?? options.minWidth ?? triggerRect.width,
      maxHeight: override.maxHeight ?? options.maxHeight ?? 754,
      gap: override.gap ?? options.gap ?? DEFAULT_GAP,
      margin: override.margin ?? options.margin ?? DEFAULT_MARGIN,
    });

    placement.value = position.placement;
    floatingStyle.value = {
      position: "fixed",
      left: `${position.left}px`,
      top: `${position.top}px`,
      width: `${position.width}px`,
      maxHeight: `${position.maxHeight}px`,
      overflowY: position.maxHeight < desiredHeight ? "auto" : "visible",
    };
  };

  const resetFloatingPosition = () => {
    floatingStyle.value = {};
    placement.value = "bottom";
    lastOverride = {};
  };

  const handleWindowChange = () => {
    if (Object.keys(floatingStyle.value).length) {
      updateFloatingPosition(lastOverride);
    }
  };

  onMounted(() => {
    window.addEventListener("resize", handleWindowChange);
    document.addEventListener("scroll", handleWindowChange, true);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("resize", handleWindowChange);
    document.removeEventListener("scroll", handleWindowChange, true);
  });

  return {
    floatingStyle,
    placement,
    updateFloatingPosition,
    resetFloatingPosition,
  };
}

function clamp(value, min, max) {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}
