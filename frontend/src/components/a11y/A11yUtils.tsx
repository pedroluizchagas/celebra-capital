import React, { useEffect, useRef } from 'react'

/**
 * Utilitário que anuncia mensagens para leitores de tela
 * Permite anunciar atualizações dinâmicas para usuários de tecnologias assistivas
 */
export const ScreenReaderAnnouncement: React.FC<{
  message: string
  assertive?: boolean
}> = ({ message, assertive = false }) => {
  const announcerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (announcerRef.current && message) {
      announcerRef.current.textContent = ''
      // Trick para forçar os leitores de tela a anunciarem novamente
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = message
        }
      }, 50)
    }
  }, [message])

  return (
    <div
      ref={announcerRef}
      aria-live={assertive ? 'assertive' : 'polite'}
      aria-atomic="true"
      className="sr-only"
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0',
      }}
    >
      {message}
    </div>
  )
}

/**
 * Hook para gerenciar o foco em elementos quando são montados/desmontados
 * Útil para modais, drawers e outros elementos que precisam gerenciar foco
 */
export const useFocusTrap = () => {
  const elementRef = useRef<HTMLDivElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    // Salva o elemento atualmente focado
    previousFocus.current = document.activeElement as HTMLElement

    // Função para focar no primeiro elemento focável dentro do container
    const focusFirstElement = () => {
      if (!elementRef.current) return

      const focusableElements = elementRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>

      if (focusableElements.length > 0) {
        focusableElements[0].focus()
      } else {
        // Se não há elementos focáveis, foca no container
        elementRef.current.focus()
      }
    }

    // Focar no primeiro elemento focável
    focusFirstElement()

    // Função para lidar com a navegação por tab dentro do container
    const handleTabKey = (e: KeyboardEvent) => {
      if (!elementRef.current || e.key !== 'Tab') return

      const focusableElements = Array.from(
        elementRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ) as HTMLElement[]

      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      // Se pressionar Shift+Tab no primeiro elemento, vá para o último
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
      // Se pressionar Tab no último elemento, vá para o primeiro
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }

    // Adiciona o event listener
    document.addEventListener('keydown', handleTabKey)

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleTabKey)
      // Restaura o foco para o elemento anterior
      if (previousFocus.current) {
        previousFocus.current.focus()
      }
    }
  }, [])

  return elementRef
}

/**
 * Hook para detectar o uso de tecnologias assistivas
 * Ajuda a determinar se o usuário está usando leitor de tela
 */
export const useA11yDetection = () => {
  const [usingAssistiveTech, setUsingAssistiveTech] = React.useState(false)

  useEffect(() => {
    // Detecta o uso de tecnologias assistivas (heurística)
    const detectA11yTech = () => {
      // Verifica se há configurações de acessibilidade ativadas
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      // Tenta detectar leitores de tela (heurística imperfeita)
      const possibleScreenReader =
        // Presença de objetos específicos de leitores de tela
        'speechSynthesis' in window ||
        // NVDA no Windows
        navigator.userAgent.includes('NVDA') ||
        // VoiceOver no macOS/iOS pode ser detectado por algumas pistas
        (navigator.userAgent.includes('Mac') &&
          'webkitSpeechRecognition' in window)

      setUsingAssistiveTech(prefersReducedMotion || possibleScreenReader)
    }

    detectA11yTech()

    // Ao usar eventos de teclado também pode ser uma pista
    const keyboardListener = () => {
      document.removeEventListener('keydown', keyboardListener)
      setUsingAssistiveTech(true)
    }

    document.addEventListener('keydown', keyboardListener)

    return () => {
      document.removeEventListener('keydown', keyboardListener)
    }
  }, [])

  return { usingAssistiveTech }
}

/**
 * Componente para oferecer modo alto contraste
 * Adiciona classes CSS para melhorar a visualização para pessoas com baixa visão
 */
export const HighContrastToggle: React.FC<{
  className?: string
}> = ({ className }) => {
  const [highContrast, setHighContrast] = React.useState(() => {
    const saved = localStorage.getItem('high-contrast')
    return saved === 'true'
  })

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
    localStorage.setItem('high-contrast', highContrast.toString())
  }, [highContrast])

  return (
    <button
      className={className}
      onClick={() => setHighContrast(!highContrast)}
      aria-pressed={highContrast}
    >
      {highContrast ? 'Desativar Alto Contraste' : 'Ativar Alto Contraste'}
    </button>
  )
}

/**
 * Lista de verificação de acessibilidade para desenvolvedores
 * @returns Lista de verificações comuns de acessibilidade
 */
export const getA11yChecklist = () => {
  return [
    {
      category: 'Semântica',
      items: [
        {
          id: 'semantic-elements',
          label: 'Uso de elementos HTML semânticos',
          checked: false,
        },
        {
          id: 'heading-structure',
          label: 'Estrutura de headings (h1-h6) apropriada',
          checked: false,
        },
        {
          id: 'landmarks',
          label: 'Regiões de landmarks usadas corretamente',
          checked: false,
        },
      ],
    },
    {
      category: 'Teclado e Foco',
      items: [
        {
          id: 'keyboard-nav',
          label: 'Navegação por teclado funcional',
          checked: false,
        },
        {
          id: 'focus-visible',
          label: 'Indicadores de foco visíveis',
          checked: false,
        },
        { id: 'focus-order', label: 'Ordem de foco lógica', checked: false },
      ],
    },
    {
      category: 'Texto e Contraste',
      items: [
        {
          id: 'color-contrast',
          label: 'Contraste de cores adequado (4.5:1 ou 3:1)',
          checked: false,
        },
        {
          id: 'text-resize',
          label: 'Texto pode ser redimensionado até 200%',
          checked: false,
        },
        {
          id: 'text-spacing',
          label: 'Espaçamento de texto adequado',
          checked: false,
        },
      ],
    },
    {
      category: 'Imagens e Mídia',
      items: [
        {
          id: 'alt-text',
          label: 'Textos alternativos em imagens',
          checked: false,
        },
        { id: 'captions', label: 'Legendas em vídeos', checked: false },
        {
          id: 'audio-control',
          label: 'Controle de áudio disponível',
          checked: false,
        },
      ],
    },
    {
      category: 'Formulários',
      items: [
        {
          id: 'form-labels',
          label: 'Labels associados aos campos',
          checked: false,
        },
        {
          id: 'error-identification',
          label: 'Erros identificados claramente',
          checked: false,
        },
        {
          id: 'error-suggestion',
          label: 'Sugestões para correção de erros',
          checked: false,
        },
      ],
    },
    {
      category: 'ARIA',
      items: [
        {
          id: 'aria-roles',
          label: 'Roles ARIA usados corretamente',
          checked: false,
        },
        {
          id: 'aria-properties',
          label: 'Propriedades ARIA aplicadas adequadamente',
          checked: false,
        },
        {
          id: 'aria-live',
          label: 'Regiões live para conteúdo dinâmico',
          checked: false,
        },
      ],
    },
  ]
}
