import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import notificationService, {
  Notification,
} from '../../services/notificationService'

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true)
      try {
        const response = await notificationService.getNotifications()
        setNotifications(response.results)
      } catch (error) {
        console.error('Erro ao buscar notificações:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const handleMarkAsRead = async (notification: Notification) => {
    if (!notification.isRead) {
      await notificationService.markAsRead(notification.id)

      // Atualizar o estado local
      setNotifications(
        notifications.map((n) =>
          n.id === notification.id ? { ...n, isRead: true } : n
        )
      )
    }

    if (notification.link) {
      navigate(notification.link)
    }
  }

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead()

    // Atualizar o estado local
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
  }

  const handleDeleteNotification = async (notificationId: string) => {
    await notificationService.deleteNotification(notificationId)

    // Atualizar o estado local
    setNotifications(notifications.filter((n) => n.id !== notificationId))
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-500 dark:text-green-300">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )
      case 'warning':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-yellow-500 dark:text-yellow-300">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        )
      case 'error':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-red-500 dark:text-red-300">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        )
      default:
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-500 dark:text-blue-300">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        )
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const filteredNotifications = notifications.filter(
    (notification) =>
      filter === 'all' || (filter === 'unread' && !notification.isRead)
  )

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Todas as Notificações
        </h3>
        <div className="flex items-center space-x-4">
          <div className="flex rounded-md shadow-sm">
            <button
              type="button"
              className={`py-2 px-4 text-sm font-medium rounded-l-lg ${
                filter === 'all'
                  ? 'bg-celebra-blue text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => setFilter('all')}
            >
              Todas
            </button>
            <button
              type="button"
              className={`py-2 px-4 text-sm font-medium rounded-r-lg ${
                filter === 'unread'
                  ? 'bg-celebra-blue text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
              onClick={() => setFilter('unread')}
            >
              Não Lidas
            </button>
          </div>
          <button
            onClick={handleMarkAllAsRead}
            className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg"
          >
            Marcar Todas como Lidas
          </button>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start p-4 animate-pulse">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full mr-4"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              Nenhuma notificação encontrada
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {filter === 'unread'
                ? 'Não há notificações não lidas no momento.'
                : 'Não há notificações no momento.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 flex items-start ${
                  !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                {getNotificationIcon(notification.type)}
                <div className="ml-4 flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {notification.message}
                  </p>
                  <div className="mt-2 flex space-x-3">
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Marcar como lida
                      </button>
                    )}
                    {notification.link && (
                      <button
                        onClick={() => navigate(notification.link!)}
                        className="text-xs text-green-600 dark:text-green-400 hover:underline"
                      >
                        Ver detalhes
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="text-xs text-red-600 dark:text-red-400 hover:underline"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationsPage
