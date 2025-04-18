import React, { useState } from 'react'
import { useNotifications } from '../contexts/NotificationContext'
import { Link } from 'react-router-dom'

const NotificationIcon: React.FC = () => {
  const { unreadCount, notifications, markAsRead, markAllAsRead } =
    useNotifications()
  const [showDropdown, setShowDropdown] = useState(false)

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown)
  }

  const handleMarkAsRead = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    markAsRead(id)
  }

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.preventDefault()
    markAllAsRead()
  }

  // Formatar data relativa (ex: "há 5 minutos")
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.round(diffMs / 1000)
    const diffMin = Math.round(diffSec / 60)
    const diffHour = Math.round(diffMin / 60)
    const diffDay = Math.round(diffHour / 24)

    if (diffSec < 60) return `Agora mesmo`
    if (diffMin < 60)
      return `Há ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`
    if (diffHour < 24)
      return `Há ${diffHour} ${diffHour === 1 ? 'hora' : 'horas'}`
    if (diffDay < 30) return `Há ${diffDay} ${diffDay === 1 ? 'dia' : 'dias'}`

    return date.toLocaleDateString('pt-BR')
  }

  // Pegar cor do tipo de notificação
  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'info':
        return 'bg-blue-100 text-blue-800'
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'analysis':
        return 'bg-purple-100 text-purple-800'
      case 'approval':
        return 'bg-emerald-100 text-emerald-800'
      case 'rejection':
        return 'bg-pink-100 text-pink-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Pegar ícone do tipo de notificação
  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'info':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        )
      case 'success':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        )
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        )
      case 'error':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        )
      case 'analysis':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 2a8 8 0 00-8 8c0 1.42.37 2.79 1.07 4l-.07.06a1 1 0 00.26 1.4 1 1 0 001.4-.26L5 14.94c1.21.7 2.58 1.06 4 1.06a8 8 0 000-16zm-1 11a1 1 0 112 0v1a1 1 0 11-2 0v-1zm2-7.25a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0v-4.5z"
              clipRule="evenodd"
            />
          </svg>
        )
      case 'approval':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        )
      case 'rejection':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        )
    }
  }

  return (
    <div className="relative">
      <button
        className="p-1 rounded-full text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-celebra-blue"
        onClick={toggleDropdown}
      >
        <span className="sr-only">Ver notificações</span>
        <svg
          className="h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Notificações
              </h3>
              {unreadCount > 0 && (
                <button
                  className="text-xs text-celebra-blue hover:text-celebra-blue-dark"
                  onClick={handleMarkAllAsRead}
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  Nenhuma notificação disponível
                </div>
              ) : (
                notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`flex-shrink-0 p-1 rounded-full ${getNotificationTypeColor(
                          notification.notification_type
                        )}`}
                      >
                        {getNotificationTypeIcon(
                          notification.notification_type
                        )}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {notification.content}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatRelativeTime(notification.created_at)}
                        </p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          className="ml-2 p-1 text-xs text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          <span className="sr-only">Marcar como lida</span>
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700">
              <Link
                to="/notifications"
                className="block px-4 py-2 text-sm text-center text-celebra-blue hover:text-celebra-blue-dark"
                onClick={() => setShowDropdown(false)}
              >
                Ver todas as notificações
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationIcon
