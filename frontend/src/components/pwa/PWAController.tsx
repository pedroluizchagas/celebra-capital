import React, { useState, useEffect } from 'react'
import './PWAController.css'

// Interfaces para o PWA
interface CelebraPWA {
  PWAUtils: {
    checkPWASupport: () => boolean
    checkPWAInstalled: () => boolean
    checkBeforeInstallPromptSupported: () => boolean
    checkPushSupported: () => boolean
    checkNotificationSupported: () => boolean
    checkSyncSupported: () => boolean
  }
  PWAInstallManager: {
    deferredPrompt: Event | null
    showInstallPrompt: () => Promise<boolean>
  }
  PushNotificationManager: {
    checkPermission: () => string
    requestPermission: () => Promise<string>
    isPushEnabled: () => boolean
    enablePush: () => Promise<boolean>
    sendTestNotification: (title: string, options: object) => Promise<void>
  }
  BackgroundSyncManager: {
    registerSync: (tag: string) => Promise<boolean>
    checkSyncStatus: () => {
      pending: boolean
      count: number
    }
  }
}

interface WindowWithPWA extends Window {
  CelebraPWA?: CelebraPWA
}

interface PWAControllerProps {
  position?: 'top' | 'bottom'
  showInstallButton?: boolean
  showNotificationButton?: boolean
  showSyncStatus?: boolean
  customClass?: string
}

