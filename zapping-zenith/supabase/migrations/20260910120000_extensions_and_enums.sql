create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
create extension if not exists postgis with schema extensions;

-- Relocate an existing installation if an earlier migration put it in public.
do $$
begin
  if exists (
    select 1
    from pg_extension e
    join pg_namespace n on n.oid = e.extnamespace
    where e.extname = 'pgcrypto' and n.nspname = 'public'
  ) then
    alter extension pgcrypto set schema extensions;
  end if;

  if exists (
    select 1
    from pg_extension e
    join pg_namespace n on n.oid = e.extnamespace
    where e.extname = 'postgis' and n.nspname = 'public'
  ) then
    alter extension postgis set schema extensions;
  end if;
end;
$$;

create type public.report_status as enum (
  'RECEIVED',
  'UNDER_REVIEW',
  'CLASSIFIED',
  'INSPECTION_PENDING',
  'INSPECTION_COMPLETED',
  'REPORT_PENDING',
  'CLOSED'
);

create type public.app_role as enum ('ADMIN', 'VIEWER');

create function public.generate_tracking_code()
returns text
language sql
volatile
as $$
  select 'ECO-' || upper(encode(extensions.gen_random_bytes(10), 'hex'));
$$;
