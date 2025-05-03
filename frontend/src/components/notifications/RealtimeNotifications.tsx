import React, { useEffect, useState } from 'react'
import { useNotifications } from '../../contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

const RealtimeNotifications: React.FC = () => {
  const { notifications, markAsRead } = useNotifications()
  const { user } = useAuth()
  const [visibleNotification, setVisibleNotification] = useState<any | null>(
    null
  )
  const [isShowing, setIsShowing] = useState(false)

  // Monitorar notificações novas e exibi-las em tempo real
  useEffect(() => {
    if (!notifications.length || !user) return

    // Encontrar a notificação mais recente não lida
    const latestUnread = notifications.find((n) => !n.isRead)

    if (latestUnread && !isShowing) {
      setVisibleNotification(latestUnread)
      setIsShowing(true)

      // Esconder a notificação após 5 segundos
      const timer = setTimeout(() => {
        setIsShowing(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [notifications, isShowing, user])

  // Lidar com o clique na notificação
  const handleNotificationClick = () => {
    if (!visibleNotification) return

    // Marcar como lida
    markAsRead(visibleNotification.id)

    // Redirecionar se tiver link
    if (visibleNotification.link) {
      window.location.href = visibleNotification.link
    }

    // Fechar a notificação
    setIsShowing(false)
  }

  // Fechar a notificação
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsShowing(false)
  }

  // Se não houver notificação visível, não renderizar nada
  if (!isShowing || !visibleNotification) return null

  return (
    <AnimatePresence>
      {isShowing && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="fixed top-5 right-5 z-50 w-96 max-w-full shadow-lg"
          onClick={handleNotificationClick}
        >
          <div
            className={`p-4 rounded-lg flex items-start cursor-pointer ${getNotificationBgColor(
              visibleNotification.type
            )}`}
          >
            {/* Ícone baseado no tipo */}
            <div className="mr-3 flex-shrink-0">
              {getNotificationIcon(visibleNotification.type)}
            </div>

            {/* Conteúdo */}
            <div className="flex-grow">
              <h4 className="font-semibold mb-1">
                {visibleNotification.title}
              </h4>
              <p className="text-sm">{visibleNotification.message}</p>
              {visibleNotification.link && (
                <p className="text-xs mt-1 underline">Clique para ver mais</p>
              )}
            </div>

            {/* Botão de fechar */}
            <button
              onClick={handleClose}
              className="ml-3 text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Obter cor de fundo baseada no tipo de notificação
const getNotificationBgColor = (type: string): string => {
  switch (type) {
    case 'success':
      return 'bg-green-100 border-l-4 border-green-500 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300'
    case 'warning':
      return 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-300'
    case 'error':
      return 'bg-red-100 border-l-4 border-red-500 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300'
    case 'info':
    default:
      return 'bg-blue-100 border-l-4 border-blue-500 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300'
  }
}

// Obter ícone baseado no tipo de notificação
const getNotificationIcon = (type: string): JSX.Element => {
  switch (type) {
    case 'success':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-green-600 dark:text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )
    case 'warning':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      )
    case 'error':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-red-600 dark:text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      )
    case 'info':
    default:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-blue-600 dark:text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )
  }
}

export default RealtimeNotifications
