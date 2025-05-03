import { useCallback, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import useAuthStore from '../stores/useAuthStore'

interface AnalyticsEventProps {
  [key: string]: any
}

/**
 * Hook para registro de eventos de analytics
 *
 * @returns Métodos para rastreamento de eventos
 */
export const useAnalytics = () => {
  const location = useLocation()
  const { user } = useAuthStore()

  /**
   * Registra um evento de analytics
   *
   * @param category Categoria do evento (ex: 'proposta', 'documento', 'usuario')
   * @param action Ação específica (ex: 'proposta_iniciada', 'documento_enviado')
   * @param properties Propriedades adicionais do evento
   */
  const trackEvent = useCallback(
    (
      category: string,
      action: string,
      properties: AnalyticsEventProps = {}
    ) => {
      // Propriedades básicas comuns a todos os eventos
      const baseProperties = {
        timestamp: new Date().toISOString(),
        page_path: location.pathname,
        page_url: window.location.href,
        user_id: user?.id,
        session_id: sessionStorage.getItem('session_id'),
      }

      // Combina as propriedades base com as específicas
      const eventData = {
        event_category: category,
        event_action: action,
        ...baseProperties,
        ...properties,
      }

      // Envio para Google Analytics (se configurado)
      if (typeof window.gtag === 'function') {
        window.gtag('event', action, eventData)
      }

      // Envio para nossa API de analytics
      try {
        fetch('/api/analytics/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify({
            category,
            action,
            properties: eventData,
          }),
        })
      } catch (error) {
        console.error('Erro ao enviar evento de analytics:', error)
      }

      // Log para debug em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics]', category, action, eventData)
      }
    },
    [location, user]
  )

  /**
   * Registra visualização de página
   */
  const trackPageView = useCallback(() => {
    trackEvent('navegacao', 'pagina_visualizada', {
      page_title: document.title,
    })
  }, [trackEvent])

  /**
   * Registra interação com elemento de UI
   *
   * @param elementId ID do elemento
   * @param elementType Tipo de elemento (botao, link, form, etc)
   * @param properties Propriedades adicionais
   */
  const trackInteraction = useCallback(
    (
      elementId: string,
      elementType: string,
      properties: AnalyticsEventProps = {}
    ) => {
      trackEvent('interacao', `${elementType}_interacao`, {
        element_id: elementId,
        ...properties,
      })
    },
    [trackEvent]
  )

  return {
    trackEvent,
    trackPageView,
    trackInteraction,
  }
}

// Declaração para TypeScript reconhecer o gtag
declare global {
  interface Window {
    gtag: (command: string, action: string, params?: any) => void
  }
}
