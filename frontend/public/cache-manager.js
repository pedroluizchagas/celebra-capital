/**
 * Gerenciador de Cache para o PWA da Celebra Capital
 * Fornece funções para gerenciar o cache de diferentes tipos de conteúdo
 */

class CacheManager {
  constructor() {
    // Configurações de cache
    this.config = {
      staticCache: 'celebra-static-v1',
      dynamicCache: 'celebra-dynamic-v1',
      userDataCache: 'celebra-user-data-v1',
      imageCache: 'celebra-images-v1',
      fontCache: 'celebra-fonts-v1',
      maxCachedItems: 100,
      expirationTime: 7 * 24 * 60 * 60 * 1000, // 7 dias em milissegundos
    }

    // Recursos que sempre devem ser buscados da rede
    this.neverCacheUrls = [
      /\/api\/auth/,
      /\/api\/login/,
      /\/api\/logout/,
      /\/api\/token-refresh/,
    ]

    // Recursos que devem ser cacheados com estratégia stale-while-revalidate
    this.staleWhileRevalidateUrls = [
      /\/api\/public/,
      /\/api\/taxas/,
      /\/api\/parametros/,
    ]
  }

  /**
   * Limpa caches expirados ou versões antigas
   */
  async limparCachesAntigos() {
    try {
      const cacheKeys = await caches.keys()

      const deletarPromises = cacheKeys
        .filter((key) => {
          // Verificar se é uma versão antiga do cache (diferente da atual)
          return (
            key.startsWith('celebra-') &&
            key !== this.config.staticCache &&
            key !== this.config.dynamicCache &&
            key !== this.config.userDataCache &&
            key !== this.config.imageCache &&
            key !== this.config.fontCache
          )
        })
        .map((key) => caches.delete(key))

      return Promise.all(deletarPromises)
    } catch (erro) {
      console.error('[Cache Manager] Erro ao limpar caches antigos:', erro)
      return Promise.resolve()
    }
  }

  /**
   * Limita o número de itens em um cache específico
   */
  async limitarTamanhoCache(cacheName) {
    try {
      const cache = await caches.open(cacheName)
      const keys = await cache.keys()

      if (keys.length > this.config.maxCachedItems) {
        // Remover os itens mais antigos
        const excesso = keys.length - this.config.maxCachedItems

        for (let i = 0; i < excesso; i++) {
          await cache.delete(keys[i])
        }

        console.log(
          `[Cache Manager] Removidos ${excesso} itens antigos de ${cacheName}`
        )
      }
    } catch (erro) {
      console.error(
        `[Cache Manager] Erro ao limitar tamanho do cache ${cacheName}:`,
        erro
      )
    }
  }

  /**
   * Verifica se um recurso deve ser cacheado
   */
  shouldCache(url) {
    // Verificar se a URL está na lista de "nunca cachear"
    for (const pattern of this.neverCacheUrls) {
      if (pattern.test(url)) {
        return false
      }
    }

    return true
  }

  /**
   * Determina qual estratégia de cache usar para uma URL
   */
  getStrategyForUrl(url) {
    // Verificar stale-while-revalidate URLs
    for (const pattern of this.staleWhileRevalidateUrls) {
      if (pattern.test(url)) {
        return 'stale-while-revalidate'
      }
    }

    // Verificar por tipo de conteúdo
    if (url.includes('/api/')) {
      return 'network-first'
    }

    if (url.match(/\.(jpe?g|png|gif|svg|webp)$/)) {
      return 'cache-first'
    }

    if (url.match(/\.(woff2?|ttf|eot)$/)) {
      return 'cache-first'
    }

    if (url.match(/\.(css|js)$/)) {
      return 'stale-while-revalidate'
    }

    // Padrão para outros recursos
    return 'network-first'
  }

  /**
   * Armazena um recurso no cache apropriado
   */
  async cacheResource(request, response) {
    if (!this.shouldCache(request.url)) {
      return
    }

    const url = new URL(request.url)
    let cacheName

    // Determinar qual cache usar baseado no tipo de conteúdo
    if (url.pathname.match(/\.(jpe?g|png|gif|svg|webp)$/)) {
      cacheName = this.config.imageCache
    } else if (url.pathname.match(/\.(woff2?|ttf|eot)$/)) {
      cacheName = this.config.fontCache
    } else if (url.pathname.startsWith('/api/')) {
      cacheName = this.config.dynamicCache
    } else {
      cacheName = this.config.staticCache
    }

    try {
      const cache = await caches.open(cacheName)

      // Adicionar cabeçalho de timestamp para controlar expiração
      const headers = new Headers(response.headers)
      headers.append('x-cache-timestamp', Date.now().toString())

      const clonedResponse = new Response(response.clone().body, {
        status: response.status,
        statusText: response.statusText,
        headers: headers,
      })

      // Armazenar no cache
      await cache.put(request, clonedResponse)

      // Manter tamanho do cache dentro do limite
      await this.limitarTamanhoCache(cacheName)
    } catch (erro) {
      console.error('[Cache Manager] Erro ao armazenar no cache:', erro)
    }
  }

