import { defineConfig, devices } from "@playwright/test";

// E2E runs against the running app. By default it auto-starts `npm run dev`
// (which proxies /MSP to the backend), so it needs backend network access.
// Set E2E_BASE_URL to point at an already-running app/deployment instead.
const baseURL = process.env.E2E_BASE_URL || "http://localhost:5173";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    ignoreHTTPSErrors: true,
  },
  // E2E_CHANNEL=msedge (or chrome) launches the system-installed browser, so no
  // Playwright Chromium download is needed (useful behind a corporate firewall).
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: process.env.E2E_CHANNEL || undefined,
      },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:5173",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
