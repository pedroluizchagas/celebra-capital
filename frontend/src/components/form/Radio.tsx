import React, { InputHTMLAttributes } from 'react'

interface RadioOption {
  value: string
  label: string
  disabled?: boolean
}

interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  options: RadioOption[]
  error?: string
  helperText?: string
}

export const Radio: React.FC<RadioProps> = ({
  label,
  options,
  error,
  helperText,
  id,
  name,
  required,
  onChange,
  value,
  ...props
}) => {
  const errorId = error ? `${id}-error` : undefined
  const helperId = helperText ? `${id}-helper` : undefined
  const describedBy = [errorId, helperId].filter(Boolean).join(' ')
  const groupLabelId = `${id}-group-label`

  return (
    <div className="form-field">
      <div
        role="radiogroup"
        aria-labelledby={groupLabelId}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={describedBy || undefined}
      >
        <p
          id={groupLabelId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </p>

        <div className="space-y-2">
          {options.map((option, index) => {
            const optionId = `${id}-${index}`
            return (
              <div key={option.value} className="flex items-center">
                <input
                  id={optionId}
                  name={name}
                  type="radio"
                  value={option.value}
                  checked={value === option.value}
                  disabled={option.disabled}
                  onChange={onChange}
                  className={`
                    h-4 w-4 border-gray-300
                    text-primary-600 focus:ring-primary-500
                    ${error ? 'border-red-500' : ''}
                  `}
                  {...props}
                />
                <label
                  htmlFor={optionId}
                  className="ml-3 block text-sm font-medium text-gray-700"
                >
                  {option.label}
                </label>
              </div>
            )
          })}
        </div>
      </div>

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
