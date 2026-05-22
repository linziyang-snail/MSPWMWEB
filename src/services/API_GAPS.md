# API Gaps

### Auth
- `POST /auth/login`：登入
- `POST /auth/logout`：登出
- `POST /auth/refresh`：刷新 access token

### User
- `GET /api/users`：查詢使用者分頁
- `POST /api/users`：新增使用者申請
- `GET /api/users/{id}`：查詢單一使用者
- `PUT /api/users/{id}`：修改使用者申請
- `DELETE /api/users/{id}`：停用使用者申請
- `PUT /api/users/{id}/unlock`：解鎖使用者
- `PUT /api/users/{id}/password`：重設使用者密碼
- `PUT /api/users/me/password`：修改自己的密碼

### Role
- `GET /api/roles`：查詢角色

### Organization
- `GET /api/organizations`：查詢可管理組織
- `POST /api/organizations`：新增組織
- `PUT /api/organizations/{id}`：修改組織
- `DELETE /api/organizations/{id}`：停用組織

### Approval
- `GET /api/change-requests`：查詢待審核列表
- `GET /api/change-requests/history`：查詢審核歷史
- `PUT /api/change-requests/{id}/approve`：放行
- `PUT /api/change-requests/{id}/reject`：駁回
- `PUT /api/change-requests/{id}/cancel`：取消

### Copy
- `POST /api/copies`：文案送審

### Deprecated
- `GET /api/departments/copy-categories/{departmentId}`
- `POST /api/departments/copy-categories`
- `PUT /api/departments/copy-categories/{copyCategoryId}`
- `DELETE /api/departments/copy-categories/{copyCategoryId}`
- `GET /api/organizations/{orgId}/categories`
- `PUT /api/organizations/{orgId}/categories`
- `POST /api/organizations/{orgId}/categories/{categoryId}`
- `DELETE /api/organizations/{orgId}/categories/{categoryId}`

## 前端仍缺正式 API

- 文案列表查詢：全部 / 待審核 / 已核准 / 已駁回 / 已取消。
- 文案詳情查詢。
- 文案取消送審。
- 文案核准 / 駁回。現有 Approval API 可能可承接，但仍缺 `targetType` enum 與 payload schema。
- 文案複製新建是否為前端行為或後端 API。
- 操作歷程查詢 API。
- 科別全部列表 / 狀態列表正式主流程 API。目前 CopyCategory API 標示 deprecated。
- 帳號異動待審核列表。現有 Approval API 可能可承接，但仍缺 target schema。
- 首次登入 / 管理員重設密碼後強制改密碼欄位。
- 密碼到期第 25 天提醒與第 30 天鎖定欄位。
- 權限選單 / permission 對照 API。
- refresh token 儲存方式與 401 自動 refresh 流程。

## 暫時 Mock-only Compatibility Service

- `src/services/copyService.js`
  - `getCompatibleCopies`
  - `getCompatibleCopyCounts`
  - `createCompatibleCopy`
  - `cancelCompatibleCopy`
  - `approveCompatibleCopy`
  - `rejectCompatibleCopy`
- `src/services/categoryCompatibilityService.js`
  - `GetCompatibleCopyCategories`
- `src/services/operationHistoryService.js`
  - `GetOperationHistory`
- `src/services/userService.js`
  - `GetAccountChangeRequests`

這些 function 是為了避免 component 直接 import mock，同時集中標記正式 API 缺口。後端提供正式 endpoint 後，應優先替換這些 compatibility service。

## 後端待確認

- 成功 response 是否為 raw DTO / array / page object，或統一包 `{ code, desc, body }`。
- `ChangeRequest.targetType` enum。
- User role code / roleName / permission 對照表。
- User status enum：`PENDING`、`PENDING_MULTI`、`ACTIVE`、`DISABLED`、`DELETED`、`REJECTED` 是否為正式值。
- Copy status enum：`PENDING`、`APPROVED`、`REJECTED`、`CANCELLED` 是否為正式值。
- 密碼規則：最大長度、大小寫、數字、特殊符號、不可重複舊密碼等。
- 文案欄位最大長度與 URL 驗證規則。
