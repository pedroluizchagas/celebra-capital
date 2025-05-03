/**
 * Service Worker para o PWA da Celebra Capital
 * Implementa estratégias de cache, suporte offline e notificações push
 */

// Nome e versão do cache
const CACHE_NAME = 'celebra-cache-v1'
const DATA_CACHE_NAME = 'celebra-data-cache-v1'
const OFFLINE_PAGE = '/offline.html'

// Arquivos para armazenar em cache
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/bundle.js',
  '/static/css/main.chunk.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  OFFLINE_PAGE,
  // Recursos adicionais essenciais para a experiência offline
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/maskable-icon.png',
  '/icons/apple-touch-icon.png',
]

// Instalação do Service Worker e cache de recursos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache')
      return cache.addAll(urlsToCache)
    })
  )
  // Força a ativação do novo service worker sem esperar o fechamento das abas
  self.skipWaiting()
})

// Ativação do Service Worker e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, DATA_CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Exclui caches antigos que não estão na whitelist
            return caches.delete(cacheName)
          }
          return null
        })
      )
    })
  )
  // Garante que o service worker tenha controle sobre todas as páginas abertas
  self.clients.claim()
})

// Função auxiliar para verificar se a URL é da API
const isApiRequest = (url) => {
  return url.includes('/api/')
}

// Função auxiliar para verificar se a URL é um recurso estático
const isStaticResource = (url) => {
  return (
    url.includes('/static/') ||
    url.includes('/icons/') ||
    url.includes('.png') ||
    url.includes('.jpg') ||
    url.includes('.svg') ||
    url.includes('.css') ||
    url.includes('.js') ||
    url.includes('.ico') ||
    url.includes('.woff') ||
    url.includes('.woff2') ||
    url.includes('.ttf')
  )
}

// Estratégia de cache para diferentes tipos de recursos
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // 1. Tratamento especial para APIs - Network First com cache de fallback
  if (isApiRequest(url.pathname)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response || response.status !== 200) {
            return response
          }

          // Clonar para armazenar no cache
          const responseToCache = response.clone()

          caches
            .open(DATA_CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseToCache)
            })
            .catch((err) =>
              console.error('Erro ao armazenar dados da API:', err)
            )

          return response
        })
        .catch(() => {
          // Se a rede falhar, tente do cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            // Se não tiver no cache e for GET, retorne a página offline
            if (request.method === 'GET') {
              return caches.match(OFFLINE_PAGE)
            }
            // Para outros métodos que não GET, apenas informe o erro
            throw new Error('Falha de rede e recurso não encontrado no cache')
          })
        })
    )
    return
  }

  // 2. Para recursos estáticos - Cache First
  if (isStaticResource(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        return (
          cachedResponse ||
          fetch(request).then((networkResponse) => {
            // Armazenar no cache para uso futuro
            const responseToCache = networkResponse.clone()
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, responseToCache))
              .catch((err) =>
                console.error('Erro ao armazenar recurso estático:', err)
              )

            return networkResponse
          })
        )
      })
    )
    return
  }

  // 3. Para navegação e outros recursos - Network First
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Se a resposta for válida, retorne e armazene no cache
        if (response.status === 200) {
          const responseToCache = response.clone()
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(request, responseToCache))
            .catch((err) =>
              console.error('Erro ao armazenar recurso de navegação:', err)
            )
        }
        return response
      })
      .catch(() => {
        // Em caso de falha, verifique no cache
        return caches.match(request).then((cachedResponse) => {
          // Se encontrarmos no cache, retorne
          if (cachedResponse) {
            return cachedResponse
          }

          // Para navegação, retornar a página offline
          if (request.mode === 'navigate') {
            return caches.match(OFFLINE_PAGE)
          }

          // Para outros recursos não encontrados
          throw new Error('Recurso não encontrado')
        })
      })
  )
})

// Evento para receber mensagens do cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Evento de sincronização em segundo plano
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-actions' || event.tag === 'sync-all-data') {
    event.waitUntil(
      // Notifica todos os clientes para iniciar a sincronização
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'START_SYNC',
            tag: event.tag,
          })
        })
      })
    )
  }
})

// Evento de push notification
self.addEventListener('push', (event) => {
  console.log('Notificação push recebida', event)

  if (!event.data) {
    console.log('Push recebido, mas sem dados.')
    return
  }

  try {
    // Extrair dados da notificação
    const notificationData = event.data.json()
    console.log('Dados da notificação:', notificationData)

    // Configurar opções da notificação
    const options = {
      body: notificationData.message || 'Nova notificação',
      icon: '/logo192.png', // Ícone da notificação
      badge: '/logo192.png', // Ícone pequeno para dispositivos móveis
      data: {
        url: notificationData.link || '/', // URL para abrir ao clicar
        id: notificationData.id,
        tipo: notificationData.type,
      },
      actions: [],
      vibrate: [100, 50, 100], // Padrão de vibração (apenas mobile)
      tag: `notification-${notificationData.id || Date.now()}`, // Tag única para agrupar notificações similares
      requireInteraction: notificationData.requireInteraction || false, // Se a notificação deve permanecer visível
    }

    // Adicionar ações baseadas no tipo
    if (notificationData.type === 'proposal_review') {
      options.actions.push({
        action: 'view',
        title: 'Visualizar',
      })
    } else if (notificationData.type === 'document_upload') {
      options.actions.push({
        action: 'view',
        title: 'Visualizar',
      })
    }

    // Mostrar a notificação
    event.waitUntil(
      self.registration.showNotification(
        notificationData.title || 'Celebra Capital',
        options
      )
    )
  } catch (error) {
    console.error('Erro ao processar notificação push:', error)
  }
})

// Evento de clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('Notificação clicada', event)

  // Fechar a notificação
  event.notification.close()

  // Extrair dados
  const notificationData = event.notification.data

  // URL para abrir (padrão para a home se não especificado)
  let url = notificationData.url || '/'

  // Verificar se uma ação específica foi clicada
  if (event.action === 'view' && notificationData.id) {
    if (notificationData.tipo === 'proposal_review') {
      url = `/proposals/${notificationData.id}`
    } else if (notificationData.tipo === 'document_upload') {
      url = `/documents/${notificationData.id}`
    }
  }

  // Abrir ou focar na janela existente com a URL
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // Verificar se já existe uma janela/aba aberta com a URL
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus()
        }
      }
      // Se nenhuma janela estiver aberta, abrir uma nova
      return self.clients.openWindow(url)
    })
  )
})

// Evento para sincronização em segundo plano (útil para dispositivos móveis)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications())
  }
})

// Função para sincronizar notificações em segundo plano
async function syncNotifications() {
  // Implementar lógica para sincronizar notificações
  console.log('Sincronizando notificações em segundo plano')
}
