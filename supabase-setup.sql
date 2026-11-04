-- =====================================================================
-- Nubia — Supabase setup (schema + least-privilege Row Level Security)
--
-- Run the whole file in: Supabase Dashboard → SQL Editor → New query → Run.
-- It is idempotent: safe to re-run on a new or an existing project.
--
-- Security model
--   * Visitors (anon key) can only READ the catalogue and site content.
--   * Only admins can INSERT / UPDATE / DELETE, and only admins can write to
--     the `product-images` Storage bucket.
--   * An admin is an authenticated Supabase Auth user listed in public.admin_users.
--     Add the first admin after creating the user (Authentication → Users):
--
--       insert into public.admin_users (user_id, email)
--       select id, email from auth.users where email = 'you@example.com'
--       on conflict (user_id) do nothing;
--
--   * The service_role key is never needed by the app.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Admins
-- ---------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Nobody can list or modify admins through the API; manage them in the SQL editor.
revoke all on table public.admin_users from anon, authenticated;

-- is_admin(): true when the current JWT belongs to a user in admin_users.
-- SECURITY DEFINER so it can read admin_users without exposing the table.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users a where a.user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;


-- ---------------------------------------------------------------------
-- 2. products
-- ---------------------------------------------------------------------
create table if not exists public.products (
  id          uuid        default gen_random_uuid() primary key,
  name        text        not null,
  description text        not null,
  price       numeric     not null check (price > 0),
  image_url   text        not null,
  badge       text,
  created_at  timestamptz default now()
);

alter table public.products add column if not exists category         text default 'Oud & Woody';
alter table public.products add column if not exists top_notes        text default 'Bergamot, Mandarin';
alter table public.products add column if not exists heart_notes      text default 'Lavender, Jasmine';
alter table public.products add column if not exists base_notes       text default 'Oud, Amber, Patchouli';
alter table public.products add column if not exists longevity        text default 'Very Long Lasting (8h-12h)';
alter table public.products add column if not exists sillage          text default 'Strong';
alter table public.products add column if not exists sizes            jsonb;
alter table public.products add column if not exists images           text[];
alter table public.products add column if not exists video_url        text;
alter table public.products add column if not exists badge            text;
alter table public.products add column if not exists gender           text default 'unisex';
alter table public.products add column if not exists fragrance_family text;

alter table public.products drop constraint if exists products_gender_check;
alter table public.products add constraint products_gender_check
  check (gender in ('men', 'women', 'unisex', 'oriental'));

alter table public.products enable row level security;

-- Remove the old permissive policies (anyone could insert / delete).
drop policy if exists "Allow public select" on public.products;
drop policy if exists "Allow public insert" on public.products;
drop policy if exists "Allow public delete" on public.products;
drop policy if exists "Allow public update" on public.products;

drop policy if exists "products: public read"   on public.products;
drop policy if exists "products: admin insert"  on public.products;
drop policy if exists "products: admin update"  on public.products;
drop policy if exists "products: admin delete"  on public.products;

create policy "products: public read"
  on public.products for select
  to anon, authenticated
  using (true);

create policy "products: admin insert"
  on public.products for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "products: admin update"
  on public.products for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "products: admin delete"
  on public.products for delete
  to authenticated
  using ((select public.is_admin()));


-- ---------------------------------------------------------------------
-- 3. site_content (editable copy and images, key/value)
-- ---------------------------------------------------------------------
create table if not exists public.site_content (
  key   text primary key,
  value text not null
);

alter table public.site_content enable row level security;

drop policy if exists "Allow public select on site_content" on public.site_content;
drop policy if exists "Allow public insert on site_content" on public.site_content;
drop policy if exists "Allow public update on site_content" on public.site_content;

drop policy if exists "site_content: public read"  on public.site_content;
drop policy if exists "site_content: admin insert" on public.site_content;
drop policy if exists "site_content: admin update" on public.site_content;
drop policy if exists "site_content: admin delete" on public.site_content;

create policy "site_content: public read"
  on public.site_content for select
  to anon, authenticated
  using (true);

