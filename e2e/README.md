# E2E Tests — Nubia Perfumes

End-to-end tests written with **Playwright**, run on **desktop Chrome** and **mobile Chrome (Pixel 7)**: **45 tests**, run against two production builds of the app.

| `E2E_MODE` | Build under test | Specs that run | Runs |
|---|---|---|---|
| `demo` (default) | built **without** Supabase env vars → bundled demo catalogue. Any request to Supabase fails the test. | smoke, seo, demo-catalogue, security (API part) | 31 × 2 = **62** |
| `mock` | built with a **fake, unresolvable** Supabase URL; the browser's Supabase calls are answered by `fixtures/supabase-mock.js`, server-side calls fall back to the demo catalogue | smoke, seo, shop-flow, security | 37 × 2 = **74** |

No Supabase credentials are needed and no real database is touched.

## What is tested

| File | Tests | Checks |
|---|---|---|
| `smoke.spec.js` | 9 | 8 key pages return HTTP 200 with the right title · unknown routes return a branded 404 with a working link back |
| `seo.spec.js` | 12 | Absolute, self-referencing https canonical + description + og:image on 7 indexable pages · unique titles · `noindex` on cart / checkout / dashboard · JSON-LD parses (OnlineStore + WebSite) · `robots.txt` → https sitemap · `sitemap.xml` lists the key pages on one https host |
| `demo-catalogue.spec.js` | 8 | Demo products listed with EGP prices + demo note · home page not empty · search · product images served from `/public` · product page: server-rendered `Product` JSON-LD (EGP `AggregateOffer`, no ratings) → size → add to cart → cart totals · cash-on-delivery checkout → confirmation marked as demo order, WhatsApp not opened, cart cleared · sitemap lists demo products · read-only dashboard |
| `security.spec.js` | 6 | `POST /api/upload` without token → 401 · forged token → 401 (503 in demo mode) · `/dashboard` → 307 `/dashboard/login` + `X-Robots-Tag: noindex` · forged session cookie is rejected · Supabase unreachable → demo catalogue fallback · Supabase reachable → its catalogue, no demo note |
| `shop-flow.spec.js` | 10 | Catalogue renders products and prices · search · gender filter · price sorting · product page → size → add to cart → cart subtotal / shipping / quantity / remove · free-shipping threshold · `/checkout` survives a reload · checkout validation · valid cash-on-delivery order → confirmation + WhatsApp hand-off · language switch sets `lang="ar"` + `dir="rtl"` |

## Run locally

```bash
# Demo build (from the repo root)
npm ci && npm run build && npm start                     # http://localhost:3000
cd e2e && npm ci && npx playwright install chromium
BASE_URL=http://localhost:3000 npm test

# Supabase-mode build
NEXT_PUBLIC_SUPABASE_URL=https://e2e-mock.invalid NEXT_PUBLIC_SUPABASE_ANON_KEY=e2e npm run build && npm start
BASE_URL=http://localhost:3000 E2E_MODE=mock npm test

npm test                                                 # against the live site (demo mode by default)
```

CI (`.github/workflows/e2e.yml`) runs lint → type-check → demo build → E2E (`demo`) → Supabase-mode build → E2E (`mock`), plus a PostgreSQL job that tests the RLS policies in `supabase-setup.sql`.
