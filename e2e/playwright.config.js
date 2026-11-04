import { defineConfig, devices } from '@playwright/test';

// E2E tests run against the live deployment by default.
// Override with: BASE_URL=http://localhost:3000 npm test
export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  // CI runners are slower than a laptop: give UI assertions more headroom and
  // run serially so animations/hydration are not starved of CPU.
  expect: { timeout: process.env.CI ? 15_000 : 7_000 },
  workers: process.env.CI ? 1 : undefined,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.BASE_URL || 'https://perfume-sooty-alpha.vercel.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],
});
