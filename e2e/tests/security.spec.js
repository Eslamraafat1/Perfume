import { test, expect } from '@playwright/test';
import { mockSupabase, dismissPromo, MODE } from '../fixtures/supabase-mock.js';

// A 1x1 PNG, used to prove the upload route rejects requests before reading files.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);
const upload = { file: { name: 'x.png', mimeType: 'image/png', buffer: PNG }, fileName: 'x.png' };

test.describe('Admin API protection', () => {
  test('POST /api/upload without a token is rejected with 401', async ({ request }) => {
    const res = await request.post('/api/upload', { multipart: upload });
    expect(res.status()).toBe(401);
    expect(await res.json()).toEqual({ error: 'Authentication required.' });
  });

  test('POST /api/upload with a forged token is rejected', async ({ request }) => {
    const res = await request.post('/api/upload', {
      headers: { Authorization: 'Bearer not-a-real-token' },
      multipart: upload,
    });
    // Supabase mode: the token cannot be verified → 401. Demo mode: uploads are disabled → 503.
    expect(res.status()).toBe(MODE === 'mock' ? 401 : 503);
  });
});

test.describe('Admin dashboard protection', () => {
  test.skip(MODE !== 'mock', 'Sign-in only exists when Supabase is configured');

  test('/dashboard redirects anonymous visitors to the sign-in page', async ({ page, request }) => {
    const res = await request.get('/dashboard', { maxRedirects: 0 });
    expect(res.status()).toBe(307);
    expect(res.headers()['location']).toMatch(/\/dashboard\/login$/);
    expect(res.headers()['x-robots-tag']).toContain('noindex');

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard\/login$/);
    await expect(page.getByRole('heading', { name: 'Admin sign in' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    expect(await page.locator('meta[name="robots"]').getAttribute('content')).toContain('noindex');
  });

  test('a forged session cookie does not open the dashboard', async ({ page, context, baseURL }) => {
    await context.addCookies([
      { name: 'sb-e2e-mock-auth-token', value: 'base64-eyJhY2Nlc3NfdG9rZW4iOiJmb3JnZWQifQ', url: baseURL },
    ]);
    await page.goto('/dashboard/products');
    await expect(page).toHaveURL(/\/dashboard\/login$/);
  });
});

test.describe('Supabase outage → demo catalogue fallback', () => {
  test.skip(MODE !== 'mock', 'Needs a build with a Supabase URL');

  test('when Supabase is unreachable the store falls back to the demo catalogue', async ({ page }) => {
    await dismissPromo(page);
    await page.route(/\/rest\/v1\//, (route) => route.abort('internetdisconnected'));
    await page.routeWebSocket(/\/realtime\/v1\//, () => {});
    await page.goto('/products');
    await expect(page.getByText('Oud Noir', { exact: true }).first()).toBeVisible();
    await expect(page.getByTestId('demo-catalogue-note')).toBeVisible();
  });

  test('when Supabase answers, its catalogue is used and no demo note is shown', async ({ page }) => {
    await dismissPromo(page);
    await mockSupabase(page);
    await page.goto('/products');
    await expect(page.getByText('E2E Royal Oud', { exact: true })).toBeVisible();
    await expect(page.getByText('Oud Noir', { exact: true })).toHaveCount(0);
    await expect(page.getByTestId('demo-catalogue-note')).toHaveCount(0);
  });
});
