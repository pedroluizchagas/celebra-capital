import { AxiosError } from 'axios'

/**
 * Tratamento padronizado de erros de API
 */
export const handleApiError = (error: any): void => {
  if (error?.response) {
    // O servidor respondeu com um status de erro
    const { status, data } = error.response

    switch (status) {
      case 400:
        console.error('Erro de validação:', data)
        break
      case 401:
        console.error('Não autorizado. Faça login novamente.')
        // Aqui você pode adicionar um redirecionamento para a página de login
        // ou disparar uma ação para limpar o estado de autenticação
        break
      case 403:
        console.error('Acesso proibido. Você não tem permissão para esta ação.')
        break
      case 404:
        console.error('Recurso não encontrado.')
        break
      case 422:
        console.error('Erro de validação:', data)
        break
      case 500:
        console.error('Erro interno do servidor. Tente novamente mais tarde.')
        break
      default:
        console.error(`Erro inesperado (status ${status})`, data)
    }
  } else if (error?.request) {
    // A requisição foi feita mas não houve resposta
    console.error('Erro de conexão. Verifique sua conexão com a internet.')
  } else {
    // Erro ao configurar a requisição
    console.error('Erro ao fazer requisição:', error?.message || error)
  }
}

/**
 * Formata mensagens de erro para exibição ao usuário
 */
export const formatApiErrorMessage = (error: any): string => {
  if (error?.response?.data?.message) {
    return error.response.data.message
  }

  if (error?.response?.data?.error) {
    return error.response.data.error
  }

  if (error?.response?.status === 401) {
    return 'Não autorizado. Faça login novamente.'
  }

  if (error?.response?.status === 403) {
    return 'Acesso proibido. Você não tem permissão para esta ação.'
  }

  if (error?.response?.status === 404) {
    return 'Recurso não encontrado.'
  }

  if (error?.response?.status === 500) {
    return 'Erro interno do servidor. Tente novamente mais tarde.'
  }

  if (error?.request) {
    return 'Erro de conexão. Verifique sua conexão com a internet.'
  }

  return 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
}

/**
 * Verifica se um erro é de validação e extrai os erros
 */
export const extractValidationErrors = (
  error: any
): Record<string, string> | null => {
  // Se o erro for de validação (422 ou 400 com formato específico)
  if (
    error?.response?.status === 422 ||
    (error?.response?.status === 400 && error?.response?.data?.errors)
  ) {
    const { errors } = error.response.data

    if (errors && typeof errors === 'object') {
      return errors
    }
  }

  return null
}

export default {
  handleApiError,
  formatApiErrorMessage,
  extractValidationErrors,
}
