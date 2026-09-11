import type { APIContext } from 'astro'
import { completeMediaUpload } from '../../../../../features/reports/server/complete-media-upload'
import { createPrivilegedSupabaseClient } from '../../../../../lib/supabase/privileged'

export const prerender = false

export async function POST({ params }: APIContext): Promise<Response> {
  try {
    if (!params.trackingCode) throw new Error('Código de seguimiento requerido')
    const response = await completeMediaUpload(createPrivilegedSupabaseClient(), params.trackingCode)
    return Response.json(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo validar la evidencia'
    return Response.json({ error: message }, { status: 400 })
  }
}
