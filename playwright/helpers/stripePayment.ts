import { expect, Page } from '@playwright/test';
import { APP_BASE_URL } from '../constants';

/** Same payment page URL as Paddle; backend shows Stripe when request is from US IP (X-Forwarded-For). */
const PAYMENT_PAGE_URL_PATTERN = /^https:\/\/pay\.[^/]+\.programiz\.pro\/pay(\?|$)/;

/**
 * Programiz uses Stripe Embedded Checkout: a single outer iframe (#stripe-checkout /
 * name="embedded-checkout"). Inside it, card number / expiry / CVC live in their own
 * nested Stripe security iframes. Cardholder name, ZIP, and the submit button are
 * direct elements of the outer iframe.
 */
const STRIPE_EMBEDDED_IFRAME = '#stripe-checkout iframe, iframe[name="embedded-checkout"], iframe[src*="embedded-checkout"]';

/** Stripe test card (success). */
const TEST_CARD = '4242424242424242';
const TEST_EXP = '05 / 28';
const TEST_CVC = '100';
const TEST_ZIP = '44600';
const TEST_NAME = 'Jane Doea';

export async function stripeCheckoutPaymentFlow(page: Page): Promise<void> {
  await page.waitForURL(PAYMENT_PAGE_URL_PATTERN, { timeout: 20000 });
  console.log('[StripeCheckout] On payment page. URL:', page.url());

  // Wait for the outer embedded-checkout iframe to be ready
  const outerIframeEl = page.locator(STRIPE_EMBEDDED_IFRAME).first();
  await outerIframeEl.waitFor({ state: 'attached', timeout: 20000 });
  // Scroll the iframe itself into view on the main page so inner elements are within viewport
  await outerIframeEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);

  const outer = page.frameLocator(STRIPE_EMBEDDED_IFRAME).first();

  // If a "Card" option button is present (payment-method accordion), click it first
  const cardOption = outer.getByRole('button', { name: /Pay with card|^Card$/i });
  const hasCardOption = await cardOption.waitFor({ state: 'attached', timeout: 5000 }).then(() => true).catch(() => false);
  if (hasCardOption) {
    await cardOption.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await cardOption.click();
    await page.waitForTimeout(1000);
  }

  // Card fields are all direct inputs inside the outer embedded-checkout iframe
  // (no per-field nested security iframes in the new Stripe Embedded Checkout layout)
  const cardNumberInput = outer.locator('input[name="cardNumber"]');
  await cardNumberInput.waitFor({ state: 'visible', timeout: 15000 });
  await cardNumberInput.fill(TEST_CARD);
  console.log('[StripeCheckout] Card number filled.');

  const expiryInput = outer.locator('input[name="cardExpiry"]');
  await expiryInput.waitFor({ state: 'visible', timeout: 10000 });
  await expiryInput.fill(TEST_EXP);
  console.log('[StripeCheckout] Expiry filled.');

  const cvcInput = outer.locator('input[name="cardCvc"]');
  await cvcInput.waitFor({ state: 'visible', timeout: 10000 });
  await cvcInput.fill(TEST_CVC);
  console.log('[StripeCheckout] CVC filled.');

  // Cardholder name — direct input in outer iframe (name="billingName")
  const nameInput = outer.locator('input[name="billingName"], input[autocomplete="cc-name"]').first();
  const hasName = await nameInput.waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false);
  if (hasName) {
    await nameInput.fill(TEST_NAME);
    console.log('[StripeCheckout] Cardholder name filled.');
  }

  // ZIP / postal code — direct input in outer iframe
  const zipInput = outer.locator(
    'input[name="postalCode"], input[id="postalCode"], input[placeholder="ZIP"], input[placeholder="Postal code"], #billingPostalCode, input[name="billingPostalCode"]'
  ).first();
  const hasZip = await zipInput.waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false);
  if (hasZip) {
    await zipInput.fill(TEST_ZIP);
    console.log('[StripeCheckout] ZIP filled.');
  }

  // Submit
  const subscribeBtn = outer.getByRole('button', { name: /Subscribe|Pay|Submit/i });
  await subscribeBtn.waitFor({ state: 'visible', timeout: 10000 });
  await expect(subscribeBtn).toBeEnabled({ timeout: 5000 });
  await subscribeBtn.scrollIntoViewIfNeeded();
  await subscribeBtn.click();

  console.log('[StripeCheckout] Submit clicked. Waiting for redirect to app (up to 90s).');
  await page.waitForURL((url) => url.href.startsWith(APP_BASE_URL), { timeout: 90000 });
  await expect(page).toHaveURL(APP_BASE_URL + '/');
}
