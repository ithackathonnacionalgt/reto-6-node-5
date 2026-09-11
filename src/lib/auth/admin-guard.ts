import type { APIContext } from 'astro'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '../supabase/server'

export type AppRole = 'ADMIN' | 'VIEWER'

export interface AuthContext {
  supabase: SupabaseClient
  user: User
  role: AppRole
}

export async function getAuthContext(
  context: Pick<APIContext, 'cookies'>,
): Promise<AuthContext | null> {
  const supabase = createSupabaseServerClient(context)
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) return null

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle()

  if (profileError || !profile || !isAppRole(profile.role)) return null

  return { supabase, user: data.user, role: profile.role }
}

export function isAppRole(value: unknown): value is AppRole {
  return value === 'ADMIN' || value === 'VIEWER'
}

export function unauthorizedResponse(): Response {
  return Response.json({ error: 'Autenticación requerida' }, { status: 401 })
}

export function forbiddenResponse(): Response {
  return Response.json({ error: 'Permisos insuficientes' }, { status: 403 })
}
