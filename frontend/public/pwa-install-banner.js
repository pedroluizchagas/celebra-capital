/**
 * Gerenciador de instalação do PWA da Celebra Capital
 * Implementa banner de instalação e controle do fluxo de instalação
 */

class PWAInstallManager {
  constructor() {
    // Evento de instalação
    this.deferredPrompt = null

    // Status de instalação
    this.installed = false

    // Elemento do banner de instalação
    this.installBanner = null

    // Elemento do botão de instalação
    this.installButton = null

    // Evento de disparo personalizado
    this.installEvent = new Event('pwaInstalled')

    // Configurações
    this.config = {
      minUsageBeforePrompt: 2, // Número mínimo de visitas antes de mostrar prompt
      daysBeforePromptAgain: 30, // Dias para esperar antes de mostrar novamente o prompt
      storageKey: 'celebra-pwa-install', // Chave para armazenar informações de instalação
    }

    // Inicializar
    this.init()
  }

  /**
   * Inicializar o gerenciador
   */
  init() {
    // Verificar se o PWA já está instalado
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) {
      this.installed = true
      this.dispatchInstalledEvent()
      return
    }

    // Capturar o evento beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevenir exibição automática do banner do navegador
      e.preventDefault()

      // Armazenar o evento para uso posterior
      this.deferredPrompt = e

