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

The front end aims for a premium feel (GSAP animations, custom cursor, WebGL "splash" cursor, scratch-to-reveal welcome offer) while keeping the fundamentals right: server-rendered metadata, structured data, a sitemap that includes every product, accessible forms and an automated E2E suite.

## Key Features

**Storefront**
- Product catalogue with **search** (name / notes), **collection** and **gender filters**, **price / newest sorting**, grid / list view and pagination.
- Product detail pages with size variants (price per size), olfactory pyramid (top / heart / base notes), longevity and sillage, image gallery and related products.
- **Cart** persisted in `localStorage`, quantity controls, free-shipping threshold, promo code.
- **Checkout** with form validation and Cash on Delivery / InstaPay deposit options. The order is summarised and handed off to WhatsApp, then shown on an order-confirmation page.
- **Fragrance Finder** quiz (page + floating widget) that scores products against the visitor's answers.
- **Bilingual EN / AR**: a language toggle switches all copy and sets `<html lang>` and `dir="rtl"`.

**Admin dashboard (`/dashboard`)**
- Create, edit and delete products; upload the main image and gallery images to Supabase Storage through a Next.js Route Handler.
- Edit the site copy (EN + AR) and images stored in the `site_content` table.
- Manage the hero carousel (add, edit, reorder, activate / deactivate slides) stored in `hero_slides`.
- Changes appear on the storefront instantly through a Realtime subscription on `products`.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 16.2** (App Router, Turbopack), **React 19.2** |
| Language | **TypeScript 5.9** |
| Back end | **Supabase**: PostgreSQL with Row Level Security, Storage, Realtime (`@supabase/supabase-js` 2.108) |
| API | Next.js Route Handler (`app/api/upload`) for image uploads |
| Styling & motion | Hand-written CSS design tokens (`app/globals.css`), `next/font`, **GSAP 3.15** (ScrollTrigger), WebGL fluid cursor |
| Quality | **Playwright 1.63** E2E (desktop + mobile Chrome), ESLint 9 (`eslint-config-next`), `tsc --noEmit` |
| CI / Hosting | GitHub Actions, **Vercel** |

## Architecture

```
Browser (client components)
 ├─ ProductContext ───── supabase.from('products')     ─┐
 │    └─ Realtime channel on public.products             │
 ├─ SiteContentContext ─ supabase.from('site_content')   ├─► Supabase Postgres (RLS)
 ├─ HeroSlidesContext ── supabase.from('hero_slides')   ─┘
 ├─ CartContext ──────── localStorage
 └─ LanguageContext ──── <html lang dir>

Next.js server
 ├─ app/layout.tsx               global metadata, OnlineStore + WebSite JSON-LD
 ├─ app/*/layout.tsx             per-route title / description / canonical / noindex
 ├─ app/product/[id]/layout.tsx  generateMetadata + Product & BreadcrumbList JSON-LD (fetched server-side)
 ├─ app/sitemap.ts               static routes + every product (revalidated hourly)
 ├─ app/robots.ts
 └─ app/api/upload/route.ts      multipart upload → Storage bucket `product-images`
```

### Data model ([`supabase-setup.sql`](./supabase-setup.sql))

| Table | Purpose | Key columns |
|---|---|---|
| `products` | Catalogue | `id uuid` PK (`gen_random_uuid()`), `name`, `description`, `price numeric CHECK (price > 0)`, `image_url`, `images text[]`, `video_url`, `badge`, `category`, `gender` (CHECK: `men` / `women` / `unisex` / `oriental`), `fragrance_family`, `top_notes`, `heart_notes`, `base_notes`, `longevity`, `sillage`, `sizes jsonb` (`[{ size, price }]`), `created_at timestamptz` |
| `site_content` | Editable CMS copy and images (key/value, separate `en_*` / `ar_*` keys) | `key text` PK, `value text` |
| `hero_slides` | Homepage carousel | `id uuid` PK, `sort_order`, `active boolean`, `img`, colour / gradient fields, bilingual `*_en` / `*_ar` title, subtitle and button text |

The SQL is written as an idempotent migration (`create table if not exists`, `add column if not exists`, constraint drop + re-add), so it can be re-run safely on an existing project. Images live in a public Storage bucket named `product-images`.

### Authentication & Row Level Security

RLS is **enabled on every table**. Because this is a single-owner demo there is **no user authentication yet**: the policies let the `anon` role read everything and write too (`products`: select / insert / delete; `site_content`: select / insert / update; `hero_slides`: full CRUD). The `/dashboard` route is only hidden from search engines (`noindex` and `robots.txt`).

