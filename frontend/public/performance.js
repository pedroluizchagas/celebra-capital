/**
 * Celebra Capital - Performance Optimization Script
 * Otimizações para melhorar as métricas Core Web Vitals
 */

// Melhorar a prioridade de carregamento de imagens críticas
document.addEventListener('DOMContentLoaded', () => {
  // Identificar potenciais elementos LCP (Largest Contentful Paint)
  const observeLCP = () => {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      if (entries.length > 0) {
        const lcpElement = entries[0]
        console.info('LCP candidate:', lcpElement.element)
        observer.disconnect()
      }
    })

    observer.observe({ type: 'largest-contentful-paint', buffered: true })
  }

  // Preload imagens críticas acima do fold
  const preloadCriticalImages = () => {
    const criticalImages = [
      '/assets/images/hero-banner.webp',
      '/assets/images/logo.png',
    ]

    criticalImages.forEach((imageSrc) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = imageSrc
      link.type = 'image/webp'
      document.head.appendChild(link)
    })
  }

  // Lazy load imagens não críticas
  const setupLazyLoading = () => {
    if ('loading' in HTMLImageElement.prototype) {
      // Usar loading nativo do navegador
      document.querySelectorAll('img[data-src]').forEach((img) => {
        img.src = img.dataset.src
        img.loading = 'lazy'
        delete img.dataset.src
      })
    } else {
      // Fallback para navegadores que não suportam loading nativo
      const lazyImages = document.querySelectorAll('img[data-src]')

      if (lazyImages.length === 0) return

      const lazyImageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const lazyImage = entry.target
            lazyImage.src = lazyImage.dataset.src
            lazyImageObserver.unobserve(lazyImage)
            delete lazyImage.dataset.src
          }
        })
      })

      lazyImages.forEach((lazyImage) => {
        lazyImageObserver.observe(lazyImage)
      })
    }
  }

  // Otimização de fontes
  const optimizeFonts = () => {
    // Adiciona font-display: swap às fontes do Google
    const fontStyles = document.querySelectorAll(
      'link[rel="stylesheet"][href*="fonts.googleapis.com"]'
    )
    fontStyles.forEach((linkEl) => {
      const href = linkEl.getAttribute('href')
      if (href && !href.includes('&display=swap')) {
        linkEl.setAttribute('href', `${href}&display=swap`)
      }
    })
  }

  // Medir e reportar métricas Web Vitals
  const reportWebVitals = () => {
    if ('web-vitals' in window) {
      webVitals.getCLS((metric) => console.log('CLS:', metric.value))
      webVitals.getFID((metric) => console.log('FID:', metric.value))
      webVitals.getLCP((metric) => console.log('LCP:', metric.value))
      webVitals.getFCP((metric) => console.log('FCP:', metric.value))
      webVitals.getTTFB((metric) => console.log('TTFB:', metric.value))
    }
  }

  // Executar otimizações
  try {
    observeLCP()
    preloadCriticalImages()
    setupLazyLoading()
    optimizeFonts()

    // Reportar Web Vitals quando o script estiver disponível
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => reportWebVitals())
    } else {
      setTimeout(() => reportWebVitals(), 1000)
    }
  } catch (err) {
    console.error('Error in performance optimization:', err)
  }
})

// Detectar quando o aplicativo está completamente interativo
const measureTTI = () => {
  // Simplified Time to Interactive measurement
  const startTime = performance.now()

  const checkInteractive = () => {
    if (document.readyState === 'complete') {
      const tti = performance.now() - startTime
      console.info(`Approximate TTI: ${Math.round(tti)}ms`)
      return
    }

    requestAnimationFrame(checkInteractive)
  }

  requestAnimationFrame(checkInteractive)
}

// Measure First Input Delay
const measureFID = () => {
  const firstInputObserver = new PerformanceObserver((entryList) => {
    const firstInput = entryList.getEntries()[0]
    if (firstInput) {
      const delay = firstInput.processingStart - firstInput.startTime
      console.info(`FID: ${Math.round(delay)}ms`)
      firstInputObserver.disconnect()
    }
  })

  firstInputObserver.observe({ type: 'first-input', buffered: true })
}

// Iniciar medições
if (performance && 'PerformanceObserver' in window) {
  measureTTI()
  measureFID()
}

// Adicionar script ao head após carregar conteúdo essencial
window.addEventListener('load', () => {
  const webVitalsScript = document.createElement('script')
  webVitalsScript.src = 'https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js'
  webVitalsScript.async = true
  document.head.appendChild(webVitalsScript)
})
