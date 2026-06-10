# E2E tests (Playwright)

These tests drive the real app in a browser. They are **not** run by the build
or by Jenkins — run them manually on a machine that can reach the backend.

## One-time setup

```bash
npm install
npx playwright install chromium   # downloads the browser binary (not committed)
```

## Run

By default Playwright auto-starts `npm run dev` (which proxies `/MSP` to the
backend), so the backend must be reachable:

```bash
# routing-only smoke test (no credentials needed)
npm run test:e2e

# include the real login flow
E2E_USER_ID=<id> E2E_PASSWORD=<password> npm run test:e2e
```

Point at an already-running app/deployment instead of auto-starting dev:

```bash
E2E_BASE_URL=http://172.16.46.215:443 npm run test:e2e
```

## Notes

- Do **not** commit credentials. Pass them via the `E2E_USER_ID` /
  `E2E_PASSWORD` environment variables; the login test is skipped when they are
  absent.
- `test-results/` and `playwright-report/` are gitignored.
