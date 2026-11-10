import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    ...devices['Desktop Chrome'],
    launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
  },
  webServer: {
    command: 'npm run dev -- --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
