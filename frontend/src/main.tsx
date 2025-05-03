import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ErrorBoundary } from 'react-error-boundary'

import App from './App'
import './styles/index.css'
import sentryService from './services/sentryService'
import { ErrorProvider } from './contexts/ErrorContext'
import { ErrorFallback } from './components/ErrorFallback'
import { AnalyticsPageTracker } from './components/analytics/PageTracker'

// Importar utilitários de performance e segurança
import { performanceMonitor } from './utils/performance'
import { initializeSecurity } from './utils/security'

// Inicializar Sentry no ambiente correto
const NODE_ENV = import.meta.env?.MODE || 'development'
sentryService.initSentry(NODE_ENV)

// Inicializar medidas de segurança
initializeSecurity()

// Registro do service worker para funcionalidades PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const registerServiceWorker = async () => {
      try {
        // Em produção, usamos o service worker normalmente
        if (import.meta.env.PROD) {
          const registration = await navigator.serviceWorker.register(
            '/service-worker.js',
            {
              scope: '/',
            }
          )

          console.log(
            'Service Worker registrado com sucesso:',
            registration.scope
          )

          // Verificar por atualizações do Service Worker
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            console.log('Novo Service Worker em instalação:', newWorker)

            // Notificar se houver nova versão disponível
            if (newWorker && navigator.serviceWorker.controller) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  console.log(
                    'Nova versão disponível! Recarregue para atualizar.'
                  )

                  // A notificação visual será tratada pelo pwa-utils.js
                }
              })
            }
          })
        } else {
          // Em desenvolvimento, podemos desabilitar ou usar um service worker de desenvolvimento
          console.log(
            'Service Worker desabilitado em ambiente de desenvolvimento'
          )
        }
      } catch (error) {
        console.error('Falha ao registrar Service Worker:', error)
      }
    }

    registerServiceWorker()
  })
}

// Configuração do client React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutos
    },
  },
})

// Registrar erros não tratados no analytics
window.addEventListener('error', (event) => {
  // Importar de forma lazy para evitar dependência circular
  import('./services/analytics').then(
    ({ analyticsService, AnalyticsEventType }) => {
      analyticsService.trackEvent(AnalyticsEventType.ERROR, {
        message: event.message,
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event?.error?.stack || 'Não disponível',
      })
    }
  )
})

// Registrar rejeições de promessas não tratadas
window.addEventListener('unhandledrejection', (event) => {
  // Importar de forma lazy para evitar dependência circular
  import('./services/analytics').then(
    ({ analyticsService, AnalyticsEventType }) => {
      analyticsService.trackEvent(AnalyticsEventType.ERROR, {
        message: event.reason?.message || 'Rejeição de promessa não tratada',
        stack: event.reason?.stack || 'Não disponível',
      })
    }
  )
})

// Componente para monitorar transições de página
function AppWithAnalytics() {
  return (
    <>
      <AnalyticsPageTracker />
      <App />
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ErrorProvider>
            <AppWithAnalytics />
          </ErrorProvider>
        </BrowserRouter>
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
