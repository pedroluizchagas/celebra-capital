/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string
  readonly VITE_API_URL: string
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_APP_ENVIRONMENT?: string
  readonly VITE_APP_VERSION?: string
  readonly VITE_VAPID_PUBLIC_KEY?: string
  // Adicione outras variáveis de ambiente conforme necessário
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
