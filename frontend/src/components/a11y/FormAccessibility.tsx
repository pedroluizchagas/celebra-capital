import React from 'react'
import InlineFeedback from './InlineFeedback'
import LiveRegion from './LiveRegion'

interface FormFieldWrapperProps {
  /**
   * ID único do campo
   */
  id: string

  /**
   * Label do campo
   */
  label: string

  /**
   * Mensagem de erro, se houver
   */
  error?: string

  /**
   * Dica/descrição do campo
   */
  hint?: string

  /**
   * Se o campo é obrigatório
   */
  required?: boolean

  /**
   * Elementos filhos (o campo propriamente dito)
   */
  children: React.ReactNode

  /**
   * Classe CSS adicional para o container
   */
  className?: string
}

/**
 * Componente wrapper para campos de formulário que garante acessibilidade adequada
 *
 * - Associa labels corretamente
 * - Gerencia mensagens de erro acessíveis
 * - Fornece dicas contextuais
 * - Indica campos obrigatórios
 */
export const FormFieldWrapper: React.FC<FormFieldWrapperProps> = ({
  id,
  label,
  error,
  hint,
  required = false,
  children,
  className = '',
}) => {
  // IDs para associação de ARIA
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined

  // Construir o aria-describedby combinando hint e error IDs
  const getDescribedBy = () => {
    const ids = []
    if (hintId) ids.push(hintId)
    if (errorId) ids.push(errorId)
    return ids.length > 0 ? ids.join(' ') : undefined
  }

  // Não tentaremos clonar os componentes filhos com propriedades adicionais
  // devido à limitação de tipos. Em vez disso, espera-se que o componente pai
  // passe essas propriedades diretamente.

  return (
    <div className={`form-field ${error ? 'has-error' : ''} ${className}`}>
      <label htmlFor={id} className="form-label">
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="required-indicator">
              {' '}
              *
            </span>
            <span className="sr-only"> (obrigatório)</span>
          </>
        )}
      </label>

      {/* Renderizar os filhos como estão, esperando que o ID seja passado pelo componente pai */}
      {children}

      {hint && !error && (
        <div id={hintId} className="form-hint">
          {hint}
        </div>
      )}

      {error && (
        <InlineFeedback
          id={errorId || ''}
          type="error"
          message={error}
          assertive={true}
        />
      )}
    </div>
  )
}

/**
 * Cria as props de acessibilidade para inputs em formulários
 * Esta função deve ser usada pelo componente pai ao renderizar campos de formulário
 */
export const getAccessibleFieldProps = (
  id: string,
  error?: string,
  hint?: string,
  required?: boolean
) => {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined

  // Construir os IDs para aria-describedby
  const describedByIds = []
  if (hintId) describedByIds.push(hintId)
  if (errorId) describedByIds.push(errorId)

  return {
    id,
    'aria-describedby':
      describedByIds.length > 0 ? describedByIds.join(' ') : undefined,
    'aria-invalid': error ? 'true' : 'false',
    'aria-required': required ? 'true' : undefined,
  }
}

interface FormStatusMessageProps {
  /**
   * Mensagem de status do formulário
   */
  message: string

  /**
   * Tipo de status
   */
  type: 'success' | 'error' | 'info' | 'warning'

  /**
   * Se a mensagem deve ser exibida visualmente
   */
  visible?: boolean
}

/**
 * Componente para exibir mensagens de status de formulário de forma acessível
 */
export const FormStatusMessage: React.FC<FormStatusMessageProps> = ({
  message,
  type,
  visible = true,
}) => {
  if (!message) return null

  // Determinar os atributos ARIA com base no tipo
  const getAriaLive = () => {
    if (type === 'error') return 'assertive'
    return 'polite'
  }

  const getRole = () => {
    if (type === 'error') return 'alert'
    return 'status'
  }

  return (
    <LiveRegion
      message={message}
      ariaLive={getAriaLive()}
      role={getRole()}
      visible={visible}
    />
  )
}

/**
 * Hook para gerenciar o foco em erros de formulário
 *
 * @param formRef - Referência para o elemento do formulário
 * @param hasErrors - Se o formulário tem erros
 */
export const useFormErrorFocus = (
  formRef: React.RefObject<HTMLFormElement>,
  hasErrors: boolean
) => {
  React.useEffect(() => {
    if (hasErrors && formRef.current) {
      // Encontrar o primeiro elemento com erro
      const firstErrorField = formRef.current.querySelector(
        '[aria-invalid="true"]'
      )

      if (firstErrorField instanceof HTMLElement) {
        // Focar no primeiro campo com erro
        firstErrorField.focus()
      } else {
        // Se não encontrar campo com erro, focar no primeiro campo
        const firstField = formRef.current.querySelector(
          'input, select, textarea'
        )
        if (firstField instanceof HTMLElement) {
          firstField.focus()
        }
      }
    }
  }, [hasErrors, formRef])
}

export default {
  FormFieldWrapper,
  FormStatusMessage,
  useFormErrorFocus,
  getAccessibleFieldProps,
}
