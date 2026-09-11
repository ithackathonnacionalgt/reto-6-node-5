import type { SupabaseClient } from '@supabase/supabase-js'
import type { ReportStatus } from '../../../contracts/reports'
import { sendStatusUpdateEmail } from '../../notifications/server/send-status-update-email'

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
  const result = Array.isArray(data) ? data[0] ?? null : data

  try {
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('tracking_code, is_anonymous, reporter_email')
      .eq('id', reportId)
      .maybeSingle()

    if (reportError) throw new Error(reportError.message)
    if (report && !report.is_anonymous && report.reporter_email) {
      await sendStatusUpdateEmail({
        recipient: report.reporter_email,
        trackingCode: report.tracking_code,
        status,
        message,
      })
    }
  } catch (notificationError) {
    console.error('El estado se actualizó, pero no fue posible enviar la notificación por correo.', notificationError)
  }

  return result
}
