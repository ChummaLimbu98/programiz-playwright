import { playwrightEnvConfig } from './env';

export const MARKETING_URL = playwrightEnvConfig.marketingURL;
export const APP_BASE_URL = playwrightEnvConfig.baseURL;
export const PRO_USER = playwrightEnvConfig.proUser;
export const NON_USER = playwrightEnvConfig.nonUser;

/** Unique email for signup tests (mirrors Cypress randomNewEmail). */
export function randomNewEmail(): string {
  return `chumma+${Date.now()}@parewalabs.com`;
}
