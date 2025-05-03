import React, { useRef, useEffect } from 'react'

interface FocusTrapProps {
  /** Indica se o trap de foco está ativo */
  active: boolean
  /** Elementos a serem renderizados dentro do trap de foco */
  children: React.ReactNode
  /** ID do elemento que deve receber o foco inicialmente */
  initialFocusId?: string
  /** Função chamada quando o usuário tenta sair do trap com Tab+Shift na primeira posição */
  onBackwardExit?: () => void
  /** Função chamada quando o usuário tenta sair do trap com Tab na última posição */
  onForwardExit?: () => void
}

/**
 * Componente que captura o foco dentro de seus elementos filhos
 *
 * Muito útil para modais, drawers e outras interfaces que exigem
 * que o usuário interaja com eles antes de voltar ao fluxo principal.
 * Isso evita que usuários de teclado/leitores de tela "percam" o modal
 * ou acessem acidentalmente o conteúdo por trás.
 */
const FocusTrap: React.FC<FocusTrapProps> = ({
  active,
  children,
  initialFocusId,
  onBackwardExit,
  onForwardExit,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<Element | null>(null)

  // Manipula a captura de foco
  useEffect(() => {
    if (!active) return

    // Salva o elemento atualmente focado
    previousActiveElement.current = document.activeElement

    // Foca no elemento inicial especificado ou no primeiro focável
    if (initialFocusId) {
      const initialFocusElement = document.getElementById(initialFocusId)
      if (initialFocusElement) {
        initialFocusElement.focus()
      } else {
        focusFirstElement()
      }
    } else {
      focusFirstElement()
    }

    // Quando o componente for desmontado ou desativado, restaura o foco
    return () => {
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus()
      }
    }
  }, [active, initialFocusId])

  // Captura a tecla Tab para manter o foco dentro do trap
  useEffect(() => {
    if (!active) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      // Obter elementos focáveis no trap
      const focusableElements = getFocusableElements()
      if (!focusableElements.length) return

      // Primeira e última posição focável
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      // Shift + Tab no primeiro elemento - voltar ao último ou sair
      if (event.shiftKey && document.activeElement === firstElement) {
        if (onBackwardExit) {
          onBackwardExit()
        } else {
          event.preventDefault()
          lastElement.focus()
        }
      }
      // Tab no último elemento - voltar ao primeiro ou sair
      else if (!event.shiftKey && document.activeElement === lastElement) {
        if (onForwardExit) {
          onForwardExit()
        } else {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [active, onBackwardExit, onForwardExit])

  /**
   * Foca o primeiro elemento focável dentro do trap
   */
  const focusFirstElement = () => {
    if (!containerRef.current) return

    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }
  }

  /**
   * Retorna todos os elementos focáveis dentro do trap
   */
  const getFocusableElements = (): HTMLElement[] => {
    if (!containerRef.current) return []

    // Seletores para elementos que podem receber foco
    const focusableSelectors = [
      'a[href]',
      'area[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'button:not([disabled])',
      '[tabindex="0"]',
      'audio[controls]',
      'video[controls]',
      '[contenteditable]:not([contenteditable="false"])',
    ].join(',')

    // Obter todos os elementos focáveis
    const candidates =
      containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors)

    // Filtrar para garantir que só incluímos elementos realmente focáveis (visíveis, etc)
    return Array.from(candidates).filter((el) => {
      return (
        // Elemento é visível
        el.offsetWidth > 0 &&
        el.offsetHeight > 0 &&
        // Não está escondido por overflow
        window.getComputedStyle(el).visibility !== 'hidden'
      )
    })
  }

  return <div ref={containerRef}>{children}</div>
}

export default FocusTrap
