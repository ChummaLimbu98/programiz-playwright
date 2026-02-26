/**
 * Stripe payment test: same URL as Paddle; backend shows Stripe when request is from US IP.
 * Run in headed mode (from US IP): npx playwright test playwright/stripe-payment.spec.ts --project=chromium-stripe --headed
 */
import { test } from '@playwright/test';
import { signUp, stripeCheckoutPaymentFlow, personaOnboardingFlow } from './helpers';
import { randomNewEmail } from './constants';

test.describe('Stripe Payment', () => {
  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus && !process.env.CI) {
      await page.pause();
    }
  });

  test.beforeEach(async ({ page }) => {
    page.on('pageerror', (err) => {
      const stack = err.stack ?? '';
      const msg = err.message ?? '';
      const isThirdParty =
        stack.includes('gstatic.com') ||
        stack.includes('boq-payments-consumer') ||
        msg.includes("Cannot read properties of null (reading 'o')") ||
        msg === 'Failed to fetch';
      if (isThirdParty) return;
      throw err;
    });
  });

  test('signup then Stripe payment completes and shows pro badge', async ({ page }) => {
    test.setTimeout(300000);
    const email = randomNewEmail();
    console.log('[Stripe Spec] Starting test. Email:', email);
    console.log('[Stripe Spec] Step 1/3: Sign up...');
    await signUp(page, 'Ann Mary', email, 'Player@dev8');
    console.log('[Stripe Spec] Sign up done. URL:', page.url());
    console.log('[Stripe Spec] Step 2/3: Stripe payment flow...');
    await stripeCheckoutPaymentFlow(page);
    console.log('[Stripe Spec] Payment flow done. URL:', page.url());
    console.log('[Stripe Spec] Step 3/3: Persona onboarding...');
    await personaOnboardingFlow(page);
    console.log('[Stripe Spec] All steps complete. URL:', page.url());
  });
});
