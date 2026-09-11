import { createServerClient } from '@supabase/ssr'
import type { APIContext } from 'astro'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getServerEnvironment } from '../env/server'

export function createSupabaseServerClient(
  context: Pick<APIContext, 'cookies' | 'request'>,
): SupabaseClient {
  const url = getServerEnvironment('PUBLIC_SUPABASE_URL')
  const anonKey = getServerEnvironment('PUBLIC_SUPABASE_ANON_KEY')

  if (!url || !anonKey) {
    throw new Error('Supabase public environment variables are missing')
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        const cookieHeader = context.request.headers.get('cookie')
        if (!cookieHeader) return []

        return cookieHeader.split(';').flatMap((cookie) => {
          const separator = cookie.indexOf('=')
          if (separator < 1) return []

          const name = cookie.slice(0, separator).trim()
          const encodedValue = cookie.slice(separator + 1).trim()

          try {
            return [{ name, value: decodeURIComponent(encodedValue) }]
          } catch {
            return [{ name, value: encodedValue }]
          }
        })
      },
      setAll(cookies) {
        cookies.forEach(({ name, value, options }) => {
          context.cookies.set(name, value, options)
        })
      },
    },
  })
}
