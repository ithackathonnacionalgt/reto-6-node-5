import { env } from 'cloudflare:workers'

type ServerEnvironmentName =
  | 'PUBLIC_SUPABASE_URL'
  | 'PUBLIC_SUPABASE_ANON_KEY'
  | 'SUPABASE_SERVICE_ROLE_KEY'
  | 'SUPABASE_STORAGE_BUCKET'
  | 'RESEND_API_KEY'
  | 'RESEND_FROM_EMAIL'
  | 'APP_URL'

export function getServerEnvironment(name: ServerEnvironmentName): string | undefined {
  const runtimeEnvironment = env as unknown as Record<string, string | undefined>
  const buildEnvironment = import.meta.env as Record<string, string | undefined>
  return runtimeEnvironment[name] ?? buildEnvironment[name]
}
