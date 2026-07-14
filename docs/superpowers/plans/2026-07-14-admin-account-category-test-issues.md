# Admin Account and Category Test Issues Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成人員管理全部／已駁回清單、帳號與科別重新新增錯誤提示、雙類型操作歷程，以及科別刪除前人員檢查。

**Architecture:** 延續 `component → Pinia store → service → apiRequest` 單向資料流。帳號頁以 route meta 決定主檔或 change request 資料源；歷程服務聚合 USER/ORGANIZATION；科別刪除檢查抽成可單測的 service/helper，後端仍保留最終資料完整性責任。

**Tech Stack:** Vue 3 Composition API、Vue Router、Pinia、Axios、Vitest、Vue Test Utils。

## Global Constraints

- 「全部帳號」呼叫帳號 API 時不傳 `status`，顯示後端回傳資料。
- 「已駁回帳號」只查 `targetType=USER&status=REJECTED`。
- 已刪除員編／科別的唯一性與恢復由後端決定；前端不得假成功。
- 科別是否仍有人員由後端刪除 API 判斷；前端不得下載全部帳號自行判定。
- 不新增第三方依賴，不修改後端 API。

---

### Task 1: 支援未帶 status 的全部帳號資料流

**Files:**
- Modify: `src/services/userService.js`
- Modify: `src/stores/userStore.js`
- Test: `tests/unit/userService.test.js`
- Test: `tests/unit/userStore.test.js`

**Interfaces:**
- Produces: `getUsers({ page, size, status?: string })`；`status` 未提供時請求參數中不得出現 `status`。
- Produces: `userStore.fetchUsers({ status: null, size: 100 })`，以 `ALL` cache key 抓完所有分頁。

- [ ] **Step 1: 寫 service 失敗測試**

Mock `apiRequest.get`，呼叫 `getUsers({ page: 1, size: 100, status: null })`，斷言 `/api/users` 的 params 等於 `{ page: 1, size: 100 }`。

- [ ] **Step 2: 執行測試確認失敗**

Run: `npm test -- tests/unit/userService.test.js`
Expected: FAIL，因現況會把預設 `ACTIVE` 放入 params。

- [ ] **Step 3: 修改 service 的 status 預設行為**

將解構改為保留未提供狀態：

```js
export async function getUsers(params = {}) {
  const { page = 1, size = 20, status } = params || {};
  return unwrapApiBody(
    await apiRequest.get("/api/users", {
      params: pruneEmptyParams({ page, size: clampUserPageSize(size), status }),
    }),
  );
}
```

- [ ] **Step 4: 寫 store 全部帳號分頁測試**

在 `userStore.test.js` 加入 `status: null` 案例，mock 第一頁 100 筆、第二頁 20 筆，斷言兩次 `getUsers` 都收到 `status: undefined` 或未提供狀態，且 `getCachedUsers(null)` 回傳 120 筆。

- [ ] **Step 5: 實作 ALL cache key 與全分頁查詢**

調整 `normalizeStatusList`、`buildStatusKey`、`fetchAllUsersForStatus`：

```js
function normalizeStatusList(status) {
  if (status === null || status === undefined || status === "") return [];
  if (Array.isArray(status)) return status.filter(Boolean).map(String);
  return [String(status)];
}

function buildStatusKey(status) {
  const statuses = normalizeStatusList(status);
  return statuses.length ? statuses.sort().join(",") : "ALL";
}
```

`fetchUsers` 遇到空 statuses 時執行一次 `fetchAllUsersForStatus(undefined, requestParams)`；呼叫 service 前移除 `status`。

- [ ] **Step 6: 執行相關測試**

Run: `npm test -- tests/unit/userService.test.js tests/unit/userStore.test.js`
Expected: PASS。

- [ ] **Step 7: Commit**

```bash
git add src/services/userService.js src/stores/userStore.js tests/unit/userService.test.js tests/unit/userStore.test.js
git commit -m "feat: support unfiltered account queries"
```

### Task 2: 新增全部帳號與已駁回帳號頁面

**Files:**
- Modify: `src/router/routes.js`
- Modify: `src/utils/navigation.js`
- Modify: `src/views/accounts/AccountStatusListView.vue`
- Test: `tests/unit/accountRoutes.test.js`
- Test: `tests/unit/AccountStatusListView.test.js`

**Interfaces:**
- Consumes: Task 1 的 `fetchUsers({ status: null })`。
- Produces: `AccountAll` route；真正的 `AccountRejected` route；REJECTED change request 列表。

- [ ] **Step 1: 寫路由與導覽失敗測試**

斷言：

