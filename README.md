# MSPWMWEB 推播文案編輯後台

MSPWMWEB 是一套 Vue 3 內部後台前端專案，目前主要支援推播文案管理、人員管理、科別 / 申請單資訊查詢、登入與角色導覽。專案已整理成 mock / real API 可切換架構，公司電腦 dev mode 可透過 `/MSP` 代理串接測試 API。

本 README 依照目前實際檔案整理，非通用模板。若功能目前尚未有正式後端 API，會明確標註為「待後端補 API」或「mock-only compatibility」。

## 1. Project Overview

目前專案包含：

- 登入頁與登入後台版型。
- 文案管理：全部文案、待審核、已核准、已駁回、已取消、查看文案內容、預覽、送審、複製新建、取消送審。
- 覆核主管文案審核：核准、駁回、查看內容。
- 超級管理員人員管理：待審核新帳號、待審核帳號異動、已啟用、已停用、已駁回、已刪除。
- 科別 / 申請單資訊查詢頁面，目前正式 API 仍有缺口。
- 全域 loading、alert、修改密碼、密碼更新提醒、操作歷程查詢。
- mock / real API 切換：`VITE_USE_MOCK=true` 走 mock，`false` 走 `apiRequest`。

## 2. Tech Stack

依據 `package.json`：

| Package | Version | Usage |
|---|---:|---|
| `vue` | `^3.5.31` | Frontend framework |
| `vite` | `^8.0.3` | Build tool |
| `@vitejs/plugin-vue` | `^6.0.5` | Vue SFC support |
| `pinia` | `^3.0.4` | State management |
| `vue-router` | `^5.0.4` | Routing and navigation guards |
| `axios` | `^1.15.0` | HTTP client |
| `tailwindcss` | `^4.2.2` | Utility CSS |
| `@tailwindcss/vite` | `^4.2.2` | Tailwind v4 Vite plugin |
| `vite-plugin-vue-devtools` | `^8.1.1` | Devtools plugin |
| `prettier` | `3.8.1` | Formatting |

Node 版本限制：

```txt
^20.19.0 || >=22.12.0
```

## 3. Directory Structure

```txt
src/
├── assets/        # SVG / 圖片資產、全域 CSS、Tailwind v4 @theme tokens
├── components/    # 共用元件
│   ├── base/      # BaseButton、BaseInput、BaseSelect、BaseModal 等基礎元件
│   ├── common/    # ConfirmDialog、EmptyState、PageTitle、SearchFilterBar 等共用元件
│   ├── copies/    # 文案 domain component
│   ├── dialogs/   # 各種 modal / dialog
│   ├── forms/     # 表單輔助元件
│   ├── layout/    # Header、Sidebar、Breadcrumb
│   └── tables/    # BaseTable
├── composables/   # 共用 composition helpers，例如 dropdown positioning
├── layouts/       # AppLayout、AuthLayout
├── mocks/         # mock data 與 mock API
│   └── api/       # mock API functions，對應正式 service
├── router/        # Vue Router routes 與 guard
├── services/      # API client、domain services、mock / real switch
├── stores/        # Pinia stores
├── utils/         # navigation、permissions、validators、formatters、constants
└── views/         # route page components
```

根目錄重要文件：

- `PROJECT_STRUCTURE.md`：目前架構與維護規範摘要。
- `src/services/API_GAPS.md`：正式後端 API 缺口。
- `.env.example`：環境變數範例。

## 4. Installation

目前使用 npm：

```bash
npm install
```

若公司環境重新安裝，請先確認 Node 符合 `package.json` 的 `engines`。

## 5. Development Commands

依據 `package.json`：

| Command | Purpose |
|---|---|
| `npm run dev` | 使用 Vite dev server，mode 為 `dev` |
| `npm run build` | production build，使用 Vite 預設 mode |
| `npm run build:dev` | 使用 `.env.dev` 打包 |
| `npm run build:prod` | 使用 `.env.prod` 打包 |
| `npm run preview` | 預覽 build 後的產物 |
| `npm run format` | 使用 Prettier 格式化 `src/` |

