import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import * as Sentry from '@sentry/react'
import pushNotificationService from './services/pushNotificationService'

// Inicializar Sentry para monitoramento
Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  // Configuração simplificada para evitar erros de tipagem
  tracesSampleRate: 0.5,
})

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

// Registrar o Service Worker para PWA e notificações push
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    pushNotificationService
      .registerServiceWorker()
      .then((registration) => {
        console.log(
          'Service Worker registrado com sucesso:',
          registration.scope
        )

        // Verificar e oferecer atualizações ao usuário
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                // Há uma nova versão disponível
                if (
                  window.confirm(
                    'Nova versão disponível! Deseja atualizar agora?'
                  )
                ) {
                  // Notificar o service worker para pular a espera
                  newWorker.postMessage({ type: 'SKIP_WAITING' })
                  // Recarregar a página para usar o novo service worker
                  window.location.reload()
                }
              }
            })
          }
        })
      })
      .catch((error) => {
        console.error('Falha ao registrar o Service Worker:', error)
      })

    // Detectar quando o service worker é atualizado
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true
        window.location.reload()
      }
    })
  })
}
