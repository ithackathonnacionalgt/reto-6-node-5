create index reports_category_id_idx on public.reports (category_id);
create index reports_current_status_created_at_idx
  on public.reports (current_status, created_at desc);
create index reports_created_at_idx on public.reports (created_at desc);
create index reports_location_gist_idx on public.reports using gist (location);
create index report_media_report_id_idx on public.report_media (report_id);
create index status_history_report_id_created_at_idx
  on public.status_history (report_id, created_at desc);
