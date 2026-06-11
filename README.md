# MSPWMWEB 推播文案編輯後台

MSPWMWEB 是聯邦銀行推播訊息維運的內部管理後台前端，提供推播文案的撰寫與審核、人員帳號管理、科別管理，並以審核流程（change request）為核心的覆核機制。系統依角色分流：經辦撰寫文案、覆核主管核准 / 駁回、超級管理員管理帳號與科別。

本專案為純前端應用，透過 `/MSP` 反向代理串接後端 API。

## 技術棧

| 類別 | 技術 | 版本 |
| --- | --- | --- |
| 框架 | Vue 3（Composition API、`<script setup>`） | ^3.5 |
| 建置工具 | Vite | ^8.0 |
| 狀態管理 | Pinia | ^3.0 |
| 路由 | Vue Router | ^5.0 |
| HTTP | Axios | ^1.15 |
| 樣式 | Tailwind CSS（v4，CSS-first `@theme`） | ^4.2 |
| 語言 | JavaScript（非 TypeScript） | — |
| 測試 | Vitest、@vue/test-utils（單元）、Playwright（E2E） | — |

UI 以 Tailwind 搭配自建的基礎元件（`src/components/base`）組成，不引入第三方 UI 套件。

## 環境需求

- Node.js `^20.19.0 || >=22.12.0`（CI 以 Node 23.1.0 / npm 10.9.0 建置）
- npm

## 安裝與啟動

```bash
npm install        # 安裝相依套件
npm run dev        # 啟動開發伺服器（mode=dev，將 /MSP 代理至後端）
```

開發伺服器會把 `/MSP` 代理至 `VITE_DEV_PROXY_TARGET`（見「環境變數」），因此本機開發需可連線到後端。

## 可用指令

| 指令 | 說明 |
| --- | --- |
| `npm run dev` | 開發伺服器（mode=dev） |
| `npm run build` | 正式建置 |
| `npm run build:dev` | 以 dev 環境建置（CI DEV 使用） |
| `npm run build:prod` | 以 prod 環境建置 |
| `npm run preview` | 預覽 `dist/` 建置結果 |
| `npm run format` | Prettier 格式化 `src/` |
| `npm run test` | 執行單元測試（Vitest） |
| `npm run test:watch` | 單元測試 watch 模式 |
| `npm run test:e2e` | 執行 E2E 測試（Playwright，見 `e2e/README.md`） |

## 環境變數

以 `.env.<mode>` 提供（`.env.example` 為範本，實際 `.env*` 不納入版控）。

| 變數 | 說明 | 範例 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | API 基底路徑，固定為 `/MSP`；服務層只寫 Swagger 原始路徑（如 `/auth/login`、`/api/users`），由此前綴組合，不可寫死 host | `/MSP` |
| `VITE_DEV_PROXY_TARGET` | 開發伺服器將 `/MSP` 代理至此後端位址（僅開發用） | `http://<host>:<port>` |

## 專案結構

```
src/
├── assets/           # 圖示與全域樣式（main.css 內含 Tailwind @theme 設計變數）
├── components/
│   ├── base/         # 基礎元件（BaseInput、BaseSelect、BaseModal…）
│   ├── common/       # 共用元件（EmptyState、ConfirmDialog…）
│   ├── copies/       # 文案相關元件
│   ├── dialogs/      # 各功能彈窗（新增 / 編輯 / 審核 / 密碼…）
│   ├── forms/        # 表單元件
│   ├── layout/       # 版型元件（Sidebar、Header…）
│   └── tables/       # 表格元件
├── composables/      # 組合式函式
├── layouts/          # 頁面版型（AppLayout、AuthLayout）
├── router/           # 路由定義與守衛
├── services/         # API 服務層（每個領域一檔，僅存放端點與請求 / 回應整形）
├── stores/           # Pinia stores（state / loading / error / actions）
├── utils/            # 工具函式（驗證、權限、常數、日期…）
└── views/            # 頁面元件（依路由懶載入）

tests/unit/           # Vitest 單元 / 元件測試
e2e/                  # Playwright E2E 測試
```

### 資料流

嚴格單向：

```
component → store（Pinia） → service → apiRequest（axios）
```

元件不可直接呼叫 axios 或寫死 API 位址。服務層集中所有端點路徑與資料整形；store 持有 state、loading、error 並呼叫服務層。

### API 用戶端（`src/services/apiRequest.js`）

- 基底為 `VITE_API_BASE_URL`（`/MSP`），逾時 60 秒。
- 請求攔截器附上 `Authorization: Bearer <token>`（取自 sessionStorage）並驅動全域 loading。
- 回應信封：HTTP 2xx 但 `code !== "0000"` 視為業務錯誤並 reject；錯誤統一正規化後以全域 alert 呈現；`401` 會清除登入狀態並導向 `/login?redirect=...`。

## 角色與權限

三種後端角色（一律以英文代碼傳遞，不送中文標籤）：

| 代碼 | 名稱 | 預設首頁 | 權限範圍 |
| --- | --- | --- | --- |
| `ADMIN` | 超級管理員 | `/accounts/pending-changes` | 人員管理、科別管理、操作記錄 |
| `MANAGER` | 覆核主管 | `/copies/all` | 文案覆核（核准 / 駁回），不可建立文案 |
| `USER` | 經辦人員 | `/copies/all` | 文案管理（建立 / 取消送審 / 複製新建） |

- 路由 `meta` 以 `requiresAuth` 與 `roles` 控管；未登入存取受保護頁面會導向 `/login` 並保留 `redirect`，角色不符則導回該角色首頁並提示權限不足。
- 帳號異動（新增 / 編輯 / 刪除）與科別（新增 / 刪除）皆透過審核流程，需由另一位管理員核准（不可核准自己提交的申請）；重設他人密碼為即時生效、不需審核。

## 測試

- **單元 / 元件（Vitest）**：`npm run test`，不需後端。
- **E2E（Playwright）**：`npm run test:e2e`，需可連線後端，帳密以環境變數提供；防火牆環境可設 `E2E_CHANNEL=msedge` 使用系統 Edge，免下載瀏覽器。詳見 `e2e/README.md`。

## 建置與部署

```bash
npm run build:dev      # 產出 dist/（CI DEV 流程）
```

部署為靜態檔案：將 `dist/*` 佈署至 nginx 站台根目錄即可，更新靜態檔不需重載 nginx。正式環境部署前應確認 `.env.prod` 的 `VITE_API_BASE_URL` 與站台代理設定正確。`dist/` 與 `.env*`（除 `.env.example`）皆不納入版控。
