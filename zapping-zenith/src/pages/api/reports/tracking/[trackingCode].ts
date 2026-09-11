import type { APIContext } from 'astro'
import { getPublicReport } from '../../../../features/reports/server/get-public-report'
import { createPrivilegedSupabaseClient } from '../../../../lib/supabase/privileged'

export const prerender = false

export async function GET({ params }: APIContext): Promise<Response> {
  try {
    if (!params.trackingCode) throw new Error('Código de seguimiento requerido')
    const report = await getPublicReport(createPrivilegedSupabaseClient(), params.trackingCode)
    if (!report) return Response.json({ error: 'Denuncia no encontrada' }, { status: 404 })
    return Response.json(report)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo consultar la denuncia'
    return Response.json({ error: message }, { status: 500 })
  }
}
