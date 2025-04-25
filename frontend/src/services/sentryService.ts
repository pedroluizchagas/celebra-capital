import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'

/**
 * Inicializa o Sentry para monitoramento de erros
 * @param environment Ambiente atual (development, staging, production)
 */
export const initSentry = (environment: string = 'development') => {
  // Só inicializa o Sentry em staging e production
  if (environment === 'development') {
    console.log('Sentry não inicializado em ambiente de desenvolvimento')
    return
  }

  const dsn = import.meta.env.VITE_SENTRY_DSN

  if (!dsn) {
    console.warn('Variável de ambiente VITE_SENTRY_DSN não definida')
    return
  }

  Sentry.init({
    dsn,
    integrations: [
      new BrowserTracing({
        // Rastreamento de performance para navegação e requisições
        tracingOrigins: ['localhost', /^\//],
      }),
    ],
    // Configurar amostragem de performance (0.2 = 20% das transações)
    tracesSampleRate: 0.2,
    // Ambiente (staging, production)
    environment,
    // Não capturar erros em desenvolvimento
    enabled: environment !== 'development',
    // Versão da aplicação (para rastreamento de releases)
    release: import.meta.env.VITE_APP_VERSION || 'unknown',
  })
}

/**
 * Captura um erro no Sentry com informações adicionais
 * @param error Erro a ser capturado
 * @param context Contexto adicional (opcional)
 */
export const captureError = (
  error: Error | string,
  context?: Record<string, any>
) => {
  if (typeof error === 'string') {
    Sentry.captureMessage(error, {
      level: Sentry.Severity.Error,
      ...(context && { extra: context }),
    })
  } else {
    Sentry.captureException(error, {
      ...(context && { extra: context }),
    })
  }
}

/**
 * Define informações do usuário para o Sentry
 * @param userId ID do usuário
 * @param userData Dados adicionais do usuário (opcional)
 */
export const setUserInfo = (
  userId: string | number | null,
  userData?: Record<string, any>
) => {
  if (userId) {
    Sentry.setUser({
      id: String(userId),
      ...userData,
    })
  } else {
    // Limpar dados do usuário (após logout)
    Sentry.setUser(null)
  }
}

export default {
  initSentry,
  captureError,
  setUserInfo,
}