目前沒有 `lint` 或 `typecheck` script，不要在文件或 CI 裡假設存在。

## 6. Environment Variables

目前實際檔案：

| File | Purpose |
|---|---|
| `.env` | local default |
| `.env.dev` | development mode |
| `.env.prod` | production build |
| `.env.example` | 可提交的範例檔 |

目前內容：

```env
VITE_APP_ENV=local
VITE_API_BASE_URL=http://localhost:8081
VITE_USE_MOCK=true
```

`.env.dev`：

```env
VITE_APP_ENV=dev
VITE_API_BASE_URL=/MSP
VITE_USE_MOCK=false
VITE_DEV_PROXY_TARGET=http://172.16.46.215:443
```

`.env.prod`：

```env
VITE_APP_ENV=prod
VITE_API_BASE_URL=/MSP
VITE_USE_MOCK=false
```

變數說明：

- `VITE_APP_ENV`：目前環境名稱。
- `VITE_API_BASE_URL`：正式 API base URL。公司內網 dev/prod 統一使用 `/MSP`；不要在 component 或 service function 中寫死正式 URL。
- `VITE_USE_MOCK`：`true` 走 mock API，`false` 走 real API。

注意：`.gitignore` 目前排除 `.env`、`.env.*`，但保留 `!.env.example`。正式機敏資訊不可 commit。

## 7. Mock / Real API Switching

切換邏輯集中在：

- `src/services/config.js`

```js
const defaultApiBaseURL = "/MSP";

export const apiBaseURL =
  import.meta.env.VITE_API_BASE_URL || defaultApiBaseURL;

export const useMock = import.meta.env.VITE_USE_MOCK === "true";
```

資料流標準：

```txt
component -> store -> service -> apiRequest / mock api
```

簡單查詢 dialog 可維持：

```txt
component -> service -> apiRequest / mock api
```

規範：

- component 不應直接 import `src/mocks/*.mock.js`。
- store 不應直接 import raw mock data。
- service 依 `useMock` 判斷走 mock function 或 `apiRequest`。
- API base URL 不應寫死在 component 或各 API function 中。

目前現行正式路由相關頁面已移除 direct mock import；舊 scaffold views 仍有殘留，見「Maintenance Notes」。

## 公司電腦 dev 串接 API

### 角色與欄位命名

後端角色 value 與前端顯示 label：

| Value | Label |
|---|---|
| `ADMIN` | 超級管理員 |
| `MANAGER` | 覆核主管 |
| `USER` | 經辦人員 |

角色 value 永遠使用後端英文代碼；中文只作為畫面顯示，不可送回 API 當 payload value。

欄位命名規則：

- 後端 DB 欄位可為 snake_case，例如 `user_name`、`org_id`。
- Swagger DTO、API payload 與前端畫面資料一律使用 camelCase，例如 `userName`、`orgId`。
- 前端不使用 DB-only 欄位，例如 `mima`、`created_at`、`updated_at`。

### 環境檔

`.env.dev`

```env
VITE_APP_ENV=dev
VITE_API_BASE_URL=/MSP
VITE_USE_MOCK=false
VITE_DEV_PROXY_TARGET=http://172.16.46.215:443
```

### 啟動方式

```bash
npm run dev -- --mode dev
```

`package.json` 的 `npm run dev` 已經是 `vite --mode dev`，所以也可直接執行：

```bash
npm run dev
```

### API Path 規則

Swagger path `/auth/...` 實際由前端呼叫為 `/MSP/auth/...`。

Swagger path `/api/...` 實際由前端呼叫為 `/MSP/api/...`。

service 內只寫 Swagger 原始 path，例如 `/auth/login`、`/api/users`，由 `VITE_API_BASE_URL=/MSP` 組成實際路徑；不要硬寫 host，也不要組成 `/MSP/MSP/...`。

### DEV 測試帳號

