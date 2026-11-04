# E2E Tests — Nubia Perfumes

End-to-end tests written with **Playwright**, run on **desktop Chrome** and **mobile Chrome (Pixel 7)** — 31 tests × 2 projects = **62 runs**.

The storefront reads its data from Supabase in the browser, so the suite intercepts every Supabase REST call (`fixtures/supabase-mock.js`) and answers with fixture products. **No Supabase credentials are needed** and the real database is never touched — CI builds the app without any secrets.

## What is tested

| File | Tests | Checks |
|---|---|---|
| `smoke.spec.js` | 9 | 8 key pages return HTTP 200 with the right title · unknown routes return a branded 404 with a working link back |
| `shop-flow.spec.js` | 10 | Catalogue renders products and prices · search narrows results · gender filter · price sorting re-orders the grid · product page → pick size → add to cart → cart badge → cart subtotal / shipping / quantity / remove · free-shipping threshold (80 EGP under 1,500 EGP) · `/checkout` survives a reload · checkout form validation (required fields, invalid email) · valid cash-on-delivery order reaches the confirmation page and clears the cart · language switch sets `lang="ar"` + `dir="rtl"` |
| `seo.spec.js` | 12 | Absolute, self-referencing https canonical + description + og:image on 7 indexable pages · unique titles · `noindex` on cart / checkout / dashboard · JSON-LD parses (OnlineStore + WebSite) · `robots.txt` → https sitemap · `sitemap.xml` lists the key pages on one https host |

## Run locally

```bash
# 1. build and start the app (from the repo root)
npm ci && npm run build && npm start          # http://localhost:3000

# 2. in another terminal
cd e2e
npm ci
npx playwright install chromium
BASE_URL=http://localhost:3000 npm test       # against the local build
npm test                                      # against the live site (default)
```

CI (`.github/workflows/e2e.yml`) runs lint → type-check → build → starts the production server → runs this suite on every push and pull request.
