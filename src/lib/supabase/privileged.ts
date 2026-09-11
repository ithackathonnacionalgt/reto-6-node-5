import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getServerEnvironment } from '../env/server'

export function createPrivilegedSupabaseClient(): SupabaseClient {
  const url = getServerEnvironment('PUBLIC_SUPABASE_URL')
  const serviceRoleKey = getServerEnvironment('SUPABASE_SERVICE_ROLE_KEY')

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase server environment variables are missing')
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export function getStorageBucket(): string {
  return getServerEnvironment('SUPABASE_STORAGE_BUCKET') || 'report-evidence'
}
