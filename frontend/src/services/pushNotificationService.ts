import api from './api'
import { createErrorHandler } from './errorHandler'

const errorHandler = createErrorHandler()

// Converter chave pública base64 para Uint8Array para uso com a Web Push API
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

// Verificar se o navegador suporta notificações push
function isPushNotificationSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window
}

// Verificar se as notificações estão habilitadas
async function areNotificationsEnabled() {
  if (!isPushNotificationSupported()) {
    return false
  }

  try {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  } catch (error) {
    console.error('Erro ao verificar permissão de notificação:', error)
    return false
  }
}

// Registrar service worker
async function registerServiceWorker() {
  try {
    const registration = await navigator.serviceWorker.register(
      '/service-worker.js'
    )
    console.log('Service Worker registrado com sucesso:', registration)
    return registration
  } catch (error) {
    console.error('Erro ao registrar Service Worker:', error)
    throw error
  }
}

// Solicitar permissão para enviar notificações
async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      throw new Error('Permissão de notificação não concedida')
    }
    return true
  } catch (error) {
    console.error('Erro ao solicitar permissão de notificação:', error)
    throw error
  }
}

// Obter chave pública VAPID do servidor
async function getVapidPublicKey() {
  try {
    const response = await api.get('/notifications/vapid-public-key/')
    return response.data.vapid_public_key
  } catch (error) {
    errorHandler.handleApiError(error)
    throw new Error('Não foi possível obter a chave pública VAPID')
  }
}

// Inscrever para receber notificações push
async function subscribeToPushNotifications(userId: number) {
  if (!isPushNotificationSupported()) {
    throw new Error('Este navegador não suporta notificações push')
  }

  try {
    // 1. Solicitar permissão
    await requestNotificationPermission()

    // 2. Registrar service worker
    const registration = await registerServiceWorker()

    // 3. Obter chave pública VAPID
    const vapidPublicKey = await getVapidPublicKey()

    // 4. Converter chave para formato correto
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)

    // 5. Obter inscrição atual ou criar nova
    let subscription = await registration.pushManager.getSubscription()

    // 6. Se não houver inscrição, criar uma nova
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      })
    }

    // 7. Enviar detalhes da inscrição para o servidor
    await api.post('/notifications/register-push/', {
      subscription: JSON.stringify(subscription),
      user_id: userId,
    })

    return subscription
  } catch (error) {
    console.error('Erro ao inscrever para notificações push:', error)
    errorHandler.setError('Não foi possível ativar as notificações push')
    throw error
  }
}

// Cancelar inscrição de notificações push
async function unsubscribeFromPushNotifications() {
  if (!isPushNotificationSupported()) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      // Informar servidor sobre cancelamento
      await api.post('/notifications/unregister-push/', {
        subscription: JSON.stringify(subscription),
      })

      // Cancelar inscrição no navegador
      await subscription.unsubscribe()
      return true
    }

    return false
  } catch (error) {
    console.error('Erro ao cancelar inscrição de notificações push:', error)
    throw error
  }
}

// Verificar status da inscrição
async function checkPushSubscriptionStatus() {
  if (!isPushNotificationSupported()) {
    return { subscribed: false, supported: false }
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    return {
      subscribed: !!subscription,
      supported: true,
      subscription: subscription,
    }
  } catch (error) {
    console.error('Erro ao verificar status da inscrição push:', error)
    return { subscribed: false, supported: true, error }
  }
}

// Obter configurações de notificação do usuário
async function getUserNotificationSettings() {
  try {
    const response = await api.get('/notifications/settings/')
    return response.data
  } catch (error) {
    errorHandler.handleApiError(error)
    throw new Error('Não foi possível obter as configurações de notificação')
  }
}

// Atualizar configurações de notificação do usuário
async function updateUserNotificationSettings(settings: any) {
  try {
    const response = await api.post('/notifications/settings/', settings)
    return response.data
  } catch (error) {
    errorHandler.handleApiError(error)
    throw new Error(
      'Não foi possível atualizar as configurações de notificação'
    )
  }
}

// Enviar uma notificação de teste
async function sendTestNotification() {
  try {
    await api.post('/notifications/send-test/')
    return true
  } catch (error) {
    errorHandler.handleApiError(error)
    throw new Error('Não foi possível enviar notificação de teste')
  }
}

// Exibir uma notificação local (não via push, apenas no navegador)
function showLocalNotification(title: string, options = {}) {
  if (!('Notification' in window)) {
    console.error('Este navegador não suporta notificações')
    return
  }

  if (Notification.permission === 'granted') {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, options)
    })
  }
}

const pushNotificationService = {
  isPushNotificationSupported,
  areNotificationsEnabled,
  registerServiceWorker,
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  checkPushSubscriptionStatus,
  getUserNotificationSettings,
  updateUserNotificationSettings,
  sendTestNotification,
  showLocalNotification,
}

export default pushNotificationService
