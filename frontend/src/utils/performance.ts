/**
 * Utilitários para monitoramento e otimização de performance
 */

import { analyticsService, AnalyticsEventType } from '../services/analytics'

// Interface para métricas de performance
export interface PerformanceMetrics {
  // Métricas do Core Web Vitals
  FCP?: number // First Contentful Paint
  LCP?: number // Largest Contentful Paint
  CLS?: number // Cumulative Layout Shift
  FID?: number // First Input Delay
  TTI?: number // Time to Interactive
  TBT?: number // Total Blocking Time

  // Métricas personalizadas
  apiResponseTime?: Record<string, number>
  resourceLoadTime?: Record<string, number>
  componentRenderTime?: Record<string, number>
  ttfb?: number // Time to First Byte
  domContentLoaded?: number
  windowLoaded?: number
}

// Tipos estendidos para as entradas de performance
interface PerformanceEntryFID extends PerformanceEntry {
  processingStart: number
}

interface PerformanceEntryCLS extends PerformanceEntry {
  value: number
}

// Classe para monitoramento de performance
class PerformanceMonitor {
  private metrics: PerformanceMetrics = {}
  private apiTimings: Record<string, number> = {}
  private componentTimings: Record<string, number> = {}
  private resourceTimings: Record<string, number> = {}
  private isInitialized = false

  constructor() {
    this.init()
  }

  /**
   * Inicializa o monitoramento de performance
   */
  public init(): void {
    if (this.isInitialized || typeof window === 'undefined') return

    this.isInitialized = true

    // Observar métricas do Core Web Vitals
    this.observeCoreWebVitals()

    // Observar carregamento de página
    this.observePageLoad()

    // Observar carregamento de recursos
    this.observeResourceTiming()

    // Enviar métricas quando o usuário sair da página
    window.addEventListener('beforeunload', () => {
      this.sendMetricsToAnalytics()
    })

    // Ou periodicamente a cada 1 minuto
    setInterval(() => {
      this.sendMetricsToAnalytics()
    }, 60000)
  }