  /**
   * Verifica se um recurso cacheado está expirado
   */
  isExpired(response) {
    if (!response || !response.headers) {
      return true
    }

    const timestamp = response.headers.get('x-cache-timestamp')

    if (!timestamp) {
      return false // Se não tiver timestamp, considera válido
    }

    const cacheTime = parseInt(timestamp, 10)
    const now = Date.now()

    return now - cacheTime > this.config.expirationTime
  }

  /**
   * Estratégia Cache First: tenta buscar do cache primeiro, recorrendo à rede se necessário
   */
  async cacheFirstStrategy(request) {
    try {
      // Tentar buscar do cache primeiro
      const cachedResponse = await caches.match(request)

      if (cachedResponse && !this.isExpired(cachedResponse)) {
        return cachedResponse
      }

      // Se não estiver no cache ou estiver expirado, buscar da rede
      const networkResponse = await fetch(request)

      // Armazenar no cache para uso futuro
      await this.cacheResource(request, networkResponse.clone())

      return networkResponse
    } catch (erro) {
      console.error('[Cache Manager] Erro na estratégia cache-first:', erro)

      // Se falhar, tentar retornar do cache mesmo que expirado
      const cachedResponse = await caches.match(request)

      if (cachedResponse) {
        return cachedResponse
      }

      // Se tudo falhar, retornar resposta de erro genérica
      return new Response('Falha ao carregar recurso', {
        status: 408,
        headers: { 'Content-Type': 'text/plain' },
      })
    }
  }

  /**
   * Estratégia Network First: tenta buscar da rede primeiro, recorrendo ao cache se offline
   */
  async networkFirstStrategy(request) {
    try {
      // Tentar buscar da rede primeiro
      const networkResponse = await fetch(request)

      // Se obtiver sucesso, armazenar no cache
      await this.cacheResource(request, networkResponse.clone())

      return networkResponse
    } catch (erro) {
      console.log(
        '[Cache Manager] Rede indisponível, buscando do cache:',
        request.url
      )

      // Se falhar, buscar do cache
      const cachedResponse = await caches.match(request)

      if (cachedResponse) {
        return cachedResponse
      }

      // Se não estiver no cache, retornar erro
      throw erro
    }
  }

  /**
   * Estratégia Stale While Revalidate: retorna do cache enquanto atualiza em segundo plano
   */
  async staleWhileRevalidateStrategy(request) {
    try {
      // Buscar do cache
      const cachedResponse = await caches.match(request)

      // Iniciar busca da rede em paralelo
      const networkPromise = fetch(request)
        .then((networkResponse) => {
          // Atualizar o cache em segundo plano
          this.cacheResource(request, networkResponse.clone())
          return networkResponse
        })
        .catch((erro) => {
          console.error('[Cache Manager] Erro ao revalidar:', erro)
        })

      // Se tiver no cache, retornar imediatamente
      if (cachedResponse) {
        // Revalidação acontece em segundo plano
        return cachedResponse
      }

      // Se não tiver no cache, aguardar a rede
      return await networkPromise
    } catch (erro) {
      console.error(
        '[Cache Manager] Erro na estratégia stale-while-revalidate:',
        erro
      )

      // Último recurso - tentar cache mesmo com erro
      const cachedResponse = await caches.match(request)

      if (cachedResponse) {
        return cachedResponse
      }

      throw erro
    }
  }

  /**
   * Manipula uma requisição aplicando a estratégia de cache apropriada
   */
  async handleRequest(request) {
    const strategy = this.getStrategyForUrl(request.url)

    switch (strategy) {
      case 'cache-first':
        return this.cacheFirstStrategy(request)
      case 'network-first':
        return this.networkFirstStrategy(request)
      case 'stale-while-revalidate':
        return this.staleWhileRevalidateStrategy(request)
      default:
        return this.networkFirstStrategy(request)
    }
  }
}

// Exportar uma instância global
window.CelebraCacheManager = new CacheManager()
