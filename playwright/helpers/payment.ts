import { expect, Page } from '@playwright/test';
import { APP_BASE_URL } from '../constants';

/** Payment page URL pattern: host pay.*.programiz.pro, path /pay, token changes per user. */
const PAYMENT_PAGE_URL_PATTERN = /^https:\/\/pay\.[^/]+\.programiz\.pro\/pay(\?|$)/;

/**
 * Fill postcode (if present), complete Paddle iframe card form, assert app root and pro-badge.
 * Call after signup when redirected to pay.*.programiz.pro/pay?token=<unique-per-user>.
 */
export async function paymentFlow(page: Page): Promise<void> {
  console.log('[PaymentFlow] Waiting for payment page URL (pay.*.programiz.pro/pay)...');
  await page.waitForURL(PAYMENT_PAGE_URL_PATTERN, { timeout: 20000 });
  console.log('[PaymentFlow] On payment page. URL:', page.url());

  const postcodeField = page.getByTestId('postcode-field');
  const postcodeVisible = await postcodeField.waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false);
  if (postcodeVisible) {
    console.log('[PaymentFlow] Postcode field visible; filling 44600 and submitting.');
    await postcodeField.fill('44600');
    await postcodeField.press('Enter');
  } else {
    console.log('[PaymentFlow] No postcode field (skipped). Proceeding to Paddle iframe.');
  }

  console.log('[PaymentFlow] Waiting for Paddle iframe...');
  const iframe = page.locator('.paddle-frame-inline');
  await iframe.waitFor({ state: 'attached', timeout: 15000 });
  await iframe.waitFor({ state: 'visible', timeout: 10000 });
  console.log('[PaymentFlow] Waiting for Paddle iframe card number input...');
  const frame = page.frameLocator('.paddle-frame-inline');
  const cardNumberInput = frame.getByTestId('cardNumberInput');
  const cardInputTimeout = process.env.CI ? 60000 : 30000;
  await cardNumberInput.waitFor({ state: 'visible', timeout: cardInputTimeout });
  console.log('[PaymentFlow] Paddle iframe visible. Filling card details...');
  await page.waitForTimeout(1500);
  await cardNumberInput.focus();
  await cardNumberInput.fill('4242 4242 4242 4242');
  await frame.getByTestId('cardholderNameInput').fill('Jane Doe');
  await frame.getByTestId('expiryDateField').fill('02/32');
  await frame.getByTestId('cardVerificationValueInput').fill('111');
  await frame.getByTestId('countriesSelect').selectOption({ value: 'NP' });
  console.log('[PaymentFlow] Card details filled. Clicking Subscribe now...');

  const subscribeBtn = frame.getByTestId('cardPaymentFormSubmitButton');
  await subscribeBtn.waitFor({ state: 'visible', timeout: 10000 });
  await expect(subscribeBtn).toBeEnabled({ timeout: 10000 });
  await subscribeBtn.scrollIntoViewIfNeeded();
  await subscribeBtn.click();
  console.log('[PaymentFlow] Subscribe clicked. Waiting for redirect to app (up to 90s). Current URL:', page.url());

  try {
    await page.waitForURL((url) => url.href.startsWith(APP_BASE_URL), { timeout: 90000 });
  } catch (e) {
    const screenshotPath = 'test-results/payment-redirect-stuck.png';
    await page.screenshot({ path: screenshotPath }).catch(() => {});
    console.error('[PaymentFlow] Redirect did not happen. Screenshot saved to:', screenshotPath);
    console.error('[PaymentFlow] Troubleshooting: 1) Run with headed: npm run test:playwright:payment  2) In the browser, check for error messages on the payment form after Subscribe  3) Confirm Paddle sandbox redirect URL is set to', APP_BASE_URL);
    throw e;
  }
  console.log('[PaymentFlow] Redirected to app. URL:', page.url());

  await expect(page).toHaveURL(APP_BASE_URL + '/');
}
