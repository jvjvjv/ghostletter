import { defineConfig, devices } from "@playwright/test";

const SERVER_TIMEOUT = 1000 * 60;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e",
  testMatch: /.*\.spec\.ts/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: [
    {
      command: "cd ../API && php artisan serve",
      url: "http://localhost:8000",
      reuseExistingServer: !process.env.CI,
      timeout: SERVER_TIMEOUT,
    },
    {
      command: "cd ../UI && pnpm run dev",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
      timeout: SERVER_TIMEOUT,
    },
  ],
});
