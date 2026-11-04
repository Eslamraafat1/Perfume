import { test, expect } from '@playwright/test';

// Pages are server-rendered, so these checks read the raw HTML response.
const indexable = ['/', '/products', '/category', '/about', '/blog', '/contact', '/fragrance-finder'];

async function html(request, path) {
  const res = await request.get(path);
  expect(res.status()).toBe(200);
  return res.text();
}

function attr(source, re) {
  const m = source.match(re);
  return m ? m[1] : null;
}

test.describe('SEO', () => {
  for (const path of indexable) {
    test(`${path} has an absolute, self-referencing canonical`, async ({ request }) => {
      const source = await html(request, path);
      const canonical = attr(source, /<link rel="canonical" href="([^"]+)"/);
      expect(canonical).toMatch(/^https:\/\//);
      expect(canonical).not.toContain('localhost');
      expect(new URL(canonical).pathname.replace(/\/$/, '')).toBe(path.replace(/\/$/, ''));
      expect(attr(source, /<meta name="description" content="([^"]+)"/)).toBeTruthy();
      expect(attr(source, /<meta property="og:image" content="([^"]+)"/)).toMatch(/^https:\/\//);
    });
  }

  test('pages have unique titles', async ({ request }) => {
    const titles = [];
    for (const path of indexable) {
      titles.push(attr(await html(request, path), /<title>([^<]+)<\/title>/));
    }
    expect(new Set(titles).size).toBe(titles.length);
  });

  test('cart, checkout and dashboard are noindex', async ({ request }) => {
    for (const path of ['/cart', '/checkout', '/dashboard']) {
      expect(await html(request, path)).toMatch(/<meta name="robots" content="noindex/);
    }
  });

  test('home page JSON-LD parses and describes the store', async ({ request }) => {
    const source = await html(request, '/');
    const blocks = [...source.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) =>
      JSON.parse(m[1]),
    );
    const types = blocks.flat().map((b) => b['@type']);
    expect(types).toContain('OnlineStore');
    expect(types).toContain('WebSite');
    for (const b of blocks.flat()) {
      if (b.url) expect(b.url).not.toContain('localhost');
    }
  });

  test('robots.txt references an absolute https sitemap', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/Disallow: \/dashboard/);
    const sitemap = attr(body, /Sitemap: (\S+)/);
    expect(sitemap).toMatch(/^https:\/\/.+\/sitemap\.xml$/);
    expect(sitemap).not.toContain('localhost');
  });

  test('sitemap.xml lists the key pages on one https host', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const locs = [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.length).toBeGreaterThanOrEqual(indexable.length);
    expect(new Set(locs.map((l) => new URL(l).host)).size).toBe(1);
    for (const loc of locs) expect(loc).toMatch(/^https:\/\//);
    const paths = locs.map((l) => new URL(l).pathname.replace(/\/$/, '') || '/');
    for (const p of indexable) expect(paths).toContain(p === '/' ? '/' : p);
  });
});
