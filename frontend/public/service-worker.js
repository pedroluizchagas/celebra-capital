// Nome do cache
const CACHE_NAME = 'celebra-capital-v1'

// Arquivos para cache offline
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
]

// Instalação do service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache')
      return cache.addAll(urlsToCache)
    })
  )
  self.skipWaiting()
})

// Ativação do service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME
          })
          .map((cacheName) => {
            return caches.delete(cacheName)
          })
      )
    })
  )
  self.clients.claim()
})

// Interceptação das requisições
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - retorna a resposta do cache
      if (response) {
        return response
      }

      // Clone da requisição, porque é um stream e só pode ser consumido uma vez
      const fetchRequest = event.request.clone()

      return fetch(fetchRequest).then((response) => {
        // Verifica se a resposta é válida
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }

        // Clone da resposta, porque é um stream e só pode ser consumido uma vez
        const responseToCache = response.clone()

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
    })
  )
})

// Recebimento de push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    try {
      const data = event.data.json()

      const options = {
        body: data.body || 'Nova notificação',
        icon: data.icon || '/logo192.png',
        badge: data.badge || '/logo192.png',
        data: data.data || {},
        vibrate: [100, 50, 100],
        actions: [
          {
            action: 'open',
            title: 'Abrir',
          },
          {
            action: 'close',
            title: 'Fechar',
          },
        ],
      }

      event.waitUntil(
        self.registration.showNotification(
          data.title || 'Celebra Capital',
          options
        )
      )
    } catch (error) {
      console.error('Erro ao processar notificação push:', error)

      // Fallback para dados simples se não for JSON
      const text = event.data.text()

      event.waitUntil(
        self.registration.showNotification('Celebra Capital', {
          body: text,
          icon: '/logo192.png',
          badge: '/logo192.png',
          vibrate: [100, 50, 100],
        })
      )
    }
  }
})

// Ação ao clicar na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  // Tenta abrir a URL específica se existir nos dados da notificação
  if (event.action === 'open' || !event.action) {
    const urlToOpen = event.notification.data?.url || '/notifications'

    event.waitUntil(
      clients
        .matchAll({
          type: 'window',
        })
        .then((windowClients) => {
          // Verifica se já existe uma janela aberta e foca nela
          for (let client of windowClients) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus()
            }
          }

          // Caso contrário, abre uma nova janela
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen)
          }
        })
    )
  }
})
