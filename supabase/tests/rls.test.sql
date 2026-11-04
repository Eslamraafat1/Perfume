-- Behavioural test for the RLS policies in supabase-setup.sql.
-- Run after supabase-stub.sql + supabase-setup.sql (see .github/workflows/e2e.yml).
-- Any failed expectation raises an exception (psql -v ON_ERROR_STOP=1 exits non-zero).
\set ON_ERROR_STOP 1

insert into public.admin_users (user_id, email)
select id, email from auth.users where email = 'admin@example.com'
on conflict (user_id) do nothing;

insert into public.products (id, name, description, price, image_url)
values ('11111111-1111-4111-8111-111111111111', 'Seed', 'd', 100, '/perfume_1.png')
on conflict (id) do nothing;
insert into public.site_content values ('k', 'v') on conflict (key) do nothing;
insert into public.hero_slides (id, img) values ('22222222-2222-4222-8222-222222222222', '/x.png')
on conflict (id) do nothing;

-- expect(label, sql, should_succeed, min_rows): run sql, check allowed/denied and rows touched.
create or replace function pg_temp.expect(label text, q text, allowed boolean, min_rows int default 0)
returns void language plpgsql as $$
declare n int;
begin
  begin
    execute q;
    get diagnostics n = row_count;
  exception when others then
    if allowed then raise exception 'FAIL [%]: expected success, got: %', label, sqlerrm; end if;
    raise notice 'ok   [%] denied (%)', label, sqlerrm;
    return;
  end;
  if not allowed and n > 0 then raise exception 'FAIL [%]: expected denial, % row(s) affected', label, n; end if;
  if allowed and n < min_rows then raise exception 'FAIL [%]: expected >= % row(s), got %', label, min_rows, n; end if;
  raise notice 'ok   [%] % (% rows)', label, case when allowed then 'allowed' else 'no rows affected' end, n;
end $$;

-- ── anon (public visitors) ────────────────────────────────────────────
set role anon;
select set_config('request.jwt.claim.sub', '', false);
select pg_temp.expect('anon: read products',        'select * from public.products', true, 1);
select pg_temp.expect('anon: read site_content',    'select * from public.site_content', true, 1);
select pg_temp.expect('anon: read hero_slides',     'select * from public.hero_slides', true, 1);
select pg_temp.expect('anon: insert product',       $q$insert into public.products (name, description, price, image_url) values ('x', 'x', 1, 'x')$q$, false);
select pg_temp.expect('anon: update products',      'update public.products set price = 1', false);
select pg_temp.expect('anon: delete products',      'delete from public.products', false);
select pg_temp.expect('anon: write site_content',   $q$insert into public.site_content values ('k', 'hacked') on conflict (key) do update set value = 'hacked'$q$, false);
select pg_temp.expect('anon: delete hero_slides',   'delete from public.hero_slides', false);
select pg_temp.expect('anon: read admin_users',     'select * from public.admin_users', false);
select pg_temp.expect('anon: upload to storage',    $q$insert into storage.objects (bucket_id, name) values ('product-images', 'evil.png')$q$, false);
do $$ begin if public.is_admin() then raise exception 'FAIL: anon is_admin() returned true'; end if; end $$;
reset role;

-- ── signed-in user who is NOT an admin ───────────────────────────────
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000b', false);
select pg_temp.expect('user: insert product',       $q$insert into public.products (name, description, price, image_url) values ('x', 'x', 1, 'x')$q$, false);
select pg_temp.expect('user: update products',      'update public.products set price = 1', false);
select pg_temp.expect('user: delete products',      'delete from public.products', false);
select pg_temp.expect('user: write site_content',   $q$update public.site_content set value = 'hacked'$q$, false);
select pg_temp.expect('user: upload to storage',    $q$insert into storage.objects (bucket_id, name) values ('product-images', 'evil.png')$q$, false);
select pg_temp.expect('user: make self admin',      $q$insert into public.admin_users (user_id) values ('00000000-0000-0000-0000-00000000000b')$q$, false);
do $$ begin if public.is_admin() then raise exception 'FAIL: non-admin is_admin() returned true'; end if; end $$;
reset role;

-- ── admin ────────────────────────────────────────────────────────────
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', false);
do $$ begin if not public.is_admin() then raise exception 'FAIL: admin is_admin() returned false'; end if; end $$;
select pg_temp.expect('admin: insert product',      $q$insert into public.products (name, description, price, image_url) values ('Tmp', 'x', 1, 'x')$q$, true, 1);
select pg_temp.expect('admin: update product',      $q$update public.products set price = 2 where name = 'Seed'$q$, true, 1);
select pg_temp.expect('admin: delete product',      $q$delete from public.products where name = 'Tmp'$q$, true, 1);
select pg_temp.expect('admin: upsert site_content', $q$insert into public.site_content values ('k', 'new') on conflict (key) do update set value = 'new'$q$, true, 1);
select pg_temp.expect('admin: update hero_slides',  'update public.hero_slides set active = false', true, 1);
select pg_temp.expect('admin: upload to storage',   $q$insert into storage.objects (bucket_id, name) values ('product-images', 'ok.png')$q$, true, 1);
reset role;

\echo 'All RLS expectations passed.'