  /**
   * Observa métricas do Core Web Vitals
   */
  private observeCoreWebVitals(): void {
    if (typeof PerformanceObserver === 'undefined') return

    // First Contentful Paint (FCP)
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        if (entries.length > 0) {
          const fcp = entries[0]
          this.metrics.FCP = fcp.startTime
          analyticsService.trackEvent(AnalyticsEventType.FEATURE_USAGE, {
            metric: 'FCP',
            value: fcp.startTime,
          })
        }
      })
      fcpObserver.observe({ type: 'paint', buffered: true })
    } catch (e) {
      console.error('Erro ao observar FCP:', e)
    }

    // Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        // Usamos a última entrada, que é geralmente o maior elemento
        if (entries.length > 0) {
          const lcp = entries[entries.length - 1]
          this.metrics.LCP = lcp.startTime
          analyticsService.trackEvent(AnalyticsEventType.FEATURE_USAGE, {
            metric: 'LCP',
            value: lcp.startTime,
          })
        }
      })
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
    } catch (e) {
      console.error('Erro ao observar LCP:', e)
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        if (entries.length > 0) {
          const fid = entries[0] as PerformanceEntryFID
          this.metrics.FID = fid.processingStart - fid.startTime
          analyticsService.trackEvent(AnalyticsEventType.FEATURE_USAGE, {
            metric: 'FID',
            value: this.metrics.FID,
          })
        }
      })
      fidObserver.observe({ type: 'first-input', buffered: true })
    } catch (e) {
      console.error('Erro ao observar FID:', e)
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0
      let clsEntries: Array<PerformanceEntryCLS> = []
      let sessionValue = 0
      let sessionEntries: Array<PerformanceEntryCLS> = []
      let lastSessionTime: number | null = null

      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceEntryCLS[]

        entries.forEach((entry) => {
          // Ignorar se não for esperado
          if (
            !lastSessionTime ||
            entry.startTime - lastSessionTime > 1000 ||
            sessionValue >= 0.05
          ) {
            sessionValue = entry.value
            sessionEntries = [entry]
          } else {
            sessionValue += entry.value
            sessionEntries.push(entry)
          }

          if (sessionValue > clsValue) {
            clsValue = sessionValue
            clsEntries = sessionEntries
            this.metrics.CLS = clsValue
            analyticsService.trackEvent(AnalyticsEventType.FEATURE_USAGE, {
              metric: 'CLS',
              value: clsValue,
            })
          }

          lastSessionTime = entry.startTime
        })
      })
      clsObserver.observe({ type: 'layout-shift', buffered: true })
    } catch (e) {
      console.error('Erro ao observar CLS:', e)
    }
  }

  /**
   * Observa o carregamento da página
   */
  private observePageLoad(): void {
    if (typeof window === 'undefined') return

    // DOMContentLoaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.metrics.domContentLoaded = performance.now()
      })
    } else {
      this.metrics.domContentLoaded = performance.now()
    }

    // Window load
    window.addEventListener('load', () => {
      this.metrics.windowLoaded = performance.now()

      // Time to First Byte (TTFB)
      const navigationEntries = performance.getEntriesByType('navigation')
      if (navigationEntries.length > 0) {
        const navEntry = navigationEntries[0] as PerformanceNavigationTiming
        this.metrics.ttfb = navEntry.responseStart - navEntry.requestStart
      }

      // Enviar métricas iniciais
      setTimeout(() => {
        this.sendMetricsToAnalytics()
      }, 5000)
    })
  }

  /**
   * Observa o carregamento de recursos
   */
  private observeResourceTiming(): void {
    if (typeof PerformanceObserver === 'undefined') return

    try {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()

        entries.forEach((entry) => {
          const url = entry.name
          const duration = entry.duration

          // Identificar o tipo de recurso
          if (url.includes('/api/')) {
            // Requisição de API
            const endpoint = url.split('/api/')[1]?.split('?')[0] || url
            this.apiTimings[endpoint] = duration
          } else if (
            url.includes('.js') ||
            url.includes('.css') ||
            url.includes('.woff')
          ) {
            // Recursos estáticos
            const fileName = url.split('/').pop() || url
            this.resourceTimings[fileName] = duration
          }
        })

        this.metrics.apiResponseTime = { ...this.apiTimings }
        this.metrics.resourceLoadTime = { ...this.resourceTimings }
      })

      resourceObserver.observe({ type: 'resource', buffered: true })
    } catch (e) {
      console.error('Erro ao observar Resource Timing:', e)
    }
  }

  /**
   * Registra o tempo de renderização de um componente
   * @param componentName Nome do componente
   * @param duration Tempo de renderização em ms
   */
  public trackComponentRender(componentName: string, duration: number): void {
    this.componentTimings[componentName] = duration
    this.metrics.componentRenderTime = { ...this.componentTimings }
  }

  /**
   * Envia métricas para o serviço de analytics
   */
  private sendMetricsToAnalytics(): void {
    analyticsService.trackEvent(AnalyticsEventType.FEATURE_USAGE, {
      metricType: 'performance',
      metrics: this.metrics,
    })
  }

  /**
   * Obtém todas as métricas de performance coletadas
   * @returns Métricas de performance
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }
}

// Instância singleton para monitoramento de performance
export const performanceMonitor = new PerformanceMonitor()

/**
 * Mede o tempo de execução de uma função
 * @param fn Função a ser medida
 * @param fnName Nome da função (para registro)
 * @returns Resultado da função e tempo de execução em ms
 */
export function measureExecutionTime<T>(
  fn: () => T,
  fnName: string
): { result: T; duration: number } {
  const startTime = performance.now()
  const result = fn()
  const endTime = performance.now()
  const duration = endTime - startTime

  console.debug(`Tempo de execução de ${fnName}: ${duration.toFixed(2)}ms`)

  return { result, duration }
}

/**
 * Hook para medir o tempo de renderização de um componente React
 * @param componentName Nome do componente
 * @returns Função de cleanup para ser chamada na desmontagem do componente
 */
export function useComponentPerformanceTracking(
  componentName: string
): () => void {
  if (typeof window === 'undefined') return () => {}

  const startTime = performance.now()

  // Registrar o tempo quando o componente for desmontado ou atualizado
  return () => {
    const endTime = performance.now()
    const duration = endTime - startTime
    performanceMonitor.trackComponentRender(componentName, duration)
  }
}

/**
 * Otimiza a função com memoização para evitar recálculos desnecessários
 * @param fn Função a ser otimizada
 * @returns Função otimizada com memoização
 */
export function memoize<T>(fn: (...args: any[]) => T): (...args: any[]) => T {
  const cache = new Map()

  return (...args: any[]) => {
    const key = JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)
    }

    const result = fn(...args)
    cache.set(key, result)

    return result
  }
}

/**
 * Aplica debounce a uma função para limitar chamadas frequentes
 * @param fn Função a ser limitada
 * @param delay Atraso em ms
 * @returns Função com debounce
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    timeoutId = window.setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

/**
 * Aplica throttle a uma função para limitar chamadas frequentes
 * @param fn Função a ser limitada
 * @param limit Limite de tempo em ms
 * @returns Função com throttle
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastCall = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()

    if (now - lastCall >= limit) {
      fn(...args)
      lastCall = now
    }
  }
}
