import { useError } from '../contexts/ErrorContext'
import type { ErrorContextType } from '../contexts/ErrorContext'
import sentryService from './sentryService'

// Armazenamento global para o contexto fora do React
let globalErrorHandler: {
  errorContext: ErrorContextType | null
  setErrorContext: (ctx: ErrorContextType) => void
} = {
  errorContext: null,
  setErrorContext: (ctx) => {
    globalErrorHandler.errorContext = ctx
  },
}

// Hook para conectar o contexto ao estado global
export const useErrorHandler = () => {
  const errorContext = useError()

  // Atualizar referência global quando o componente montar
  globalErrorHandler.setErrorContext(errorContext)

  return {
    ...createBaseErrorHandler(errorContext),
  }
}

// Função que cria um handler para uso em componentes React
export const createErrorHandler = () => {
  let contextToUse: ErrorContextType | null = null

  try {
    // Tenta usar o hook primeiro (dentro de componentes React)
    contextToUse = useError()
  } catch (error) {
    // Se falhar, usa a referência global (fora de componentes React)
    contextToUse = globalErrorHandler.errorContext
  }

  return createBaseErrorHandler(contextToUse)
}

// Função base que implementa as funções de tratamento de erro
const createBaseErrorHandler = (errorContext: ErrorContextType | null) => {
  const handleApiError = (error: any) => {
    if (!errorContext) return

    // Enviar erro para o Sentry em todos os casos, exceto 401 e 400 de validação
    const shouldReportToSentry =
      !error.response ||
      (error.response.status !== 401 &&
        (error.response.status !== 400 ||
          !error.response.data ||
          typeof error.response.data !== 'object'))

    if (shouldReportToSentry) {
      sentryService.captureError(error, {
        type: 'api_error',
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
      })
    }

    if (error.response) {
      // Erro de resposta do servidor (4xx, 5xx)
      const { status, data } = error.response

      // Limpar erros anteriores
      errorContext.clearApiErrors()

      switch (status) {
        case 400:
          // Processar erros de validação (campos específicos)
          if (data && typeof data === 'object') {
            const apiErrors: Record<string, string[]> = {}

            Object.entries(data).forEach(([key, value]) => {
              apiErrors[key] = Array.isArray(value)
                ? value.map(String)
                : [String(value)]
            })

            errorContext.setApiErrors(apiErrors)
          } else {
            errorContext.setError(
              'Requisição inválida. Verifique os dados e tente novamente.'
            )
          }
          break

        case 401:
          // Não autorizado - tratado pelo interceptor
          break

        case 403:
          errorContext.setError(
            'Você não tem permissão para realizar esta ação.'
          )
          break

        case 404:
          errorContext.setError('O recurso solicitado não foi encontrado.')
          break

        case 500:
        case 502:
        case 503:
        case 504:
          errorContext.setError(
            'Ocorreu um erro no servidor. Por favor, tente novamente mais tarde.'
          )
          break

        default:
          errorContext.setError(`Ocorreu um erro inesperado. Código: ${status}`)
      }
    } else if (error.request) {
      // Requisição feita, mas sem resposta (problemas de rede)
      errorContext.setError(
        'Não foi possível conectar ao servidor. Verifique sua conexão de internet.'
      )
    } else {
      // Erro ao configurar requisição
      errorContext.setError(
        `Ocorreu um erro ao processar sua solicitação: ${error.message}`
      )
    }
  }

  const handleFormError = (
    formId: string,
    fieldName: string,
    errorMessage: string | string[]
  ) => {
    if (!errorContext) return
    errorContext.addFormFieldError(formId, fieldName, errorMessage)
  }

  const setFormErrors = (formId: string, errors: Record<string, string[]>) => {
    if (!errorContext) return
    errorContext.setFormErrors(formId, errors)
  }

  const setError = (message: string) => {
    if (!errorContext) return
    errorContext.setError(message)

    // Reportar erro global ao Sentry
    sentryService.captureError(message, {
      type: 'global_error',
    })
  }

  const clearErrors = () => {
    if (!errorContext) return
    errorContext.clearErrors()
  }

  return {
    handleApiError,
    handleFormError,
    setFormErrors,
    setError,
    clearErrors,
  }
}
