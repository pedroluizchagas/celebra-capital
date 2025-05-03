import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import { createErrorHandler } from './errorHandler'
// import { setupCacheInterceptors } from './cacheManager'  // Remover para evitar referência circular

// Definir URL base da API - usar variável de ambiente no ambiente de produção
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

// Definir tipos para respostas de erros da API
export interface ApiErrorResponse {
  message?: string
  detail?: string
  errors?: Record<string, string[]>
  code?: string
}

// Extender InternalAxiosRequestConfig para incluir propriedade _retry
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean
    useCache?: boolean
    cacheKey?: string
    cacheTTL?: number
  }
}

// Interface para configuração de cache
interface CacheConfig {
  useCache?: boolean
  cacheKey?: string
  cacheTTL?: number // tempo em segundos
}

// Instância do axios com configurações padrão
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Configurar timeout global para evitar requisições penduradas
  timeout: 30000, // 30 segundos
})

// Token de renovação em andamento
let isRefreshing = false
let failedQueue: { resolve: Function; reject: Function }[] = []

// Implementação simples de cache em memória
const apiCache: Record<string, { data: any; timestamp: number }> = {}

// Função para verificar se o cache é válido
const isCacheValid = (key: string, ttl: number): boolean => {
  if (!apiCache[key]) return false

  const now = Date.now()
  const cacheTime = apiCache[key].timestamp
  return now - cacheTime < ttl * 1000
}

// Limpar cache por chave ou expressão regular
export const clearCache = (pattern?: string | RegExp): void => {
  if (!pattern) {
    // Limpar todo o cache
    Object.keys(apiCache).forEach((key) => {
      delete apiCache[key]
    })
    return
  }

  // Limpar entradas específicas
  const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern)
  Object.keys(apiCache).forEach((key) => {
    if (regex.test(key)) {
      delete apiCache[key]
    }
  })
}

// Função para processar a fila de requisições que falharam
const processQueue = (error: any, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

// Interceptor para adicionar token nas requisições
api.interceptors.request.use(
  (config) => {
    // Verifica se está no browser antes de acessar localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('celebraToken')

      if (token) {
        config.headers = config.headers || {}
        config.headers['Authorization'] = `Token ${token}`
      }
    }

    // Verificar se deve usar cache
    if (config.useCache && config.cacheKey) {
      const ttl = config.cacheTTL || 60 // Padrão: 60 segundos
      if (isCacheValid(config.cacheKey, ttl)) {
        // Se o cache for válido, define uma flag para o interceptor de resposta
        config.adapter = (config) => {
          return Promise.resolve({
            data: apiCache[config.cacheKey!].data,
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
            request: {},
          } as AxiosResponse)
        }
      }
    }

    return config
  },
  (error) => {
    const errorHandler = createErrorHandler()
    errorHandler.handleApiError(error)
    return Promise.reject(error)
  }
)

