import React, { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'text'
  size?: 'small' | 'medium' | 'large'
  isLoading?: boolean
  fullWidth?: boolean
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  'aria-label': ariaLabel,
  ...props
}) => {
  const baseStyles =
    'rounded-md font-medium focus:outline-none transition-all focus:ring-2 focus:ring-offset-2'

  const variantStyles = {
    primary:
      'bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 focus:ring-primary-500 dark:focus:ring-primary-400 dark:focus:ring-offset-gray-900',
    secondary:
      'bg-secondary-600 text-white hover:bg-secondary-700 dark:bg-secondary-700 dark:hover:bg-secondary-800 focus:ring-secondary-500 dark:focus:ring-secondary-400 dark:focus:ring-offset-gray-900',
    outline:
      'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 focus:ring-primary-500 dark:focus:ring-primary-400 dark:focus:ring-offset-gray-900',
    text: 'text-primary-600 bg-transparent hover:bg-gray-100 dark:text-primary-400 dark:hover:bg-gray-800 focus:ring-primary-500 dark:focus:ring-primary-400 dark:focus:ring-offset-gray-900',
  }

  const sizeStyles = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  }

  const widthStyles = fullWidth ? 'w-full' : ''

  const buttonClasses = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${widthStyles}
    ${disabled || isLoading ? 'opacity-60 cursor-not-allowed' : ''}
    ${className}
  `

  // Atributos de acessibilidade para o estado de carregamento
  const a11yProps = isLoading
    ? {
        'aria-busy': true,
        'aria-disabled': true,
      }
    : disabled
    ? {
        'aria-disabled': true,
      }
    : {}

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...a11yProps}
      aria-label={ariaLabel}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center" aria-hidden="true">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Carregando...</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}

export default Button
