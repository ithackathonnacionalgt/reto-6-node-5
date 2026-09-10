import type { SupabaseClient } from '@supabase/supabase-js'
import type { ReportStatus } from '../../../contracts/reports'

export async function updateReportStatus(
  supabase: SupabaseClient,
  reportId: string,
  status: ReportStatus,
  message: string,
): Promise<unknown> {
  const { data, error } = await supabase.rpc('admin_update_report_status', {
    p_report_id: reportId,
    p_next_status: status,
    p_message: message,
  })
  if (error) throw new Error(error.message)
  return Array.isArray(data) ? data[0] ?? null : data
}
