import api from './api'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  isRead: boolean
  createdAt: string
  link?: string
}

export interface UserNotificationSettings {
  email_notifications: boolean
  push_notifications: boolean
  proposal_status_updates: boolean
  proposal_approvals: boolean
  proposal_rejections: boolean
  document_requests: boolean
  system_notifications: boolean
  reminders: boolean
  push_subscription_json?: string
}

interface NotificationResponse {
  results: Notification[]
  count: number
  unread_count: number
}

const notificationService = {
  /**
   * Obter todas as notificações do usuário
   */
  getNotifications: async (): Promise<NotificationResponse> => {
    try {
      // Em produção, chamar endpoint real
      const response = await api.get('/notifications/')
      return response.data
    } catch (error) {
      console.error('Erro ao obter notificações:', error)

      // Dados simulados para desenvolvimento
      return {
        results: [
          {
            id: '1',
            title: 'Nova proposta submetida',
            message: 'A proposta P-2023-421 foi submetida para análise',
            type: 'info',
            isRead: false,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            link: '/admin/proposals/P-2023-421',
          },
          {
            id: '2',
            title: 'Proposta aprovada',
            message: 'A proposta P-2023-418 foi aprovada com sucesso',
            type: 'success',
            isRead: false,
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            link: '/admin/proposals/P-2023-418',
          },
          {
            id: '3',
            title: 'Documentação pendente',
            message: 'A proposta P-2023-415 precisa de documentação adicional',
            type: 'warning',
            isRead: true,
            createdAt: new Date(
              Date.now() - 1 * 24 * 60 * 60 * 1000
            ).toISOString(),
            link: '/admin/proposals/P-2023-415',
          },
          {
            id: '4',
            title: 'Proposta rejeitada',
            message:
              'A proposta P-2023-410 foi rejeitada por falta de documentação',
            type: 'error',
            isRead: true,
            createdAt: new Date(
              Date.now() - 2 * 24 * 60 * 60 * 1000
            ).toISOString(),
            link: '/admin/proposals/P-2023-410',
          },
          {
            id: '5',
            title: 'Novo usuário cadastrado',
            message: 'Um novo usuário foi cadastrado na plataforma',
            type: 'info',
            isRead: true,
            createdAt: new Date(
              Date.now() - 3 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        ],
        count: 5,
        unread_count: 2,
      }
    }
  },

  /**
   * Obter configurações de notificação do usuário
   */
  getNotificationSettings: async (): Promise<UserNotificationSettings> => {
    try {
      const response = await api.get('/notifications/settings/')
      return response.data
    } catch (error) {
      console.error('Erro ao obter configurações de notificação:', error)

      // Configurações padrão para desenvolvimento
      return {
        email_notifications: true,
        push_notifications: false,
        proposal_status_updates: true,
        proposal_approvals: true,
        proposal_rejections: true,
        document_requests: true,
        system_notifications: true,
        reminders: true,
      }
    }
  },

  /**
   * Atualizar configurações de notificação
   */
  updateNotificationSettings: async (
    settings: Partial<UserNotificationSettings>
  ): Promise<UserNotificationSettings> => {
    try {
      const response = await api.patch('/notifications/settings/', settings)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar configurações de notificação:', error)

      // Simulação para desenvolvimento
      return {
        email_notifications: settings.email_notifications ?? true,
        push_notifications: settings.push_notifications ?? false,
        proposal_status_updates: settings.proposal_status_updates ?? true,
        proposal_approvals: settings.proposal_approvals ?? true,
        proposal_rejections: settings.proposal_rejections ?? true,
        document_requests: settings.document_requests ?? true,
        system_notifications: settings.system_notifications ?? true,
        reminders: settings.reminders ?? true,
      }
    }
  },

  /**
   * Marcar uma notificação como lida
   */
  markAsRead: async (notificationId: string): Promise<boolean> => {
    try {
      // Em produção, chamar endpoint real
      await api.patch(`/notifications/${notificationId}/read/`)
      return true
    } catch (error) {
      console.error(
        `Erro ao marcar notificação ${notificationId} como lida:`,
        error
      )
      // Simular sucesso para desenvolvimento
      return true
    }
  },

  /**
   * Marcar todas as notificações como lidas
   */
  markAllAsRead: async (): Promise<boolean> => {
    try {
      // Em produção, chamar endpoint real
      await api.post('/notifications/mark-all-read/')
      return true
    } catch (error) {
      console.error('Erro ao marcar todas notificações como lidas:', error)
      // Simular sucesso para desenvolvimento
      return true
    }
  },

  /**
   * Excluir uma notificação
   */
  deleteNotification: async (notificationId: string): Promise<boolean> => {
    try {
      // Em produção, chamar endpoint real
      await api.delete(`/notifications/${notificationId}/`)
      return true
    } catch (error) {
      console.error(`Erro ao excluir notificação ${notificationId}:`, error)
      // Simular sucesso para desenvolvimento
      return true
    }
  },

  /**
   * Registrar inscrição para notificações push
   */
  registerPushSubscription: async (
    subscriptionJson: string
  ): Promise<boolean> => {
    try {
      await api.post('/notifications/register-push/', {
        subscription_json: subscriptionJson,
      })
      return true
    } catch (error) {
      console.error('Erro ao registrar inscrição push:', error)
      return false
    }
  },
}

export default notificationService
