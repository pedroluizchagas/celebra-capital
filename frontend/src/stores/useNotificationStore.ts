import { create } from 'zustand'
import notificationService, {
  Notification as NotificationType,
  UserNotificationSettings,
} from '../services/notificationService'
import useAuthStore from './useAuthStore'

// Estender apenas a interface Window para não conflitar com a declaração centralizada
declare global {
  interface Window {
    __notificationInterval?: ReturnType<typeof setInterval>
  }
}

interface NotificationState {
  notifications: NotificationType[]
  unreadCount: number
  isLoading: boolean
  settings: UserNotificationSettings | null

  // Actions
  markAsRead: (id: number) => Promise<void>
  markAllAsRead: () => Promise<void>
  loadNotifications: () => Promise<void>
  loadUnreadCount: () => Promise<void>
  loadSettings: () => Promise<void>
  updateSettings: (settings: Partial<UserNotificationSettings>) => Promise<void>
  registerForPushNotifications: () => Promise<void>
  setNotifications: (notifications: NotificationType[]) => void
  setUnreadCount: (count: number) => void
  setIsLoading: (isLoading: boolean) => void
  setSettings: (settings: UserNotificationSettings | null) => void
  reset: () => void
}

const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  settings: null,

  loadNotifications: async () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) return

    set({ isLoading: true })
    try {
      const data = await notificationService.getNotifications()
      set({ notifications: data })
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  loadUnreadCount: async () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) return

    try {
      const count = await notificationService.getUnreadCount()
      set({ unreadCount: count })
    } catch (error) {
      console.error(
        'Erro ao carregar contagem de notificações não lidas:',
        error
      )
    }
  },

  loadSettings: async () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) return

    try {
      const settings = await notificationService.getSettings()
      set({ settings })
    } catch (error) {
      console.error('Erro ao carregar configurações de notificação:', error)
    }
  },

  markAsRead: async (id: number) => {
    try {
      await notificationService.markAsRead(id)

      // Atualizar estado local
      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification.id === id
            ? { ...notification, read: true, read_at: new Date().toISOString() }
            : notification
        ),
      }))

      // Atualizar contagem
      get().loadUnreadCount()
    } catch (error) {
      console.error(`Erro ao marcar notificação ${id} como lida:`, error)
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead()

      // Atualizar estado local
      set((state) => ({
        notifications: state.notifications.map((notification) => ({
          ...notification,
          read: true,
          read_at: notification.read_at || new Date().toISOString(),
        })),
        unreadCount: 0,
      }))
    } catch (error) {
      console.error('Erro ao marcar todas notificações como lidas:', error)
    }
  },

  updateSettings: async (
    updatedSettings: Partial<UserNotificationSettings>
  ) => {
    try {
      const newSettings = await notificationService.updateSettings(
        updatedSettings
      )
      set({ settings: newSettings })
    } catch (error) {
      console.error('Erro ao atualizar configurações de notificação:', error)
    }
  },

  registerForPushNotifications: async () => {
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
      const permission = await window.Notification.requestPermission()
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
      const { settings } = get()
      if (settings) {
        set({
          settings: {
            ...settings,
            push_notifications: true,
          },
        })
      }
    } catch (error) {
      console.error('Erro ao registrar para notificações push:', error)
    }
  },

  setNotifications: (notifications: NotificationType[]) => {
    set({ notifications })
  },

  setUnreadCount: (count: number) => {
    set({ unreadCount: count })
  },

  setIsLoading: (isLoading: boolean) => {
    set({ isLoading })
  },

  setSettings: (settings: UserNotificationSettings | null) => {
    set({ settings })
  },

  reset: () => {
    set({
      notifications: [],
      unreadCount: 0,
      settings: null,
    })
  },
}))

// Função auxiliar para converter chave VAPID para formato correto
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Configurar listeners para autenticação
useAuthStore.subscribe((state, prevState) => {
  // Quando o usuário estiver autenticado, carregue as notificações
  if (state.isAuthenticated && !prevState.isAuthenticated) {
    const notificationStore = useNotificationStore.getState()
    notificationStore.loadNotifications()
    notificationStore.loadUnreadCount()
    notificationStore.loadSettings()

    // Configurar intervalo para atualizar contagem
    const intervalId = setInterval(() => {
      notificationStore.loadUnreadCount()
    }, 60000) // A cada 1 minuto

    // Armazenar ID do intervalo para limpar depois
    window.__notificationInterval = intervalId
  }

  // Quando o usuário fizer logout, limpe o estado
  if (!state.isAuthenticated && prevState.isAuthenticated) {
    useNotificationStore.getState().reset()

    // Limpar intervalo se existir
    if (window.__notificationInterval) {
      clearInterval(window.__notificationInterval)
      window.__notificationInterval = undefined
    }
  }
})

export default useNotificationStore
