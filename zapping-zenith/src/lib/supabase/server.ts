import { createServerClient } from '@supabase/ssr'
import type { APIContext } from 'astro'
import type { SupabaseClient } from '@supabase/supabase-js'

export function createSupabaseServerClient(
  context: Pick<APIContext, 'cookies'>,
): SupabaseClient {
  const url = import.meta.env.PUBLIC_SUPABASE_URL
  const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Supabase public environment variables are missing')
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return context.cookies.getAll().map(({ name, value }) => ({ name, value }))
      },
      setAll(cookies) {
        cookies.forEach(({ name, value, options }) => {
          context.cookies.set(name, value, options)
        })
      },
    },
  })
}
