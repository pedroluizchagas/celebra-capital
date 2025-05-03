/**
 * Adaptadores para facilitar a migração gradual dos contextos para Zustand
 *
 * Este arquivo contém hooks que imitam a API dos contextos antigos,
 * mas usam as novas stores Zustand internamente.
 */

import useAuthStore from './useAuthStore'
import useErrorStore from './useErrorStore'
import useNotificationStore from './useNotificationStore'

/**
 * Versão Zustand do hook useAuth
 * Com a mesma interface do hook original baseado em contexto
 */
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, login, logout, checkAuth } =
    useAuthStore()

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  }
}

/**
 * Versão Zustand do hook useError
 * Com a mesma interface do hook original baseado em contexto
 */
export const useError = () => {
  const {
    error,
    apiErrors,
    formErrors,
    setError,
    setApiErrors,
    setFormErrors,
    addFormFieldError,
    clearErrors,
    clearApiErrors,
    clearFormErrors,
  } = useErrorStore()

  return {
    error,
    apiErrors,
    formErrors,
    setError,
    setApiErrors,
    setFormErrors,
    addFormFieldError,
    clearErrors,
    clearApiErrors,
    clearFormErrors,
  }
}

/**
 * Versão Zustand do hook useNotifications
 * Com a mesma interface do hook original baseado em contexto
 */
export const useNotifications = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    settings,
    markAsRead,
    markAllAsRead,
    loadNotifications,
    updateSettings,
    registerForPushNotifications,
  } = useNotificationStore()

  return {
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
}
