# API Gaps / Diff

## Controller confirmed API

### Auth
- `POST /auth/login`：登入，request `{ userId, password }`，response body 含 `accessToken`。
- `POST /auth/refresh`：刷新 access token，response body 含 `token`，前端統一寫回 access token key。
- `POST /auth/logout`：登出。
- `PUT /auth/me/password`：修改自己的密碼，request `{ id, oldPassword, newPassword }`。

### User
- `GET /api/users?page=&size=&status=`：已支援 `status`，`size` 最大 100。
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
- `GET /api/change-requests?targetType=&status=`：已支援 `status`。
- `GET /api/change-requests/history?targetType=&targetId=`：`targetType`、`targetId` 必填，前端空值不送。
- `GET /api/change-requests/search?targetId=&startDate=&endDate=&page=&size=`：日期以 Controller 為準送 `yyyyMMdd`。
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
- `approvalService.getChangeRequests` / `getPendingChangeRequests` 支援 `status`。
- `approvalService.searchChangeRequests` 已新增 `/api/change-requests/search`，空值不送，日期轉 `yyyyMMdd`。
- 帳號新增 / 編輯的科別下拉改抓 `GET /api/organizations?status=ACTIVE` 並過濾 SECTION / 科別。
- 科別管理依 tab 改抓對應 status；待審核 / 已駁回操作使用 change request id。
- 全域前端 enum 改用 `CANCELED`。

## Remaining official API gaps

- 文案列表 / 詳情 / 取消 / 核准 / 駁回仍缺正式 Copy API；目前只可正式送 `POST /api/copies`。
- 文案列表仍保留 compatibility service，不會亂打不存在的 Copy endpoint。
- `change-requests/search` 沒有 `targetType` query；若 UI 需要依 USER / ORGANIZATION / COPY 分類搜尋，需要後端確認或擴充。
- 操作歷程查詢 API 仍未確認。
- 401 自動 refresh 流程尚未完整串成 interceptor retry；auth store 已保留 refresh token 寫回 access token 的 action。

## Compatibility services kept

- `src/services/copyService.js`：保留文案列表 / 統計 / 取消 / 核准 / 駁回 compatibility function，正式 API 不存在時集中處理缺口。
- `src/services/categoryCompatibilityService.js`：以 active SECTION organizations 暫代分類來源。
- `src/services/deprecated/copyCategoryService.js`：集中 deprecated CopyCategory API。
- `src/services/deprecated/organizationCategoryService.js`：集中 deprecated OrganizationCategory API。
- `src/services/operationHistoryService.js`：操作歷程正式 API 未確認前保留 compatibility。
