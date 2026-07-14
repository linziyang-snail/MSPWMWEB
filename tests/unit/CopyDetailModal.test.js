import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";

import CopyDetailModal from "@/components/dialogs/CopyDetailModal.vue";

const baseCopy = {
  code: "COPY-001",
  title: "測試文案",
  content: "文案內容",
  status: "PENDING",
};

const mountedWrappers = [];

const mountDetail = (copy) => {
  const wrapper = mount(CopyDetailModal, {
    props: {
      modelValue: true,
      copy: { ...baseCopy, ...copy },
    },
    global: {
      stubs: {
        CopyPreviewModal: true,
      },
    },
    attachTo: document.body,
  });
  mountedWrappers.push(wrapper);
  return wrapper;
};

const modalText = () => document.body.textContent || "";

afterEach(() => {
  mountedWrappers.splice(0).forEach((wrapper) => wrapper.unmount());
  document.body.innerHTML = "";
});

describe("CopyDetailModal URL and action fields", () => {
  it("shows the URL and localized OPEN_URL action", () => {
    mountDetail({
      url: "https://example.com/campaign",
      clickAction: "OPEN_URL",
    });

    expect(modalText()).toContain("URL");
    expect(modalText()).toContain("https://example.com/campaign");
    expect(modalText()).toContain("動作");
    expect(modalText()).toContain("開啟連結");
  });

  it("shows safe fallbacks for empty URL and missing action", () => {
    mountDetail({ url: "" });

    expect(modalText()).toContain("—");
    expect(modalText()).toContain("無");
    expect(modalText()).not.toContain("undefined");
  });

  it("shows the localized OPEN_PAGE action", () => {
    mountDetail({ clickAction: "OPEN_PAGE" });

    expect(modalText()).toContain("跳轉頁面");
  });

  it("preserves an unknown action value for diagnosis", () => {
    mountDetail({ clickAction: "CUSTOM_ACTION" });

    expect(modalText()).toContain("CUSTOM_ACTION");
  });
});
