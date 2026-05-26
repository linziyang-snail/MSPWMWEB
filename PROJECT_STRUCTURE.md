# Project Structure

## 技術棧

- Vue 3 + `<script setup>`
- Vite
- JavaScript
- Tailwind CSS v4
- Pinia
- Vue Router
- Axios
- Mock / real API switch by environment variables

## 主要目錄

- `src/assets`：全域樣式、Tailwind v4 `@theme` token、圖片與 SVG assets。
- `src/components`：base、layout、dialog、domain components。
- `src/views`：route page components。
- `src/layouts`：登入與後台 shell。
- `src/router`：routes 與 navigation guard。
- `src/stores`：Pinia stores，負責 state、loading、error 與呼叫 service。
- `src/services`：API client、domain service、mock / real switch。
- `src/mocks`：mock data 與 mock API functions。
- `src/utils`：navigation、format、validators、constants。

## 環境變數

公司環境使用：

- `.env`
- `.env.dev`
- `.env.prod`
- `.env.example`

變數：

- `VITE_APP_ENV`：目前環境名稱。
- `VITE_API_BASE_URL`：正式 API base URL。
- `VITE_USE_MOCK`：`true` 走 mock，`false` 走 axios API。

目前預設：

```env
VITE_APP_ENV=dev
VITE_API_BASE_URL=http://localhost:8081
VITE_USE_MOCK=true
```

正式環境透過 nginx `/MSP` proxy 轉發後端 API：

```env
VITE_APP_ENV=prod
VITE_API_BASE_URL=/MSP
VITE_USE_MOCK=false
```

API path 規則：

- Swagger `/auth/...` -> 前端實際 `/MSP/auth/...`
- Swagger `/api/...` -> 前端實際 `/MSP/api/...`
- service 只寫 `/auth/login`、`/api/users` 這類原始 path，不可重複組 `/MSP`。

角色 value 與顯示 label：

- `ADMIN` = 超級管理員
- `MANAGER` = 覆核主管
- `USER` = 經辦人員

欄位命名規則：

- 後端 DB 使用 snake_case。
- Swagger DTO、前端資料模型與 API payload 使用 camelCase。
- 前端不傳中文 label、不傳 DB-only 欄位，例如 `mima`。

## API 呼叫流程

標準流程：

```text
component -> store -> service -> apiRequest / mock api
```

允許在簡單查詢 dialog 中：

```text
component -> service -> apiRequest / mock api
```

禁止：

- component 直接 import `src/mocks/*.mock.js`
- component 直接建立 axios instance
- service 寫死完整正式 URL

## Mock 規範

- `src/mocks/api` 放 mock API function。
- `src/mocks/*.mock.js` 仍保留 raw mock data。
- service 透過 `src/services/config.js` 的 `useMock` 判斷資料來源。
- mock function 命名需與正式 API function 一一對應，例如 `GetUsers` / `mockGetUsers`。
- 正式 API 缺口集中記錄在 `src/services/API_GAPS.md`。

## Store 規範

- store 負責 state、loading、error、呼叫 service。
- store 不直接 import raw mock data。
- store 不寫 UI class。
- API action 不留空 catch，至少 `console.error(error)`。

## Vue Coding Style

- 使用 Composition API + `<script setup>`。
- 新增或安全修改的事件函式使用 `const handleXxx = () => {}`。
- async 使用 `const fetchXxx = async () => {}`。
- 複雜 dropdown、datepicker、positioning helper 暫不盲改 function declaration。
- import 順序：Vue、Vue Router、第三方、assets、components、stores、services、utils、constants。
- 表單資料使用 `reactive({})`。
- 錯誤訊息使用 `errors` state。

## Tailwind / UI 規範

- Tailwind v4 token source 是 `src/assets/main.css` 的 `@theme`。
- 優先使用語意化 token，例如 `bg-primary`、`text-text-primary`、`bg-background-surface`。
- 明顯等價值可改成 Tailwind scale，例如 `mt-[16px]` -> `mt-4`。
- Figma 精準對齊值、modal width、特殊 shadow / gradient 不盲改。
- 登入頁目前視覺不在本輪清理範圍。

## Router / 權限

- Route meta 使用 `requiresAuth`、`roles` 管理登入與權限。
- 現有登入 redirect 保留：
  - `ADMIN` -> `/accounts/pending-changes`
  - `MANAGER` / `USER` -> `/copies/all`
- `ADMIN` 只可進入人員管理、申請單資訊查詢、查看操作記錄與自身帳號功能。
- `USER` / `MANAGER` 只可進入文案管理與自身帳號功能；`USER` 可新增文案，`MANAGER` 可核准與駁回文案。
- `/403` 不受角色 guard 擋住，回首頁會導回目前角色可進入的預設入口，避免 403 loop。
- 未登入進入內頁需導回 `/login` 並保留 redirect query。

## Build / 部署

可用指令：

```bash
npm run dev
npm run build
npm run build:dev
npm run build:prod
npm run preview
```

Jenkins DEV 部署：

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

部署後結構是 `D:/nginx/MSPWMWEB/index.html` 與 `D:/nginx/MSPWMWEB/assets/...`。靜態檔更新不需要 nginx reload，目前 Jenkins 不執行 nginx reload，避免 DCUser 對 nginx process 發 signal 時出現 `Access is denied`。

## 後續接正式 API 步驟

1. 設定 `.env.prod` 的 `VITE_API_BASE_URL`。
2. 將 `VITE_USE_MOCK=false`。
3. 依 `src/services/API_GAPS.md` 補後端缺口。
4. 確認 response schema 與 mock schema 一致。
5. 執行 `npm run build`。

## 保留的 Scaffold 風險

以下舊 scaffold views 仍可看到 direct mock import，但目前不是正式路由主流程，避免本輪大搬造成 UI/流程風險，暫列後續清理：

- `src/views/users`
- `src/views/organizations`
- `src/views/approvals`
- `src/views/roles`
- `src/views/dashboard`

若未來重新啟用這些頁面，需先改為 `component -> store/service -> mock/real switch`。
