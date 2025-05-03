/**
 * Utilitários para o PWA da Celebra Capital
 * Fornece funções auxiliares para trabalhar com recursos avançados do PWA
 */

class PWAUtils {
  constructor() {
    // Configurações
    this.config = {
      swPath: '/service-worker.js',
      debugMode: false,
      periodicSyncInterval: 60 * 60 * 1000, // 1 hora em milissegundos
      networkTimeoutDuration: 10000, // 10 segundos em milissegundos
    }

    // Referência para o service worker
    this.swRegistration = null

    // Status da rede
    this.isOnline = navigator.onLine

    // Inicializar
    this.init()
  }

  /**
   * Inicializar utilitários
   */
  init() {
    // Registrar o service worker
    this.registerServiceWorker()

    // Configurar detecção de status da rede
    this.setupNetworkDetection()

    // Configurar sincronização periódica
    this.setupPeriodicSync()

    // Expor métodos públicos para desenvolvedores
    this.exposePublicMethods()
  }

  /**
   * Registrar o service worker
   */
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register(
          this.config.swPath
        )

        if (this.config.debugMode) {
          console.log(
            '[PWA Utils] Service Worker registrado com sucesso:',
            this.swRegistration
          )
        }

        // Verificar atualizações do service worker
        this.swRegistration.addEventListener('updatefound', () => {
          const newWorker = this.swRegistration.installing

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              this.notifyUpdate()
            }
          })
        })
      } catch (error) {
        console.error('[PWA Utils] Falha ao registrar Service Worker:', error)
      }
    }
  }

  /**
   * Configurar detecção de status da rede
   */
  setupNetworkDetection() {
    // Verificar status inicial
    this.isOnline = navigator.onLine

    // Ouvir mudanças de status
    window.addEventListener('online', () => {
      this.isOnline = true
      this.dispatchNetworkEvent('online')

      // Tentar sincronizar dados quando voltar online
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        this.triggerBackgroundSync('sync-proposals')
      }
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      this.dispatchNetworkEvent('offline')
    })

    // Verificação periódica da qualidade da conexão
    setInterval(
      () => this.checkNetworkQuality(),
      this.config.networkTimeoutDuration
    )
  }

  /**
   * Verificar qualidade da conexão
   */
  async checkNetworkQuality() {
    if (!navigator.onLine) return

    try {
      const startTime = Date.now()

      // Fazer uma requisição pequena para testar a conexão
      const response = await fetch('/api/ping', {
        method: 'HEAD',
        cache: 'no-store',
        timeout: this.config.networkTimeoutDuration / 2,
      })

      const endTime = Date.now()
      const latency = endTime - startTime

      // Determinar qualidade com base na latência
      let quality = 'good'

      if (latency > 1000) {
        quality = 'poor'
      } else if (latency > 300) {
        quality = 'fair'
      }

      // Disparar evento com qualidade da rede
      this.dispatchNetworkEvent('quality', { quality, latency })
    } catch (error) {
      // Problemas na rede, mas ainda online segundo o navegador
      this.dispatchNetworkEvent('quality', {
        quality: 'poor',
        latency: this.config.networkTimeoutDuration,
      })
    }
  }

  /**
   * Disparar evento de rede
   */
  dispatchNetworkEvent(type, detail = {}) {
    const event = new CustomEvent(`network:${type}`, {
      detail: {
        timestamp: Date.now(),
        online: this.isOnline,
        ...detail,
      },
    })

    window.dispatchEvent(event)

    if (this.config.debugMode) {
      console.log(`[PWA Utils] Evento de rede: ${type}`, detail)
    }
  }

  /**
   * Configurar sincronização periódica (se suportado)
   */
  async setupPeriodicSync() {
    if (
      'serviceWorker' in navigator &&
      'periodicSync' in navigator.serviceWorker
    ) {
      try {
        // Registrar sincronização periódica
        const tags = ['sync-content', 'sync-proposals']

        for (const tag of tags) {
          await this.registerPeriodicSync(tag)
        }
      } catch (error) {
        console.error(
          '[PWA Utils] Erro ao configurar sincronização periódica:',
          error
        )
      }
    }
  }

  /**
   * Registrar sincronização periódica para uma tag
   */
  async registerPeriodicSync(tag) {
    try {
      // Verificar permissões
      const status = await navigator.permissions.query({
        name: 'periodic-background-sync',
      })

      if (status.state !== 'granted') {
        if (this.config.debugMode) {
          console.log(
            '[PWA Utils] Permissão de sincronização periódica não concedida'
          )
        }
        return
      }

      // Registrar sincronização
      await this.swRegistration.periodicSync.register(tag, {
        minInterval: this.config.periodicSyncInterval,
      })

      if (this.config.debugMode) {
        console.log(
          `[PWA Utils] Sincronização periódica registrada para: ${tag}`
        )
      }
    } catch (error) {
      console.error(
        `[PWA Utils] Erro ao registrar sincronização periódica para ${tag}:`,
        error
      )
    }
  }

  /**
   * Acionar sincronização em segundo plano
   */
  async triggerBackgroundSync(tag) {
    if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
      console.error('[PWA Utils] Background Sync não suportado')
      return false
    }

    try {
      // Garantir que temos uma referência ao service worker
      if (!this.swRegistration) {
        this.swRegistration = await navigator.serviceWorker.ready
      }

      // Registrar evento de sincronização
      await this.swRegistration.sync.register(tag)

      if (this.config.debugMode) {
        console.log(`[PWA Utils] Background Sync acionado para: ${tag}`)
      }

      return true
    } catch (error) {
      console.error('[PWA Utils] Erro ao acionar Background Sync:', error)
      return false
    }
  }

  /**
   * Verificar suporte a recursos PWA
   */
  checkFeatureSupport() {
    return {
      serviceWorker: 'serviceWorker' in navigator,
      caches: 'caches' in window,
      push: 'PushManager' in window,
      backgroundSync: 'SyncManager' in window,
      periodicSync: 'periodicSync' in (navigator.serviceWorker || {}),
      notification: 'Notification' in window,
      installPrompt: CSS.supports('display-mode', 'standalone'),
      offlineCapabilities: Boolean(navigator.serviceWorker && window.caches),
    }
  }

  /**
   * Notificar sobre atualização do service worker
   */
  notifyUpdate() {
    // Criar toast para notificar o usuário
    const toast = document.createElement('div')
    toast.className = 'pwa-update-toast'
    toast.innerHTML = `
      <div class="toast-content">
        <span>Nova versão disponível!</span>
        <button class="update-button">Atualizar</button>
      </div>
    `

    // Estilo do toast
    const style = document.createElement('style')
    style.textContent = `
      .pwa-update-toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #0066cc;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateY(150%);
        transition: transform 0.3s ease;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }
      
      .pwa-update-toast.active {
        transform: translateY(0);
      }
      
      .toast-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .update-button {
        background-color: white;
        color: #0066cc;
        border: none;
        border-radius: 4px;
        padding: 6px 12px;
        margin-left: 15px;
        cursor: pointer;
        font-weight: bold;
      }
    `

    // Adicionar ao DOM
    document.head.appendChild(style)
    document.body.appendChild(toast)

    // Mostrar toast após um pequeno delay
    setTimeout(() => {
      toast.classList.add('active')
    }, 100)

    // Configurar botão de atualização
    const updateButton = toast.querySelector('.update-button')
    updateButton.addEventListener('click', () => {
      // Remover toast
      toast.remove()
      style.remove()

      // Recarregar a página para ativar o novo service worker
      window.location.reload()
    })
  }

  /**
   * Salvar dados no cache IndexedDB para uso offline
   */
  async saveForOffline(storeName, data, key = null) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('celebra-offline-db', 1)

      request.onerror = function (event) {
        reject('Erro ao abrir banco de dados: ' + event.target.errorCode)
      }

      request.onupgradeneeded = function (event) {
        const db = event.target.result

        // Criar object store se não existir
        if (!db.objectStoreNames.contains(storeName)) {
          const options = key ? { keyPath: key } : { autoIncrement: true }
          db.createObjectStore(storeName, options)
        }
      }

      request.onsuccess = function (event) {
        const db = event.target.result

        try {
          // Garantir que o object store existe
          if (!db.objectStoreNames.contains(storeName)) {
            db.close()
            const newRequest = indexedDB.open(
              'celebra-offline-db',
              db.version + 1
            )

            newRequest.onupgradeneeded = function (event) {
              const newDb = event.target.result
              const options = key ? { keyPath: key } : { autoIncrement: true }
              newDb.createObjectStore(storeName, options)
            }

            newRequest.onsuccess = function (event) {
              const upgradeDb = event.target.result
              saveData(upgradeDb)
            }

            newRequest.onerror = function (event) {
              reject(
                'Erro ao atualizar banco de dados: ' + event.target.errorCode
              )
            }

            return
          }

          saveData(db)
        } catch (error) {
          reject(error)
        }
      }

      function saveData(db) {
        const transaction = db.transaction([storeName], 'readwrite')
        const store = transaction.objectStore(storeName)

        const request = store.put(data)

        request.onsuccess = function () {
          resolve(true)
        }

        request.onerror = function (event) {
          reject('Erro ao salvar dados: ' + event.target.errorCode)
        }

        transaction.oncomplete = function () {
          db.close()
        }
      }
    })
  }

  /**
   * Obter dados do cache IndexedDB
   */
  async getOfflineData(storeName, id = null) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('celebra-offline-db', 1)

      request.onerror = function (event) {
        reject('Erro ao abrir banco de dados: ' + event.target.errorCode)
      }

      request.onsuccess = function (event) {
        const db = event.target.result

        // Verificar se o object store existe
        if (!db.objectStoreNames.contains(storeName)) {
          resolve(id ? null : [])
          db.close()
          return
        }

        const transaction = db.transaction([storeName], 'readonly')
        const store = transaction.objectStore(storeName)

        let request

        if (id !== null) {
          // Buscar por ID específico
          request = store.get(id)

          request.onsuccess = function () {
            resolve(request.result)
          }
        } else {
          // Buscar todos os itens
          request = store.getAll()

          request.onsuccess = function () {
            resolve(request.result)
          }
        }

        request.onerror = function (event) {
          reject('Erro ao obter dados: ' + event.target.errorCode)
        }

        transaction.oncomplete = function () {
          db.close()
        }
      }
    })
  }

  /**
   * Solicitar permissão para notificações push
   */
  async requestPushPermission() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.error('[PWA Utils] Notificações push não suportadas')
      return false
    }

    // Verificar permissão atual
    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {
      console.warn(
        '[PWA Utils] Permissão de notificação já foi negada pelo usuário'
      )
      return false
    }

    try {
      // Solicitar permissão
      const permission = await Notification.requestPermission()

      if (permission === 'granted') {
        // Obter registration
        if (!this.swRegistration) {
          this.swRegistration = await navigator.serviceWorker.ready
        }

        // Inscrever para notificações push (substitua por sua chave pública real)
        const pushSubscription =
          await this.swRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array(
              'BEL-VF3JnGAg2uXMn28iukZFMq9hmBZzrBO5I7BUwEb-G6c7FMJCJvDGYxdE4kw5eOswnKAp3m-WKFcSh5rNnJE'
            ),
          })

        // Enviar assinatura para o servidor (implementar conforme necessário)
        if (this.config.debugMode) {
          console.log(
            '[PWA Utils] Assinatura de notificação push:',
            JSON.stringify(pushSubscription)
          )
        }

        return true
      } else {
        console.warn('[PWA Utils] Permissão de notificação negada pelo usuário')
        return false
      }
    } catch (error) {
      console.error(
        '[PWA Utils] Erro ao solicitar permissão de notificação:',
        error
      )
      return false
    }
  }

  /**
   * Converter Base64 URL para Uint8Array (para chave de aplicativo push)
   */
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }

    return outputArray
  }

  /**
   * Expor métodos úteis globalmente
   */
  exposePublicMethods() {
    // Métodos públicos para desenvolvedores
    window.CelebraPWA = {
      saveForOffline: this.saveForOffline.bind(this),
      getOfflineData: this.getOfflineData.bind(this),
      requestPushPermission: this.requestPushPermission.bind(this),
      triggerSync: this.triggerBackgroundSync.bind(this),
      isOnline: () => this.isOnline,
      checkFeatureSupport: this.checkFeatureSupport.bind(this),

      // Registrar ouvintes para eventos de rede
      onNetworkChange: (callback) => {
        window.addEventListener('network:online', callback)
        window.addEventListener('network:offline', callback)
      },

      // Registrar ouvinte para qualidade da rede
      onNetworkQuality: (callback) => {
        window.addEventListener('network:quality', callback)
      },
    }
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.pwaUtils = new PWAUtils()
})
