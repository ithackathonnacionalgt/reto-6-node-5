import type { APIContext } from 'astro'
import { getMunicipalitiesByDepartment } from '../../features/locations/server/get-municipalities'
import { createSupabaseServerClient } from '../../lib/supabase/server'

export const prerender = false

export async function GET(context: APIContext): Promise<Response> {
  const department = context.url.searchParams.get('department')?.trim()

  if (!department) {
    return Response.json({ error: 'El departamento es obligatorio' }, { status: 400 })
  }

  try {
    const municipalities = await getMunicipalitiesByDepartment(
      createSupabaseServerClient(context),
      department,
    )

    if (!municipalities) {
      return Response.json({ error: 'Departamento no encontrado' }, { status: 404 })
    }

    return Response.json(municipalities)
  } catch (error) {
    console.error('No se pudieron consultar las ubicaciones', error)
    return Response.json({ error: 'No se pudieron consultar las ubicaciones' }, { status: 500 })
  }
}
