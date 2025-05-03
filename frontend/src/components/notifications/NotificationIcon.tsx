import React, { useState, useEffect } from 'react'
import notificationService from '../../services/notificationService'
import NotificationDropdown from './NotificationDropdown'

const NotificationIcon: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationService.getNotifications()
        setUnreadCount(response.unread_count)
      } catch (error) {
        console.error('Erro ao buscar contagem de notificações:', error)
      }
    }

    fetchUnreadCount()

    // Atualizar a cada minuto
    const intervalId = setInterval(fetchUnreadCount, 60000)

    return () => clearInterval(intervalId)
  }, [])

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleDropdown}
        className="relative p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
        aria-label="Notificações"
      >
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
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationDropdown
        isOpen={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
      />
    </div>
  )
}

export default NotificationIcon
