/**
 * Monitoramento de erros com Sentry
 *
 * Antes de usar este módulo, instale os pacotes necessários:
 * npm install @sentry/react @sentry/tracing
 */

import * as Sentry from '@sentry/react'
import { BrowserTracing, Replay } from '@sentry/browser'

const initializeSentry = (): void => {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    console.warn(
      'Sentry DSN não configurado. O monitoramento de erros está desativado.'
    )
    return
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [new BrowserTracing(), new Replay()],
    // Performance Monitoring
    tracesSampleRate:
      import.meta.env.VITE_APP_ENVIRONMENT === 'production' ? 0.1 : 1.0,
    // Session Replay para capturar mais insights
    replaysSessionSampleRate:
      import.meta.env.VITE_APP_ENVIRONMENT === 'production' ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.VITE_APP_ENVIRONMENT,
    release: import.meta.env.VITE_APP_VERSION,
    beforeSend(event) {
      // Não enviar eventos em desenvolvimento local
      if (import.meta.env.VITE_APP_ENVIRONMENT === 'development') {
        return null
      }
      return event
    },
  })
}

export default initializeSentry
