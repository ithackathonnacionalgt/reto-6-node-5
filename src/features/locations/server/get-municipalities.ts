import type { SupabaseClient } from '@supabase/supabase-js'

interface DepartmentRow {
  code: string
}

interface MunicipalityRow {
  name: string
}

export async function getMunicipalitiesByDepartment(
  supabase: SupabaseClient,
  departmentName: string,
): Promise<string[] | null> {
  const { data: department, error: departmentError } = await supabase
    .from('departments')
    .select('code')
    .eq('name', departmentName)
    .maybeSingle<DepartmentRow>()

  if (departmentError) {
    throw new Error('No se pudo consultar el departamento')
  }

  if (!department) return null

  const { data: municipalities, error: municipalitiesError } = await supabase
    .from('municipalities')
    .select('name')
    .eq('department_code', department.code)
    .order('name')
    .returns<MunicipalityRow[]>()

  if (municipalitiesError) {
    throw new Error('No se pudieron consultar los municipios')
  }

  const collator = new Intl.Collator('es-GT', { sensitivity: 'base' })
  return (municipalities ?? []).map(({ name }) => name).sort(collator.compare)
}
