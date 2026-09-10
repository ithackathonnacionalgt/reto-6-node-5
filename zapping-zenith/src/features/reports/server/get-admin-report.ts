import type { SupabaseClient } from '@supabase/supabase-js'
import { getStorageBucket } from '../../../lib/supabase/privileged'

export async function getAdminReport(
  supabase: SupabaseClient,
  privileged: SupabaseClient,
  id: string,
): Promise<unknown | null> {
  const { data, error } = await supabase
    .from('reports')
    .select('*, categories(id,name,description,icon), report_media(*), status_history(*)')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null

  const media = Array.isArray(data.report_media) ? data.report_media : []
  const withUrls = await Promise.all(media.map(async (item) => {
    const { data: signed, error: signedError } = await privileged.storage
      .from(getStorageBucket())
      .createSignedUrl(item.storage_path, 300)
    if (signedError) throw new Error(signedError.message)
    return { ...item, signedUrl: signed?.signedUrl ?? null }
  }))

  return { ...data, report_media: withUrls }
}
