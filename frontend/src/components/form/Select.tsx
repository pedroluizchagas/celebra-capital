import React, { SelectHTMLAttributes } from 'react'

interface Option {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label: string
  options: Option[]
  error?: string
  helperText?: string
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
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
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <select
        id={id}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={describedBy || undefined}
        className={`
          block w-full rounded-md border-gray-300 shadow-sm
          focus:border-primary-500 focus:ring-primary-500
          ${error ? 'border-red-500' : ''}
        `}
        {...props}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {helperText && (
        <p id={helperId} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
