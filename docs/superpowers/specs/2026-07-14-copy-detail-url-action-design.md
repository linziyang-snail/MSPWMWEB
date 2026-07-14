# 文案詳情 URL 與動作欄位顯示設計

日期：2026-07-14

## 問題與根因

覆核主管在「查看文案內容」中看不到 URL 與動作欄位。資料流追蹤確認 `copyService.normalizeCopyChangeRequest` 已將 payload 的 `url` 與 `clickAction` 保留在文案 row model，覆核主管與一般經辦也共用 `CopyDetailModal`。缺口位於共用詳情模板沒有渲染這兩個欄位，不是角色權限或 API 資料源差異。

## 設計

- 在 `CopyDetailModal` 的「文案內容」欄位下方新增「URL」與「動作」兩列。
- 沿用現有 `FieldRow` 與唯讀欄位樣式，使兩種角色看到相同版面。
- 動作以 `clickActionLabelMap` 顯示中文：
  - `OPEN_URL`：開啟連結
  - `OPEN_PAGE`：跳轉頁面
  - `NONE`：無
- URL 有值時顯示原值；空字串、`null` 或缺少欄位時顯示 `—`。
- 未知的 `clickAction` 不顯示 `undefined`；保留原始值供診斷，完全缺值時退回「無」。
- 不依角色加入條件渲染，不新增覆核主管專用 Modal。

## 資料與錯誤邊界

- 不修改 API request、change-request 查詢或權限判斷。
- 不在前端補造 URL；後端未提供時只顯示占位符。
- 不把 URL 轉成可點擊連結，避免內部後台誤觸外部網址；本次只做唯讀資訊呈現。

## 測試與驗收

- `OPEN_URL` 顯示實際 URL 與「開啟連結」。
- `OPEN_PAGE` 顯示「跳轉頁面」。
- `NONE` 顯示「無」，空 URL 顯示 `—`。
- 缺少 URL／動作時不出現 `undefined`。
- `CopyStatusListView` 對 MANAGER 與 USER 都繼續使用同一個 `CopyDetailModal`，因此顯示規則一致。
- 完整單元測試與 production build 必須通過。

## 不在本次範圍

- 修改後端 payload。
- 新增 URL 導航或安全白名單。
- 重做文案詳情 Modal 的其他區塊。
