import type { APIContext } from 'astro'
import { getAdminReport } from '../../../../features/reports/server/get-admin-report'
import { forbiddenResponse, getAuthContext, unauthorizedResponse } from '../../../../lib/auth/admin-guard'
import { createPrivilegedSupabaseClient } from '../../../../lib/supabase/privileged'

export const prerender = false

export async function GET(context: APIContext): Promise<Response> {
  try {
    const auth = await getAuthContext(context)
    if (!auth) return unauthorizedResponse()
    if (auth.role !== 'ADMIN' && auth.role !== 'VIEWER') return forbiddenResponse()
    if (!context.params.id) return Response.json({ error: 'Identificador requerido' }, { status: 400 })
    const report = await getAdminReport(auth.supabase, createPrivilegedSupabaseClient(), context.params.id)
    if (!report) return Response.json({ error: 'Denuncia no encontrada' }, { status: 404 })
    return Response.json(report)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo consultar la denuncia'
    return Response.json({ error: message }, { status: 500 })
  }
}
