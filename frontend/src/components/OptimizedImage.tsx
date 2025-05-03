import React, { useState, useEffect, memo, useCallback } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  priority?: boolean // Se true, não usará lazy loading
  sizes?: string // Tamanhos responsivos para diferentes viewports
  quality?: number // Qualidade da imagem (1-100)
  onLoad?: () => void
  onError?: () => void
}

// Cache para evitar verificações repetidas de WebP/AVIF
const imageFormatSupport = {
  webp: null as boolean | null,
  avif: null as boolean | null,
}

// Função para verificar suporte de formatos uma única vez
const checkFormatSupport = async (
  format: 'webp' | 'avif'
): Promise<boolean> => {
  if (imageFormatSupport[format] !== null) {
    return imageFormatSupport[format] as boolean
  }

  // Se no servidor, retorna false
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const elem = document.createElement('canvas')
    if (elem.getContext && elem.getContext('2d')) {
      const result =
        elem.toDataURL(`image/${format}`).indexOf(`data:image/${format}`) === 0
      imageFormatSupport[format] = result
      return result
    }
  } catch (e) {
    // Erro ao verificar o suporte
    imageFormatSupport[format] = false
  }

  return false
}

// Preconnect para domínios de CDN comuns
useEffect(() => {
  const cdnDomains = [
    'imagecdn.app',
    'imgix.net',
    'cloudinary.com',
    'images.celebracapital.com.br',
  ]

  cdnDomains.forEach((domain) => {
    if (
      !document.querySelector(
        `link[rel="preconnect"][href="https://${domain}"]`
      )
    ) {
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = `https://${domain}`
      document.head.appendChild(link)
    }
  })
}, [])

/**
 * Componente de imagem otimizada que implementa:
 * - Lazy loading (carregamento preguiçoso)
 * - Dimensões definidas para evitar layout shifts
 * - Fallback para erro de carregamento
 * - Placeholder durante o carregamento
 * - Suporte a formatos modernos como WebP e AVIF
 * - Dimensionamento responsivo
 * - Cache de verificação de formato
 * - Preconnect para domínios CDN
 */
