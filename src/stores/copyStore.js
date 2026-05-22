import { defineStore } from "pinia";

import {
  approveCompatibleCopy,
  cancelCompatibleCopy,
  createCompatibleCopy,
  getCompatibleCopies,
  rejectCompatibleCopy,
} from "@/services/copyService";

/**
 * 經辦文案 store —— mock 版本
 * - 不打 API
 * - 提供 list / counts / create / cancel / copyAndCreate
 */
export const useCopyStore = defineStore("copies", {
  state: () => ({
    items: [],
    draft: null,
    loaded: false,
    loading: false,
    error: "",
  }),

  getters: {
    counts: (state) => getCounts(state.items),
    byStatus: (state) => (status) =>
      status ? state.items.filter((it) => it.status === status) : state.items,
  },

  actions: {
    async ensureLoaded() {
      if (this.loaded || this.loading) return;
      this.loading = true;
      this.error = "";
      try {
        this.items = await getCompatibleCopies();
        this.loaded = true;
      } catch (error) {
        this.error = "文案資料載入失敗";
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    /** 經辦：新增文案並送出審核 */
    async create(payload) {
      const item = await createCompatibleCopy(payload);
      if (item) this.items = [item, ...this.items];
      return item;
    },

    /** 經辦：取消送審 (待審核 → 已取消) */
    async cancelSubmission(id) {
      const item = await cancelCompatibleCopy(id);
      if (item) this.replaceItem(item);
    },

    /** 覆核主管：核准文案 */
    async approveSubmission(id) {
      const item = await approveCompatibleCopy(id);
      if (item) this.replaceItem(item);
    },

    /** 覆核主管：駁回文案 */
    async rejectSubmission(id, reason) {
      const item = await rejectCompatibleCopy(id, reason);
      if (item) this.replaceItem(item);
    },

    /** 經辦：以既有文案複製建立新版本 */
    async copyAndCreate(sourceId, overrides = {}) {
      const source = this.items.find((it) => it.id === sourceId);
      if (!source) return null;
      return this.create({
        title: overrides.title ?? `${source.title} (副本)`,
        category: overrides.category ?? source.category,
        nnbCategory:
          overrides.nnbCategory ?? source.nnbCategory ?? source.category,
        wbkCategory: overrides.wbkCategory ?? source.wbkCategory,
        content: overrides.content ?? source.content,
        note: overrides.note ?? source.note,
        clickAction: overrides.clickAction ?? source.clickAction,
        url: overrides.url ?? source.url,
        expirationType: overrides.expirationType ?? source.expirationType,
        retentionMonths: overrides.retentionMonths ?? source.retentionMonths,
        expiredAt: overrides.expiredAt ?? source.expiredAt,
      });
    },

    replaceItem(item) {
      const index = this.items.findIndex(
        (existing) => Number(existing.id) === Number(item.id),
      );
      if (index >= 0) this.items[index] = item;
    },
  },
});

const getCounts = (rows) =>
  rows.reduce(
    (acc, row) => {
      acc.all += 1;
      if (row.status === "PENDING") acc.pending += 1;
      if (row.status === "APPROVED") acc.approved += 1;
      if (row.status === "REJECTED") acc.rejected += 1;
      if (row.status === "CANCELLED") acc.cancelled += 1;
      return acc;
    },
    {
      all: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
    },
  );
