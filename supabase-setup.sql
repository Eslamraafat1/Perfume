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
