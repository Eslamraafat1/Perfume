# E2E Tests — Nubia Perfumes

End-to-end tests written with **Playwright**, run against the live site on desktop and mobile Chrome.

## What is tested

| Area | Checks |
|---|---|
| Pages | 7 key pages return HTTP 200 with the correct title |
| SEO | `robots.txt` and `sitemap.xml` are served |
| Errors | Unknown routes return HTTP 404 |

## Run locally

```bash
cd e2e
npm install
npx playwright install chromium
npm test                                   # against the live site
BASE_URL=http://localhost:3000 npm test    # against a local dev server
```

Tests also run automatically on every push via GitHub Actions (`.github/workflows/e2e.yml`).