```js
expect(routes).toContainEqual(expect.objectContaining({ name: "AccountAll" }));
expect(findRoute("AccountRejected").redirect).toBeUndefined();
expect(accountChildren.map((item) => item.label)).toEqual(
  expect.arrayContaining(["全部帳號", "已駁回帳號"]),
);
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `npm test -- tests/unit/accountRoutes.test.js`
Expected: FAIL，因 `AccountAll` 不存在且 rejected 仍 redirect。

- [ ] **Step 3: 新增 routes、sidebar 與 breadcrumb**

在 `routes.js` 加入：

```js
{
  path: "accounts/all",
  name: "AccountAll",
  component: AccountStatusListView,
  meta: { title: "全部帳號", status: "ALL", roles: ["ADMIN"] },
},
{
  path: "accounts/rejected",
  name: "AccountRejected",
  component: AccountStatusListView,
  meta: { title: "已駁回帳號", status: "REJECTED", roles: ["ADMIN"] },
},
```

在 `navigation.js` 人員 children 加入兩項並新增 `AccountAll`、`AccountRejected` breadcrumb。

- [ ] **Step 4: 寫 AccountStatusListView 資料源失敗測試**

掛載 `AccountAll` 時斷言 `fetchUsers` 收到 `status: null`；掛載 `AccountRejected` 時斷言 `fetchAccountChangeRequests` 收到 `{ status: "REJECTED" }`，且不呼叫 `fetchUsers`。

- [ ] **Step 5: 實作 route 對應**

在 view 中加入：

```js
if (route.name === "AccountAll") return null;
```

至 `accountRouteApiStatus`；在 `accountRouteRequestQuery` 加入 rejected query；將 `AccountRejected` 納入 `routeNeedsChangeRequests`，並於 `filteredRows` 使用通用 change-request row normalizer 呈現駁回資料。表格在 rejected route 將日期欄改為「駁回日期」、尾欄改為「駁回原因」。

- [ ] **Step 6: 執行測試**

Run: `npm test -- tests/unit/accountRoutes.test.js tests/unit/AccountStatusListView.test.js`
Expected: PASS。

- [ ] **Step 7: Commit**

```bash
git add src/router/routes.js src/utils/navigation.js src/views/accounts/AccountStatusListView.vue tests/unit/accountRoutes.test.js tests/unit/AccountStatusListView.test.js
git commit -m "feat: add all and rejected account views"
```

### Task 3: 聚合人員與科別操作歷程

**Files:**
- Modify: `src/services/operationHistoryService.js`
- Modify: `src/views/operationLogs/OperationLogView.vue`
- Test: `tests/unit/operationHistoryService.test.js`
- Test: `tests/unit/OperationLogView.test.js`

**Interfaces:**
- Produces: `getOperationHistory(params)` 回傳 `{ list, content, totalElements, partialFailure, failedTargetTypes }`。

- [ ] **Step 1: 寫雙類型與部分失敗測試**

Mock `getChangeRequests` 依 `targetType` 回傳 USER 與 ORGANIZATION 紀錄，斷言兩者合併並依日期倒序。再令 ORGANIZATION reject，斷言 USER 紀錄仍存在、`partialFailure === true`、`failedTargetTypes === ["ORGANIZATION"]`。

- [ ] **Step 2: 執行測試確認失敗**

Run: `npm test -- tests/unit/operationHistoryService.test.js`
Expected: FAIL，現況只送出 USER 查詢。

- [ ] **Step 3: 實作獨立分頁查詢與 allSettled 聚合**

新增 `fetchAllHistoryForTargetType(targetType, params)`，用原有 guard 分頁；主函式：

```js
const targetTypes = ["USER", "ORGANIZATION"];
const results = await Promise.allSettled(
  targetTypes.map((targetType) => fetchAllHistoryForTargetType(targetType, params)),
);
const failedTargetTypes = results
  .map((result, index) => result.status === "rejected" ? targetTypes[index] : null)
  .filter(Boolean);
