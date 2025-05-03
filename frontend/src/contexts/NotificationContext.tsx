import React, { createContext, useContext, useState, useEffect } from 'react'
import notificationService, {
  Notification as NotificationType,
  UserNotificationSettings,
} from '../services/notificationService'
import websocketService from '../services/websocketService'
import { useAuth } from './AuthContext'

interface NotificationContextType {
  notifications: NotificationType[]
  unreadCount: number
  isLoading: boolean
  settings: UserNotificationSettings | null
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  loadNotifications: () => Promise<void>
  updateSettings: (settings: Partial<UserNotificationSettings>) => Promise<void>
  registerForPushNotifications: () => Promise<boolean>
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
)

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<NotificationType[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<UserNotificationSettings | null>(
    null
  )
  const { user } = useAuth()

  // Carregar notificações
  const loadNotifications = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const response = await notificationService.getNotifications()
      setNotifications(response.results)
      setUnreadCount(response.unread_count)
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Carregar configurações de notificação
  const loadSettings = async () => {
    if (!user) return

    try {
      const userSettings = await notificationService.getNotificationSettings()
      setSettings(userSettings)
    } catch (error) {
      console.error('Erro ao carregar configurações de notificações:', error)
    }
  }

  // Inicializar WebSocket para notificações em tempo real
  const initializeWebSocket = async () => {
    if (!user || !user.id) return

    try {
      await websocketService.connect(user.id.toString())

      // Escutar por novas notificações
      websocketService.on('notification', (message) => {
        // Adicionar nova notificação à lista
        const newNotification = message.notification
        setNotifications((prev) => [newNotification, ...prev])
        setUnreadCount((prev) => prev + 1)

        // Exibir notificação no navegador (se permitido)
        showBrowserNotification(newNotification)
      })

      // Reconectar quando o estado de conexão mudar
      websocketService.on('disconnected', () => {
        console.log(
          'Desconectado do serviço de notificações. Tentando reconectar...'
        )
      })
    } catch (error) {
      console.error('Erro ao inicializar WebSocket:', error)
    }
  }

  // Exibir notificação no navegador
  const showBrowserNotification = (notification: any) => {
    if (!('Notification' in window)) return

    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.content,
        icon: '/favicon.ico',
      })
    }
  }

  // Marcar notificação como lida
  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id)

      // Atualizar estado local
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        )
      )

      // Atualizar contador de não lidas
      setUnreadCount((prev) => Math.max(0, prev - 1))

      // Informar ao WebSocket que a notificação foi lida
      websocketService.sendMessage({
        type: 'mark_read',
        notification_id: id,
      })
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
    }
  }

  // Marcar todas notificações como lidas
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()

      // Atualizar estado local
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Erro ao marcar todas notificações como lidas:', error)
    }
  }

  // Atualizar configurações de notificação
  const updateSettings = async (
    newSettings: Partial<UserNotificationSettings>
  ) => {
    try {
      const updatedSettings =
        await notificationService.updateNotificationSettings(newSettings)
      setSettings(updatedSettings)
    } catch (error) {
      console.error('Erro ao atualizar configurações de notificações:', error)
    }
  }

  // Registrar para notificações push
  const registerForPushNotifications = async (): Promise<boolean> => {
    try {
      // Solicitar permissão para notificações do navegador
      if ('Notification' in window) {
        const permission = await Notification.requestPermission()

        if (permission === 'granted') {
          // Registrar service worker para push notifications
          const registration = await navigator.serviceWorker.register(
            '/service-worker.js'
          )

          // Obter assinatura push ou criar uma nova
          const pushSubscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
              process.env.REACT_APP_VAPID_PUBLIC_KEY || ''
            ),
          })

          // Enviar assinatura para o backend
          await notificationService.registerPushSubscription(
            JSON.stringify(pushSubscription)
          )

          return true
        }
      }
      return false
    } catch (error) {
      console.error('Erro ao registrar para notificações push:', error)
      return false
    }
  }

  // Converter chave VAPID para o formato correto
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
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

  // Efeito para carregar notificações e configurações quando o usuário muda
  useEffect(() => {
    if (user) {
      loadNotifications()
      loadSettings()
      initializeWebSocket()
    } else {
      // Fechar WebSocket quando o usuário sair
      websocketService.closeConnection()
      setNotifications([])
      setUnreadCount(0)
      setSettings(null)
    }

    // Limpar listener do WebSocket ao desmontar
    return () => {
      websocketService.off('notification', () => {})
      websocketService.off('disconnected', () => {})
    }
  }, [user])

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

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error(
      'useNotifications deve ser usado dentro de um NotificationProvider'
    )
  }
  return context
}

export default NotificationContext
