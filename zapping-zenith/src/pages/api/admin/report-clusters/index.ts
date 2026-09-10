import type { APIContext } from 'astro'
import { getReportClusters } from '../../../features/reports/server/get-report-clusters'
import { forbiddenResponse, getAuthContext, unauthorizedResponse } from '../../../lib/auth/admin-guard'

export const prerender = false

export async function GET(context: APIContext): Promise<Response> {
  try {
    const auth = await getAuthContext(context)
    if (!auth) return unauthorizedResponse()
    if (auth.role !== 'ADMIN' && auth.role !== 'VIEWER') return forbiddenResponse()
    return Response.json(await getReportClusters(auth.supabase, context.url.searchParams.get('categoryId')))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudieron obtener las agrupaciones'
    return Response.json({ error: message }, { status: 500 })
  }
}