const PWAController: React.FC<PWAControllerProps> = ({
  position = 'bottom',
  showInstallButton = true,
  showNotificationButton = true,
  showSyncStatus = true,
  customClass = '',
}) => {
  // Estado para controle dos recursos PWA
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [pwaSupported, setPwaSupported] = useState<boolean>(false)
  const [installSupported, setInstallSupported] = useState<boolean>(false)
  const [isInstalled, setIsInstalled] = useState<boolean>(false)
  const [installButtonVisible, setInstallButtonVisible] =
    useState<boolean>(false)

  const [notificationSupported, setNotificationSupported] =
    useState<boolean>(false)
  const [notificationStatus, setNotificationStatus] = useState<string>('')
  const [syncSupported, setSyncSupported] = useState<boolean>(false)
  const [syncStatus, setSyncStatus] = useState<{
    pending: boolean
    count: number
  }>({ pending: false, count: 0 })
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)

  useEffect(() => {
    checkFeatures()
    setupEventListeners()

    return () => {
      removeEventListeners()
    }
  }, [])

  const checkFeatures = () => {
    setIsLoading(true)

    const windowWithPWA = window as WindowWithPWA

    if (windowWithPWA.CelebraPWA && windowWithPWA.CelebraPWA.PWAUtils) {
      try {
        // Verificar suporte a PWA
        const pwaUtils = windowWithPWA.CelebraPWA.PWAUtils

        const pwaSupport = pwaUtils.checkPWASupport()
        setPwaSupported(pwaSupport)

        if (pwaSupport) {
          // Verificar se o app já está instalado
          const installed = pwaUtils.checkPWAInstalled()
          setIsInstalled(installed)

          // Verificar suporte ao prompt de instalação
          const installPromptSupported =
            pwaUtils.checkBeforeInstallPromptSupported()
          setInstallSupported(installPromptSupported)
          setInstallButtonVisible(installPromptSupported && !installed)

          // Verificar suporte a notificações
          const pushSupported =
            pwaUtils.checkPushSupported() &&
            pwaUtils.checkNotificationSupported()
          setNotificationSupported(pushSupported)

          if (
            pushSupported &&
            windowWithPWA.CelebraPWA.PushNotificationManager
          ) {
            const status =
              windowWithPWA.CelebraPWA.PushNotificationManager.checkPermission()
            setNotificationStatus(status)
          }

          // Verificar suporte a sincronização em segundo plano
          const bgSyncSupported = pwaUtils.checkSyncSupported()
          setSyncSupported(bgSyncSupported)

          if (
            bgSyncSupported &&
            windowWithPWA.CelebraPWA.BackgroundSyncManager
          ) {
            const status =
              windowWithPWA.CelebraPWA.BackgroundSyncManager.checkSyncStatus()
            setSyncStatus(status)
          }
        }
      } catch (error) {
        console.error('Erro ao verificar recursos PWA:', error)
        setPwaSupported(false)
      }
    } else {
      setPwaSupported(false)
    }

    setIsLoading(false)
  }

  const setupEventListeners = () => {
    window.addEventListener('online', handleNetworkChange)
    window.addEventListener('offline', handleNetworkChange)

    // Adicionar listeners para eventos PWA
    window.addEventListener('appinstalled', handleAppInstalled)

    // Atualizar status de sincronização quando forem realizadas alterações
    document.addEventListener('sync-status-changed', handleSyncStatusChanged)
  }

  const removeEventListeners = () => {
    window.removeEventListener('online', handleNetworkChange)
    window.removeEventListener('offline', handleNetworkChange)
    window.removeEventListener('appinstalled', handleAppInstalled)
    document.removeEventListener('sync-status-changed', handleSyncStatusChanged)
  }

  const handleNetworkChange = () => {
    setIsOnline(navigator.onLine)
    checkFeatures()
  }

  const handleAppInstalled = () => {
    setIsInstalled(true)
    setInstallButtonVisible(false)
  }

  const handleSyncStatusChanged = (e: Event) => {
    const windowWithPWA = window as WindowWithPWA
    if (
      syncSupported &&
      windowWithPWA.CelebraPWA &&
      windowWithPWA.CelebraPWA.BackgroundSyncManager
    ) {
      const status =
        windowWithPWA.CelebraPWA.BackgroundSyncManager.checkSyncStatus()
      setSyncStatus(status)
    }
  }

  const handleInstallClick = async () => {
    const windowWithPWA = window as WindowWithPWA
    if (
      windowWithPWA.CelebraPWA &&
      windowWithPWA.CelebraPWA.PWAInstallManager
    ) {
      try {
        const result =
          await windowWithPWA.CelebraPWA.PWAInstallManager.showInstallPrompt()
        if (result) {
          setIsInstalled(true)
          setInstallButtonVisible(false)
        }
      } catch (error) {
        console.error('Erro ao instalar o aplicativo:', error)
      }
    }
  }

  const handleEnableNotifications = async () => {
    const windowWithPWA = window as WindowWithPWA
    if (
      windowWithPWA.CelebraPWA &&
      windowWithPWA.CelebraPWA.PushNotificationManager
    ) {
      try {
        const permission =
          await windowWithPWA.CelebraPWA.PushNotificationManager.requestPermission()
        setNotificationStatus(permission)

        if (permission === 'granted') {
          const enabled =
            await windowWithPWA.CelebraPWA.PushNotificationManager.enablePush()
          console.log('Push notifications enabled:', enabled)
        }
      } catch (error) {
        console.error('Erro ao habilitar notificações:', error)
        setNotificationStatus('failed')
      }
    }
  }

  const getNotificationButtonText = () => {
    switch (notificationStatus) {
      case 'granted':
        return 'Notificações ativadas'
      case 'denied':
        return 'Notificações bloqueadas'
      case 'failed':
        return 'Falha ao ativar notificações'
      default:
        return 'Ativar notificações'
    }
  }

  const getNotificationButtonClass = () => {
    let baseClass = 'pwa-notification-button'
    switch (notificationStatus) {
      case 'granted':
        return `${baseClass} enabled`
      case 'denied':
        return `${baseClass} blocked`
      case 'failed':
        return `${baseClass} failed`
      default:
        return baseClass
    }
  }

  if (isLoading) {
    return (
      <div className={`pwa-controller ${position} ${customClass}`}>
        <div className="pwa-loading">Carregando recursos PWA...</div>
      </div>
    )
  }

  if (!pwaSupported) {
    return null
  }

  return (
    <div className={`pwa-controller ${position} ${customClass}`}>
      {showInstallButton && installButtonVisible && (
        <button className="pwa-install-button" onClick={handleInstallClick}>
          Instalar aplicativo
        </button>
      )}

      {showNotificationButton && notificationSupported && (
        <button
          className={getNotificationButtonClass()}
          onClick={handleEnableNotifications}
          disabled={
            notificationStatus === 'granted' || notificationStatus === 'denied'
          }
        >
          {getNotificationButtonText()}
        </button>
      )}

      {showSyncStatus && syncSupported && (
        <div className="pwa-sync-status">
          <span className={`network-status ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>

          {syncStatus.pending && (
            <span className="pending-sync">
              {syncStatus.count}{' '}
              {syncStatus.count === 1 ? 'item pendente' : 'itens pendentes'}{' '}
              para sincronização
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default PWAController
