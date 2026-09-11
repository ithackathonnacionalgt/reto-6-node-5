import type { APIContext } from 'astro'
import { forbiddenResponse, getAuthContext, unauthorizedResponse } from '../../../../lib/auth/admin-guard'
import { listAdminReports } from '../../../../features/reports/server/list-admin-reports'

export const prerender = false

export async function GET(context: APIContext): Promise<Response> {
  try {
    const auth = await getAuthContext(context)
    if (!auth) return unauthorizedResponse()
    if (auth.role !== 'ADMIN' && auth.role !== 'VIEWER') return forbiddenResponse()
    return Response.json(await listAdminReports(auth.supabase, context.url))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudieron listar las denuncias'
    return Response.json({ error: message }, { status: 500 })
  }
}