| 帳號 | 密碼 | 角色 |
|---|---|---|
| `admin01` | `1234` | `ADMIN` |
| `admin02` | `1234` | `ADMIN` |
| `manager` | `1234` | `MANAGER` |
| `user001` | `1234` | `USER` |

### Jenkins DEV 部署

DEV Jenkins 使用 Node v23.1.0 / npm 10.9.0：

```bash
pwd
export PATH="$PATH":/VCS/nodeJs/node-v23.1.0-linux-x64/bin
echo $PATH
node -v
npm -v
npm i
npm run build:dev
ssh DCUser@172.16.46.215 "cmd /c if exist D:\nginx\MSPWMWEB rmdir /S /Q D:\nginx\MSPWMWEB"
ssh DCUser@172.16.46.215 "cmd /c mkdir D:\nginx\MSPWMWEB"
scp -r dist/* DCUser@172.16.46.215:D:/nginx/MSPWMWEB/
ssh DCUser@172.16.46.215 "cmd /c D:\nginx\nginx.exe -p D:\nginx -c conf\nginx.conf -t"
echo "MSPWMWEB 部署完成"
```

部署後產物必須在 `D:/nginx/MSPWMWEB/index.html` 與 `D:/nginx/MSPWMWEB/assets/...`，不可多一層 `dist`。

靜態檔更新不需要 nginx reload。目前 Jenkins 不執行 nginx reload，避免 DCUser 對 nginx process 發 signal 時出現 `Access is denied`。

### 登入 redirect

如果直接進入受保護頁，例如 `/copies/all`，尚未登入時被導到 `/login?redirect=/copies/all` 是正常 router guard 行為，登入成功後應該回到原頁。

### Mock 切換

`VITE_USE_MOCK=true` 使用 mock。

`VITE_USE_MOCK=false` 使用真實 API；Swagger 尚未提供的 API 會保留 compatibility service 或 mock-only 行為，缺口記錄在 `src/services/API_GAPS.md`。

## 8. API Layer

### API Client

`src/services/apiRequest.js`：

- 使用 Axios instance。
- `baseURL` 來自 `src/services/config.js`。
- timeout：`60000` ms。
- request interceptor 會從 `localStorage.getItem("mspwm.accessToken")` 帶 `Authorization: Bearer <token>`。
- response interceptor 回傳後端 envelope `response.data`；需要資料內容的 service 會使用 `body`，登入則由 auth store 明確讀 `response.body.accessToken` 等欄位。
- API error 會整理成 `{ status, code, desc, body, raw }`，並保留後端回傳的 `code` / `desc`。
- HTTP 2xx 但 `code !== "0000"` 會視為業務錯誤並 reject。
- 401 會清除 `mspwm.auth`、`mspwm.accessToken` 並導向 `/login?redirect=...`。
- 400 / 403 / 500 不會被吞掉，仍會 reject 給呼叫端。
- API error 會透過 `useAppStore().showAlert()` 顯示全域 alert。

### Domain Services

主要 service：

- `authService.js`
- `userService.js`
- `roleService.js`
- `organizationService.js`
- `approvalService.js`
- `copyService.js`
- `categoryCompatibilityService.js`
- `operationHistoryService.js`
- `deprecated/copyCategoryService.js`
- `deprecated/organizationCategoryService.js`

### Auth

| Function | Endpoint | Description |
|---|---|---|
| `Login(userId, password)` | `POST /auth/login` | 登入 |
| `Logout()` | `POST /auth/logout` | 登出 |
| `RefreshToken()` | `POST /auth/refresh` | 刷新 access token |
| `ChangeMyPassword(data)` | `PUT /auth/me/password` | 修改自己的密碼 |

### User

