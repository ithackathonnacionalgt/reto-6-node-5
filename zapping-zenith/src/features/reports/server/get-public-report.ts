import type { SupabaseClient } from '@supabase/supabase-js'
import type { PublicReportResponse } from '../../../contracts/reports'

export async function getPublicReport(
  supabase: SupabaseClient,
  trackingCode: string,
): Promise<PublicReportResponse | null> {
  const { data, error } = await supabase.rpc('get_public_report_by_tracking_code', {
    p_tracking_code: trackingCode,
  })

  if (error) throw new Error(error.message)
  return (data as PublicReportResponse | null) ?? null
}
