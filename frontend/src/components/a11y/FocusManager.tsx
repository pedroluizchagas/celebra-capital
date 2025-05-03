import React, { useRef, useEffect } from 'react'

interface FocusManagerProps {
  /**
   * Conteúdo a ser renderizado dentro do gerenciador de foco
   */
  children: React.ReactNode

  /**
   * Se o componente deve estar ativo (gerenciando o foco)
   */
  isActive: boolean

  /**
   * Se deve retornar o foco ao elemento anterior quando desmontado
   */
  returnFocus?: boolean

  /**
   * Se deve prender o foco dentro do componente
   */
  trapFocus?: boolean

  /**
   * ID do elemento que deve receber foco inicial
   */
  initialFocusId?: string

  /**
   * Callback quando o componente é ativado
   */
  onActivate?: () => void

  /**
   * Callback quando o componente é desativado
   */
  onDeactivate?: () => void
}

/**
 * FocusManager - Gerencia o foco para componentes como modais e diálogos
 *
 * Este componente garante que:
 * 1. O foco seja movido para dentro do componente quando ativo
 * 2. O foco fique preso dentro do componente (opcional)
 * 3. O foco retorne ao elemento anterior quando o componente for fechado
 *
 * Essencial para garantir que usuários de teclado possam navegar corretamente
 * em elementos modais e diálogos.
 */
const FocusManager: React.FC<FocusManagerProps> = ({
  children,
  isActive,
  returnFocus = true,
  trapFocus = true,
  initialFocusId,
  onActivate,
  onDeactivate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Armazena o elemento com foco antes de ativar o gerenciador
  useEffect(() => {
    if (isActive) {
      previousFocusRef.current = document.activeElement as HTMLElement

      if (onActivate) {
        onActivate()
      }
    } else if (!isActive && onDeactivate) {
      onDeactivate()
    }
  }, [isActive, onActivate, onDeactivate])

  // Gerencia o foco inicial quando o componente se torna ativo
  useEffect(() => {
    if (isActive) {
      // Se um ID de foco inicial for fornecido, foca neste elemento
      if (initialFocusId) {
        const initialFocusElement = document.getElementById(initialFocusId)
        if (initialFocusElement) {
          initialFocusElement.focus()
          return
        }
      }

      // Caso contrário, foca no primeiro elemento focável dentro do container
      if (containerRef.current) {
        const focusableElements = containerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )

        if (focusableElements.length > 0) {
          ;(focusableElements[0] as HTMLElement).focus()
        } else {
          // Se não houver elementos focáveis, foca no próprio container
          containerRef.current.focus()
        }
      }
    }
  }, [isActive, initialFocusId])

  // Retorna o foco ao elemento anterior quando o componente é desativado
  useEffect(() => {
    return () => {
      if (
        returnFocus &&
        previousFocusRef.current &&
        document.body.contains(previousFocusRef.current)
      ) {
        previousFocusRef.current.focus()
      }
    }
  }, [returnFocus])

  // Gerencia o loop de foco (armadilha de foco)
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (
      !trapFocus ||
      !isActive ||
      event.key !== 'Tab' ||
      !containerRef.current
    ) {
      return
    }

    const focusableElements = Array.from(
      containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[]

    if (focusableElements.length === 0) {
      event.preventDefault()
      return
    }

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Shift + Tab no primeiro elemento -> vai para o último
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault()
      lastElement.focus()
    }
    // Tab no último elemento -> vai para o primeiro
    else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }

  if (!isActive) {
    return <>{children}</>
  }

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      style={{ outline: 'none' }}
      role="region"
    >
      {children}
    </div>
  )
}

export default FocusManager
