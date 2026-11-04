import { test, expect } from '@playwright/test';
import { dismissPromo, seedCart, MODE } from '../fixtures/supabase-mock.js';

// The store built WITHOUT any Supabase env vars must still be a working shop,
// served from the bundled demo catalogue (data/demo-catalogue.ts).
test.skip(MODE !== 'demo', 'Demo-catalogue flows: run against a build without Supabase env vars');

const DEMO = {
  oudNoir: { id: '29849ccc-14d1-4c1d-96db-11667d5569e2', name: 'Oud Noir' },
  ete: { id: '15152fe3-c7fc-47ea-942a-b10c5ba1b822', name: 'Été', image: '/perfume_4.png' },
};
const DEMO_NAMES = ['Oud Noir', 'Rose Noir', 'Aurélia', 'Aurora Gold', 'Aquatica Luxe', 'Été'];

test.beforeEach(async ({ page }) => {
  await dismissPromo(page);
  // Prove there is no dependency on Supabase: any Supabase request fails the test.
  await page.route(/supabase\.(co|in)|\/rest\/v1\//, (route) => {
    throw new Error(`Unexpected Supabase request in demo mode: ${route.request().url()}`);
  });
});

async function clickCentered(locator) {
  await locator.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await locator.click();
}

test.describe('Demo catalogue (no Supabase configured)', () => {
  test('lists every demo product with EGP prices and a subtle demo note', async ({ page }) => {
    await page.goto('/products');
    for (const name of DEMO_NAMES) {
      await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
    }
    await expect(page.getByText('2,400 EGP').first()).toBeVisible();
    await expect(page.getByTestId('demo-catalogue-note')).toContainText('Demo catalogue');
  });

  test('home page shows demo products instead of an empty shelf', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href^="/product/"]').first()).toBeAttached({ timeout: 15_000 });
    await expect(page.getByText('No fragrances yet')).toHaveCount(0);
  });

  test('search narrows the demo catalogue', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByText('Rose Noir', { exact: true })).toBeVisible();
    await page.getByRole('searchbox', { name: 'Search fragrances' }).fill('aqua');
    await expect(page.getByText('Aquatica Luxe', { exact: true })).toBeVisible();
    await expect(page.getByText('Rose Noir', { exact: true })).toHaveCount(0);
  });

  test('every demo product image is served from /public', async ({ page, request }) => {
    await page.goto('/products');
    await expect(page.getByText('Oud Noir', { exact: true })).toBeVisible();
    for (const src of ['/perfume_1.png', '/perfume_2.png', '/perfume_3.png', '/perfume_4.png', '/perfume_5.png', '/perfume_hero.png']) {
      expect((await request.get(src)).status(), src).toBe(200);
    }
  });

  test('product page: server-rendered JSON-LD, pick a size, add to cart', async ({ page, request }) => {
    test.slow(); // on-demand server render + animated page
    const html = await (await request.get(`/product/${DEMO.oudNoir.id}`)).text();
    expect(html).toContain(`<title>${DEMO.oudNoir.name} | Nubia Fine Fragrances</title>`);
    const ld = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)]
      .map((m) => JSON.parse(m[1]))
      .flat();
    const product = ld.find((b) => b['@type'] === 'Product');
    expect(product.name).toBe(DEMO.oudNoir.name);
    expect(product.offers).toMatchObject({ '@type': 'AggregateOffer', priceCurrency: 'EGP', lowPrice: 2400, highPrice: 3600 });
    expect(JSON.stringify(product)).not.toMatch(/aggregateRating|review/i);

    await page.goto('/products');
    await page.getByText(DEMO.oudNoir.name, { exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/product/${DEMO.oudNoir.id}$`), { timeout: 20_000 });
    await expect(page.getByRole('heading', { name: DEMO.oudNoir.name })).toBeVisible();

    await expect(async () => {
      await page.getByRole('button', { name: /100ml/ }).click();
      await expect(page.getByText('Price for 100ml', { exact: false })).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 15_000 });

    await page.getByRole('button', { name: /add to cart/i }).click();
    await expect(page.locator('.cart-badge').first()).toHaveText('1');

    await page.goto('/cart');
    const summary = page.locator('.cart-summary-panel');
    await expect(summary).toContainText('3,600 EGP');
    await expect(summary).toContainText('Free');
  });

  test('cash-on-delivery checkout completes as a demo order (nothing sent)', async ({ page }) => {
    await seedCart(page, [
      { id: DEMO.ete.id, name: DEMO.ete.name, price: 750, image_url: DEMO.ete.image, quantity: 1, size: '30ml' },
    ]);
    await page.addInitScript(() => {
      window.open = (url) => {
        window.__openedUrl = String(url);
        return null;
      };
    });
    await page.goto('/checkout');
    const submit = page.getByRole('button', { name: /Place Order · 830 EGP/ });
    await expect(submit).toBeVisible();
    await page.getByLabel('Full Name *').fill('Demo Customer');
    await page.getByLabel('Email Address *').fill('demo@example.com');
    await page.getByLabel('Phone Number *').fill('01000000000');
    await page.getByLabel('Governorate *').selectOption('Cairo');
    await page.getByLabel('Detailed Address *').fill('1 Demo Street');
    await clickCentered(submit);

    await expect(page).toHaveURL(/\/order-confirmation$/);
    await expect(page.getByText(/ML-\d{6}/).first()).toBeVisible();
    await expect(page.getByTestId('demo-order-note')).toContainText('Nothing was sent');
    // Demo orders are not handed off to the shop's WhatsApp
    expect(await page.evaluate(() => window.__openedUrl)).toBeUndefined();
    const order = await page.evaluate(() => JSON.parse(localStorage.getItem('last-order')));
    expect(order).toMatchObject({ demo: true, total: 830, payment_method: 'cod' });
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('maison-luxe-cart')))).toEqual([]);
  });

  test('sitemap.xml lists the demo products', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    expect(xml).toContain(`/product/${DEMO.oudNoir.id}</loc>`);
    expect([...xml.matchAll(/\/product\/[0-9a-f-]{36}<\/loc>/g)]).toHaveLength(DEMO_NAMES.length);
  });

  test('dashboard is a read-only notice and sign-in is disabled', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByTestId('demo-dashboard-notice')).toContainText('read-only');
    await expect(page.getByRole('button', { name: /Add Product|Publish|Save/i })).toHaveCount(0);
    await page.goto('/dashboard/login');
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
