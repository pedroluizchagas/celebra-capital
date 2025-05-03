import React, { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  helperText?: string
  showCharCount?: boolean
  maxLength?: number
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  id,
  required,
  rows = 3,
  maxLength,
  showCharCount = false,
  value = '',
  ...props
}) => {
  const errorId = error ? `${id}-error` : undefined
  const helperId = helperText ? `${id}-helper` : undefined
  const counterId = showCharCount ? `${id}-counter` : undefined
  const describedBy = [errorId, helperId, counterId].filter(Boolean).join(' ')

  const currentLength = typeof value === 'string' ? value.length : 0
  const isNearMaxLength = maxLength && currentLength >= maxLength * 0.9
  const isAtMaxLength = maxLength && currentLength >= maxLength

  return (
    <div className="form-field">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <textarea
        id={id}
        rows={rows}
        maxLength={maxLength}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={describedBy || undefined}
        className={`
          block w-full rounded-md border-gray-300 shadow-sm
          focus:border-primary-500 focus:ring-primary-500
          ${error ? 'border-red-500' : ''}
          ${
            isAtMaxLength
              ? 'border-red-500'
              : isNearMaxLength
              ? 'border-yellow-500'
              : ''
          }
        `}
        value={value}
        {...props}
      />

      <div className="flex justify-between mt-1">
        {(helperText || error) && (
          <div>
            {helperText && (
              <p id={helperId} className="text-sm text-gray-500">
                {helperText}
              </p>
            )}
            {error && (
              <p id={errorId} className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>
        )}

        {showCharCount && maxLength && (
          <p
            id={counterId}
            className={`text-sm ml-auto ${
              isAtMaxLength
                ? 'text-red-600 font-medium'
                : isNearMaxLength
                ? 'text-yellow-600'
                : 'text-gray-500'
            }`}
            aria-live="polite"
          >
            <span className="sr-only">
              {isAtMaxLength
                ? 'Limite de caracteres atingido. '
                : isNearMaxLength
                ? 'Próximo do limite de caracteres. '
                : ''}
            </span>
            {currentLength}/{maxLength}
          </p>
        )}
      </div>
    </div>
  )
}
