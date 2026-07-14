# Copy Detail URL and Action Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在共用文案詳情 Modal 顯示 URL 與中文動作，讓覆核主管與一般經辦取得一致資訊。

**Architecture:** 保留既有 `copyService` row model 與角色資料流，只修改共用 `CopyDetailModal` 的唯讀呈現。動作文字使用既有 `clickActionLabelMap`，URL 與未知／缺少值採安全 fallback。

**Tech Stack:** Vue 3 Composition API、Vitest、Vue Test Utils。

## Global Constraints

- 覆核主管與一般經辦共用同一份顯示規則，不增加角色條件。
- `OPEN_URL` 顯示「開啟連結」、`OPEN_PAGE` 顯示「跳轉頁面」、`NONE` 顯示「無」。
- 空 URL 顯示 `—`；缺少動作時顯示「無動作」；未知動作顯示原始值。
- URL 僅作唯讀文字，不新增可點擊導航。
- 不修改 API、change-request 查詢或權限判斷，不新增第三方依賴。

---

### Task 1: 在共用文案詳情顯示 URL 與動作

**Files:**
- Modify: `src/components/dialogs/CopyDetailModal.vue`
- Create: `tests/unit/CopyDetailModal.test.js`

**Interfaces:**
- Consumes: `copy.url?: string`、`copy.clickAction?: string`、`clickActionLabelMap`。
- Produces: `actionLabel: ComputedRef<string>` 與 Modal 中的「URL」、「動作」唯讀欄位。

- [ ] **Step 1: 寫 OPEN_URL 失敗測試**

掛載 `CopyDetailModal`，傳入必要文案欄位、`url: "https://example.com"`、`clickAction: "OPEN_URL"`，斷言文字包含「URL」、「https://example.com」、「動作」、「開啟連結」。

- [ ] **Step 2: 寫 fallback 與 OPEN_PAGE 失敗測試**

分別驗證：`NONE`＋空 URL 顯示「無」與 `—`；`OPEN_PAGE` 顯示「跳轉頁面」；缺少兩欄不顯示 `undefined`；未知 `clickAction: "CUSTOM_ACTION"` 顯示原始值。

- [ ] **Step 3: 執行測試確認失敗**

Run: `npm test -- tests/unit/CopyDetailModal.test.js`
Expected: FAIL，因目前詳情模板沒有 URL 與動作欄位。

- [ ] **Step 4: 實作最小呈現**

在文案內容下方加入：

```vue
<FieldRow label="URL">
  <span class="flex min-h-10 items-center rounded-lg border border-copy-table-border bg-background-surface px-4 py-2 text-base font-normal leading-normal text-natural">
    {{ copy.url || "—" }}
  </span>
</FieldRow>
<FieldRow label="動作">
  <span class="flex min-h-10 items-center rounded-lg border border-copy-table-border bg-background-surface px-4 py-2 text-base font-normal leading-normal text-natural">
    {{ actionLabel }}
  </span>
</FieldRow>
```

並新增：

```js
import { clickActionLabelMap } from "@/utils/constants";

const actionLabel = computed(() => {
  const action = props.copy?.clickAction || "NONE";
  return clickActionLabelMap[action] || action;
});
```

- [ ] **Step 5: 執行 focused 與完整驗證**

Run: `npm test -- tests/unit/CopyDetailModal.test.js`
Expected: PASS。

Run: `npm test`
Expected: 全部 Vitest 測試 PASS。

Run: `npm run build`
Expected: Vite production build 成功。

- [ ] **Step 6: Commit**

```bash
git add src/components/dialogs/CopyDetailModal.vue tests/unit/CopyDetailModal.test.js docs/superpowers/plans/2026-07-14-copy-detail-url-action.md
git commit -m "fix: show copy URL and action in details"
```
