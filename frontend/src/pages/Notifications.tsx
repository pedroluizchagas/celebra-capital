import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNotifications } from '../contexts/NotificationContext'
import { Tab } from '@headlessui/react'
import { useVirtualizer } from '@tanstack/react-virtual'
import Navbar from '../components/Navbar'
import notificationService from '../services/notificationService'

const NotificationsPage: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    settings,
    updateSettings,
    loadNotifications,
    registerForPushNotifications,
  } = useNotifications()

  const [activeTab, setActiveTab] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Ref para container da lista virtualizada
  const parentRef = React.useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await notificationService.getNotifications()
      // Atualizar estado local
      // notifications.current = data
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Pegar cor do tipo de notificação
  const getNotificationTypeClass = (type: string) => {
    switch (type) {
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'analysis':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'approval':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'rejection':
        return 'bg-pink-100 text-pink-800 border-pink-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Atualizar configurações
  const handleSettingChange = (setting: string, value: boolean) => {
    if (settings) {
      updateSettings({
        [setting]: value,
      })
    }
  }

  // Solicitar permissão para notificações push
  const handleEnablePushNotifications = () => {
    registerForPushNotifications()
  }

  // Aplicar filtro com base na tab ativa
  const filteredNotifications = useMemo(() => {
    return activeTab === 0
      ? notifications
      : notifications.filter((notification) => !notification.read)
  }, [notifications, activeTab])

  // Configurar virtualização da lista
  const rowVirtualizer = useVirtualizer({
    count: filteredNotifications.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // altura estimada por item
    overscan: 5, // número de itens a serem renderizados além da área visível
  })

  // Renderização condicional baseada no ícone do tipo de notificação
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
        )
      case 'success':
      case 'approval':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-green-600 dark:text-green-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
        )
      case 'warning':
      case 'analysis':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-yellow-600 dark:text-yellow-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
          </div>
        )
      case 'error':
      case 'rejection':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-red-600 dark:text-red-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </div>
        )
      default:
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              ></path>
            </svg>
          </div>
        )
    }
  }

  // Componente otimizado de notificação
  const NotificationItem = React.memo(
    ({ notification }: { notification: any }) => {
      const handleClick = () => {
        if (!notification.read) {
          markAsRead(notification.id)
        }
      }

      return (
        <div
          onClick={handleClick}
          className={`flex p-4 mb-4 rounded-lg shadow border border-gray-100 dark:border-gray-700 ${
            notification.read
              ? 'bg-white dark:bg-gray-800'
              : 'bg-blue-50 dark:bg-blue-900/20'
          } cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50`}
        >
          {getNotificationIcon(notification.notification_type)}
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <h3
                className={`text-sm font-medium ${
                  notification.read
                    ? 'text-gray-700 dark:text-gray-300'
                    : 'text-gray-900 dark:text-white'
                }`}
              >
                {notification.title}
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(notification.created_at)}
              </span>
            </div>
            <p
              className={`mt-1 text-sm ${
                notification.read
                  ? 'text-gray-500 dark:text-gray-400'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {notification.content}
            </p>
            {!notification.read && (
              <span className="inline-flex items-center mt-2 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                Nova
              </span>
            )}
          </div>
        </div>
      )
    }
  )

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <svg
        className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        ></path>
      </svg>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Nenhuma notificação
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
        Você não tem{' '}
        {activeTab === 1 ? 'notificações não lidas' : 'notificações'} no
        momento.
      </p>
    </div>
  )

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex p-4 rounded-lg shadow border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 animate-pulse"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div className="ml-4 flex-1">
            <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4 mb-4"></div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-2"></div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-5/6"></div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
            Notificações
          </h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setActiveTab(0)}
              className={`px-4 py-2 rounded-md ${
                activeTab === 0
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              } transition-colors`}
            >
              Todas
            </button>
            <button
              onClick={() => setActiveTab(1)}
              className={`px-4 py-2 rounded-md ${
                activeTab === 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              } transition-colors`}
            >
              Não lidas
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </button>
            <button
              onClick={markAllAsRead}
              disabled={!notifications.some((n) => !n.read)}
              className={`px-4 py-2 rounded-md ${
                notifications.some((n) => !n.read)
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
              } transition-colors`}
            >
              Marcar todas como lidas
            </button>
          </div>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : filteredNotifications.length === 0 ? (
          <EmptyState />
        ) : (
          <div
            ref={parentRef}
            className="overflow-auto"
            style={{ height: 'calc(100vh - 200px)' }}
          >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const notification = filteredNotifications[virtualRow.index]
                return (
                  <div
                    key={notification.id}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <NotificationItem notification={notification} />
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default NotificationsPage
