import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

export function createPrivilegedSupabaseClient(): SupabaseClient {
  const url = import.meta.env.PUBLIC_SUPABASE_URL
  const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase server environment variables are missing')
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export function getStorageBucket(): string {
  return import.meta.env.SUPABASE_STORAGE_BUCKET || 'report-evidence'
}