// Interceptador para tratamento de erros
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Armazenar resposta no cache se configurado
    const config = response.config
    if (config.useCache && config.cacheKey) {
      apiCache[config.cacheKey] = {
        data: response.data,
        timestamp: Date.now(),
      }
    }
    return response
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig
    const errorHandler = createErrorHandler()

    // Tratamento para erros de timeout
    if (error.code === 'ECONNABORTED') {
      errorHandler.setError(
        'A requisição excedeu o tempo limite. Por favor, tente novamente.'
      )
      return Promise.reject(error)
    }

    // Tratamento para erros de rede (sem conexão)
    if (!error.response) {
      errorHandler.setError(
        'Não foi possível conectar ao servidor. Por favor, verifique sua conexão de internet.'
      )
      return Promise.reject(error)
    }

    // Evitar loop infinito
    if (originalRequest._retry) {
      // Processar erro com o ErrorHandler centralizado
      errorHandler.handleApiError(error)
      return Promise.reject(error)
    }

    const { status } = error.response

    // Tratamento de erro 401 (não autorizado)
    if (status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        try {
          // Adicionar a requisição à fila
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers['Authorization'] = `Bearer ${token}`
              }
              return api(originalRequest)
            })
            .catch((err) => {
              // Processar erro com o ErrorHandler centralizado
              errorHandler.handleApiError(err)
              return Promise.reject(err)
            })
        } catch (err) {
          // Processar erro com o ErrorHandler centralizado
          errorHandler.handleApiError(err)
          return Promise.reject(err)
        }
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')

        if (!refreshToken) {
          // Se não tiver refresh token, limpar localStorage e redirecionar
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
          // Processar erro com o ErrorHandler centralizado
          errorHandler.setError(
            'Sua sessão expirou. Por favor, faça login novamente.'
          )
          return Promise.reject(error)
        }

        // Tentar renovar o token
        const response = await axios.post(`${API_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        })

        // Se a renovação for bem-sucedida
        if (response.data.access) {
          localStorage.setItem('token', response.data.access)
          api.defaults.headers.common[
            'Authorization'
          ] = `Bearer ${response.data.access}`

          if (originalRequest.headers) {
            originalRequest.headers[
              'Authorization'
            ] = `Bearer ${response.data.access}`
          }

          // Processar a fila com o novo token
          processQueue(null, response.data.access)
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Se falhar a renovação, limpar localStorage e redirecionar
        processQueue(refreshError, null)
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        // Processar erro com o ErrorHandler centralizado
        errorHandler.setError(
          'Não foi possível renovar sua sessão. Por favor, faça login novamente.'
        )
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    } else if (status === 403) {
      // Tratamento específico para erro de permissão
      errorHandler.setError('Você não tem permissão para acessar este recurso.')
      return Promise.reject(error)
    } else if (status === 404) {
      // Tratamento específico para recurso não encontrado
      errorHandler.setError('O recurso solicitado não foi encontrado.')
      return Promise.reject(error)
    } else if (status >= 500) {
      // Tratamento específico para erros de servidor
      errorHandler.setError(
        'Ocorreu um erro no servidor. Por favor, tente novamente mais tarde.'
      )
      return Promise.reject(error)
    }

    // Processar outros tipos de erros
    errorHandler.handleApiError(error)
    return Promise.reject(error)
  }
)

// Utilidades para requisições com cache
export const createCacheConfig = (
  key: string,
  ttl: number = 60,
  useCache: boolean = true
): CacheConfig => ({
  useCache,
  cacheKey: key,
  cacheTTL: ttl,
})

// Utilitário para requisições com upload de arquivos
export const createFormData = (
  file: File,
  additionalData?: Record<string, any>
): FormData => {
  const formData = new FormData()
  formData.append('file', file)

  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(
          key,
          typeof value === 'object' ? JSON.stringify(value) : String(value)
        )
      }
    })
  }

  return formData
}

// Utilidades de API com tratamento de erro consistente
export const apiUtils = {
  // Wrapper para GET seguro com tratamento de erro padronizado
  async get<T>(
    url: string,
    params?: any,
    cacheConfig?: CacheConfig
  ): Promise<T> {
    try {
      const config: any = { params }
      if (cacheConfig) {
        config.useCache = cacheConfig.useCache
        config.cacheKey = cacheConfig.cacheKey || url
        config.cacheTTL = cacheConfig.cacheTTL
      }
      const response = await api.get<T>(url, config)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Wrapper para POST seguro com tratamento de erro padronizado
  async post<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await api.post<T>(url, data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Wrapper para PUT seguro com tratamento de erro padronizado
  async put<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await api.put<T>(url, data)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Wrapper para DELETE seguro com tratamento de erro padronizado
  async delete<T>(url: string): Promise<T> {
    try {
      const response = await api.delete<T>(url)
      return response.data
    } catch (error) {
      throw error
    }
  },

  // Wrapper para upload seguro com tratamento de erro padronizado
  async upload<T>(
    url: string,
    file: File,
    additionalData?: Record<string, any>
  ): Promise<T> {
    try {
      const formData = createFormData(file, additionalData)
      const response = await api.post<T>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw error
    }
  },
}

export default api
