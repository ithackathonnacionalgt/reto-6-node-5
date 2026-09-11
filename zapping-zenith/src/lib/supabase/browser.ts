import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let browserClient: SupabaseClient | null = null

export function getSupabaseBrowserClient(): SupabaseClient {
  const url = import.meta.env.PUBLIC_SUPABASE_URL
  const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Falta configurar la conexión pública de Supabase')
  }

  browserClient ??= createBrowserClient(url, anonKey)
  return browserClient
}
