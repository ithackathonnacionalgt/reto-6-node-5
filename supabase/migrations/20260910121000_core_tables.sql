create table public.categories (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text unique not null,
  name text unique not null,
  description text,
  icon text,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default extensions.gen_random_uuid(),
  tracking_code text unique not null default public.generate_tracking_code(),
  is_anonymous boolean not null default false,
  reporter_name text,
  reporter_email text,
  reported_company text,
  category_id uuid not null references public.categories(id),
  description text not null,
  department text not null,
  municipality text not null,
  location_reference text not null,
  latitude double precision not null,
  longitude double precision not null,
  location extensions.geography(Point, 4326) generated always as (
    extensions.st_setsrid(extensions.st_makepoint(longitude, latitude), 4326)::extensions.geography
  ) stored,
  current_status public.report_status not null default 'RECEIVED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reports_identified_name_check check (
    is_anonymous or reporter_name is not null
  ),
  constraint reports_latitude_check check (latitude between -90 and 90),
  constraint reports_longitude_check check (longitude between -180 and 180)
);