| Function | Endpoint | Description |
|---|---|---|
| `GetUsers(page, size)` | `GET /api/users` | 查詢使用者分頁 |
| `GetUserById(id)` | `GET /api/users/{id}` | 查詢單一使用者 |
| `CreateUser(data)` | `POST /api/users` | 新增使用者申請 |
| `UpdateUser(id, data)` | `PUT /api/users/{id}` | 修改使用者申請 |
| `DeleteUser(id)` | `DELETE /api/users/{id}` | 停用使用者申請 |
| `UnlockUser(id)` | `PUT /api/users/{id}/unlock` | 解鎖使用者 |
| `ResetUserPassword(id, newPassword)` | `PUT /api/users/{id}/password` | 重設使用者密碼 |
| `ChangeMyPassword(oldPassword, newPassword)` | `PUT /auth/me/password` | 修改自己的密碼 |
| `GetAccountChangeRequests()` | mock-only compatibility | 帳號異動列表，待正式 API |

### Role

| Function | Endpoint | Description |
|---|---|---|
| `GetRoles()` | `GET /api/roles` | 查詢角色 |

### Organization

| Function | Endpoint | Description |
|---|---|---|
| `GetOrganizations()` | `GET /api/organizations` | 查詢組織 |
| `CreateOrganization(data)` | `POST /api/organizations` | 新增組織 |
| `UpdateOrganization(id, data)` | `PUT /api/organizations/{id}` | 修改組織 |
| `DisableOrganization(id)` | `DELETE /api/organizations/{id}` | 停用組織 |

### Approval

| Function | Endpoint | Description |
|---|---|---|
| `GetPendingChangeRequests(targetType)` | `GET /api/change-requests` | 查詢待審核列表 |
| `GetChangeRequestHistory(targetType, targetId)` | `GET /api/change-requests/history` | 查詢審核歷史 |
| `ApproveChangeRequest(id)` | `PUT /api/change-requests/{id}/approve` | 放行 |
| `RejectChangeRequest(id, remark)` | `PUT /api/change-requests/{id}/reject` | 駁回 |
| `CancelChangeRequest(id)` | `PUT /api/change-requests/{id}/cancel` | 取消 |

### Copy

| Function | Endpoint | Description |
|---|---|---|
| `SubmitCopy(data)` | `POST /api/copies` | 文案送審 |
| `getCompatibleCopies()` | mock-only compatibility | 文案列表，待正式 API |
| `createCompatibleCopy(payload)` | mock-only compatibility | 文案建立後送審資料流 |
| `cancelCompatibleCopy(id)` | mock-only compatibility | 取消送審，待正式 API |
| `approveCompatibleCopy(id)` | mock-only compatibility | 核准文案，待正式 API 或 Approval target schema |
| `rejectCompatibleCopy(id, reason)` | mock-only compatibility | 駁回文案，待正式 API 或 Approval target schema |

### Deprecated Copy Category / Organization Category

OpenAPI 標示已廢棄，service 保留於 `src/services/deprecated/`，新流程不要主動依賴，除非後端確認仍使用。

正式 API 缺口請看 `src/services/API_GAPS.md`。

## 9. Mock Layer

目前 mock 分兩層：

- `src/mocks/*.mock.js`：raw mock data。
- `src/mocks/api/*.js`：mock API functions。

命名規則：

```txt
正式 API: GetUsers()
Mock API: mockGetUsers()
```

主要 mock API 檔案：

- `src/mocks/api/authApi.js`
- `src/mocks/api/userApi.js`
- `src/mocks/api/roleApi.js`
- `src/mocks/api/organizationApi.js`
- `src/mocks/api/approvalApi.js`
- `src/mocks/api/copyApi.js`
- `src/mocks/api/copyCategoryApi.js`
- `src/mocks/api/organizationCategoryApi.js`
- `src/mocks/api/operationHistoryApi.js`

規範：

- mock request / response 應盡量對齊 OpenAPI schema。
- NoResponse 類型可回 `{}`。
- mock-only compatibility function 必須集中在 service，不可散落在 component。
- raw mock data 可以保留，但正式頁面不應直接 import。

## 10. State Management

目前 Pinia stores：

