/**
 * Gerenciador de Notificações Push para o PWA da Celebra Capital
 * Gerencia o registro, exibição e interação com notificações push
 */

class PushNotificationManager {
  constructor() {
    // Configurações
    this.config = {
      serverEndpoint: '/api/push/register',
      topics: ['geral', 'propostas', 'taxas', 'avisos'],
      defaultIcon: '/icons/pwa-192x192.png',
      defaultBadge: '/icons/pwa-72x72.png',
      vapidPublicKey:
        'BEL-VF3JnGAg2uXMn28iukZFMq9hmBZzrBO5I7BUwEb-G6c7FMJCJvDGYxdE4kw5eOswnKAp3m-WKFcSh5rNnJE', // Substitua pela sua chave VAPID real
      debugMode: false,
    }

    // Referência do Service Worker
    this.swRegistration = null

    // Assinatura Push
    this.pushSubscription = null

    // Tópicos assinados
    this.subscribedTopics = []

    // Inicializar
    this.init()
  }

  /**
   * Inicializar o gerenciador
   */
  async init() {
    // Verificar suporte a notificações
    if (!('Notification' in window)) {
      console.warn('[Push] Notificações não são suportadas por este navegador')
      return
    }

    // Verificar suporte a Service Worker e Push API
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn(
        '[Push] Push notifications não são suportadas por este navegador'
      )
      return
    }

    // Configurar botões de permissão
    document.addEventListener('DOMContentLoaded', () => {
      this.setupPermissionButtons()
    })

