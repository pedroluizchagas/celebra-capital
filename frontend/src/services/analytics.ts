/**
 * Serviço de Analytics para rastrear métricas de sucesso
 * Permite monitorar eventos importantes na plataforma:
 * - Taxas de conversão
 * - Tempo médio para preenchimento de formulários
 * - Dispositivos e navegadores utilizados
 * - Ações do usuário
 */

import { getEnvironment } from '../utils/environment'

// Tipos para eventos de analytics
export enum AnalyticsEventType {
  FORM_START = 'form_start',
  FORM_STEP_COMPLETE = 'form_step_complete',
  FORM_SUBMIT = 'form_submit',
  DOCUMENT_UPLOAD = 'document_upload',
  SIGNATURE_COMPLETE = 'signature_complete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  ERROR = 'error',
  PAGE_VIEW = 'page_view',
  USER_REGISTRATION = 'user_registration',
  PROPOSAL_APPROVED = 'proposal_approved',
  PROPOSAL_REJECTED = 'proposal_rejected',
  FEATURE_USAGE = 'feature_usage',
}

// Interface para os eventos de analytics
export interface AnalyticsEvent {
  type: AnalyticsEventType
  timestamp: number
  userId?: string | null
  sessionId: string
  data?: Record<string, any>
  duration?: number
}

// Classe para rastreamento de eventos
class AnalyticsService {
  private events: AnalyticsEvent[] = []
  private sessionId: string
  private isEnabled: boolean
  private flushInterval: number = 60000 // 1 minuto
  private intervalId: number | null = null
  private apiUrl: string

  constructor() {
    this.sessionId = this.generateSessionId()
    this.isEnabled = getEnvironment() !== 'development'
    this.apiUrl = `${import.meta.env.VITE_API_URL}/analytics`

    // Iniciar envio periódico de eventos para o backend
    this.startAutoFlush()

    // Registrar evento de carregamento da página
    this.trackPageView(window.location.pathname)

    // Adicionar listener para mudanças de URL (para SPA)
    window.addEventListener('popstate', () => {
      this.trackPageView(window.location.pathname)
    })

    // Registrar dados quando o usuário deixar a página
    window.addEventListener('beforeunload', () => {
      this.flush(true)
    })
  }

  // Gerar ID único para a sessão
  private generateSessionId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  // Iniciar envio automático de eventos
  private startAutoFlush(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }

    this.intervalId = window.setInterval(() => {
      this.flush()
    }, this.flushInterval)
  }

  // Enviar eventos ao backend
  public async flush(immediate = false): Promise<void> {
    if (!this.isEnabled || this.events.length === 0) {
      return
    }

    try {
      const eventsToSend = [...this.events]
      this.events = []

      // Em produção, enviamos para a API
      if (getEnvironment() === 'production' || immediate) {
        await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ events: eventsToSend }),
          // Para envio imediato antes de unload
          keepalive: immediate,
        })
      } else {
        // Em outros ambientes, armazenamos localmente
        const storedEvents = JSON.parse(
          localStorage.getItem('analytics_events') || '[]'
        )
        localStorage.setItem(
          'analytics_events',
          JSON.stringify([...storedEvents, ...eventsToSend])
        )
      }
    } catch (error) {
      console.error('Erro ao enviar eventos de analytics:', error)
      // Restaurar eventos não enviados
      this.events = [...this.events, ...this.events]
    }
  }

  // Rastrear evento genérico
  public trackEvent(
    type: AnalyticsEventType,
    data?: Record<string, any>,
    duration?: number
  ): void {
    if (!this.isEnabled) return

    // Obter ID do usuário do localStorage
    const userId = localStorage.getItem('user_id')

    const event: AnalyticsEvent = {
      type,
      timestamp: Date.now(),
      userId,
      sessionId: this.sessionId,
      data,
      duration,
    }

    this.events.push(event)

    // Enviar imediatamente eventos importantes
    if (
      type === AnalyticsEventType.FORM_SUBMIT ||
      type === AnalyticsEventType.SIGNATURE_COMPLETE ||
      type === AnalyticsEventType.PROPOSAL_APPROVED ||
      type === AnalyticsEventType.PROPOSAL_REJECTED
    ) {
      this.flush()
    }
  }

  // Rastrear visualização de página
  public trackPageView(path: string): void {
    this.trackEvent(AnalyticsEventType.PAGE_VIEW, { path })
  }

  // Rastrear início de formulário
  public trackFormStart(formId: string, formName: string): void {
    this.trackEvent(AnalyticsEventType.FORM_START, { formId, formName })
  }

  // Rastrear conclusão de etapa de formulário
  public trackFormStepComplete(
    formId: string,
    stepId: string,
    stepName: string,
    timeSpent: number
  ): void {
    this.trackEvent(AnalyticsEventType.FORM_STEP_COMPLETE, {
      formId,
      stepId,
      stepName,
      timeSpent,
    })
  }

  // Rastrear envio de formulário
  public trackFormSubmit(
    formId: string,
    formName: string,
    totalTime: number,
    isComplete: boolean
  ): void {
    this.trackEvent(AnalyticsEventType.FORM_SUBMIT, {
      formId,
      formName,
      totalTime,
      isComplete,
    })
  }

  // Rastrear upload de documento
  public trackDocumentUpload(
    documentType: string,
    fileSize: number,
    mimeType: string,
    success: boolean
  ): void {
    this.trackEvent(AnalyticsEventType.DOCUMENT_UPLOAD, {
      documentType,
      fileSize,
      mimeType,
      success,
    })
  }

  // Rastrear conclusão de assinatura
  public trackSignatureComplete(documentId: string, timeToSign: number): void {
    this.trackEvent(AnalyticsEventType.SIGNATURE_COMPLETE, {
      documentId,
      timeToSign,
    })
  }

  // Rastrear login
  public trackLogin(userId: string, method: string): void {
    this.trackEvent(AnalyticsEventType.LOGIN, { userId, method })
  }

  // Rastrear logout
  public trackLogout(userId: string): void {
    this.trackEvent(AnalyticsEventType.LOGOUT, { userId })
  }

  // Rastrear erro
  public trackError(
    errorCode: string,
    errorMessage: string,
    context: Record<string, any>
  ): void {
    this.trackEvent(AnalyticsEventType.ERROR, {
      errorCode,
      errorMessage,
      context,
    })
  }

  // Rastrear uso de recurso
  public trackFeatureUsage(featureId: string, featureName: string): void {
    this.trackEvent(AnalyticsEventType.FEATURE_USAGE, {
      featureId,
      featureName,
    })
  }
}

// Exportar instância única do serviço
export const analyticsService = new AnalyticsService()
