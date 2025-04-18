import axios from 'axios'

// Definir URL base da API - usar variável de ambiente no ambiente de produção
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

// Instância do axios com configurações padrão
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Token de renovação em andamento
let isRefreshing = false
let failedQueue: { resolve: Function; reject: Function }[] = []

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

// Interceptador para adicionar token nas requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptador para tratamento de erros
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Evitar loop infinito
    if (originalRequest._retry) {
      return Promise.reject(error)
    }

    // Tratamento de erro 401 (não autorizado)
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        try {
          // Adicionar a requisição à fila
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then((token) => {
              originalRequest.headers['Authorization'] = `Bearer ${token}`
              return api(originalRequest)
            })
            .catch((err) => {
              return Promise.reject(err)
            })
        } catch (err) {
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
          originalRequest.headers[
            'Authorization'
          ] = `Bearer ${response.data.access}`

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
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