| Store | Responsibility |
|---|---|
| `appStore` | 全域 loading、全域 alert state |
| `authStore` | 登入狀態、token、user profile、roles、密碼提醒狀態 |
| `copyStore` | 文案列表、狀態 counts、建立 / 取消 / 核准 / 駁回 / 複製新建 |
| `userStore` | 使用者列表、待審核新帳號數量、待審核異動數量 |
| `approvalStore` | 審核待辦與審核歷史 |
| `organizationStore` | 組織列表 |
| `roleStore` | 角色列表 |

Store 規範：

- store 負責 state、loading、error、actions。
- store 呼叫 service，不直接 import raw mock data。
- component 呼叫 store action 或 getter。
- API action 不留空 catch；至少要 `console.error(error)`，並設定可讀 error message。
- store 不處理 DOM、不寫 UI class。

注意：`approvalStore`、`organizationStore`、`roleStore` 目前仍有部分 action 未設定 user-facing `error` state，後續可低風險補齊。

## 11. Router and Permission

Router 設定：

- `src/router/routes.js`
- `src/router/index.js`

Layout：

- `/login` 使用 `AuthLayout`。
- 其餘後台頁面使用 `AppLayout`。

Public route：

- `/login`

Protected routes：

- `/` 下面的後台頁面，父層 `meta.requiresAuth: true`。

Navigation guard：

- 未登入進入內頁會導回 `Login`，並保留 `redirect` query。
- route meta 有 `roles` 時，若目前登入角色不符合，導向 `/403`。

預設入口：

- `ADMIN`：`/accounts/pending-changes`
- 非 `ADMIN`：`/copies/all`

目前角色：

- `ADMIN`
- `MANAGER`
- `USER`

角色權限範圍：

- `ADMIN`：只可進入人員管理、申請單資訊查詢、查看操作記錄與自身帳號功能。
- `USER`：只可進入文案管理與自身帳號功能，可新增文案、取消送審、複製新建。
- `MANAGER`：只可進入文案管理與自身帳號功能，可核准與駁回文案，不可新增文案。

`/403` 本身不需要登入角色，回首頁會導向目前角色可進入的預設入口，避免 `/403` loop。

Sidebar 顯示依 `src/utils/navigation.js` 的 `roles` 設定。

## 12. Component Development Rules

元件規範：

- 元件檔名使用 PascalCase，例如 `CopyCard.vue`、`AccountCreateModal.vue`。
- 使用 `<script setup>`。
- props 應明確命名，避免不明確的 `data`、`item`，除非是非常小型內部元件。
- emits 使用 kebab-case，例如 `update:modelValue`、`submit`、`close`。
- component 不直接 import mock。
- component 不直接建立 axios request。
- 一般資料流程走 `component -> store -> service`。
- 簡單查詢 dialog 可走 `component -> service`，但仍不可直接碰 mock。
- 表單資料使用 `reactive({})`。
- 單一 UI state 使用 `ref()`。

Import 順序建議：

1. Vue
2. Vue Router
3. 第三方套件
4. assets
5. components
6. stores
7. services
8. utils
9. constants / config

## 13. Vue Coding Style

### Function

在 `.vue` 的 `<script setup>` 內，低風險事件函式建議使用：

```js
const handleSubmit = async () => {};
const handleClose = () => {};
const validateForm = () => {};
```

不要無腦改所有 function declaration。以下先保留 function declaration，除非完整確認行為不變：

- `BaseDateInput.vue`
- `BaseSelect.vue`
- dropdown / datepicker positioning helper
- resize observer
- outside click / keyboard navigation
- recursive helper
- services normalize helpers
- router guard 中依賴 hoisting 的 helper

如果 function A 呼叫 function B，建議 B 宣告在 A 前面，避免 temporal dead zone 與可讀性問題。

### Reactive / Ref

表單：

```js
const form = reactive({
  userId: "",
  password: "",
});
```

錯誤訊息：

```js
const errors = reactive({
  userId: "",
  password: "",
});
```

單一 boolean / string / number：

