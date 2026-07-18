-- =============================================
-- Nubia — Supabase Setup SQL
-- Run this in: Supabase Dashboard → SQL Editor
-- =============================================

-- 1. Create products table
create table if not exists products (
  id          uuid        default gen_random_uuid() primary key,
  name        text        not null,
  description text        not null,
  price       numeric     not null check (price > 0),
  image_url   text        not null,
  badge       text,
  created_at  timestamptz default now()
);

-- 2. Enable Row Level Security (required for public access)
alter table products enable row level security;

-- 3. RLS Policies — allow public read, insert, delete
--    (for a real production app you'd add auth, but for this use-case this is correct)
create policy "Allow public select"
  on products for select
  using (true);

create policy "Allow public insert"
  on products for insert
  with check (true);

create policy "Allow public delete"
  on products for delete
  using (true);

-- =============================================
-- After running the SQL above, also do this in the Supabase UI:
-- Storage → New Bucket → Name: "product-images" → toggle Public ON
-- =============================================

-- =============================================
-- Migration: Add new columns if they don't exist yet
-- =============================================
alter table public.products add column if not exists category text default 'Oud & Woody';
alter table public.products add column if not exists top_notes text default 'Bergamot, Mandarin';
alter table public.products add column if not exists heart_notes text default 'Lavender, Jasmine';
alter table public.products add column if not exists base_notes text default 'Oud, Amber, Patchouli';
alter table public.products add column if not exists longevity text default 'Very Long Lasting (8h-12h)';
alter table public.products add column if not exists sillage text default 'Strong';
alter table public.products add column if not exists sizes jsonb;
alter table public.products add column if not exists images text[];
alter table public.products add column if not exists video_url text;
alter table public.products add column if not exists badge text;
-- =============================================
-- Gender column (men / women / unisex / oriental)
-- =============================================
-- Drop old constraint first, then re-add with oriental included
alter table public.products drop constraint if exists products_gender_check;
alter table public.products add column if not exists gender text default 'unisex';
alter table public.products add constraint products_gender_check
  check (gender in ('men', 'women', 'unisex', 'oriental'));

-- =============================================
-- Fragrance Family column
-- =============================================
alter table public.products add column if not exists fragrance_family text;

-- =============================================
-- 4. Create site_content table for dynamic text/images
-- =============================================
create table if not exists site_content (
  key   text primary key,
  value text not null
);

-- Enable RLS for site_content
alter table site_content enable row level security;

-- Allow public read
create policy "Allow public select on site_content"
  on site_content for select
  using (true);

-- Allow public insert/update (for demo/admin without auth)
create policy "Allow public insert on site_content"
  on site_content for insert
  with check (true);

create policy "Allow public update on site_content"
  on site_content for update
  using (true);

-- =============================================
-- 5. Create hero_slides table for Hero Carousel
-- =============================================
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

-- Enable RLS for hero_slides
alter table public.hero_slides enable row level security;

-- Allow public select/insert/update/delete (for admin/demo without auth)
create policy "Allow public select on hero_slides"
  on public.hero_slides for select
  using (true);

create policy "Allow public insert on hero_slides"
  on public.hero_slides for insert
  with check (true);

create policy "Allow public update on hero_slides"
  on public.hero_slides for update
  using (true);

create policy "Allow public delete on hero_slides"
  on public.hero_slides for delete
  using (true);

-- 4. Grant table privileges to anon, authenticated, and service_role
grant select, insert, update, delete on table public.hero_slides to anon, authenticated, service_role;



