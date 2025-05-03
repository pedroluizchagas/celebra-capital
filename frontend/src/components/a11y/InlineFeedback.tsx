import React from 'react'
import { VisuallyHidden } from './VisuallyHidden'

export type FeedbackType = 'info' | 'success' | 'error' | 'warning'

interface InlineFeedbackProps {
  /**
   * ID única do feedback para associação via aria-describedby
   */
  id: string

  /**
   * Mensagem a ser exibida
   */
  message: string

  /**
   * Tipo de feedback
   */
  type?: FeedbackType

  /**
   * Se verdadeiro, o feedback é anunciado imediatamente para leitores de tela
   */
  assertive?: boolean

  /**
   * Se verdadeiro, o feedback é visualmente oculto mas ainda acessível para leitores de tela
   */
  visuallyHidden?: boolean

  /**
   * Classe CSS adicional
   */
  className?: string
}

/**
 * Componente para fornecer feedback acessível em formulários e interações
 *
 * Pode ser associado a campos de formulário via aria-describedby
 * Pode ter diferentes estilos dependendo do tipo de feedback
 */
const InlineFeedback: React.FC<InlineFeedbackProps> = ({
  id,
  message,
  type = 'info',
  assertive = false,
  visuallyHidden = false,
  className = '',
}) => {
  // Só renderizar se houver mensagem
  if (!message) return null

  // Definir classes com base no tipo
  const typeClasses = {
    info: 'text-blue-700 bg-blue-50 border-blue-200',
    success: 'text-green-700 bg-green-50 border-green-200',
    error: 'text-red-700 bg-red-50 border-red-200',
    warning: 'text-amber-700 bg-amber-50 border-amber-200',
  }

  // Ícones para cada tipo
  const typeIcons = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️',
  }

  // Determinar role baseado no tipo
  const getRole = () => {
    if (type === 'error') return 'alert'
    return 'status'
  }

  // Componente interno com estilos visuais
  const FeedbackContent = () => (
    <div
      id={id}
      className={`inline-feedback rounded-md py-1.5 px-3 text-sm flex items-center my-1 border ${typeClasses[type]} ${className}`}
      role={getRole()}
      aria-live={assertive ? 'assertive' : 'polite'}
    >
      <span className="inline-feedback-icon mr-1.5" aria-hidden="true">
        {typeIcons[type]}
      </span>
      {message}
    </div>
  )

  // Se for visualmente oculto, usar o componente VisuallyHidden
  if (visuallyHidden) {
    return (
      <VisuallyHidden>
        <div
          id={id}
          role={getRole()}
          aria-live={assertive ? 'assertive' : 'polite'}
        >
          {message}
        </div>
      </VisuallyHidden>
    )
  }

  // Caso contrário, renderizar com estilos visuais
  return <FeedbackContent />
}

export default InlineFeedback