```js
const isLoading = ref(false);
const showPassword = ref(false);
const message = ref("");
```

### Computed

`computed` 只做衍生狀態，不做副作用。

可以：

```js
const filteredUsers = computed(() =>
  users.value.filter((user) => user.status === selectedStatus.value),
);
```

不要在 computed 裡呼叫 API 或修改 state。

### Watch

`watch` 用於必要副作用，例如 route query、dialog open 初始化、filter 變化重新查詢。不要用 watch 取代 computed。

### onMounted

初始化邏輯應包成具名函式：

```js
const initializePage = async () => {
  await fetchUsers();
  await fetchRoles();
};

onMounted(() => {
  initializePage();
});
```

不要在 `onMounted` 裡塞長篇業務邏輯。

## 14. Tailwind and UI Rules

Tailwind v4 token source：

- `src/assets/main.css`
- `@theme`

目前已有 tokens：

- color：`primary`、`text-*`、`success-*`、`danger-*`、`background-*`、`border-*` 等。
- spacing：`sidebar`、`header`、`modal-*`、`filter-*`、`auth-card` 等。
- shadow：`shadow-control`、`shadow-popup`、`shadow-auth-card` 等。
- utility：`bg-auth-page`、`bg-auth-hero-border`、`bg-auth-title-gradient`、`bg-auth-title-line`。

規範：

- 優先使用 design token，例如 `bg-primary`、`text-text-primary`、`bg-background-surface`。
- 優先使用 Tailwind spacing scale。
- 明顯等價可替換：
  - `bg-[#FFFFFF]` -> `bg-white`
  - `text-[#000000]` -> `text-black`
  - `mt-[16px]` -> `mt-4`
  - `px-[24px]` -> `px-6`
  - `py-[8px]` -> `py-2`
  - `rounded-[8px]` -> `rounded-lg`
- Figma 精準對齊值、modal width、特殊 shadow、特殊 gradient 可保留。
- 不要任意調整登入頁與 modal UI。
- 不要大規模重排 class，避免產生不可 review 的 diff。

## 15. Form and Validation

目前 validation helper：

- `src/utils/validators.js`
  - `required(value)`
  - `validateUserId(value)`
  - `validateRequired(value, label)`
  - `validateCopyForm(form)`

建議模式：

```js
const form = reactive({
  userId: "",
  password: "",
});

const errors = reactive({
  userId: "",
  password: "",
});

const validateForm = () => {
  errors.userId = validateUserId(form.userId);
  errors.password = validateRequired(form.password, "密碼");
  return !errors.userId && !errors.password;
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  try {
    await store.submit(form);
  } catch (error) {
    console.error(error);
  }
};
```

文案表單目前使用 `validateCopyForm(form)`，欄位包含 number、title、content、clickAction、expirationType，並依 clickAction / expirationType 做必要驗證。

## 16. Error Handling

規範：

- 禁止空 catch。
- 至少：

```js
catch (error) {
  console.error(error);
}
```

- store 應設定使用者可讀 error message，例如 `this.error = "查詢使用者失敗"`。
- API error 優先由 `apiRequest` response interceptor 統一處理。
- component 不應重複解析底層 HTTP error，除非有明確 UI 需求。
- `apiRequest` 目前會處理 timeout、offline、HTTP 400 / 401 / 403 / 404 / 500 / 502 / 504。

## 17. Adding New Features

新增功能標準流程：

1. 確認 OpenAPI endpoint、request payload、response schema。
2. 在對應 service 新增 PascalCase API function。
3. 在 `src/mocks/api` 新增對應 mock function。
4. 確認 `VITE_USE_MOCK=true` 時 service 走 mock。
5. 若有 shared state，在 store 新增 action / loading / error。
6. component 呼叫 store 或 service，不直接碰 mock。
7. 補 route 與 `meta.roles`。
8. 補 Sidebar / breadcrumb 設定，若該頁需要導覽。
9. 跑 `npm run build`。

Checklist：

