create extension if not exists pgcrypto;
create extension if not exists postgis;

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
  select 'ECO-' || upper(encode(gen_random_bytes(10), 'hex'));
$$;
