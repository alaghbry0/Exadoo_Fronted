/**
 * Visual Regression Testing - Components
 * للتحقق من أن تغييرات Design Tokens لا تؤثر سلباً على المظهر
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function setTheme(page: Page, theme: 'light' | 'dark') {
  if (theme === 'dark') {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.evaluate(() => document.documentElement.classList.add('dark'));
  } else {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.evaluate(() => document.documentElement.classList.remove('dark'));
  }
  await page.waitForTimeout(300);
}

test.describe('Design Tokens - Visual Regression', () => {
  
  test('Card Components - Light Mode', async ({ page }) => {
    await page.goto(`${BASE_URL}`);
    await setTheme(page, 'light');
    await page.waitForLoadState('networkidle');
    
    const card = page.locator('[data-testid="service-card"]').first();
    if (await card.count() > 0) {
      await expect(card).toHaveScreenshot('card-light.png', {
        maxDiffPixels: 100,
      });
    }
  });
  
  test('Card Components - Dark Mode', async ({ page }) => {
    await page.goto(`${BASE_URL}`);
    await setTheme(page, 'dark');
    await page.waitForLoadState('networkidle');
    
    const card = page.locator('[data-testid="service-card"]').first();
    if (await card.count() > 0) {
      await expect(card).toHaveScreenshot('card-dark.png', {
        maxDiffPixels: 100,
      });
    }
  });
});
