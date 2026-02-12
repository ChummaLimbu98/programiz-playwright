/**
 * Payment test: signup → pay.sandbox (Paddle) → app + persona.
 * Run headed locally: npm run test:payment (or npx playwright test payment.spec.ts --headed).
 * Paddle iframe does not load in CI (xvfb/automation), so this test is skipped in CI.
 */
import { test } from '@playwright/test';
import { signUp, paymentFlow, personaOnboardingFlow } from './helpers';
import { randomNewEmail } from './constants';

test.describe('Payment', () => {
  test.skip(!!process.env.CI, 'Paddle iframe does not load in CI; run locally: npm run test:payment');

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

  test('signup then payment completes and shows pro badge', async ({ page }) => {
    test.setTimeout(300000);
    const email = randomNewEmail();
    console.log('[Payment Spec] Starting test. Email:', email);
    console.log('[Payment Spec] Step 1/3: Sign up...');
    await signUp(page, 'Ann Mary', email, 'Player@dev8');
    console.log('[Payment Spec] Sign up done. URL:', page.url());
    console.log('[Payment Spec] Step 2/3: Payment flow...');
    await paymentFlow(page);
    console.log('[Payment Spec] Payment flow done. URL:', page.url());
    console.log('[Payment Spec] Step 3/3: Persona onboarding...');
    await personaOnboardingFlow(page);
    console.log('[Payment Spec] All steps complete. URL:', page.url());
  });
});
