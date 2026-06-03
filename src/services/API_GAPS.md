# API Gaps / Diff

## Controller confirmed API

### Auth
- `POST /auth/login`：登入，request `{ userId, password }`，response body 含 `accessToken`。
- `POST /auth/refresh`：刷新 access token，response body 含 `token`，前端統一寫回 access token key。
- `POST /auth/logout`：登出。
- `PUT /auth/me/password`：修改自己的密碼，request `{ id, oldPassword, newPassword }`。

### User
- `GET /api/users?page=&size=&status=`：已支援 `status`，`size` 最大 100。
- 已啟用帳號前端歸類包含 `ACTIVE` 與 `PASSWORD_INVALID`；目前以前端並行查詢兩種 status 後合併去重，避免依賴後端 repeated `status` 支援。
- `POST /api/users`：新增使用者申請，`roleIds` required。
- `GET /api/users/{id}`：查詢單一使用者；前端不額外加死數字驗證。
- `PUT /api/users/{id}`：修改使用者申請。
- `DELETE /api/users/{id}`：停用使用者申請。
- `PUT /api/users/{id}/unlock`：解鎖使用者。
- `PUT /api/users/{id}/password`：重設使用者密碼。

### Organization
- `GET /api/organizations?status=`：已支援 `ACTIVE` / `DISABLED` / `PENDING`。
- `POST /api/organizations`：新增組織 / 科別，request `orgType` 送英文 enum。
- `PUT /api/organizations/{id}`：修改組織 / 科別。
- `DELETE /api/organizations/{id}`：停用組織 / 科別。
- Response 的 `orgType` / `status` 可能回中文 label，例如 `科別`、`啟用`、`審核中`；request 仍只送英文 enum。

### Approval / ChangeRequest
- `GET /api/change-requests`：新版多重查詢，使用 `ChangeRequestQuery`。
  - query：`id`、`targetId`、`targetType`（必填）、`action`、`status`（必填）、`start`、`end`、`page`、`size`。
  - `status` / `action` 多值以 repeated query key 送出，例如 `action=UPDATE&action=DELETE`、`status=PENDING&status=APPROVED`，不使用 `action[]=UPDATE` 或 `status[]=PENDING`。
  - `start` / `end` 依 Swagger 使用 `yyyy-MM-dd`。
  - response body 已改為 `PageChangeRequestDto`，列表資料在 `body.content`。
  - 舊 `/api/change-requests/history` 與 `/api/change-requests/search` 已不存在；前端相容 wrapper 皆改呼叫新版 `/api/change-requests`。
- `PUT /api/change-requests/{id}/approve`：核准。
- `PUT /api/change-requests/{id}/reject`：駁回，request `{ remark }`。
- `PUT /api/change-requests/{id}/cancel`：取消，後端權限主要給 `USER`。
- `ChangeRequestStatus` 使用 `CANCELED`，不是 `CANCELLED`。

### Role
- `GET /api/roles`：角色代碼使用 `ADMIN` / `MANAGER` / `USER`，中文只作顯示。

### Copy
- 目前正式 API 只有 `POST /api/copies`：文案送審。
- 正式 API 尚未提供 `GET /api/copies`、`GET /api/copies/{number}`、文案修改、停用、取消、核准、駁回 endpoint。

### Deprecated APIs still centralized in service
- CopyCategory：`/api/departments/copy-categories/**`，後端已標示 deprecated。
- OrganizationCategory：`/api/organizations/{orgId}/categories/**`，後端已標示 deprecated。
- 若現有 ADMIN 分類設定頁仍需使用，維持集中於 deprecated service，不讓 component 直接 import mock。

## Frontend changes made

- `apiRequest` 維持成功 response unwrap pattern：service 透過 `unwrapApiBody` 取得 `{ code, desc, body }` 的 `body`；錯誤保留 `status` / `code` / `desc` / `body` 並顯示後端 `desc`。
- `userService.getUsers` 支援 `page` / `size` / `status`，並限制 `size <= 100`。
- `organizationService.getOrganizations` 支援 `status`。
- `approvalService.getChangeRequests` 改為新版核心查詢，回傳 page object；`getPendingChangeRequests` / `getChangeRequestHistory` / `searchChangeRequests` 保留相容函式名，但不再呼叫舊 URL。
- `apiRequest` 新增 array repeated query serializer，供 Approval 的多值 `status` / `action` 查詢使用。
- 帳號新增 / 編輯的科別下拉改抓 `GET /api/organizations?status=ACTIVE` 並過濾 SECTION / 科別。
- 科別管理依 tab 改抓對應 status；待審核 / 已駁回操作使用 change request id。
- 全域前端 enum 改用 `CANCELED`。

## Remaining official API gaps

- 文案列表 / 詳情 / 取消 / 核准 / 駁回仍缺正式 Copy API；目前只可正式送 `POST /api/copies`。
- 文案列表仍保留 compatibility service，不會亂打不存在的 Copy endpoint。
- 操作歷程查詢第一版以 `GET /api/change-requests` 聚合 USER / ORGANIZATION，分別查詢後於前端 merge / sort。
- 401 自動 refresh 流程尚未完整串成 interceptor retry；auth store 已保留 refresh token 寫回 access token 的 action。

