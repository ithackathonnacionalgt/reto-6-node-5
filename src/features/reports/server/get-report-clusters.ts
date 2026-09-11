import type { SupabaseClient } from '@supabase/supabase-js'

export async function getReportClusters(
  supabase: SupabaseClient,
  categoryId: string | null,
): Promise<{ radiusMeters: number; clusters: unknown[] }> {
  const { data, error } = await supabase.rpc('get_report_clusters', {
    p_category_id: categoryId,
  })
  if (error) throw new Error(error.message)
  return { radiusMeters: 1000, clusters: data ?? [] }
}
