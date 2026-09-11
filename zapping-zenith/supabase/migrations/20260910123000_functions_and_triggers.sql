create function public.set_report_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_report_updated_at
before update on public.reports
for each row execute function public.set_report_updated_at();

create function public.create_initial_report_status_history()
returns trigger
language plpgsql
as $$
begin
  insert into public.status_history (report_id, status, message)
  values (new.id, 'RECEIVED', 'Denuncia recibida correctamente');
  return new;
end;
$$;

create trigger create_initial_report_status_history
after insert on public.reports
for each row execute function public.create_initial_report_status_history();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create function public.has_app_role(required_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = required_role
  );
$$;

create function public.admin_update_report_status(
  p_report_id uuid,
  p_next_status public.report_status,
  p_message text
)
returns table (
  id uuid,
  tracking_code text,
  current_status public.report_status,
  updated_at timestamptz,
  history_id uuid
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  history_row public.status_history;
begin
  if not public.has_app_role('ADMIN') then
    raise exception using errcode = '42501', message = 'Admin role required';
  end if;

  update public.reports
  set current_status = p_next_status
  where reports.id = p_report_id
  returning reports.id, reports.tracking_code, reports.current_status, reports.updated_at
  into id, tracking_code, current_status, updated_at;

  if id is null then
    raise exception using errcode = 'P0002', message = 'Report not found';
  end if;

  insert into public.status_history (report_id, status, message, changed_by)
  values (p_report_id, p_next_status, nullif(trim(p_message), ''), auth.uid())
  returning * into history_row;

  history_id := history_row.id;
  return next;
end;
$$;

create function public.get_public_report_by_tracking_code(p_tracking_code text)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'trackingCode', r.tracking_code,
    'category', jsonb_build_object('name', c.name, 'icon', c.icon),
    'department', r.department,
    'municipality', r.municipality,
    'currentStatus', r.current_status,
    'createdAt', r.created_at,
    'updatedAt', r.updated_at,
    'history', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'status', h.status,
          'message', h.message,
          'createdAt', h.created_at
        ) order by h.created_at
      )
      from public.status_history h
      where h.report_id = r.id
    ), '[]'::jsonb)
  )
  from public.reports r
  join public.categories c on c.id = r.category_id
  where r.tracking_code = upper(trim(p_tracking_code));
$$;

create function public.get_report_clusters(p_category_id uuid default null)
returns table (
  category_id uuid,
  category_name text,
  cluster_id integer,
  report_count bigint,
  latitude double precision,
  longitude double precision,
  report_ids uuid[]
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with clustered as (
    select
      r.id,
      r.category_id,
      c.name as category_name,
      extensions.st_clusterdbscan(
        extensions.st_transform(r.location::extensions.geometry, 3857),
        eps => 1000,
        minpoints => 1
      ) over (partition by r.category_id) as cluster_id,
      extensions.st_transform(r.location::extensions.geometry, 3857) as projected_location
    from public.reports r
    join public.categories c on c.id = r.category_id
    where p_category_id is null or r.category_id = p_category_id
  )
  select
    category_id,
    category_name,
    cluster_id,
    count(*)::bigint,
    extensions.st_y(extensions.st_transform(extensions.st_centroid(extensions.st_collect(projected_location)), 4326)),
    extensions.st_x(extensions.st_transform(extensions.st_centroid(extensions.st_collect(projected_location)), 4326)),
    array_agg(id)
  from clustered
  group by category_id, category_name, cluster_id;
$$;

revoke all on function public.handle_new_user() from public;
revoke all on function public.has_app_role(public.app_role) from public;
revoke all on function public.admin_update_report_status(uuid, public.report_status, text) from public;
revoke all on function public.get_public_report_by_tracking_code(text) from public;
revoke all on function public.get_report_clusters(uuid) from public;

grant execute on function public.handle_new_user() to postgres, service_role, supabase_auth_admin;
grant execute on function public.has_app_role(public.app_role) to authenticated;
grant execute on function public.admin_update_report_status(uuid, public.report_status, text) to authenticated;
grant execute on function public.get_public_report_by_tracking_code(text) to anon, authenticated;
grant execute on function public.get_report_clusters(uuid) to authenticated;
