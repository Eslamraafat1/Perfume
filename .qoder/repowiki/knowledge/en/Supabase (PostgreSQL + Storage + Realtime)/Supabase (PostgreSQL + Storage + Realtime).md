---
kind: external_dependency
name: Supabase (PostgreSQL + Storage + Realtime)
slug: supabase
category: external_dependency
category_hints:
    - vendor_identity
    - client_constraint
scope:
    - '**'
---

### Identity & role
- Backend-as-a-service providing PostgreSQL database, object storage, and realtime subscriptions for the Nubia storefront.

### Integration points
- Client created in `lib/supabase.ts` from `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`; falls back to a public demo project when env vars are missing/placeholder.
- Database schema defined in `supabase-setup.sql`: tables `products`, `site_content`, `hero_slides`, all with permissive RLS policies (public select/insert/update/delete).
- Image upload goes through Next.js Route Handler `app/api/upload/route.ts` → Supabase Storage bucket `product-images` (must be created Public in the dashboard).
- Realtime: `ProductContext` subscribes to `postgres_changes` on `public.products` to refresh the storefront instantly after admin edits.
- Remote image allowlist in `next.config.ts` includes `*.supabase.co`.

### Stable usage model
- All data mutations go through the Supabase JS client; there is no custom API layer between contexts and the database.
- Storage bucket name is fixed as `product-images` (exported as `STORAGE_BUCKET`).
- Verify exact method/params against the official Supabase docs.