import React from 'react'

interface FormLabelProps {
  /** ID do elemento de formulário associado */
  htmlFor: string
  /** Texto do label */
  children: React.ReactNode
  /** Se o campo é obrigatório */
  required?: boolean
  /** Classes CSS adicionais */
  className?: string
  /** Se deve mostrar asterisco para campos obrigatórios */
  showAsterisk?: boolean
  /** Texto de dica opcional */
  hint?: string
}

/**
 * Componente para criar labels acessíveis para campos de formulário
 *
 * Adiciona indicação visual de campos obrigatórios e suporte para textos de dica,
 * garantindo relações adequadas entre labels e campos para acessibilidade.
 */
export const FormLabel: React.FC<FormLabelProps> = ({
  htmlFor,
  children,
  required = false,
  className = '',
  showAsterisk = true,
  hint,
}) => {
  const hintId = hint ? `${htmlFor}-hint` : undefined

  return (
    <>
      <label
        htmlFor={htmlFor}
        className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}
      >
        {children}
        {required && showAsterisk && (
          <span
            className="ml-1 text-red-500"
            aria-hidden="true"
            title="Campo obrigatório"
          >
            *
          </span>
        )}
        {required && <span className="sr-only">(obrigatório)</span>}
      </label>
      {hint && (
        <p
          id={hintId}
          className="mt-1 text-xs text-gray-500 dark:text-gray-400"
        >
          {hint}
        </p>
      )}
    </>
  )
}

interface VisuallyHiddenLabelProps {
  /** ID do elemento de formulário associado */
  htmlFor: string
  /** Texto do label que será visualmente escondido */
  children: React.ReactNode
  /** Se o campo é obrigatório */
  required?: boolean
}

/**
 * Label visualmente escondido mas acessível para leitores de tela
 *
 * Útil para casos onde o design não permite um label visível,
 * mas a acessibilidade exige que o campo tenha um label.
 */
export const VisuallyHiddenLabel: React.FC<VisuallyHiddenLabelProps> = ({
  htmlFor,
  children,
  required = false,
}) => {
  return (
    <label htmlFor={htmlFor} className="sr-only">
      {children}
      {required && <span>(obrigatório)</span>}
    </label>
  )
}

interface FormGroupProps {
  /** ID do elemento de formulário associado */
  id: string
  /** Texto do label */
  label: React.ReactNode
  /** Se o campo é obrigatório */
  required?: boolean
  /** Mensagem de erro */
  error?: string
  /** Texto de dica opcional */
  hint?: string
  /** Filhos do componente (normalmente o input) */
  children: React.ReactNode
  /** Classes CSS adicionais */
  className?: string
}

/**
 * Componente que agrupa um campo de formulário, seu label e mensagens de erro/dica
 *
 * Facilita a criação de formulários acessíveis com todas as relações ARIA corretas
 */
export const FormGroup: React.FC<FormGroupProps> = ({
  id,
  label,
  required = false,
  error,
  hint,
  children,
  className = '',
}) => {
  const errorId = error ? `${id}-error` : undefined
  const hintId = hint ? `${id}-hint` : undefined

  // Constrói o aria-describedby a partir dos IDs disponíveis
  const getDescribedBy = () => {
    const ids = []
    if (errorId) ids.push(errorId)
    if (hintId) ids.push(hintId)
    return ids.length > 0 ? ids.join(' ') : undefined
  }

  // Injeta props de acessibilidade nos filhos (deve ser apenas um filho)
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        id,
        'aria-invalid': error ? 'true' : undefined,
        'aria-required': required ? 'true' : undefined,
        'aria-describedby': getDescribedBy(),
        ...child.props,
      })
    }
    return child
  })

  return (
    <div className={`form-group ${error ? 'has-error' : ''} ${className}`}>
      <FormLabel htmlFor={id} required={required}>
        {label}
      </FormLabel>

      {hint && !error && (
        <p
          id={hintId}
          className="mt-1 text-xs text-gray-500 dark:text-gray-400"
        >
          {hint}
        </p>
      )}

      {childrenWithProps}

      {error && (
        <p
          id={errorId}
          className="mt-1 text-xs text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}