if (failedTargetTypes.length === targetTypes.length) throw results[0].reason;
```

合併 fulfilled rows 後沿用 normalize 與 sort utilities。

- [ ] **Step 4: 寫頁面提示測試並實作**

在 view 新增 `historyWarning` ref。若 `response.partialFailure`，顯示 `部分操作歷程載入失敗，請稍後重試`；完全失敗使用既有全域錯誤行為且不顯示 EmptyState。

- [ ] **Step 5: 執行測試**

Run: `npm test -- tests/unit/operationHistoryService.test.js tests/unit/OperationLogView.test.js`
Expected: PASS。

- [ ] **Step 6: Commit**

```bash
git add src/services/operationHistoryService.js src/views/operationLogs/OperationLogView.vue tests/unit/operationHistoryService.test.js tests/unit/OperationLogView.test.js
git commit -m "feat: include category operation history"
```

### Task 4: 依後端判斷處理科別刪除限制

**Files:**
- Modify: `src/views/applications/ApplicationQueryView.vue`
- Test: `tests/unit/ApplicationQueryView.test.js`

**Interfaces:**
- Consumes: `disableOrganization({ id })` 的成功或後端拒絕結果。
- Produces: 後端人員衝突的明確提示，並保留確認視窗與選取科別。

- [ ] **Step 1: 寫元件行為失敗測試**

覆蓋三種情境：點擊刪除不查詢帳號清單並開啟 dialog；後端允許時完成送出；後端以科別下有人員拒絕時顯示明確訊息且保留 dialog。

- [ ] **Step 2: 執行測試確認失敗**

Run: `npm test -- tests/unit/ApplicationQueryView.test.js`
Expected: FAIL，現況尚未把後端人員衝突轉成指定訊息並保留 dialog。

- [ ] **Step 3: 維持直接確認流程**

`openDeleteCategory(category)` 只設定 `selectedCategory` 並開啟確認視窗，不呼叫帳號清單 API。是否可刪除由使用者確認後的 `disableOrganization` 回應決定。

- [ ] **Step 4: 實作後端拒絕處理**

`confirmDeleteCategory` catch 使用 `resolveApiErrorMessage(error)`；若錯誤可辨識為科別下有人員，顯示 `此科別下仍有人員，請先刪除或移轉所有帳號。`。失敗時不得關閉 dialog 或清除 `selectedCategory`。

- [ ] **Step 5: 保留一般後端錯誤**

無法辨識為人員衝突時顯示 `resolveApiErrorMessage(error)`，同樣保留 dialog；只有成功時才關閉並清除選取資料。

- [ ] **Step 6: 執行測試**

Run: `npm test -- tests/unit/ApplicationQueryView.test.js`
Expected: PASS。

- [ ] **Step 7: Commit**

```bash
git add src/views/applications/ApplicationQueryView.vue tests/unit/ApplicationQueryView.test.js
git commit -m "fix: rely on backend category deletion guard"
```

### Task 5: 已刪除資料重新新增錯誤提示與整體驗證

**Files:**
- Modify: `src/utils/resolveApiErrorMessage.js`
- Modify: `src/components/dialogs/AccountCreateModal.vue`
- Modify: `src/components/dialogs/CategoryCreateModal.vue`
- Test: `tests/unit/resolveApiErrorMessage.test.js`
- Test: `tests/unit/AccountCreateModal.test.js`
- Test: `tests/unit/CategoryCreateModal.test.js`

**Interfaces:**
- Produces: `resolveDeletedDuplicateMessage(error, targetType)`，只在可辨識重複／已刪除衝突時回傳專用訊息，否則回傳空字串。

- [ ] **Step 1: 寫錯誤分類失敗測試**

使用含 `duplicate`/`已刪除`/`unique` 的後端 code 或 desc 測試 ACCOUNT 與 ORGANIZATION 文案；另以一般 400 驗證回傳空字串，不誤分類。

- [ ] **Step 2: 執行測試確認失敗**

Run: `npm test -- tests/unit/resolveApiErrorMessage.test.js`
Expected: FAIL，函式尚不存在。

- [ ] **Step 3: 實作保守分類函式**

```js
export function resolveDeletedDuplicateMessage(error, targetType) {
  const source = [error?.code, error?.desc, error?.response?.data?.code, error?.response?.data?.desc]
    .filter(Boolean).join(" ").toLowerCase();
  const isDeletedDuplicate = /deleted|已刪除/.test(source) && /duplicate|unique|重複|已存在/.test(source);
  if (!isDeletedDuplicate) return "";
  return targetType === "ACCOUNT"
    ? "此員編曾被刪除，目前後端尚未開放重新建立，請聯絡系統管理人員恢復或解除限制。"
    : "此科別曾被刪除，目前後端尚未開放重新建立，請聯絡系統管理人員恢復或解除限制。";
}
```

- [ ] **Step 4: 在兩個新增 modal 套用專用訊息**

catch 中先呼叫分類函式；有專用訊息時顯示它，否則沿用 `resolveApiErrorMessage(error)`。不得增加前端重複資料預檢。

- [ ] **Step 5: 執行完整驗證**

Run: `npm test`
Expected: 全部 Vitest 測試 PASS。

Run: `npm run build`
Expected: Vite production build 成功且無 compile error。

- [ ] **Step 6: Commit**

```bash
git add src/utils/resolveApiErrorMessage.js src/components/dialogs/AccountCreateModal.vue src/components/dialogs/CategoryCreateModal.vue tests/unit/resolveApiErrorMessage.test.js tests/unit/AccountCreateModal.test.js tests/unit/CategoryCreateModal.test.js
git commit -m "feat: clarify deleted record recreation errors"
```
