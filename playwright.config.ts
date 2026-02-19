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
    // Chrome args to reduce automation detection and help Paddle iframe load (real payment in CI + local)
    launchOptions: {
      ...(process.env.CI ? {} : { slowMo: 300 }),
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    }
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  expect: {
    timeout: 10000
  },
  timeout: 30000
};

export default config;
