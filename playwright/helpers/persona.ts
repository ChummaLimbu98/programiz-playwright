import { expect, Page } from '@playwright/test';
import { APP_BASE_URL } from '../constants';

/**
 * Post-payment persona/onboarding flow on the app:
 * If persona screen is shown: Select "Learn programming for school or college" → Continue →
 * "Preparing for job or internship opportunities" → Continue → Python → Go to Dashboard.
 * If persona is not shown (e.g. already on dashboard), just assert pro badge.
 */
export async function personaOnboardingFlow(page: Page): Promise<void> {
  console.log('[PersonaFlow] Waiting 3s for page to settle. URL:', page.url());
  await page.waitForTimeout(3000);

  const personaCard = page.getByText('Learn programming for school or college').first();
  const personaVisible = await personaCard.waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false);

  if (!personaVisible) {
    console.log('[PersonaFlow] Persona screen not shown; asserting pro badge only.');
    await expect(page.getByTestId('pro-badge')).toBeVisible();
    console.log('[PersonaFlow] Pro badge visible. Done.');
    return;
  }

  console.log('[PersonaFlow] Persona screen visible. Selecting "Learn programming for school or college"...');
  await personaCard.click();
  await page.getByTestId('persona-continue-btn').waitFor({ state: 'visible', timeout: 10000 });
  await page.getByTestId('persona-continue-btn').click();
  console.log('[PersonaFlow] Continued. Waiting for "Preparing for job or internship opportunities"...');

  await page.getByText('Preparing for job or internship opportunities').first().waitFor({ state: 'visible', timeout: 15000 });
  await page.getByText('Preparing for job or internship opportunities').first().click();
  await page.getByTestId('persona-continue-btn').click();
  console.log('[PersonaFlow] Selected job/internship. Selecting Python...');

  await page.getByText('Python').first().waitFor({ state: 'visible', timeout: 15000 });
  await page.getByText('Python').first().click();
  await page.getByRole('button', { name: 'Go to Dashboard' }).waitFor({ state: 'visible', timeout: 10000 });
  await page.getByRole('button', { name: 'Go to Dashboard' }).click();
  console.log('[PersonaFlow] Go to Dashboard clicked. Waiting for app URL...');

  await page.waitForURL((url) => url.href.startsWith(APP_BASE_URL), { timeout: 30000 });
  await expect(page.getByTestId('pro-badge')).toBeVisible();
  console.log('[PersonaFlow] On app; pro badge visible. Done. URL:', page.url());
}
