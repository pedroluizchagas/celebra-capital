import React, { InputHTMLAttributes } from 'react'

interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  error?: string
  helperText?: string
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  helperText,
  id,
  required,
  ...props
}) => {
  const errorId = error ? `${id}-error` : undefined
  const helperId = helperText ? `${id}-helper` : undefined
  const describedBy = [errorId, helperId].filter(Boolean).join(' ')

  return (
    <div className="form-field">
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={id}
            type="checkbox"
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={describedBy || undefined}
            className={`
              h-4 w-4 rounded border-gray-300
              text-primary-600 focus:ring-primary-500
              ${error ? 'border-red-500' : ''}
            `}
            {...props}
          />
        </div>
        <div className="ml-3">
          <label htmlFor={id} className="text-sm font-medium text-gray-700">
            {label}
            {required && <span aria-hidden="true"> *</span>}
          </label>
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
      </div>
    </div>
  )
}
