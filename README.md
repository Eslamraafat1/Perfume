<div align="center">

# Nubia — Luxury Perfume Store

**A bilingual (English / Arabic, RTL) luxury perfume e-commerce store built with Next.js 16 and a Supabase (PostgreSQL) back end, with a built-in admin dashboard for managing products, site copy and the hero carousel.**

[![CI](https://github.com/Eslamraafat1/Perfume/actions/workflows/e2e.yml/badge.svg)](https://github.com/Eslamraafat1/Perfume/actions/workflows/e2e.yml)
![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%C2%B7%20Storage%20%C2%B7%20Realtime-3FCF8E?logo=supabase&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-3.15-88CE02?logo=greensock&logoColor=black)
![Playwright](https://img.shields.io/badge/Playwright-1.63-2EAD33?logo=playwright&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

[**Live Demo**](https://perfume-sooty-alpha.vercel.app) · [**Portfolio**](https://new-portfolio-ashy-xi.vercel.app) · [**LinkedIn**](https://www.linkedin.com/in/eslamraafat-dev/)

</div>

<p align="center">
  <img src="docs/screenshots/desktop-home.jpg" alt="Nubia home page on desktop: hero carousel with the gold NUBIA wordmark over Abu Simbel at sunset" width="72%" />
  &nbsp;
  <img src="docs/screenshots/mobile-home.jpg" alt="Nubia home page on mobile" width="21%" />
</p>

---

## Overview

Nubia is a personal portfolio project: a complete storefront for a fictional luxury perfume house inspired by Egyptian / Nubian heritage. It is the project in my portfolio that goes deepest into the **back end**. The catalogue, the editable site copy and the homepage carousel all live in **Supabase Postgres**, product images go to **Supabase Storage**, and the storefront updates live through **Supabase Realtime** when the catalogue changes.

**No Supabase project? The store still works.** Without Supabase credentials (or when the project is unreachable) the app serves a bundled, read-only **demo catalogue** ([`data/demo-catalogue.ts`](./data/demo-catalogue.ts)) with the same shape as the database rows, so browsing, search, product pages, cart, checkout, the sitemap and JSON-LD all keep working. A one-line "Demo catalogue" note in the footer says so. This is what the live demo currently runs on.

The front end aims for a premium feel (GSAP animations, custom cursor, WebGL "splash" cursor, scratch-to-reveal welcome offer) while keeping the fundamentals right: server-rendered metadata, structured data, a sitemap that includes every product, accessible forms and an automated E2E suite.

## Key Features

**Storefront**
- Product catalogue with **search** (name / notes), **collection** and **gender filters**, **price / newest sorting**, grid / list view and pagination.
- Product detail pages with size variants (price per size), olfactory pyramid (top / heart / base notes), longevity and sillage, image gallery and related products.
- **Cart** persisted in `localStorage`, quantity controls, free-shipping threshold, promo code.
- **Checkout** with form validation and Cash on Delivery / InstaPay deposit options. The order is summarised and handed off to WhatsApp, then shown on an order-confirmation page. In demo mode the order is only stored in the browser and is clearly labelled as a demo order (nothing is sent).
- **Fragrance Finder** quiz (page + floating widget) that scores products against the visitor's answers.
- **Bilingual EN / AR**: a language toggle switches all copy and sets `<html lang>` and `dir="rtl"`.

**Admin dashboard (`/dashboard`)**
- Protected by **Supabase Auth** (email + password at `/dashboard/login`): `proxy.ts` redirects visitors without a session, the UI checks admin rights, and Row Level Security enforces them on every write. In demo mode it shows a read-only notice.
- Create, edit and delete products; upload the main image and gallery images to Supabase Storage through a Next.js Route Handler.
- Edit the site copy (EN + AR) and images stored in the `site_content` table.
- Manage the hero carousel (add, edit, reorder, activate / deactivate slides) stored in `hero_slides`.
- Changes appear on the storefront instantly through a Realtime subscription on `products`.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 16.2** (App Router, Turbopack), **React 19.2** |
| Language | **TypeScript 5.9** |
| Back end | **Supabase**: PostgreSQL with Row Level Security, Auth, Storage, Realtime (`@supabase/supabase-js` 2.118, `@supabase/ssr` 0.12) |
| API | Next.js Route Handler (`app/api/upload`) for authenticated image uploads; `proxy.ts` guards `/dashboard` |
| Styling & motion | Hand-written CSS design tokens (`app/globals.css`), `next/font`, **GSAP 3.15** (ScrollTrigger), WebGL fluid cursor |
| Quality | **Playwright 1.63** E2E (desktop + mobile Chrome), ESLint 9 (`eslint-config-next`), `tsc --noEmit` |
| CI / Hosting | GitHub Actions, **Vercel** |

## Architecture

```
Browser (client components)
 ├─ ProductContext ───── lib/catalogue.ts ─┬─► Supabase Postgres (RLS)   when configured & reachable
 │    └─ Realtime channel on public.products └─► data/demo-catalogue.ts   otherwise (read-only)
 ├─ SiteContentContext ─ supabase.from('site_content')  (built-in copy in demo mode)
 ├─ HeroSlidesContext ── supabase.from('hero_slides')   (built-in slides in demo mode)
 ├─ CartContext ──────── localStorage
 └─ LanguageContext ──── <html lang dir>

Next.js server
 ├─ proxy.ts                     /dashboard/* → Supabase Auth session check, redirect to /dashboard/login
 ├─ app/layout.tsx               global metadata, OnlineStore + WebSite JSON-LD
 ├─ app/*/layout.tsx             per-route title / description / canonical / noindex
 ├─ app/product/[id]/layout.tsx  generateMetadata + Product & BreadcrumbList JSON-LD (fetched server-side)
 ├─ app/sitemap.ts               static routes + every product (revalidated hourly)
 ├─ app/robots.ts
 └─ app/api/upload/route.ts      Bearer token + admin check → validated image → Storage bucket `product-images`
```

### Data model ([`supabase-setup.sql`](./supabase-setup.sql))

| Table | Purpose | Key columns |
|---|---|---|
| `products` | Catalogue | `id uuid` PK (`gen_random_uuid()`), `name`, `description`, `price numeric CHECK (price > 0)`, `image_url`, `images text[]`, `video_url`, `badge`, `category`, `gender` (CHECK: `men` / `women` / `unisex` / `oriental`), `fragrance_family`, `top_notes`, `heart_notes`, `base_notes`, `longevity`, `sillage`, `sizes jsonb` (`[{ size, price }]`), `created_at timestamptz` |
| `site_content` | Editable CMS copy and images (key/value, separate `en_*` / `ar_*` keys) | `key text` PK, `value text` |
| `hero_slides` | Homepage carousel | `id uuid` PK, `sort_order`, `active boolean`, `img`, colour / gradient fields, bilingual `*_en` / `*_ar` title, subtitle and button text |
| `admin_users` | Who may edit the store | `user_id uuid` PK → `auth.users`, `email` |

The SQL is written as an idempotent migration (`create table if not exists`, `add column if not exists`, `drop policy if exists`, constraint drop + re-add), so it can be re-run safely on an existing project, including one created with the old permissive policies. It also creates the public Storage bucket `product-images` (5 MB, images only). There is no orders table: orders go to WhatsApp and a copy stays in the customer's browser.

### Security model (Auth + Row Level Security)

| Who | Catalogue / content tables | `product-images` bucket | `admin_users` |
|---|---|---|---|
| Visitor (`anon` key) | read only | read only | no access |
| Signed-in user who is not an admin | read only | read only | no access |
| Admin (row in `admin_users`) | read, insert, update, delete | read, upload, update, delete | no access via the API |

- **Admins** are Supabase Auth users listed in `public.admin_users`. Policies call `public.is_admin()`, a `security definer` function that checks `auth.uid()` against that table. Admins are added in the SQL editor, never through the API.
- **`/dashboard`** is guarded on the server by [`proxy.ts`](./proxy.ts) (Next.js 16 Proxy, `@supabase/ssr`): without a valid session every `/dashboard/*` request redirects to `/dashboard/login`, and responses carry `X-Robots-Tag: noindex`. The dashboard then checks `is_admin()` before showing any form, and RLS enforces it on every write.
- **`/api/upload`** requires `Authorization: Bearer <access token>`, verifies it with `supabase.auth.getUser`, checks `is_admin()` (401 / 403 otherwise), accepts only JPEG / PNG / WebP / AVIF / GIF up to 5 MB (MIME type and file signature; SVG rejected), and uploads **as that admin**, so Storage policies apply too.
- **No service-role key** is used anywhere; the browser only ever has the public anon key, which can only read.
- The policies are tested on a real PostgreSQL server in CI ([`supabase/tests/rls.test.sql`](./supabase/tests/rls.test.sql)): anon and non-admin writes are denied, admin writes succeed, and the setup script is applied twice to prove it is idempotent.

### Demo mode

When `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing, or a Supabase request fails or times out, [`lib/catalogue.ts`](./lib/catalogue.ts) serves [`data/demo-catalogue.ts`](./data/demo-catalogue.ts) instead. The six demo products are named after the bottles in the site's own product photos (`public/perfume_*.png`), prices are illustrative EGP amounts, and there are no ratings or reviews. In demo mode the dashboard is a read-only notice, uploads return 503, realtime is off, and checkout does not contact WhatsApp.

## SEO & Performance

- `metadataBase` plus a **self-referencing canonical** on every route, unique titles and descriptions, Open Graph and Twitter cards.
- The site URL resolves as `NEXT_PUBLIC_SITE_URL` → `VERCEL_PROJECT_PRODUCTION_URL` → the production URL, so canonicals, the sitemap and robots can never point at `localhost` or another domain.
- **JSON-LD**: `OnlineStore` + `WebSite` site-wide; `Product` (with an `Offer`, or an `AggregateOffer` in EGP across sizes) and `BreadcrumbList` on each product page, rendered on the server.
- `sitemap.xml` includes every product in the database (revalidated hourly). `robots.txt` blocks `/dashboard` and `/api/`. Cart, checkout, order confirmation and dashboard are `noindex`.
- Branded 404 page, `next/font` with `display: swap`, `next/image` for Supabase-hosted images.

### Lighthouse

Measured on **2026-07-18** with **Lighthouse 13.4.0** against a local build of the home and products pages, before and after a round of performance work. The raw reports are in [`docs/lighthouse/`](./docs/lighthouse). The code has changed since then, so treat these scores as a historical snapshot rather than a current guarantee.

| Page / run | Performance | Accessibility | Best Practices | SEO | LCP | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|---:|
| Home, mobile, baseline (`home-mobile-baseline.json`) | 36 | 100 | 100 | 100 | 22.8 s | 6,360 ms | 0 |
| Home, desktop, after optimisation (`home-desktop.json`) | 86 | 100 | 100 | 100 | 2.2 s | 120 ms | 0 |
| Products, desktop, after optimisation (`products-desktop.json`) | 96 | 92 | 100 | 100 | 1.3 s | 0 ms | 0 |

## Testing & QA

The Playwright suite in [`e2e/`](./e2e) has **45 tests**, run on **desktop Chrome and mobile Chrome (Pixel 7)** against **two production builds**:

| Build | How | Runs |
|---|---|---|
| **Demo** | no Supabase env vars (like the live site today); any request to Supabase fails the test | 31 tests × 2 = **62 runs** |
| **Supabase** | fake, unresolvable Supabase URL; browser calls answered by a network-level mock (`e2e/fixtures/supabase-mock.js`) | 37 tests × 2 = **74 runs** |

- **Demo catalogue (8):** all demo products listed with EGP prices and the demo note; home page is not empty; search; product images served from `/public`; product page with server-rendered `Product` JSON-LD (`AggregateOffer` in EGP, no ratings) → size → add to cart → cart totals; cash-on-delivery checkout reaches the confirmation page as a demo order without contacting WhatsApp; sitemap lists the demo products; read-only dashboard.
- **Security (6):** `POST /api/upload` without a token → 401, with a forged token → 401 (503 in demo mode); `/dashboard` → 307 to `/dashboard/login` with `noindex`; a forged session cookie does not open the dashboard; Supabase unreachable → demo catalogue fallback; Supabase reachable → its catalogue and no demo note.
- **User flows (10, Supabase build):** catalogue, search, gender filter, price sorting; product → size → cart → subtotal / shipping / quantity / remove; free-shipping threshold; checkout survives a reload; checkout validation; valid order → confirmation + WhatsApp hand-off; Arabic sets `lang="ar"` and `dir="rtl"`.
- **SEO (12):** absolute https self-referencing canonicals, og:image and descriptions on 7 pages; unique titles; `noindex` on private pages; JSON-LD parses; robots.txt → sitemap; sitemap URLs.
- **Smoke (9):** 8 key pages return 200 with a title; unknown routes return the branded 404.

GitHub Actions runs **lint → type-check → demo build → E2E → Supabase-mode build → E2E**, plus a separate **RLS job** that applies `supabase-setup.sql` (twice) to PostgreSQL 16 and checks what anon, a signed-in non-admin and an admin can read and write. No secrets are needed.

```bash
npm run lint && npm run typecheck && npm run build
npm start                                                     # terminal 1
cd e2e && npm ci && BASE_URL=http://localhost:3000 npm test   # terminal 2 (demo build)

# Supabase-mode build:
NEXT_PUBLIC_SUPABASE_URL=https://e2e-mock.invalid NEXT_PUBLIC_SUPABASE_ANON_KEY=e2e npm run build && npm start
cd e2e && BASE_URL=http://localhost:3000 E2E_MODE=mock npm test
```

## Project Structure

```
app/
├─ page.tsx, products/, product/[id]/, category/, fragrance-finder/,
│  cart/, checkout/, order-confirmation/, about/, blog/, contact/
├─ dashboard/            admin panel (products, site copy, hero carousel) + login/
├─ api/upload/route.ts   authenticated image upload → Supabase Storage
├─ context/              Product, Cart, SiteContent, HeroSlides and Language providers
├─ layout.tsx            fonts, global metadata, JSON-LD, providers
└─ sitemap.ts, robots.ts, not-found.tsx
components/              Navbar, Footer, HeroCarousel, FragranceFinderWidget, admin/ (AdminGate, demo notice)…
data/demo-catalogue.ts   bundled read-only catalogue (demo mode)
lib/
├─ supabase-config.ts    env-only Supabase config (no hardcoded project)
├─ supabase.ts           Supabase client (cookie-based session in the browser)
├─ catalogue.ts          Supabase → demo-catalogue fallback
├─ upload-client.ts      authenticated upload helper
├─ site.ts               site URL resolution + JSON-LD helper
└─ seo.ts                per-route metadata helper
proxy.ts                 server-side guard for /dashboard
e2e/                     Playwright tests + Supabase mock
docs/                    screenshots, Lighthouse reports
supabase-setup.sql       schema, constraints, RLS + Storage policies, admin_users
supabase/tests/          RLS behaviour test (run in CI on PostgreSQL)
```

## Getting Started

**Prerequisites:** Node.js 20.9 or newer. A [Supabase](https://supabase.com) project is optional: without one the store runs on the demo catalogue.

```bash
git clone https://github.com/Eslamraafat1/Perfume.git
cd Perfume
npm ci
npm run dev        # http://localhost:3000 — demo catalogue, read-only dashboard
```

### Connect a Supabase project

1. **Create a project** at [supabase.com](https://supabase.com) (free tier is fine).
2. **Run the SQL.** Dashboard → **SQL Editor** → paste [`supabase-setup.sql`](./supabase-setup.sql) → **Run**. It creates the tables, the `admin_users` table, the RLS and Storage policies and the public `product-images` bucket, and enables Realtime on `products`.
3. **Create the admin user.** **Authentication → Users → Add user → Create new user** (email + password, tick *Auto Confirm User*). Then, in the SQL editor:
   ```sql
   insert into public.admin_users (user_id, email)
   select id, email from auth.users where email = 'you@example.com'
   on conflict (user_id) do nothing;
   ```
   Optionally disable *Allow new users to sign up* in the Authentication settings: only admins need accounts, and a non-admin account can't edit anything anyway.
4. **Set the environment variables** from **Project Settings → API** (copy `.env.example` to `.env.local` for local work):

   | Variable | Required | Description |
   |---|---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | for Supabase mode | Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | for Supabase mode | `anon` / publishable key (never the `service_role` / secret key) |
   | `NEXT_PUBLIC_SITE_URL` | no | Canonical site URL; defaults to the Vercel production URL |

5. **Run** `npm run dev`, sign in at `/dashboard/login` and add products. The demo note disappears once the catalogue comes from Supabase.

| Script | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type-check |

## Deployment

Deployed on **Vercel**. Without Supabase variables the deployment serves the demo catalogue. To connect a project: **Settings → Environment Variables** → add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Production, and Preview if wanted) → **redeploy** (the `NEXT_PUBLIC_*` values are inlined at build time). `NEXT_PUBLIC_SITE_URL` is optional because the production domain is read from `VERCEL_PROJECT_PRODUCTION_URL`.

## Author

**Eslam Raafat**, Front-End Developer

- Portfolio: [new-portfolio-ashy-xi.vercel.app](https://new-portfolio-ashy-xi.vercel.app)
- LinkedIn: [linkedin.com/in/eslamraafat-dev](https://www.linkedin.com/in/eslamraafat-dev/)
- GitHub: [@Eslamraafat1](https://github.com/Eslamraafat1)
- Email: [eslamraafat736@gmail.com](mailto:eslamraafat736@gmail.com)

## License

[MIT](./LICENSE) © 2026 Eslam Raafat
