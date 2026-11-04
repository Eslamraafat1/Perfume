import { test, expect } from '@playwright/test';
import { mockSupabase, dismissPromo } from '../fixtures/supabase-mock.js';

test.beforeEach(async ({ page }) => {
  await dismissPromo(page);
  await mockSupabase(page);
});

// Every key page should load (HTTP 200) with the right <title>
const pages = [
  ['/', /Nubia/i],
  ['/products', /Nubia/i],
  ['/category', /Nubia/i],
  ['/fragrance-finder', /Nubia/i],
  ['/about', /Nubia/i],
  ['/contact', /Nubia/i],
  ['/blog', /Nubia/i],
  ['/cart', /Nubia/i],
];

test.describe('Key pages load', () => {
  for (const [path, title] of pages) {
    test(`${path} returns 200 with correct title`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res.status()).toBe(200);
      await expect(page).toHaveTitle(title);
    });
  }
});

test.describe('Error handling', () => {
  test('unknown routes return a branded 404 with a way back', async ({ page }) => {
    const res = await page.goto('/this-page-does-not-exist');
    expect(res.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'This Scent Has Faded' })).toBeVisible();
    await page.getByRole('link', { name: 'Explore the Collection' }).click();
    await expect(page).toHaveURL(/\/products$/);
  });
});
