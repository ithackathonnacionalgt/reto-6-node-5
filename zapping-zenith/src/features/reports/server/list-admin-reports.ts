import type { SupabaseClient } from '@supabase/supabase-js'

export async function listAdminReports(
  supabase: SupabaseClient,
  url: URL,
): Promise<{ items: unknown[]; page: number; pageSize: number; total: number }> {
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1)
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize') ?? '20') || 20))
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  let query = supabase
    .from('reports')
    .select('id, tracking_code, department, municipality, current_status, created_at, categories(id,name,icon), report_media(id)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  const status = url.searchParams.get('status')
  const categoryId = url.searchParams.get('categoryId')
  const department = url.searchParams.get('department')
  const municipality = url.searchParams.get('municipality')
  if (status) query = query.eq('current_status', status)
  if (categoryId) query = query.eq('category_id', categoryId)
  if (department) query = query.ilike('department', `%${department}%`)
  if (municipality) query = query.ilike('municipality', `%${municipality}%`)

  const { data, error, count } = await query
  if (error) throw new Error(error.message)
  return { items: data ?? [], page, pageSize, total: count ?? 0 }
}
