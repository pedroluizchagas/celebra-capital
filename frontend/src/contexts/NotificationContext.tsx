import React, { createContext, useContext, useState, useEffect } from 'react'
import notificationService, {
  Notification,
  UserNotificationSettings,
} from '../services/notificationService'
import { useAuth } from './AuthContext'

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  settings: UserNotificationSettings | null
  markAsRead: (id: number) => Promise<void>
  markAllAsRead: () => Promise<void>
  loadNotifications: () => Promise<void>
  updateSettings: (settings: Partial<UserNotificationSettings>) => Promise<void>
  registerForPushNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error(
      'useNotifications deve ser usado dentro de um NotificationProvider'
    )
  }
  return context
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<UserNotificationSettings | null>(
    null
  )

  // Carregar notificações quando o usuário estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications()
      loadUnreadCount()
      loadSettings()
    } else {
      setNotifications([])
      setUnreadCount(0)
      setSettings(null)
    }
  }, [isAuthenticated])

  // Atualizar contagem de não lidas a cada 1 minuto
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(loadUnreadCount, 60000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  const loadNotifications = async () => {
    if (!isAuthenticated) return
    setIsLoading(true)
    try {
      const data = await notificationService.getNotifications()
      setNotifications(data)
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUnreadCount = async () => {
    if (!isAuthenticated) return
    try {
      const count = await notificationService.getUnreadCount()
      setUnreadCount(count)
    } catch (error) {
      console.error(
        'Erro ao carregar contagem de notificações não lidas:',
        error
      )
    }
  }

  const loadSettings = async () => {
    if (!isAuthenticated) return
    try {
      const settings = await notificationService.getSettings()
      setSettings(settings)
    } catch (error) {
      console.error('Erro ao carregar configurações de notificação:', error)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id)

      // Atualizar estado local
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, read: true, read_at: new Date().toISOString() }
            : notification
        )
      )

      // Atualizar contagem
      loadUnreadCount()
    } catch (error) {
      console.error(`Erro ao marcar notificação ${id} como lida:`, error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()

      // Atualizar estado local
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
          read_at: notification.read_at || new Date().toISOString(),
        }))
      )

      // Atualizar contagem
      setUnreadCount(0)
    } catch (error) {
      console.error('Erro ao marcar todas notificações como lidas:', error)
    }
  }

  const updateSettings = async (
    updatedSettings: Partial<UserNotificationSettings>
  ) => {
    try {
      const newSettings = await notificationService.updateSettings(
        updatedSettings
      )
      setSettings(newSettings)
    } catch (error) {
      console.error('Erro ao atualizar configurações de notificação:', error)
    }
  }

  const registerForPushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Notificações push não são suportadas neste navegador')
      return
    }

    try {
      // Registrar service worker
      const registration = await navigator.serviceWorker.register(
        '/service-worker.js'
      )

      // Verificar permissão
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        console.warn('Permissão para notificações negada')
        return
      }

      // Obter a chave pública do ambiente do Vite (definida em .env.local)
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''

      // Criar inscrição de push
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      })

      // Salvar inscrição no servidor
      await notificationService.savePushSubscription(pushSubscription)

      // Atualizar configurações locais
      if (settings) {
        setSettings({
          ...settings,
          push_notifications: true,
        })
      }
    } catch (error) {
      console.error('Erro ao registrar para notificações push:', error)
    }
  }

  // Função auxiliar para converter chave VAPID para formato correto
  function urlBase64ToUint8Array(base64String: string) {
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

  const value = {
    notifications,
    unreadCount,
    isLoading,
    settings,
    markAsRead,
    markAllAsRead,
    loadNotifications,
    updateSettings,
    registerForPushNotifications,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export default NotificationContext