- [ ] service 有 real API branch。
- [ ] service 有 mock branch。
- [ ] mock response schema 對齊正式 API。
- [ ] component 沒有 import `src/mocks`。
- [ ] route meta roles 正確。
- [ ] build 成功。

## 18. Connecting Real API

正式 API 串接步驟：

1. 在 `.env.prod` 設定 `VITE_API_BASE_URL`。
2. 設定 `VITE_USE_MOCK=false`。
3. 確認 service endpoint 與 OpenAPI 一致。
4. 確認 request payload 欄位名稱與型別。
5. 確認 response schema。若成功 response 是 raw DTO / array / page object，service/store 不要硬套 `{ code, data }`。
6. 依 `src/services/API_GAPS.md` 補後端缺口。
7. 保留 mock fallback，方便本地與開發環境驗證。
8. 執行：

```bash
npm run build:prod
```

目前 `apiRequest` 已支援 Bearer token header，但 refresh token 自動流程仍待後端規格確認。

## 19. Build and Deployment

Build：

```bash
npm run build
npm run build:dev
npm run build:prod
```

產物：

```txt
dist/
```

部署注意：

- `dist/` 不應進 git。
- 公司部署應以 build artifact 為準。
- API URL 不應寫死在 build 後檔案或 component 中。
- `.env.prod` 不應提交正式機敏資訊。

## 20. Maintenance Notes

維護注意事項：

- 不要直接改 raw mock data 來繞過 service。
- 不要在 component 寫死 API URL。
- 不要把 `.env.prod` 機敏資訊 commit。
- 不要改登入頁 UI，除非有設計需求。
- 不要刪除尚有 route 的頁面。
- 新增頁面必須補 route meta。
- 新增 API 必須同步補 mock。
- 不要把 TypeScript 規範硬套到本專案，目前是 JavaScript。
- 不要引入 UI library；目前 UI 以 Tailwind + 自製 base components 為主。
- `src/views/users`、`src/views/organizations`、`src/views/approvals`、`src/views/roles`、`src/views/dashboard` 屬於舊 scaffold 風險區，目前不是正式主流程。若重新啟用，需先移除 direct mock import 並改走 service/store。

## 21. Known Gaps

依 `src/services/API_GAPS.md` 摘要：

- 文案列表查詢：全部 / 待審核 / 已核准 / 已駁回 / 已取消。
- 文案詳情查詢。
- 文案取消送審。
- 文案核准 / 駁回。現有 Approval API 可能可承接，但仍缺 `targetType` enum 與 payload schema。
- 文案複製新建是否為前端行為或後端 API。
- 操作歷程查詢 API。
- 科別全部列表 / 狀態列表正式主流程 API；目前 CopyCategory API 標示 deprecated。
- 帳號異動待審核列表；現有 Approval API 可能可承接，但仍缺 target schema。
- 首次登入 / 管理員重設密碼後強制改密碼欄位。
- 密碼到期第 25 天提醒與第 30 天鎖定欄位。
- 權限選單 / permission 對照 API。
- refresh token 儲存方式與 401 自動 refresh 流程。

後端待確認：

- 成功 response 是否為 raw DTO / array / page object，或統一包 `{ code, desc, body }`。
- `ChangeRequest.targetType` enum。
- User role code / roleName / permission 對照表。
- User status enum 與 Copy status enum。
- 密碼規則。
- 文案欄位最大長度與 URL 驗證規則。

## 22. Final Verification Checklist

交付前請確認：

- [ ] `npm install` 成功。
- [ ] `npm run dev` 成功。
- [ ] `npm run build` 成功。
- [ ] `VITE_USE_MOCK=true` 可正常操作。
- [ ] `VITE_USE_MOCK=false` 已確認 API base URL。
- [ ] 正式路由頁面沒有 component 直接 import mock。
- [ ] 沒有空 catch。
- [ ] 沒有正式 API URL 寫死在 component。
- [ ] 新增頁面有 route meta / roles。
- [ ] 新增 API 有對應 mock function。
