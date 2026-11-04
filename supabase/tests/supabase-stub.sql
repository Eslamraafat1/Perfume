-- Minimal stand-in for the parts of a Supabase project that supabase-setup.sql
-- relies on (roles, auth.users, auth.uid(), storage tables, realtime publication),
-- so the RLS policies can be tested on a plain PostgreSQL 15+ server in CI.
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create schema auth; create schema storage;
grant usage on schema public, auth, storage to anon, authenticated;
create table auth.users (id uuid primary key default gen_random_uuid(), email text);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant execute on function auth.uid() to anon, authenticated;
create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
alter table storage.objects enable row level security;
grant select, insert, update, delete on storage.objects to anon, authenticated;
create publication supabase_realtime;
alter default privileges in schema public grant all on tables to anon, authenticated;
insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000000a','admin@example.com'),('00000000-0000-0000-0000-00000000000b','user@example.com');
