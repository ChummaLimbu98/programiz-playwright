import { test, expect } from '@playwright/test';
import { signUp } from './helpers/auth';
import { MARKETING_URL, randomNewEmail } from './constants';

test.describe('Signup', () => {
  test.beforeEach(async ({ page }) => {
    page.on('pageerror', (err) => {
      const stack = err.stack ?? '';
      const msg = err.message ?? '';
      const isGooglePayment =
        stack.includes('gstatic.com') ||
        stack.includes('boq-payments-consumer') ||
        msg.includes("Cannot read properties of null (reading 'o')");
      if (isGooglePayment) return;
      throw err;
    });
  });

  test('new user signup returns createdJustNow true from API (no pay link check)', async ({ page }) => {
    test.setTimeout(60000);
    const signupResponsePromise = page.waitForResponse(
      (res) =>
        res.url().includes('signupwithemail') &&
        res.request().method() === 'POST' &&
        res.status() === 200,
      { timeout: 20000 }
    );

    await page.goto(MARKETING_URL + '/pricing', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await signUp(page, 'Ann Mary', randomNewEmail(), 'Player@dev8', { waitForRedirect: false });

    const response = await signupResponsePromise;
    const body = await response.json();
    expect(body.data, 'signup API must return data').toBeDefined();
    expect(body.data.createdJustNow, 'signup pass: createdJustNow should be true').toBe(true);
  });

  test('new user signup from pricing page directly lands on app or payment page', async ({ page }) => {
    test.setTimeout(90000);
    await page.goto(MARKETING_URL + '/pricing', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await signUp(page, 'Ann Mary', randomNewEmail(), 'Player@dev8');
  });
});
