import { expect, Page } from '@playwright/test';
import { APP_BASE_URL, MARKETING_URL } from '../constants';

/**
 * Log in with email and password on the marketing login page. * Visits MARKETING_URL/login, fills email → password, submits. Waits for redirect to app.
 */
export async function login(page: Page, email: string, password: string): Promise<void> {
  const loginUrl = MARKETING_URL + '/login';
  await page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

  expect(new URL(page.url()).origin).toBe(new URL(MARKETING_URL).origin);

  await page.getByTestId('login-with-email-button').click();

  const emailInput = page.getByTestId('signup-email-input');
  await emailInput.waitFor({ state: 'visible', timeout: 20000 });
  await emailInput.scrollIntoViewIfNeeded();
  await emailInput.focus();
  await emailInput.fill(email);

  await page.getByTestId('login-password-input').fill(password);

  const logInButton = page.getByTestId('signin-submit-button').filter({ hasText: 'Log In' });
  await expect(logInButton).toBeEnabled({ timeout: 5000 });
  await logInButton.click();

  await page.waitForURL((url) => url.href.startsWith(APP_BASE_URL), { timeout: 20000 });
}

/**
 * Sign up from pricing page: pricing → Choose this plan (data-testid=yearly) → signup page → Sign up with email → form.
 * Lands on app or payment page.
 */
export async function signUp(page: Page, name: string, email: string, password: string): Promise<void> {
  await page.goto(MARKETING_URL + '/pricing', { waitUntil: 'domcontentloaded', timeout: 15000 });

  const choosePlanBtn = page.getByTestId('yearly');
  await choosePlanBtn.waitFor({ state: 'visible', timeout: 15000 });
  await choosePlanBtn.scrollIntoViewIfNeeded();
  await choosePlanBtn.click();

  await page.goto(
    (MARKETING_URL.endsWith('/') ? MARKETING_URL.slice(0, -1) : MARKETING_URL) + '/signup?reason=payment&plan=yearly&ref=ppc',
    { waitUntil: 'domcontentloaded', timeout: 15000 }
  );

  const signUpWithEmailBtn = page.getByTestId('login-with-email-button');
  await signUpWithEmailBtn.waitFor({ state: 'visible', timeout: 20000 });
  await signUpWithEmailBtn.click();

  await page.getByTestId('signup-email-input').fill(email);
  await page.getByTestId('signup-full-name-input').fill(name);
  await page.getByTestId('signup-password-input').fill(password);
  await page.getByTestId('signup-submit-button').click();

  await page.waitForURL(
    (url) => url.href.startsWith(APP_BASE_URL) || (url.hostname.startsWith('pay.') && url.hostname.endsWith('programiz.pro')),
    { timeout: 20000 }
  );
}
