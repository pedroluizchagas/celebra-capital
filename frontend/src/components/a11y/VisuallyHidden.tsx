import React from 'react'

interface VisuallyHiddenProps {
  /**
   * Conteúdo a ser ocultado visualmente, mas mantido acessível para leitores de tela
   */
  children: React.ReactNode

  /**
   * Permite que o elemento se torne visível quando recebe foco (útil para skip links)
   */
  focusable?: boolean

  /**
   * Classe CSS adicional
   */
  className?: string
}

/**
 * VisuallyHidden - Oculta conteúdo visualmente mantendo-o disponível para tecnologias assistivas
 *
 * Este componente utiliza técnicas CSS para remover o conteúdo do fluxo visual da página,
 * mas mantê-lo disponível para leitores de tela. Segue padrões recomendados para acessibilidade.
 */
export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({
  children,
  focusable = false,
  className = '',
}) => {
  const hiddenStyles: React.CSSProperties = {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: '1px',
    margin: '-1px',
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    width: '1px',
    whiteSpace: 'nowrap',
    wordWrap: 'normal',
  }

  // Para elementos focusáveis, utilizamos uma classe CSS que será aplicada ao componente
  // e definimos estilos via CSS externo ou inline-styles + JS para detectar o foco
  const [isFocused, setIsFocused] = React.useState(false)

  const handleFocus = () => {
    if (focusable) setIsFocused(true)
  }

  const handleBlur = () => {
    if (focusable) setIsFocused(false)
  }

  // Modificamos os estilos quando o elemento está em foco (se for focusável)
  const combinedStyles: React.CSSProperties =
    isFocused && focusable
      ? {
          clip: 'auto',
          height: 'auto',
          margin: 0,
          overflow: 'visible',
          position: 'static',
          width: 'auto',
          whiteSpace: 'normal',
        }
      : hiddenStyles

  return (
    <span
      style={combinedStyles}
      className={`visually-hidden ${
        focusable ? 'visually-hidden-focusable' : ''
      } ${className}`}
      tabIndex={focusable ? 0 : undefined}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
    </span>
  )
}

export default VisuallyHidden