      // Verificar se devemos mostrar o banner personalizado
      this.checkAndShowInstallBanner()
    })

    // Capturar evento de instalação concluída
    window.addEventListener('appinstalled', () => {
      this.installed = true
      this.deferredPrompt = null
      this.hideInstallBanner()
      this.saveInstallInfo(true)
      this.dispatchInstalledEvent()
      console.log('[PWA] Aplicativo instalado com sucesso')
    })

    // Inicializar controles de instalação quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', () => {
      this.setupButtons()
    })
  }

  /**
   * Configurar botões de instalação no DOM
   */
  setupButtons() {
    // Banner de instalação principal
    this.installBanner = document.getElementById('pwa-install-banner')

    // Botões de instalação espalhados pelo app
    const installButtons = document.querySelectorAll('[data-pwa-install]')

    // Configurar cada botão
    installButtons.forEach((button) => {
      button.addEventListener('click', () => this.showInstallPrompt())
      this.installButton = button

      // Ocultar botão se já estiver instalado
      if (this.installed) {
        button.style.display = 'none'
      }
    })

    // Configurar botão no banner principal, se existir
    if (this.installBanner) {
      const bannerButton = this.installBanner.querySelector('button')
      const closeButton = this.installBanner.querySelector('.close-banner')

      if (bannerButton) {
        bannerButton.addEventListener('click', () => this.showInstallPrompt())
      }

      if (closeButton) {
        closeButton.addEventListener('click', () => {
          this.hideInstallBanner()
          this.saveUserDismissed()
        })
      }
    }
  }

  /**
   * Verificar se devemos mostrar o banner de instalação
   */
  checkAndShowInstallBanner() {
    // Se não houver prompt, não mostrar nada
    if (!this.deferredPrompt) return

    // Se já estiver instalado, não mostrar nada
    if (this.installed) return

    // Verificar dados de instalação salvos
    const installData = this.getInstallInfo()

    // Se já foi instalado, não mostrar
    if (installData.installed) return

    // Se o usuário dispensou recentemente, não mostrar
    if (this.wasRecentlyDismissed(installData)) return

    // Incrementar contagem de visitas
    installData.visitCount = (installData.visitCount || 0) + 1
    this.saveInstallInfo(false, installData)

    // Verificar se atingiu o mínimo de visitas
    if (installData.visitCount >= this.config.minUsageBeforePrompt) {
      this.showInstallBanner()
    }
  }

  /**
   * Verificar se o banner foi dispensado recentemente
   */
  wasRecentlyDismissed(installData) {
    if (!installData.lastDismissed) return false

    const lastDismissed = new Date(installData.lastDismissed)
    const now = new Date()
    const daysSinceDismissed = Math.floor(
      (now - lastDismissed) / (1000 * 60 * 60 * 24)
    )

    return daysSinceDismissed < this.config.daysBeforePromptAgain
  }

  /**
   * Obter informações salvas sobre instalação
   */
  getInstallInfo() {
    try {
      const data = localStorage.getItem(this.config.storageKey)
      return data ? JSON.parse(data) : { visitCount: 0, installed: false }
    } catch (e) {
      console.error('[PWA] Erro ao ler dados de instalação:', e)
      return { visitCount: 0, installed: false }
    }
  }

  /**
   * Salvar informações de instalação
   */
  saveInstallInfo(installed, existingData = null) {
    try {
      const data = existingData || this.getInstallInfo()

      if (installed) {
        data.installed = true
      }

      localStorage.setItem(this.config.storageKey, JSON.stringify(data))
    } catch (e) {
      console.error('[PWA] Erro ao salvar dados de instalação:', e)
    }
  }

  /**
   * Salvar que o usuário dispensou o banner
   */
  saveUserDismissed() {
    try {
      const data = this.getInstallInfo()
      data.lastDismissed = new Date().toISOString()
      localStorage.setItem(this.config.storageKey, JSON.stringify(data))
    } catch (e) {
      console.error('[PWA] Erro ao salvar dispensa do banner:', e)
    }
  }

  /**
   * Mostrar o banner de instalação
   */
  showInstallBanner() {
    if (!this.installBanner) {
      // Criar banner dinamicamente se não existir
      this.createInstallBanner()
    }

    // Exibir o banner
    if (this.installBanner) {
      this.installBanner.classList.add('active')
    }
  }

  /**
   * Ocultar o banner de instalação
   */
  hideInstallBanner() {
    if (this.installBanner) {
      this.installBanner.classList.remove('active')
    }
  }

  /**
   * Criar banner de instalação dinamicamente
   */
  createInstallBanner() {
    // Verificar se já existe
    if (document.getElementById('pwa-install-banner')) return

    // Criar elementos
    const banner = document.createElement('div')
    banner.id = 'pwa-install-banner'
    banner.className = 'pwa-install-banner'

    // Adicionar conteúdo
    banner.innerHTML = `
      <div class="banner-content">
        <img src="/icons/pwa-192x192.png" alt="Celebra Capital" class="banner-icon">
        <div class="banner-text">
          <strong>Celebra Capital</strong>
          <span>Instale nossa plataforma para acesso rápido e offline</span>
        </div>
        <button class="install-button">Instalar</button>
        <button class="close-banner">&times;</button>
      </div>
    `

    // Adicionar estilos
    const style = document.createElement('style')
    style.textContent = `
      .pwa-install-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: #ffffff;
        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
        padding: 12px 16px;
        transform: translateY(100%);
        transition: transform 0.3s ease;
        z-index: 9999;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }
      
      .pwa-install-banner.active {
        transform: translateY(0);
      }
      
      .banner-content {
        display: flex;
        align-items: center;
        max-width: 960px;
        margin: 0 auto;
      }
      
      .banner-icon {
        width: 42px;
        height: 42px;
        margin-right: 12px;
      }
      
      .banner-text {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      
      .banner-text strong {
        font-size: 16px;
        color: #333;
      }
      
      .banner-text span {
        font-size: 14px;
        color: #666;
      }
      
      .install-button {
        background-color: #0066cc;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        margin: 0 10px;
        cursor: pointer;
        font-weight: bold;
      }
      
      .close-banner {
        background: none;
        border: none;
        font-size: 20px;
        color: #666;
        cursor: pointer;
        padding: 0 5px;
      }
      
      @media (max-width: 480px) {
        .banner-text span {
          display: none;
        }
      }
    `

    // Adicionar ao DOM
    document.head.appendChild(style)
    document.body.appendChild(banner)

    // Atualizar referência
    this.installBanner = banner

    // Configurar eventos
    const installButton = banner.querySelector('.install-button')
    const closeButton = banner.querySelector('.close-banner')

    if (installButton) {
      installButton.addEventListener('click', () => this.showInstallPrompt())
    }

    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.hideInstallBanner()
        this.saveUserDismissed()
      })
    }
  }

  /**
   * Mostrar o prompt de instalação
   */
  async showInstallPrompt() {
    if (!this.deferredPrompt) {
      console.log('[PWA] Prompt de instalação não disponível')

      // Mostrar instrução alternativa
      this.showManualInstallInstructions()
      return
    }

    // Mostrar o prompt de instalação
    this.deferredPrompt.prompt()

    try {
      // Aguardar resposta do usuário
      const choiceResult = await this.deferredPrompt.userChoice

      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] Usuário aceitou a instalação')
      } else {
        console.log('[PWA] Usuário recusou a instalação')
        this.saveUserDismissed()
      }
    } catch (error) {
      console.error('[PWA] Erro ao mostrar prompt de instalação:', error)
    }

    // Limpar o prompt
    this.deferredPrompt = null
  }

  /**
   * Mostrar instruções manuais de instalação
   */
  showManualInstallInstructions() {
    // Detectar navegador e sistema operacional
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isFirefox = navigator.userAgent.includes('Firefox')
    const isChrome = navigator.userAgent.includes('Chrome')
    const isSafari = navigator.userAgent.includes('Safari') && !isChrome

    let instructions = ''

    if (isIOS) {
      instructions =
        'Para instalar, toque no ícone de compartilhamento <strong>📤</strong> e selecione "Adicionar à Tela de Início".'
    } else if (isFirefox) {
      instructions =
        'Para instalar, toque nos três pontos <strong>⋮</strong> no canto superior direito e selecione "Instalar".'
    } else if (isChrome) {
      instructions =
        'Para instalar, toque nos três pontos <strong>⋮</strong> no canto superior direito e selecione "Instalar aplicativo".'
    } else if (isSafari) {
      instructions =
        'Para instalar, toque no ícone de compartilhamento <strong>📤</strong> e selecione "Adicionar à Tela de Início".'
    } else {
      instructions =
        'Para instalar, toque no menu do navegador e procure a opção "Instalar aplicativo" ou "Adicionar à Tela Inicial".'
    }

    // Criar modal
    const modal = document.createElement('div')
    modal.className = 'install-instructions-modal'
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Instalar Celebra Capital</h3>
          <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          <p>${instructions}</p>
          <div class="instruction-image">
            <img src="/icons/pwa-install-guide.png" alt="Instruções de instalação" onerror="this.style.display='none'">
          </div>
        </div>
      </div>
    `

    // Estilo
    const style = document.createElement('style')
    style.textContent = `
      .install-instructions-modal {
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
      }
      
      .modal-content {
        background-color: white;
        border-radius: 8px;
        max-width: 400px;
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
      
      .instruction-image {
        margin-top: 20px;
        text-align: center;
      }
      
      .instruction-image img {
        max-width: 100%;
        max-height: 200px;
        border: 1px solid #eee;
        border-radius: 4px;
      }
    `

    // Adicionar ao DOM
    document.head.appendChild(style)
    document.body.appendChild(modal)

    // Fechar ao clicar no botão
    const closeButton = modal.querySelector('.close-modal')
    closeButton.addEventListener('click', () => {
      document.body.removeChild(modal)
      document.head.removeChild(style)
    })

    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal)
        document.head.removeChild(style)
      }
    })
  }

  /**
   * Disparar evento personalizado
   */
  dispatchInstalledEvent() {
    window.dispatchEvent(this.installEvent)
  }

  /**
   * Verificar se o app está instalado
   */
  isInstalled() {
    return (
      this.installed ||
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    )
  }
}

// Criar e exportar uma instância global
window.PWAInstallManager = new PWAInstallManager()
