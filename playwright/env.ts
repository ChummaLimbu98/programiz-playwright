import dotenv from 'dotenv';

dotenv.config();

const parsedEnv = dotenv.config().parsed;
const urls = JSON.parse(parsedEnv?.VITE_URLS || '{}');
/** Playwright tests run in development by default. Override with PLAYWRIGHT_ENV=e2e|staging (e.g. in CI). */
const env = process.env.PLAYWRIGHT_ENV || process.env.NODE_ENV || 'development';

const envConfig = {
  e2e: {
    baseURL: 'https://app.e2e.programiz.pro',
    marketingURL: 'https://e2e.programiz.pro',
    apiBaseUrl: 'https://e2e.api.programiz.pro/api',
    proUser: { email: 'sanjeev+cypress@parewalabs.com', password: 'Cypress@123' },
    nonUser: { email: 'prasish+nonPro@parewalabs.com', password: 'Test@123' }
  },
  development: {
    baseURL: 'https://app.dev.programiz.pro',
    marketingURL: 'https://dev.programiz.pro',
    apiBaseUrl: 'https://dev.api.programiz.pro/api',
    proUser: { email: 'chumma+1@parewalabs.com', password: 'Player@dev8' },
    nonUser: { email: 'prasish+nonPro1@parewalabs.com', password: 'Test@123' }
  },
  staging: {
    baseURL: 'https://app.staging.programiz.pro',
    marketingURL: 'https://staging.programiz.pro',
    apiBaseUrl: 'https://staging.api.programiz.pro/api',
    proUser: { email: 'sanjeev+cypress@parewalabs.com', password: 'Cypress@123' },
    nonUser: { email: 'prasish+nonPro@parewalabs.com', password: 'Test@123' }
  },
  default: {
    baseURL: urls.APP_SITE_URL || 'https://app.dev.programiz.pro',
    marketingURL: urls.MARKETING_SITE_URL || 'https://dev.programiz.pro',
    apiBaseUrl: urls.API_BASE_URL || 'https://dev.api.programiz.pro/api',
    proUser: { email: 'sanjeev+cypress@parewalabs.com', password: 'Cypress@123' },
    nonUser: { email: 'prasish+nonPro1@parewalabs.com', password: 'Test@123' }
  }
} as const;

type EnvKey = keyof typeof envConfig;
export const playwrightEnvConfig = envConfig[env as EnvKey] ?? envConfig.default;
