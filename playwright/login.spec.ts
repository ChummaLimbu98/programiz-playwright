import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';
import { PRO_USER } from './constants';

test.describe('Login', () => {
  test('user can log in with email and password and lands on app', async ({ page }) => {
    test.setTimeout(60000);
    await login(page, PRO_USER.email, PRO_USER.password);

    await expect(page).toHaveURL(/^https:\/\/app\.(e2e|dev|staging)\.programiz\.pro(\/|$)/);

    await page.waitForTimeout(3000);
  });
});
