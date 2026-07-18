---
kind: business_term
name: Business Glossary
category: business_term
scope:
    - '**'
---

### Nubia
- Definition：The luxury perfume brand name used throughout the application (metadata, hero copy, translations, footer). The site title is "Nubia — Fine Fragrances" and all marketing copy is written under this brand.

### Fragrance Finder
- Definition：Internal feature/page (`/fragrance-finder`) that lets users search products by olfactory note keywords (e.g., Rose, Oud, Vanilla) and returns matching fragrances. Implemented as a widget mounted in the root layout.
- Aliases：finder

### Scent Profile
- Definition：On the product detail page, a visual bar chart showing three attributes — Longevity, Sillage, and Intensity — rendered per product. These map to the `longevity` and `sillage` fields on the `products` table.

### Hero Slides
- Definition：CMS-managed carousel slides stored in the `hero_slides` table, each carrying bilingual text fields (`*_en` / `*_ar`) for eyebrow, titles, subtitle, button text, plus styling fields (accent, gradient, glow). Managed via `HeroSlidesContext`.
- Aliases：slides

### Site Content
- Definition：Key-value content store (`site_content` table) used to drive translatable strings across the app. Each row has a `key` and `value`; the frontend merges fetched rows over `defaultTranslations.ts` so admins can override any string without redeploying.
- Aliases：site_content
