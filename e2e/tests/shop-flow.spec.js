import { test, expect } from '@playwright/test';
import { mockSupabase, dismissPromo, seedCart, PRODUCTS } from '../fixtures/supabase-mock.js';

const [OUD, JASMINE, CITRUS] = PRODUCTS;

test.beforeEach(async ({ page }) => {
  await dismissPromo(page);
  await mockSupabase(page);
});

/** Product names in the order they appear in the catalogue grid. */
async function visibleProductNames(page) {
  const names = PRODUCTS.map((p) => p.name);
  const texts = await page.locator('a[href^="/product/"]').allInnerTexts();
  return texts
    .map((t) => names.find((n) => t.includes(n)))
    .filter((n, i, arr) => n && arr.indexOf(n) === i);
}

test.describe('Catalogue', () => {
  test('lists products from Supabase with their prices', async ({ page }) => {
    await page.goto('/products');
    for (const p of PRODUCTS) {
      await expect(page.getByText(p.name, { exact: true })).toBeVisible();
    }
    await expect(page.getByText('1,200 EGP').first()).toBeVisible();
  });

  test('search narrows the results', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByText(OUD.name, { exact: true })).toBeVisible();
    await page.getByRole('searchbox', { name: 'Search fragrances' }).fill('jasmine');
    await expect(page.getByText(JASMINE.name, { exact: true })).toBeVisible();
    await expect(page.getByText(OUD.name, { exact: true })).toHaveCount(0);
    await expect(page.getByText(CITRUS.name, { exact: true })).toHaveCount(0);
  });

  test('gender filter shows only matching products', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByText(CITRUS.name, { exact: true })).toBeVisible();
    await page.getByRole('button', { name: /Women/ }).click();
    await expect(page.getByText(JASMINE.name, { exact: true })).toBeVisible();
    await expect(page.getByText(OUD.name, { exact: true })).toHaveCount(0);
    await expect(page.getByText(CITRUS.name, { exact: true })).toHaveCount(0);
  });

  test('sorting by price re-orders the grid', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByText(OUD.name, { exact: true })).toBeVisible();
    const sort = page.getByRole('combobox', { name: 'Sort products' });

    await sort.selectOption('price-low');
    await expect.poll(() => visibleProductNames(page)).toEqual([CITRUS.name, JASMINE.name, OUD.name]);

    await sort.selectOption('price-high');
    await expect.poll(() => visibleProductNames(page)).toEqual([OUD.name, JASMINE.name, CITRUS.name]);
  });
});

test.describe('Product → cart', () => {
  test('open a product, pick a size, add to cart and check the totals', async ({ page }) => {
    await page.goto('/products');
    // Click the product name (the card also holds a quick-add button)
    await page.getByText(OUD.name, { exact: true }).click();
    // Product pages are server-rendered on demand, so allow extra time for the navigation
    await expect(page).toHaveURL(new RegExp(`/product/${OUD.id}$`), { timeout: 20_000 });
    await expect(page.getByRole('heading', { name: OUD.name })).toBeVisible();

    // Choosing a bigger size updates the price shown
    // (retry the click: the size buttons animate in after the page hydrates)
    await expect(async () => {
      await page.getByRole('button', { name: /100ml/ }).click();
      await expect(page.getByText('Price for 100ml', { exact: false })).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 15_000 });

    await page.getByRole('button', { name: /add to cart/i }).click();
    await expect(page.locator('.cart-badge').first()).toHaveText('1');

    await page.goto('/cart');
    await expect(page.getByRole('heading', { name: OUD.name })).toBeVisible();
    const summary = page.locator('.cart-summary-panel');
    await expect(summary).toContainText('Subtotal (1 items)');
    await expect(summary).toContainText('1,900 EGP');
    await expect(summary).toContainText('Free'); // >= 1,500 EGP ships free

    // Quantity +1 doubles the subtotal
    await page.getByRole('button', { name: `Increase quantity of ${OUD.name}` }).click();
    await expect(summary).toContainText('Subtotal (2 items)');
    await expect(summary).toContainText('3,800 EGP');

    // Removing the line empties the cart
    await page.getByRole('button', { name: `Remove ${OUD.name}` }).click();
    await expect(page.getByText('No Fragrances Selected')).toBeVisible();
  });

  test('orders under 1,500 EGP pay 80 EGP shipping', async ({ page }) => {
    await seedCart(page, [
      { id: CITRUS.id, name: CITRUS.name, price: 500, image_url: CITRUS.image_url, quantity: 1, size: '50ml' },
    ]);
    await page.goto('/cart');
    const summary = page.locator('.cart-summary-panel');
    await expect(summary).toContainText('500 EGP');
    await expect(summary).toContainText('80 EGP');
    await expect(summary).toContainText('580 EGP');
    await expect(summary).toContainText('Add 1,000 EGP more for free shipping!');
  });
});

test.describe('Checkout', () => {
  const cartItem = {
    id: JASMINE.id, name: JASMINE.name, price: 650, image_url: JASMINE.image_url, quantity: 2, size: '50ml',
  };

  test('reloading /checkout with items keeps the user on checkout', async ({ page }) => {
    await seedCart(page, [cartItem]);
    await page.goto('/checkout');
    await page.waitForTimeout(1500); // the old bug redirected to /cart right after hydration
    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.getByRole('button', { name: /Place Order · 1,380 EGP/ })).toBeVisible();
  });

  test('form validation blocks incomplete orders', async ({ page }) => {
    await seedCart(page, [cartItem]);
    await page.goto('/checkout');
    // Wait until the cart has hydrated and the total is final before interacting
    const submit = page.getByRole('button', { name: /Place Order · 1,380 EGP/ });
    await expect(submit).toBeVisible();
    const name = page.getByLabel('Full Name *');
    const email = page.getByLabel('Email Address *');

    await submit.click();
    await expect(page).toHaveURL(/\/checkout$/);
    expect(await name.evaluate((el) => el.validity.valueMissing)).toBe(true);

    await name.fill('Test Customer');
    await email.fill('not-an-email');
    await submit.click();
    await expect(page).toHaveURL(/\/checkout$/);
    expect(await email.evaluate((el) => el.validity.typeMismatch)).toBe(true);
  });

  test('a valid cash-on-delivery order reaches the confirmation page', async ({ page }) => {
    await seedCart(page, [cartItem]);
    // The order is handed off to WhatsApp in a new tab — stub it out.
    await page.addInitScript(() => {
      window.open = (url) => {
        window.__openedUrl = String(url);
        return null;
      };
    });
    await page.goto('/checkout');
    await expect(page.getByRole('button', { name: /Place Order · 1,380 EGP/ })).toBeVisible();
    await page.getByLabel('Full Name *').fill('Test Customer');
    await page.getByLabel('Email Address *').fill('test@example.com');
    await page.getByLabel('Phone Number *').fill('01000000000');
    await page.getByLabel('Governorate *').selectOption('Giza');
    await page.getByLabel('Detailed Address *').fill('1 Test Street');
    await page.getByRole('button', { name: /Place Order · 1,380 EGP/ }).click();

    await expect(page).toHaveURL(/\/order-confirmation$/);
    await expect(page.getByText(/ML-\d{6}/).first()).toBeVisible();
    expect(await page.evaluate(() => window.__openedUrl)).toContain('wa.me/');
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('maison-luxe-cart')))).toEqual([]);
  });
});

test.describe('Language', () => {
  test('switching to Arabic sets lang="ar" and dir="rtl"', async ({ page }) => {
    await page.goto('/products');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await page.getByRole('button', { name: 'Toggle language' }).locator('visible=true').first().click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });
});