    try {
      // Obter registro do service worker
      this.swRegistration = await navigator.serviceWorker.ready

      // Verificar assinatura existente
      const subscription =
        await this.swRegistration.pushManager.getSubscription()

      if (subscription) {
        this.pushSubscription = subscription
        this.loadSubscribedTopics()

        if (this.config.debugMode) {
          console.log(
            '[Push] Assinatura existente encontrada:',
            JSON.stringify(subscription)
          )
        }
      }
    } catch (error) {
      console.error('[Push] Erro ao inicializar gerenciador push:', error)
    }
  }

  /**
   * Carregar tópicos assinados do localStorage
   */
  loadSubscribedTopics() {
    try {
      const storedTopics = localStorage.getItem('celebra-push-topics')
      if (storedTopics) {
        this.subscribedTopics = JSON.parse(storedTopics)
      } else {
        // Se não tiver tópicos salvos, assume padrão
        this.subscribedTopics = ['geral']
        this.saveSubscribedTopics()
      }
    } catch (error) {
      console.error('[Push] Erro ao carregar tópicos:', error)
      this.subscribedTopics = ['geral']
    }
  }

  /**
   * Salvar tópicos assinados no localStorage
   */
  saveSubscribedTopics() {
    try {
      localStorage.setItem(
        'celebra-push-topics',
        JSON.stringify(this.subscribedTopics)
      )
    } catch (error) {
      console.error('[Push] Erro ao salvar tópicos:', error)
    }
  }

  /**
   * Configurar botões para solicitar permissão
   */
  setupPermissionButtons() {
    const buttons = document.querySelectorAll('[data-push-permission]')

    buttons.forEach((button) => {
      button.addEventListener('click', async () => {
        // Desabilitar botão durante o processo
        button.disabled = true

        try {
          const success = await this.requestPermission()

          // Atualizar UI com base no resultado
          if (success) {
            button.textContent = 'Notificações ativadas'
            button.classList.add('enabled')
          } else {
            button.textContent = 'Falha ao ativar notificações'
            button.classList.add('failed')
            setTimeout(() => {
              button.textContent = 'Ativar notificações'
              button.classList.remove('failed')
              button.disabled = false
            }, 3000)
          }
        } catch (error) {
          console.error('[Push] Erro ao solicitar permissão:', error)
          button.textContent = 'Erro ao ativar notificações'
          button.disabled = false
        }
      })

      // Atualizar estado inicial do botão
      this.updateButtonState(button)
    })

    // Configurar caixas de seleção para tópicos
    const topicCheckboxes = document.querySelectorAll('[data-push-topic]')

    topicCheckboxes.forEach((checkbox) => {
      const topic = checkbox.getAttribute('data-push-topic')

      // Definir estado inicial
      checkbox.checked = this.subscribedTopics.includes(topic)

      // Configurar evento de alteração
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          this.subscribeTopic(topic)
        } else {
          this.unsubscribeTopic(topic)
        }
      })
    })
  }

  /**
   * Atualizar estado dos botões de permissão
   */
  updateButtonState(button) {
    // Verificar permissão atual
    const permissionState = Notification.permission

    if (permissionState === 'granted' && this.pushSubscription) {
      button.textContent = 'Notificações ativadas'
      button.disabled = true
      button.classList.add('enabled')
    } else if (permissionState === 'denied') {
      button.textContent = 'Notificações bloqueadas'
      button.disabled = true
      button.classList.add('blocked')
    } else {
      button.textContent = 'Ativar notificações'
      button.disabled = false
      button.classList.remove('enabled', 'blocked', 'failed')
    }
  }

  /**
   * Solicitar permissão para notificações push
   */
  async requestPermission() {
    try {
      // Verificar permissão atual
      if (Notification.permission === 'granted') {
        // Já tem permissão, apenas verifica assinatura
        return await this.getOrCreateSubscription()
      }

      if (Notification.permission === 'denied') {
        // Mostrar instruções para desbloquear
        this.showInstructionsToUnblock()
        return false
      }

      // Solicitar permissão
      const permission = await Notification.requestPermission()

      if (permission === 'granted') {
        // Criar assinatura
        return await this.getOrCreateSubscription()
      } else {
        console.warn('[Push] Permissão para notificações negada')
        return false
      }
    } catch (error) {
      console.error('[Push] Erro ao solicitar permissão:', error)
      return false
    }
  }

  /**
   * Obter assinatura existente ou criar uma nova
   */
  async getOrCreateSubscription() {
    try {
      // Garantir que temos o registro do service worker
      if (!this.swRegistration) {
        this.swRegistration = await navigator.serviceWorker.ready
      }

      // Verificar se já existe assinatura
      let subscription = await this.swRegistration.pushManager.getSubscription()

      // Se não existe, criar nova assinatura
      if (!subscription) {
        subscription = await this.swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(
            this.config.vapidPublicKey
          ),
        })

        if (this.config.debugMode) {
          console.log(
            '[Push] Nova assinatura criada:',
            JSON.stringify(subscription)
          )
        }
      }

      // Armazenar assinatura
      this.pushSubscription = subscription

      // Registrar no servidor
      const registered = await this.registerSubscriptionOnServer(subscription)

      return registered
    } catch (error) {
      console.error('[Push] Erro ao criar assinatura push:', error)
      return false
    }
  }

  /**
   * Registrar assinatura no servidor
   */
  async registerSubscriptionOnServer(subscription) {
    try {
      // Preparar dados para o servidor
      const subscriptionData = {
        subscription: subscription.toJSON(),
        topics: this.subscribedTopics,
        userAgent: navigator.userAgent,
        language: navigator.language,
        timestamp: new Date().toISOString(),
      }

      // Enviar para o servidor
      const response = await fetch(this.config.serverEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionData),
      })

      if (response.ok) {
        const data = await response.json()

        if (this.config.debugMode) {
          console.log('[Push] Assinatura registrada no servidor:', data)
        }

        return true
      } else {
        console.error(
          '[Push] Erro ao registrar no servidor:',
          await response.text()
        )
        return false
      }
    } catch (error) {
      console.error('[Push] Erro ao enviar assinatura para o servidor:', error)
      return false
    }
  }

  /**
   * Converter Base64 URL para Uint8Array
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
   * Assinar um tópico específico
   */
  async subscribeTopic(topic) {
    if (!this.subscribedTopics.includes(topic)) {
      this.subscribedTopics.push(topic)
      this.saveSubscribedTopics()

      // Se já tem assinatura, atualizar no servidor
      if (this.pushSubscription) {
        await this.updateTopicsOnServer()
      }
    }
  }

  /**
   * Cancelar assinatura de um tópico
   */
  async unsubscribeTopic(topic) {
    if (topic === 'geral') {
      // Não permite cancelar o tópico geral
      console.warn('[Push] Não é possível cancelar o tópico geral')
      return
    }

    const index = this.subscribedTopics.indexOf(topic)
    if (index !== -1) {
      this.subscribedTopics.splice(index, 1)
      this.saveSubscribedTopics()

      // Se já tem assinatura, atualizar no servidor
      if (this.pushSubscription) {
        await this.updateTopicsOnServer()
      }
    }
  }

  /**
   * Atualizar tópicos no servidor
   */
  async updateTopicsOnServer() {
    try {
      const response = await fetch(`${this.config.serverEndpoint}/topics`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: this.pushSubscription.toJSON(),
          topics: this.subscribedTopics,
        }),
      })

      if (!response.ok) {
        console.error(
          '[Push] Erro ao atualizar tópicos no servidor:',
          await response.text()
        )
      }
    } catch (error) {
      console.error('[Push] Erro ao enviar atualização de tópicos:', error)
    }
  }

  /**
   * Cancelar todas as notificações
   */
  async unsubscribeAll() {
    if (!this.pushSubscription) return

    try {
      // Cancelar no navegador
      const success = await this.pushSubscription.unsubscribe()

      if (success) {
        // Notificar servidor
        await fetch(`${this.config.serverEndpoint}/unsubscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscription: this.pushSubscription.toJSON(),
          }),
        })

        // Limpar estado
        this.pushSubscription = null
        this.subscribedTopics = ['geral']
        this.saveSubscribedTopics()

        // Atualizar UI
        const buttons = document.querySelectorAll('[data-push-permission]')
        buttons.forEach((button) => this.updateButtonState(button))

        if (this.config.debugMode) {
          console.log('[Push] Assinatura cancelada com sucesso')
        }
      } else {
        console.error('[Push] Falha ao cancelar assinatura push')
      }
    } catch (error) {
      console.error('[Push] Erro ao cancelar assinatura push:', error)
    }
  }

  /**
   * Mostrar notificação local (não push)
   */
  async showLocalNotification(title, options = {}) {
    // Verificar permissão
    if (Notification.permission !== 'granted') {
      console.warn('[Push] Sem permissão para mostrar notificação')
      return false
    }

    // Verificar registro service worker
    if (!this.swRegistration) {
      try {
        this.swRegistration = await navigator.serviceWorker.ready
      } catch (error) {
        console.error(
          '[Push] Service worker não disponível para notificação:',
          error
        )
        return false
      }
    }

    // Definir opções padrão
    const notificationOptions = {
      body: options.body || 'Notificação da Celebra Capital',
      icon: options.icon || this.config.defaultIcon,
      badge: options.badge || this.config.defaultBadge,
      vibrate: options.vibrate || [100, 50, 100],
      data: {
        url: options.url || '/',
        ...options.data,
      },
      actions: options.actions || [
        {
          action: 'open',
          title: 'Ver detalhes',
        },
      ],
      tag: options.tag || 'default',
      requireInteraction: options.requireInteraction || false,
    }

    try {
      // Mostrar notificação
      await this.swRegistration.showNotification(title, notificationOptions)
      return true
    } catch (error) {
      console.error('[Push] Erro ao mostrar notificação:', error)
      return false
    }
  }

  /**
   * Mostrar instruções para desbloquear notificações
   */
  showInstructionsToUnblock() {
    // Criar modal com instruções
    const modal = document.createElement('div')
    modal.className = 'push-instruction-modal'

    // Detectar navegador para instruções específicas
    const isChrome = navigator.userAgent.includes('Chrome')
    const isFirefox = navigator.userAgent.includes('Firefox')
    const isSafari = navigator.userAgent.includes('Safari') && !isChrome

    let instructions = ''

    if (isChrome) {
      instructions = `
        <ol>
          <li>Clique no ícone de cadeado na barra de endereço</li>
          <li>Procure por "Notificações" nas configurações do site</li>
          <li>Mude a configuração para "Permitir"</li>
          <li>Recarregue a página</li>
        </ol>
      `
    } else if (isFirefox) {
      instructions = `
        <ol>
          <li>Clique no ícone de informações (i) na barra de endereço</li>
          <li>Clique em "Permissões"</li>
          <li>Encontre "Enviar Notificações" e marque "Permitir"</li>
          <li>Recarregue a página</li>
        </ol>
      `
    } else if (isSafari) {
      instructions = `
        <ol>
          <li>Abra as Preferências do Safari</li>
          <li>Vá para a aba "Websites"</li>
          <li>Selecione "Notificações" no menu lateral</li>
          <li>Encontre este site e selecione "Permitir"</li>
          <li>Recarregue a página</li>
        </ol>
      `
    } else {
      instructions = `
        <ol>
          <li>Clique no ícone de segurança na barra de endereço</li>
          <li>Encontre as configurações de notificação</li>
          <li>Altere para "Permitir"</li>
          <li>Recarregue a página</li>
        </ol>
      `
    }

    // Conteúdo do modal
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Desbloquear Notificações</h3>
          <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          <p>As notificações estão bloqueadas para este site. Siga as instruções abaixo para desbloquear:</p>
          ${instructions}
        </div>
        <div class="modal-footer">
          <button class="reload-button">Recarregar após desbloquear</button>
        </div>
      </div>
    `

    // Estilo do modal
    const style = document.createElement('style')
    style.textContent = `
      .push-instruction-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }
      
      .modal-content {
        background-color: white;
        border-radius: 8px;
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      }
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        border-bottom: 1px solid #eee;
      }
      
      .modal-header h3 {
        margin: 0;
        color: #0066cc;
      }
      
      .close-modal {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
      }
      
      .modal-body {
        padding: 20px;
      }
      
      .modal-body ol {
        margin: 20px 0;
        padding-left: 20px;
      }
      
      .modal-body li {
        margin-bottom: 10px;
      }
      
      .modal-footer {
        padding: 15px 20px;
        text-align: right;
        border-top: 1px solid #eee;
      }
      
      .reload-button {
        background-color: #0066cc;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        cursor: pointer;
      }
    `

    // Adicionar ao DOM
    document.head.appendChild(style)
    document.body.appendChild(modal)

    // Configurar eventos
    const closeButton = modal.querySelector('.close-modal')
    const reloadButton = modal.querySelector('.reload-button')

    closeButton.addEventListener('click', () => {
      document.body.removeChild(modal)
      document.head.removeChild(style)
    })

    reloadButton.addEventListener('click', () => {
      window.location.reload()
    })
  }
}

// Criar e exportar uma instância global
window.PushNotificationManager = new PushNotificationManager()
