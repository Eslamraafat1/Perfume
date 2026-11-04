// Deterministic Supabase mock for E2E tests.
//
// The suite runs against two builds of the app (see README → Testing):
//   E2E_MODE=demo (default) — built WITHOUT Supabase env vars: the store serves the
//                             bundled demo catalogue (data/demo-catalogue.ts).
//   E2E_MODE=mock           — built with a fake, unresolvable Supabase URL; the browser's
//                             Supabase calls are answered by the mock below.
export const MODE = process.env.E2E_MODE === 'mock' ? 'mock' : 'demo';
//
// The storefront talks to Supabase (PostgREST) directly from the browser, so the
// tests intercept those requests with Playwright and answer with fixture data.
// This means the suite needs NO Supabase credentials and never touches the real
// database (CI builds the app without any secrets).

/** Test-only catalogue (fictional products, local images from /public). */
export const PRODUCTS = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'E2E Royal Oud',
    description: 'Smoky oud and amber test fragrance.',
    price: 1200,
    image_url: '/perfume_1.png',
    badge: 'Bestseller',
    category: 'Oud & Woody',
    gender: 'men',
    fragrance_family: 'Oud & Amber',
    top_notes: 'Saffron, Bergamot',
    heart_notes: 'Rose, Oud',
    base_notes: 'Amber, Musk',
    longevity: 'Very Long Lasting (8h-12h)',
    sillage: 'Strong',
    sizes: [
      { size: '50ml', price: 1200 },
      { size: '100ml', price: 1900 },
    ],
    images: [],
    created_at: '2026-01-03T00:00:00Z',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'E2E Jasmine Bloom',
    description: 'Bright floral test fragrance.',
    price: 650,
    image_url: '/perfume_2.png',
    badge: null,
    category: 'Sweet & Floral',
    gender: 'women',
    fragrance_family: 'Floral',
    top_notes: 'Pear, Mandarin',
    heart_notes: 'Jasmine, Peony',
    base_notes: 'Vanilla, White Musk',
    longevity: 'Long Lasting (6h-8h)',
    sillage: 'Moderate',
    sizes: [{ size: '50ml', price: 650 }],
    images: [],
    created_at: '2026-01-02T00:00:00Z',
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    name: 'E2E Citrus Breeze',
    description: 'Fresh citrus test fragrance.',
    price: 500,
    image_url: '/perfume_3.png',
    badge: null,
    category: 'Fresh & Citrus',
    gender: 'unisex',
    fragrance_family: 'Fresh & Citrus',
    top_notes: 'Lemon, Grapefruit',
    heart_notes: 'Neroli',
    base_notes: 'Cedar',
    longevity: 'Moderate (4h-6h)',
    sillage: 'Soft',
    sizes: [{ size: '50ml', price: 500 }],
    images: [],
    created_at: '2026-01-01T00:00:00Z',
  },
];

/** Apply the PostgREST filters the app uses (eq / neq / limit). */
function applyFilters(rows, searchParams) {
  let result = rows;
  for (const [key, value] of searchParams) {
    if (['select', 'order', 'limit', 'offset'].includes(key)) continue;
    const [op, ...rest] = value.split('.');
    const expected = decodeURIComponent(rest.join('.'));
    if (op === 'eq') result = result.filter((r) => String(r[key]) === expected);
    if (op === 'neq') result = result.filter((r) => String(r[key]) !== expected);
  }
  const limit = Number(searchParams.get('limit'));
  return limit > 0 ? result.slice(0, limit) : result;
}

/**
 * Intercept every Supabase REST call made by the page.
 * @param {import('@playwright/test').Page} page
 * @param {{ products?: object[] }} [options]
 */
export async function mockSupabase(page, { products = PRODUCTS } = {}) {
  await page.route(/\/rest\/v1\/(products|site_content|hero_slides)/, async (route) => {
    const req = route.request();
    if (req.method() !== 'GET' && req.method() !== 'HEAD') {
      return route.fulfill({ status: 403, json: { message: 'read-only test mock' } });
    }
    const url = new URL(req.url());
    const table = url.pathname.split('/').pop();
    const rows = table === 'products' ? applyFilters(products, url.searchParams) : [];
    const wantsSingle = (req.headers()['accept'] || '').includes('vnd.pgrst.object');
    if (wantsSingle) {
      return rows.length
        ? route.fulfill({ status: 200, json: rows[0] })
        : route.fulfill({ status: 406, json: { code: 'PGRST116', message: 'no rows' } });
    }
    return route.fulfill({ status: 200, json: rows });
  });
  // Realtime websocket: keep it from hitting the network.
  await page.routeWebSocket(/\/realtime\/v1\//, () => {});
}

/** Suppress the first-visit "scratch card" promo modal so it never covers the UI. */
export async function dismissPromo(page) {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem('nubia-scratch-shown', '1');
    } catch {}
  });
}

/** Pre-fill the cart in localStorage (same key the CartContext uses). */
export async function seedCart(page, items) {
  await page.addInitScript((value) => {
    try {
      if (!sessionStorage.getItem('e2e-cart-seeded')) {
        localStorage.setItem('maison-luxe-cart', value);
        sessionStorage.setItem('e2e-cart-seeded', '1');
      }
    } catch {}
  }, JSON.stringify(items));
}
