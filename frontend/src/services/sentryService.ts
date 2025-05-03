import * as Sentry from '@sentry/react'

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

  // Inicialização para versão 9.x do Sentry
  Sentry.init({
    dsn,
    // Aumentar amostragem em ambientes de não-produção
    // Diminuir em produção para reduzir custos
    tracesSampleRate: environment === 'production' ? 0.2 : 1.0,
    replaysSessionSampleRate: environment === 'production' ? 0.1 : 0.5,
    replaysOnErrorSampleRate: 1.0,

    // Ambiente (staging, production)
    environment,

    // Desativar em desenvolvimento
    enabled: environment !== 'development',

    // Versão da aplicação (para rastreamento de releases)
    release: import.meta.env.VITE_APP_VERSION || 'unknown',

    // Filtrando erros com CORS e problemas de rede
    beforeSend(event) {
      // Evitar enviar erros de CORS e problemas de rede
      if (
        event.exception?.values?.some(
          (exception) =>
            exception.value?.includes('Network Error') ||
            exception.value?.includes('CORS') ||
            exception.value?.includes('Failed to fetch')
        )
      ) {
        // Marcar como problema de rede para facilitar a filtragem
        event.tags = { ...event.tags, network_related: true }
      }
      return event
    },

    // Configurações de contexto para ajudar no debugging
    attachStacktrace: true,
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
      level: 'error',
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

/**
 * Adicionar um breadcrumb personalizado para rastrear ações do usuário
 * @param category Categoria do breadcrumb
 * @param message Mensagem descritiva
 * @param data Dados adicionais (opcional)
 */
export const addBreadcrumb = (
  category: string,
  message: string,
  data?: Record<string, any>
) => {
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level: 'info',
  })
}

/**
 * Adiciona contexto para o Sentry, útil para adicionar metadados a erros
 * @param contextName Nome do contexto
 * @param contextData Dados do contexto
 */
export const setContext = (
  contextName: string,
  contextData: Record<string, any>
) => {
  Sentry.setContext(contextName, contextData)
}

/**
 * Define tags para o Sentry, útil para filtrar eventos
 * @param tags Objeto com as tags a serem definidas
 */
export const setTags = (tags: Record<string, string>) => {
  Object.entries(tags).forEach(([key, value]) => {
    Sentry.setTag(key, value)
  })
}

export default {
  initSentry,
  captureError,
  setUserInfo,
  addBreadcrumb,
  setContext,
  setTags,
}