> **Known gap and next step:** before this could run a real shop, the admin needs Supabase Auth; write policies should be limited to an authenticated admin (for example `using (auth.jwt() ->> 'role' = 'admin')`); `/dashboard` and `/api/upload` should be protected on the server; and the Storage bucket needs its own policies. After that, the anon key in the browser could only read.

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

The Playwright suite in [`e2e/`](./e2e) has **31 tests**, each run on **desktop Chrome and mobile Chrome (Pixel 7)**, for **62 runs** in total:

- **User flows (10):** catalogue renders, search, gender filter, price sorting; product page → choose a size → add to cart → cart badge → subtotal / shipping / quantity / remove; free-shipping threshold; checkout survives a page reload; checkout form validation (required fields, invalid email); a valid cash-on-delivery order reaches the confirmation page and clears the cart; switching to Arabic sets `lang="ar"` and `dir="rtl"`.
- **SEO (12):** absolute https self-referencing canonicals, og:image and descriptions on 7 pages; unique titles; `noindex` on private pages; JSON-LD parses; robots.txt → sitemap; sitemap URLs.
- **Smoke (9):** 8 key pages return 200 with a title; unknown routes return the branded 404.

Supabase is **mocked at the network layer** (`e2e/fixtures/supabase-mock.js`), so the tests are deterministic and need no credentials. GitHub Actions runs **lint → type-check → build → start the production server → E2E** on every push and pull request.

```bash
npm run lint && npm run typecheck && npm run build
npm start                                                     # terminal 1
cd e2e && npm ci && BASE_URL=http://localhost:3000 npm test   # terminal 2
```

## Project Structure

```
app/
├─ page.tsx, products/, product/[id]/, category/, fragrance-finder/,
│  cart/, checkout/, order-confirmation/, about/, blog/, contact/
├─ dashboard/            admin panel (products, site copy, hero carousel)
├─ api/upload/route.ts   image upload → Supabase Storage
├─ context/              Product, Cart, SiteContent, HeroSlides and Language providers
├─ layout.tsx            fonts, global metadata, JSON-LD, providers
└─ sitemap.ts, robots.ts, not-found.tsx
components/              Navbar, Footer, HeroCarousel, FragranceFinderWidget, loaders, cursors…
lib/
├─ supabase.ts           Supabase client
├─ site.ts               site URL resolution + JSON-LD helper
└─ seo.ts                per-route metadata helper
e2e/                     Playwright tests + Supabase mock
docs/                    screenshots, Lighthouse reports
supabase-setup.sql       schema, constraints and RLS policies
```

## Getting Started

**Prerequisites:** Node.js 20.9 or newer and a free [Supabase](https://supabase.com) project.

1. **Clone and install**
   ```bash
   git clone https://github.com/Eslamraafat1/Perfume.git
   cd Perfume
   npm ci
   ```
2. **Create the database.** In the Supabase dashboard open **SQL Editor** and run [`supabase-setup.sql`](./supabase-setup.sql). It creates `products`, `site_content` and `hero_slides` with their constraints and RLS policies.
3. **Create the storage bucket.** **Storage → New bucket**, name it `product-images` and make it **Public**.
4. **Enable Realtime** (optional, for live catalogue updates): **Database → Replication**, enable it for the `products` table.
5. **Configure environment variables.** Copy `.env.example` to `.env.local` and fill in the values from **Project Settings → API**:

   | Variable | Required | Description |
   |---|---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | yes | Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | `anon` / publishable key (never the `service_role` key) |
   | `NEXT_PUBLIC_SITE_URL` | no | Canonical site URL; defaults to the Vercel production URL |

6. **Run**
   ```bash
   npm run dev        # http://localhost:3000, admin at /dashboard
   ```

| Script | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type-check |

## Deployment

Deployed on **Vercel**. Import the repository, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` under **Settings → Environment Variables**, and deploy. `NEXT_PUBLIC_SITE_URL` is optional because the production domain is read from `VERCEL_PROJECT_PRODUCTION_URL`.

## Author

**Eslam Raafat**, Front-End Developer

- Portfolio: [new-portfolio-ashy-xi.vercel.app](https://new-portfolio-ashy-xi.vercel.app)
- LinkedIn: [linkedin.com/in/eslamraafat-dev](https://www.linkedin.com/in/eslamraafat-dev/)
- GitHub: [@Eslamraafat1](https://github.com/Eslamraafat1)
- Email: [eslamraafat736@gmail.com](mailto:eslamraafat736@gmail.com)

## License

[MIT](./LICENSE) © 2026 Eslam Raafat