const OptimizedImage: React.FC<OptimizedImageProps> = memo(
  ({
    src,
    alt,
    width,
    height,
    className = '',
    objectFit = 'cover',
    priority = false,
    sizes = '100vw',
    quality = 75,
    onLoad,
    onError,
  }) => {
    const [loaded, setLoaded] = useState(false)
    const [error, setError] = useState(false)
    const [imgSrc, setImgSrc] = useState<string | null>(priority ? src : null)
    const [supportsWebP, setSupportsWebP] = useState<boolean | null>(
      imageFormatSupport.webp
    )
    const [supportsAVIF, setSupportsAVIF] = useState<boolean | null>(
      imageFormatSupport.avif
    )

    // Gerar um ID único para o container baseado na URL da imagem
    const containerId = `img-container-${src
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 20)}`

    // Função para otimizar a URL da imagem (memoizada para evitar recálculos)
    const getOptimizedImageUrl = useCallback(
      (url: string): string => {
        // Se a URL já for de um serviço de otimização de imagens, retorne ela mesma
        if (
          url.includes('imagecdn.app') ||
          url.includes('imgix.net') ||
          url.includes('cloudinary.com') ||
          url.includes('images.celebracapital.com.br')
        ) {
          return url
        }

        // Se for uma URL de arquivo local, retorne ela mesma
        if (url.startsWith('blob:') || url.startsWith('data:')) {
          return url
        }

        // Para imagens externas que não passam por CDN, podemos usar um serviço como Imagekit ou Cloudinary
        try {
          const urlObj = new URL(url)
          // Verificar se é uma URL absoluta
          if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
            // Descomentar quando integrar com serviço de otimização de imagens
            // const format = supportsAVIF ? 'avif' : (supportsWebP ? 'webp' : 'auto');
            // return `https://imagecdn.app/v2/image/${encodeURIComponent(url)}?width=${width || 800}&format=${format}&quality=${quality}`;
          }
        } catch (e) {
          // Se não for uma URL válida, apenas retorna a original
        }

        return url
      },
      [width, quality, supportsWebP, supportsAVIF]
    )

    // Verificar suporte a formatos modernos
    useEffect(() => {
      if (supportsWebP === null) {
        checkFormatSupport('webp').then(setSupportsWebP)
      }
      if (supportsAVIF === null) {
        checkFormatSupport('avif').then(setSupportsAVIF)
      }
    }, [supportsWebP, supportsAVIF])

    useEffect(() => {
      if (!priority && src && !imgSrc) {
        // Usar IntersectionObserver para implementar lazy loading
        let observer: IntersectionObserver
        let observerTimeout: NodeJS.Timeout

        try {
          observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  // Pequeno delay para evitar carregamento de imagens durante rolagem rápida
                  observerTimeout = setTimeout(() => {
                    if (entry.isIntersecting) {
                      setImgSrc(getOptimizedImageUrl(src))
                      observer.disconnect()
                    }
                  }, 100)
                }
              })
            },
            {
              rootMargin: '300px 0px', // Carrega quando estiver a 300px da tela (preload maior)
              threshold: 0.01,
            }
          )

          const element = document.getElementById(containerId)
          if (element) {
            observer.observe(element)
          }
        } catch (e) {
          // Fallback se IntersectionObserver não for suportado
          setImgSrc(getOptimizedImageUrl(src))
        }

        return () => {
          observer?.disconnect()
          if (observerTimeout) clearTimeout(observerTimeout)
        }
      }
    }, [src, imgSrc, priority, containerId, getOptimizedImageUrl])

    // Quando a fonte da imagem mudar, resetar estados
    useEffect(() => {
      setLoaded(false)
      setError(false)
      if (priority) {
        setImgSrc(getOptimizedImageUrl(src))
      }
    }, [src, priority, getOptimizedImageUrl])

    const handleLoad = () => {
      setLoaded(true)
      if (onLoad) onLoad()
    }

    const handleError = () => {
      setError(true)
      if (onError) onError()
    }

    // Detectar formato da imagem
    const getImageFormat = (url: string): string => {
      const extension = url.split('.').pop()?.toLowerCase() || ''
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'].includes(extension)) {
        return extension
      }
      return 'jpeg' // formato padrão se não detectar
    }

    // Estilos dinâmicos com melhores práticas para CLS
    const containerStyle: React.CSSProperties = {
      position: 'relative',
      overflow: 'hidden',
      width: width ? `${width}px` : '100%',
      height: height ? `${height}px` : 'auto',
      background: '#f5f5f5',
      borderRadius: '4px',
      // Definir aspect ratio se largura e altura estiverem disponíveis
      ...(width && height ? { aspectRatio: `${width}/${height}` } : {}),
    }

    const imgStyle: React.CSSProperties = {
      objectFit,
      opacity: loaded ? 1 : 0,
      transition: 'opacity 0.3s ease',
      width: '100%',
      height: '100%',
    }

    return (
      <div
        id={containerId}
        style={containerStyle}
        className={className}
        data-testid="optimized-image-container"
      >
        {/* Placeholder durante o carregamento */}
        {!loaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-celebra-blue rounded-full animate-spin"></div>
          </div>
        )}

        {/* Placeholder de erro */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span className="sr-only">Erro ao carregar imagem</span>
          </div>
        )}

        {/* Imagem real com formatos otimizados */}
        {imgSrc && (
          <picture>
            {/* AVIF para navegadores suportados (melhor compressão) */}
            {supportsAVIF && getImageFormat(imgSrc) !== 'avif' && (
              <source
                srcSet={imgSrc.replace(/\.(jpg|jpeg|png|webp)$/i, '.avif')}
                type="image/avif"
              />
            )}

            {/* WebP para navegadores suportados */}
            {supportsWebP &&
              !['webp', 'avif'].includes(getImageFormat(imgSrc)) && (
                <source
                  srcSet={imgSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp')}
                  type="image/webp"
                />
              )}

            {/* Imagem original como fallback */}
            <img
              src={imgSrc}
              alt={alt}
              style={imgStyle}
              onLoad={handleLoad}
              onError={handleError}
              loading={priority ? 'eager' : 'lazy'}
              width={width}
              height={height}
              sizes={sizes}
              data-testid="optimized-image"
              decoding={priority ? 'sync' : 'async'}
            />
          </picture>
        )}
      </div>
    )
  }
)

export default OptimizedImage
