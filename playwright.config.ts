import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';
import { playwrightEnvConfig } from './playwright/env';

const config: PlaywrightTestConfig = {
  testDir: './playwright',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? 'html' : 'list',
  use: {
    baseURL: playwrightEnvConfig.baseURL,
    trace: 'on-first-retry',
    headless: process.env.PWHEADED !== '1',
    video: 'on-first-retry',
    launchOptions: process.env.PWHEADED === '1' ? { slowMo: 300 } : undefined
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  expect: {
    timeout: 10000
  },
  timeout: 30000
};

export default config;
