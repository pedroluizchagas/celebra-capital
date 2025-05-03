import api from './api'
import { AxiosRequestConfig, AxiosResponse } from 'axios'

// Configurações de cache por endpoint
type CacheConfig = {
  ttl: number // Tempo de vida em segundos
  useIfError?: boolean // Usar cache em caso de erro de rede
}

const cacheConfigs: Record<string, CacheConfig> = {
  // Assinaturas
  'GET /signatures/': { ttl: 30, useIfError: true },
  'GET /signatures/*/status/': { ttl: 30, useIfError: true },

  // Propostas
  'GET /proposals/admin/': { ttl: 60 },
  'GET /proposals/admin/*/': { ttl: 120 },

  // Documentos
  'GET /documents/': { ttl: 300 },
}

// Tipo para o Cache
interface CacheItem {
  timestamp: number
  data: any
  headers: Record<string, string>
}

// Classe para gerenciar o cache
class CacheStorage {
  private cache: Map<string, CacheItem>
  private memoryLimit: number // Limite máximo de itens no cache

  constructor(memoryLimit = 100) {
    this.cache = new Map()
    this.memoryLimit = memoryLimit
  }

  // Chave de cache baseada no método, URL e params
  private generateKey(config: AxiosRequestConfig): string {
    const method = config.method?.toUpperCase() || 'GET'
    const url = config.url || ''
    const params = config.params ? JSON.stringify(config.params) : ''

    return `${method}:${url}${params ? `:${params}` : ''}`
  }

  // Verifica se um endpoint deve ser cacheado
  public shouldCache(config: AxiosRequestConfig): boolean {
    if (!config.url || !config.method) return false

    const method = config.method.toUpperCase()
    const url = config.url

    // Só cachear GETs
    if (method !== 'GET') return false

    // Verificar padrões de URL configurados para cache
    return Object.keys(cacheConfigs).some((pattern) => {
      const [patternMethod, patternUrl] = pattern.split(' ')

      if (patternMethod !== method) return false

      // Converter pattern para regex
      const regexPattern = patternUrl.replace(/\*/g, '[^/]+')
      const regex = new RegExp(`^${regexPattern}$`)

      return regex.test(url)
    })
  }

  // Obter configuração de cache para um request
  public getCacheConfig(config: AxiosRequestConfig): CacheConfig | null {
    if (!config.url || !config.method) return null

    const method = config.method.toUpperCase()
    const url = config.url

    // Percorrer configurações procurando um match
    for (const pattern of Object.keys(cacheConfigs)) {
      const [patternMethod, patternUrl] = pattern.split(' ')

      if (patternMethod !== method) continue

      // Converter pattern para regex
      const regexPattern = patternUrl.replace(/\*/g, '[^/]+')
      const regex = new RegExp(`^${regexPattern}$`)

      if (regex.test(url)) {
        return cacheConfigs[pattern]
      }
    }

    return null
  }

  // Armazenar uma resposta no cache
  public set(config: AxiosRequestConfig, response: AxiosResponse): void {
    const key = this.generateKey(config)
    const cacheConfig = this.getCacheConfig(config)

    if (!cacheConfig) return

    // Criar item de cache
    const item: CacheItem = {
      timestamp: Date.now(),
      data: response.data,
      headers: response.headers as Record<string, string>,
    }

    // Se o cache estiver cheio, remover o item mais antigo
    if (this.cache.size >= this.memoryLimit) {
      const oldestKey = [...this.cache.entries()].sort(
        (a, b) => a[1].timestamp - b[1].timestamp
      )[0][0]

      this.cache.delete(oldestKey)
    }

    this.cache.set(key, item)
  }

  // Obter uma resposta do cache
  public get(config: AxiosRequestConfig): AxiosResponse | null {
    const key = this.generateKey(config)
    const cacheConfig = this.getCacheConfig(config)

    if (!cacheConfig) return null

    const cachedItem = this.cache.get(key)

    if (!cachedItem) return null

    // Verificar se o cache ainda é válido
    const age = (Date.now() - cachedItem.timestamp) / 1000 // em segundos

    if (age > cacheConfig.ttl) {
      // Cache expirado
      this.cache.delete(key)
      return null
    }

    // Construir resposta do cache
    return {
      data: cachedItem.data,
      status: 200,
      statusText: 'OK (from cache)',
      headers: cachedItem.headers,
      config,
      request: {} as any,
    }
  }

  // Limpar todo o cache ou um item específico
  public clear(config?: AxiosRequestConfig): void {
    if (config) {
      const key = this.generateKey(config)
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }
}

// Instanciar o gerenciador de cache
const cacheStorage = new CacheStorage()

// Configurar interceptadores
export const setupCacheInterceptors = (): void => {
  // Interceptador de requisição
  api.interceptors.request.use(
    (config) => {
      // Se a requisição deve ser cacheada
      if (cacheStorage.shouldCache(config)) {
        // Verificar se temos cache válido
        const cachedResponse = cacheStorage.get(config)

        if (cachedResponse) {
          // A resposta do cache será enviada diretamente
          // Cancelar a requisição real
          const error = new Error('Resposta obtida do cache')
          // @ts-ignore
          error.response = cachedResponse
          // @ts-ignore
          error.isAxiosError = true
          // @ts-ignore
          error.fromCache = true

          return Promise.reject(error)
        }
      }

      return config
    },
    (error) => Promise.reject(error)
  )

  // Interceptador de resposta
  api.interceptors.response.use(
    (response) => {
      // Armazenar resposta no cache se necessário
      if (cacheStorage.shouldCache(response.config)) {
        cacheStorage.set(response.config, response)
      }

      return response
    },
    (error) => {
      // Verificar se podemos usar cache em caso de erro
      if (error.config && cacheStorage.shouldCache(error.config)) {
        const cacheConfig = cacheStorage.getCacheConfig(error.config)

        // Usar cache em caso de erro de rede
        if (cacheConfig?.useIfError && !error.response) {
          const cachedResponse = cacheStorage.get(error.config)

          if (cachedResponse) {
            // Adicionar indicação de que veio do cache durante erro
            cachedResponse.headers['x-from-fallback-cache'] = 'true'

            // Retornar dados do cache com aviso
            console.warn('Usando dados em cache pois houve erro de rede')
            return Promise.resolve(cachedResponse)
          }
        }
      }

      return Promise.reject(error)
    }
  )
}

// Função para limpar o cache
export const clearCache = (config?: AxiosRequestConfig): void => {
  cacheStorage.clear(config)
}

export default cacheStorage
