import type { APIContext } from 'astro'
import { REPORT_STATUSES, type ReportStatus } from '../../../../../contracts/reports'
import { updateReportStatus } from '../../../../../features/reports/server/update-report-status'
import { forbiddenResponse, getAuthContext, unauthorizedResponse } from '../../../../../lib/auth/admin-guard'

export const prerender = false

interface StatusBody {
  status?: unknown
  message?: unknown
}

export async function PATCH(context: APIContext): Promise<Response> {
  try {
    const auth = await getAuthContext(context)
    if (!auth) return unauthorizedResponse()
    if (auth.role !== 'ADMIN') return forbiddenResponse()
    if (!context.params.id) return Response.json({ error: 'Identificador requerido' }, { status: 400 })

    const body = (await context.request.json()) as StatusBody
    if (typeof body.status !== 'string' || !REPORT_STATUSES.includes(body.status as ReportStatus)) {
      return Response.json({ error: 'Estado inválido' }, { status: 400 })
    }
    if (typeof body.message !== 'string' || !body.message.trim()) {
      return Response.json({ error: 'El mensaje es requerido' }, { status: 400 })
    }

    const result = await updateReportStatus(auth.supabase, context.params.id, body.status as ReportStatus, body.message)
    return Response.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo actualizar el estado'
    return Response.json({ error: message }, { status: 500 })
  }
}
