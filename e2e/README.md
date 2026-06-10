# E2E tests (Playwright)

Drives the real app in a browser. **Not** run by the build or Jenkins — run it
manually on a machine that can reach the backend (e.g. the company PC).

## One-time setup

```powershell
npm install
npx playwright install chromium   # downloads the browser (not committed)
```

## Credentials & env vars (never committed)

| var | meaning |
| --- | --- |
| `E2E_USER_ID` / `E2E_USER_PW` | 經辦 account |
| `E2E_MANAGER_ID` / `E2E_MANAGER_PW` | 覆核主管 account |
| `E2E_ADMIN_ID` / `E2E_ADMIN_PW` | 超級管理員 account |
| `E2E_MUTATE=1` | enable the data-creating flows (creates a test copy / category) |
| `E2E_BASE_URL` | target an already-running app instead of auto-starting dev |

Tests for a role are **skipped** when its credentials are absent.

## Run (PowerShell)

Safe checks only (auth / role landing / permission gating / sidebar) — no data created:

```powershell
$env:E2E_USER_ID="<id>"; $env:E2E_USER_PW="<pw>"
$env:E2E_MANAGER_ID="<id>"; $env:E2E_MANAGER_PW="<pw>"
$env:E2E_ADMIN_ID="<id>"; $env:E2E_ADMIN_PW="<pw>"
npm run test:e2e
```

Include the data-creating flows (submits a copy as USER, creates a category as ADMIN):

```powershell
$env:E2E_MUTATE="1"; npm run test:e2e
```

Target the deployed site instead of auto-starting `npm run dev`:

```powershell
$env:E2E_BASE_URL="http://172.16.46.215:443"; npm run test:e2e
```

Useful flags: `npm run test:e2e -- --headed` (watch it), `--ui` (interactive), `--debug`.

## What it covers

- **auth.spec.js** (safe): unauthenticated → /login; each role lands on its home;
  sidebar shows only that role's sections; ADMIN can't reach /copies and USER
  can't reach /accounts (bounced home).
- **copy-flow.spec.js** (mutating): USER submits a copy → appears under 待審核文案.
- **category-flow.spec.js** (mutating): ADMIN creates a category → appears under 待審核科別.

## Notes

- The mutating flows create real records (unique, timestamped). Run them in a
  test/dev environment, not production.
- Selectors target visible text/placeholders; if the UI text changes, update the
  matching spec.
- `test-results/` and `playwright-report/` are gitignored.
