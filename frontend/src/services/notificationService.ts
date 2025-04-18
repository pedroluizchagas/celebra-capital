import api from './api'

export interface Notification {
  id: number
  recipient: number
  title: string
  content: string
  created_at: string
  read: boolean
  read_at: string | null
  notification_type: string
  notification_type_display: string
  recipient_email: string
  recipient_name: string
  extra_data: any
}

export interface UserNotificationSettings {
  id: number
  user: number
  email_notifications: boolean
  push_notifications: boolean
  proposal_status_updates: boolean
  document_requests: boolean
  proposal_approvals: boolean
  proposal_rejections: boolean
  system_notifications: boolean
  reminders: boolean
  push_subscription_json: string | null
}

const notificationService = {
  /**
   * Obter todas as notificações do usuário
   */
  getNotifications: async (status?: string): Promise<Notification[]> => {
    const params = status ? { status } : {}
    const response = await api.get('/notifications/', { params })
    return response.data
  },

  /**
   * Obter contagem de notificações não lidas
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/notifications/unread-count/')
    return response.data.count
  },

  /**
   * Marcar uma notificação como lida
   */
  markAsRead: async (notificationId: number): Promise<void> => {
    await api.post(`/notifications/${notificationId}/read/`)
  },

  /**
   * Marcar todas as notificações como lidas
   */
  markAllAsRead: async (): Promise<void> => {
    await api.post('/notifications/read-all/')
  },

  /**
   * Obter configurações de notificação do usuário
   */
  getSettings: async (): Promise<UserNotificationSettings> => {
    const response = await api.get('/notifications/settings/')
    return response.data
  },

  /**
   * Atualizar configurações de notificação do usuário
   */
  updateSettings: async (
    settings: Partial<UserNotificationSettings>
  ): Promise<UserNotificationSettings> => {
    const response = await api.patch('/notifications/settings/', settings)
    return response.data
  },

  /**
   * Salvar configuração de inscrição para notificações push
   */
  savePushSubscription: async (
    subscription: PushSubscription
  ): Promise<void> => {
    await api.post('/notifications/settings/push-subscription/', {
      subscription: JSON.stringify(subscription),
    })
  },

  /**
   * Enviar notificação de teste
   */
  sendTestNotification: async (): Promise<void> => {
    await api.post('/notifications/send-test/')
  },
}

export default notificationService
