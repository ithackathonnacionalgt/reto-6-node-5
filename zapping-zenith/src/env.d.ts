/// <reference types="astro/client" />

declare module 'cloudflare:workers' {
  export const env: { MAKE_WEBHOOK_URL: string }
}