## ADMIN Smoke Test - 2026-06-03

Console smoke test 已完成，主要 ADMIN 查詢 API 共 12 支：

- total：12
- passed：12
- failed：0

### User / Account

| 頁面 / 功能 | API | 結果 |
| --- | --- | --- |
| 已啟用帳號 | `GET /api/users?page=1&size=100&status=ACTIVE` | page，count=15，totalElements=32 |
| 待審核新帳號 | `GET /api/change-requests?targetType=USER&status=PENDING&action=CREATE&page=1&size=100` | page，count=3，totalElements=3 |
| 待審核帳號異動 | `GET /api/change-requests?targetType=USER&status=PENDING&action=UPDATE&action=DELETE&page=1&size=100` | page，count=3，totalElements=3 |
| 已停用帳號 | `GET /api/users?page=1&size=100&status=LOCKED` | page，count=0，totalElements=32 |
| 已刪除帳號 | `GET /api/change-requests?targetType=USER&status=APPROVED&action=DELETE&page=1&size=100` | page，count=10，totalElements=10 |
| 帳號搜尋 | `GET /api/users/keyword?page=1&size=20&status=ACTIVE&keyword=1` | page，count=10，totalElements=10 |
| 角色列表 | `GET /api/roles` | array，count=3；roles=`ADMIN` / `MANAGER` / `USER` |

### Organization / Category

| 頁面 / 功能 | API | 結果 |
| --- | --- | --- |
| 全部科別 | `GET /api/organizations?status=ACTIVE` | array，count=3 |
| 待審核科別 | `GET /api/change-requests?targetType=ORGANIZATION&status=PENDING&page=1&size=100` | page，count=2，totalElements=2 |
| 已駁回科別 | `GET /api/change-requests?targetType=ORGANIZATION&status=REJECTED&page=1&size=100` | page，count=9，totalElements=9 |
| 已刪除科別主資料 | `GET /api/organizations?status=DISABLED` | array，count=9 |
| 已刪除科別審核紀錄 | `GET /api/change-requests?targetType=ORGANIZATION&status=APPROVED&action=DELETE&page=1&size=100` | page，count=9，totalElements=9 |

### Confirmed ADMIN data-source rules

- 審核流程頁以 `GET /api/change-requests` 為準。
- 已啟用帳號包含 `ACTIVE` / `PASSWORD_INVALID`；`PASSWORD_INVALID` 顯示為「需改密碼」，不歸入待審核 / 停用 / 刪除。
- 待審核新帳號使用 `targetType=USER&status=PENDING&action=CREATE`。
- 待審核帳號異動使用 `targetType=USER&status=PENDING&action=UPDATE&action=DELETE`，不可混入 `CREATE`。
- Sidebar / tab badge 必須分別使用精準 USER pending cache：
  - `USER_PENDING_CREATE`：`targetType=USER&status=PENDING&action=CREATE`
  - `USER_PENDING_CHANGES`：`targetType=USER&status=PENDING&action=UPDATE&action=DELETE`
  - `USER_PENDING_ALL`：`targetType=USER&status=PENDING` 只可用於總待審核數；不可作為「待審核帳號異動」badge 或列表來源。
- 已停用帳號使用 `GET /api/users?status=LOCKED`，`LOCKED` 不屬於審核單。
- 已刪除帳號使用 `targetType=USER&status=APPROVED&action=DELETE` 顯示刪除流程資訊。
- 待審核科別使用 `targetType=ORGANIZATION&status=PENDING`，不以 `organizations?status=PENDING` 作為主要資料來源。
- 已駁回科別使用 `targetType=ORGANIZATION&status=REJECTED`，不可使用 `organizations?status=DISABLED`。
- 已刪除科別使用 `organizations?status=DISABLED`，並合併 `targetType=ORGANIZATION&status=APPROVED&action=DELETE` 補刪除申請人、審核人、刪除日期。
- 操作歷程查詢使用兩支 change request 查詢：
  - `targetType=USER&status=PENDING&status=APPROVED&status=REJECTED&status=CANCELED&action=CREATE&action=UPDATE&action=DELETE&page=1&size=100`
  - `targetType=ORGANIZATION&status=PENDING&status=APPROVED&status=REJECTED&status=CANCELED&action=CREATE&action=UPDATE&action=DELETE&page=1&size=100`

## Compatibility services kept

- `src/services/copyService.js`：保留文案列表 / 統計 / 取消 / 核准 / 駁回 compatibility function，正式 API 不存在時集中處理缺口。
- `src/services/categoryCompatibilityService.js`：以 active SECTION organizations 暫代分類來源。
- `src/services/deprecated/copyCategoryService.js`：集中 deprecated CopyCategory API。
- `src/services/deprecated/organizationCategoryService.js`：集中 deprecated OrganizationCategory API。
- `src/services/operationHistoryService.js`：操作歷程第一版使用 change requests 聚合 USER / ORGANIZATION。
