alter table public.categories enable row level security;
alter table public.reports enable row level security;
alter table public.report_media enable row level security;
alter table public.status_history enable row level security;
alter table public.profiles enable row level security;

create policy categories_public_read
on public.categories for select
to anon, authenticated
using (true);

create policy reports_admin_viewer_read
on public.reports for select
to authenticated
using (public.has_app_role('ADMIN') or public.has_app_role('VIEWER'));

create policy report_media_admin_viewer_read
on public.report_media for select
to authenticated
using (public.has_app_role('ADMIN') or public.has_app_role('VIEWER'));

create policy status_history_admin_viewer_read
on public.status_history for select
to authenticated
using (public.has_app_role('ADMIN') or public.has_app_role('VIEWER'));

create policy profiles_self_read
on public.profiles for select
to authenticated
using (id = auth.uid());

grant select on public.categories to anon, authenticated;
grant select on public.reports to authenticated;
grant select on public.report_media to authenticated;
grant select on public.status_history to authenticated;
grant select on public.profiles to authenticated;

revoke insert, update, delete on public.categories from anon, authenticated;
revoke insert, update, delete on public.reports from anon, authenticated;
revoke insert, update, delete on public.report_media from anon, authenticated;
revoke insert, update, delete on public.status_history from anon, authenticated;
revoke insert, update, delete on public.profiles from anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'report-evidence',
  'report-evidence',
  false,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']::text[]
)
on conflict (id) do nothing;

create policy report_evidence_admin_viewer_read
on storage.objects for select
to authenticated
using (
  bucket_id = 'report-evidence'
  and (public.has_app_role('ADMIN') or public.has_app_role('VIEWER'))
);

revoke insert, update, delete on storage.objects from anon, authenticated;
