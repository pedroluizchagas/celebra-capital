import React, { useState, useEffect } from 'react'
import { useNotifications } from '../contexts/NotificationContext'
import { Tab } from '@headlessui/react'

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

  useEffect(() => {
    // Recarregar notificações ao abrir a página
    loadNotifications()
  }, [loadNotifications])

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Notificações
      </h1>

      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-700 p-1 mb-8">
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              ${
                selected
                  ? 'bg-white dark:bg-gray-800 shadow text-celebra-blue'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-800'
              }`
            }
          >
            Todas as Notificações
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              ${
                selected
                  ? 'bg-white dark:bg-gray-800 shadow text-celebra-blue'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-800'
              }`
            }
          >
            Configurações
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Todas as Notificações ({notifications.length})
                </h2>
                {unreadCount > 0 && (
                  <button
                    className="text-sm text-celebra-blue hover:text-celebra-blue-dark"
                    onClick={() => markAllAsRead()}
                  >
                    Marcar todas como lidas
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600"
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
                  <p className="mt-4">Você não tem notificações ainda.</p>
                </div>
              ) : (
                <div>
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-200 dark:border-gray-700 ${
                        !notification.read
                          ? 'bg-blue-50 dark:bg-blue-900/20'
                          : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-start">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${getNotificationTypeClass(
                                notification.notification_type
                              )}`}
                            >
                              {notification.notification_type_display}
                            </span>
                            <h3 className="text-base font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </h3>
                          </div>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                            {notification.content}
                          </p>
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(notification.created_at)}
                          </div>
                        </div>
                        {!notification.read && (
                          <button
                            className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <span className="sr-only">Marcar como lida</span>
                            <svg
                              className="h-5 w-5"
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
                  ))}
                </div>
              )}
            </div>
          </Tab.Panel>
          <Tab.Panel>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Configurações de Notificação
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Escolha como e quando deseja receber notificações.
                </p>
              </div>

              <div className="p-4 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-base font-medium text-gray-900 dark:text-white">
                    Canais de Notificação
                  </h3>

                  {settings ? (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            Notificações por Email
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Receba notificações no seu email
                          </p>
                        </div>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none">
                          <input
                            type="checkbox"
                            id="toggle-email"
                            className="sr-only"
                            checked={settings.email_notifications}
                            onChange={(e) =>
                              handleSettingChange(
                                'email_notifications',
                                e.target.checked
                              )
                            }
                          />
                          <label
                            htmlFor="toggle-email"
                            className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                              settings.email_notifications
                                ? 'bg-celebra-blue'
                                : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <span
                              className={`block h-6 w-6 rounded-full bg-white transform transition-transform ${
                                settings.email_notifications
                                  ? 'translate-x-4'
                                  : 'translate-x-0'
                              }`}
                            ></span>
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            Notificações Push
                          </span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Receba notificações no navegador mesmo quando não
                            estiver usando o site
                          </p>
                        </div>
                        {settings.push_subscription_json ? (
                          <div className="relative inline-block w-10 mr-2 align-middle select-none">
                            <input
                              type="checkbox"
                              id="toggle-push"
                              className="sr-only"
                              checked={settings.push_notifications}
                              onChange={(e) =>
                                handleSettingChange(
                                  'push_notifications',
                                  e.target.checked
                                )
                              }
                            />
                            <label
                              htmlFor="toggle-push"
                              className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                                settings.push_notifications
                                  ? 'bg-celebra-blue'
                                  : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                            >
                              <span
                                className={`block h-6 w-6 rounded-full bg-white transform transition-transform ${
                                  settings.push_notifications
                                    ? 'translate-x-4'
                                    : 'translate-x-0'
                                }`}
                              ></span>
                            </label>
                          </div>
                        ) : (
                          <button
                            onClick={handleEnablePushNotifications}
                            className="px-3 py-1 text-xs font-medium text-white bg-celebra-blue rounded-md hover:bg-celebra-blue-dark"
                          >
                            Ativar Notificações Push
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                      Carregando configurações...
                    </div>
                  )}
                </div>

                {settings && (
                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                    <h3 className="text-base font-medium text-gray-900 dark:text-white">
                      Tipos de Notificação
                    </h3>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Atualizações de Status da Proposta
                      </span>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          id="toggle-status"
                          className="sr-only"
                          checked={settings.proposal_status_updates}
                          onChange={(e) =>
                            handleSettingChange(
                              'proposal_status_updates',
                              e.target.checked
                            )
                          }
                        />
                        <label
                          htmlFor="toggle-status"
                          className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                            settings.proposal_status_updates
                              ? 'bg-celebra-blue'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`block h-6 w-6 rounded-full bg-white transform transition-transform ${
                              settings.proposal_status_updates
                                ? 'translate-x-4'
                                : 'translate-x-0'
                            }`}
                          ></span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Solicitações de Documentos
                      </span>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          id="toggle-document"
                          className="sr-only"
                          checked={settings.document_requests}
                          onChange={(e) =>
                            handleSettingChange(
                              'document_requests',
                              e.target.checked
                            )
                          }
                        />
                        <label
                          htmlFor="toggle-document"
                          className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                            settings.document_requests
                              ? 'bg-celebra-blue'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`block h-6 w-6 rounded-full bg-white transform transition-transform ${
                              settings.document_requests
                                ? 'translate-x-4'
                                : 'translate-x-0'
                            }`}
                          ></span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Aprovações de Proposta
                      </span>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          id="toggle-approval"
                          className="sr-only"
                          checked={settings.proposal_approvals}
                          onChange={(e) =>
                            handleSettingChange(
                              'proposal_approvals',
                              e.target.checked
                            )
                          }
                        />
                        <label
                          htmlFor="toggle-approval"
                          className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                            settings.proposal_approvals
                              ? 'bg-celebra-blue'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`block h-6 w-6 rounded-full bg-white transform transition-transform ${
                              settings.proposal_approvals
                                ? 'translate-x-4'
                                : 'translate-x-0'
                            }`}
                          ></span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Rejeições de Proposta
                      </span>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          id="toggle-rejection"
                          className="sr-only"
                          checked={settings.proposal_rejections}
                          onChange={(e) =>
                            handleSettingChange(
                              'proposal_rejections',
                              e.target.checked
                            )
                          }
                        />
                        <label
                          htmlFor="toggle-rejection"
                          className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                            settings.proposal_rejections
                              ? 'bg-celebra-blue'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`block h-6 w-6 rounded-full bg-white transform transition-transform ${
                              settings.proposal_rejections
                                ? 'translate-x-4'
                                : 'translate-x-0'
                            }`}
                          ></span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Notificações do Sistema
                      </span>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          id="toggle-system"
                          className="sr-only"
                          checked={settings.system_notifications}
                          onChange={(e) =>
                            handleSettingChange(
                              'system_notifications',
                              e.target.checked
                            )
                          }
                        />
                        <label
                          htmlFor="toggle-system"
                          className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                            settings.system_notifications
                              ? 'bg-celebra-blue'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`block h-6 w-6 rounded-full bg-white transform transition-transform ${
                              settings.system_notifications
                                ? 'translate-x-4'
                                : 'translate-x-0'
                            }`}
                          ></span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Lembretes
                      </span>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          id="toggle-reminder"
                          className="sr-only"
                          checked={settings.reminders}
                          onChange={(e) =>
                            handleSettingChange('reminders', e.target.checked)
                          }
                        />
                        <label
                          htmlFor="toggle-reminder"
                          className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                            settings.reminders
                              ? 'bg-celebra-blue'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`block h-6 w-6 rounded-full bg-white transform transition-transform ${
                              settings.reminders
                                ? 'translate-x-4'
                                : 'translate-x-0'
                            }`}
                          ></span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}

export default NotificationsPage