create policy "site_content: admin insert"
  on public.site_content for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "site_content: admin update"
  on public.site_content for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "site_content: admin delete"
  on public.site_content for delete
  to authenticated
  using ((select public.is_admin()));


-- ---------------------------------------------------------------------
-- 4. hero_slides (homepage carousel)
-- ---------------------------------------------------------------------
create table if not exists public.hero_slides (
  id          uuid        default gen_random_uuid() primary key,
  sort_order  integer     not null default 0,
  img         text        not null,
  accent      text        not null default 'rgba(165,110,60,0.6)',
  gradient    text        not null default 'linear-gradient(135deg,#0a0519 0%,#1a0a2e 45%,#0f0820 100%)',
  glow        text        not null default 'rgba(200,140,80,0.35)',
  href        text        not null default '/products',
  active      boolean     not null default true,
  tag_en      text        not null default '',
  tag_ar      text        not null default '',
  eyebrow_en  text        not null default '',
  eyebrow_ar  text        not null default '',
  title1_en   text        not null default '',
  title1_ar   text        not null default '',
  title2_en   text        not null default '',
  title2_ar   text        not null default '',
  title3_en   text        not null default '',
  title3_ar   text        not null default '',
  subtitle_en text        not null default '',
  subtitle_ar text        not null default '',
  btn_text_en text        not null default 'Explore Collection',
  btn_text_ar text        not null default 'استكشف الكولكشن',
  created_at  timestamptz default now()
);

alter table public.hero_slides enable row level security;

drop policy if exists "Allow public select on hero_slides" on public.hero_slides;
drop policy if exists "Allow public insert on hero_slides" on public.hero_slides;
drop policy if exists "Allow public update on hero_slides" on public.hero_slides;
drop policy if exists "Allow public delete on hero_slides" on public.hero_slides;

drop policy if exists "hero_slides: public read"  on public.hero_slides;
drop policy if exists "hero_slides: admin insert" on public.hero_slides;
drop policy if exists "hero_slides: admin update" on public.hero_slides;
drop policy if exists "hero_slides: admin delete" on public.hero_slides;

create policy "hero_slides: public read"
  on public.hero_slides for select
  to anon, authenticated
  using (true);

create policy "hero_slides: admin insert"
  on public.hero_slides for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "hero_slides: admin update"
  on public.hero_slides for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "hero_slides: admin delete"
  on public.hero_slides for delete
  to authenticated
  using ((select public.is_admin()));


-- ---------------------------------------------------------------------
-- 5. Table privileges (RLS still applies on top of these grants)
--    The old script granted INSERT/UPDATE/DELETE on hero_slides to anon.
-- ---------------------------------------------------------------------
revoke insert, update, delete, truncate on table public.products, public.site_content, public.hero_slides from anon;
grant select on table public.products, public.site_content, public.hero_slides to anon;
grant select, insert, update, delete on table public.products, public.site_content, public.hero_slides to authenticated;


-- ---------------------------------------------------------------------
-- 6. Storage: public bucket for product / site images
--    Public read (images are shown on the storefront); admin-only write.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images', 'product-images', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "product-images: public read"  on storage.objects;
drop policy if exists "product-images: admin insert" on storage.objects;
drop policy if exists "product-images: admin update" on storage.objects;
drop policy if exists "product-images: admin delete" on storage.objects;

create policy "product-images: public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

create policy "product-images: admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and (select public.is_admin()));

create policy "product-images: admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()))
  with check (bucket_id = 'product-images' and (select public.is_admin()));

create policy "product-images: admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));


-- ---------------------------------------------------------------------
-- 7. Realtime (optional): live catalogue updates on the storefront
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'products'
  ) then
    alter publication supabase_realtime add table public.products;
  end if;
exception when undefined_object then
  null; -- publication not present (e.g. local Postgres without Supabase Realtime)
end $$;

-- Note: there is no orders table. Checkout hands the order to WhatsApp and keeps
-- a copy in the customer's browser (localStorage), so no customer data is stored here.
