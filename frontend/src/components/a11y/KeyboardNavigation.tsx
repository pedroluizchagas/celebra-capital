import React, { useRef, useEffect, useCallback } from 'react'

type KeyHandler = (event: React.KeyboardEvent<HTMLElement>) => void

interface KeyMap {
  [key: string]: KeyHandler
}

interface KeyboardNavigationProps {
  /**
   * Elementos filhos a serem renderizados
   */
  children: React.ReactNode

  /**
   * Mapa de teclas para handlers
   */
  keyMap: KeyMap

  /**
   * Elemento a ser renderizado (div por padrão)
   */
  as?: React.ElementType

  /**
   * ID do componente
   */
  id?: string

  /**
   * Classes CSS adicionais
   */
  className?: string

  /**
   * Se o componente está ativo
   */
  isActive?: boolean

  /**
   * Se deve impedir propagação do evento
   */
  stopPropagation?: boolean

  /**
   * Se deve impedir comportamento padrão
   */
  preventDefault?: boolean
}

/**
 * KeyboardNavigation - Fornece navegação por teclado para componentes
 *
 * Este componente permite definir manipuladores de eventos para teclas específicas,
 * facilitando a implementação de navegação por teclado em componentes como menus,
 * listas, e outros elementos interativos.
 *
 * Exemplo de uso:
 * ```tsx
 * <KeyboardNavigation
 *   keyMap={{
 *     'ArrowDown': (e) => handleNextItem(),
 *     'ArrowUp': (e) => handlePreviousItem(),
 *     'Enter': (e) => handleSelection(),
 *     'Escape': (e) => handleClose()
 *   }}
 * >
 *   <ul>...</ul>
 * </KeyboardNavigation>
 * ```
 */
const KeyboardNavigation: React.FC<KeyboardNavigationProps> = ({
  children,
  keyMap,
  as: Component = 'div',
  id,
  className = '',
  isActive = true,
  stopPropagation = false,
  preventDefault = false,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  // Handler para eventos de teclado
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (!isActive) return

      const handler = keyMap[event.key]

      if (handler) {
        if (stopPropagation) {
          event.stopPropagation()
        }

        if (preventDefault) {
          event.preventDefault()
        }

        handler(event)
      }
    },
    [keyMap, isActive, stopPropagation, preventDefault]
  )

  // Configurar/remover eventos globais de teclado, se necessário
  useEffect(() => {
    // Implementação para eventos globais poderia ser adicionada aqui
    return () => {
      // Limpeza dos listeners se necessário
    }
  }, [])

  return (
    <Component
      ref={containerRef}
      id={id}
      className={`keyboard-navigation ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={isActive ? 0 : -1}
      {...props}
    >
      {children}
    </Component>
  )
}

export default KeyboardNavigation
