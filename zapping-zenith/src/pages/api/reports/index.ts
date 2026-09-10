import type { APIContext } from 'astro'
import { parseCreateReportInput } from '../../../contracts/reports'
import { createReport } from '../../../features/reports/server/create-report'
import { createPrivilegedSupabaseClient } from '../../../lib/supabase/privileged'

export const prerender = false

export async function POST({ request }: APIContext): Promise<Response> {
  try {
    const input = parseCreateReportInput(await request.json())
    const response = await createReport(createPrivilegedSupabaseClient(), input)
    return Response.json(response, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo crear la denuncia'
    return Response.json({ error: message }, { status: 400 })
  }
}
