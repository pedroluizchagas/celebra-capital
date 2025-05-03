import React, { forwardRef, InputHTMLAttributes, ReactNode } from 'react'
import { styled } from '@mui/material/styles'
import { Box, InputAdornment, TextField } from '@mui/material'

// Tipos para variantes do input
export type InputVariant = 'outlined' | 'filled' | 'standard'

// Tipos para tamanhos do input
export type InputSize = 'small' | 'medium' | 'large'

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label para o input */
  label?: string
  /** Texto auxiliar abaixo do input */
  helperText?: string
  /** Mensagem de erro (quando aplicável) */
  error?: string | boolean
  /** Variante visual do input */
  variant?: InputVariant
  /** Tamanho do input */
  size?: InputSize
  /** Ícone ou elemento para exibir no início do input */
  startAdornment?: ReactNode
  /** Ícone ou elemento para exibir no final do input */
  endAdornment?: ReactNode
  /** Se o input deve ocupar toda a largura disponível */
  fullWidth?: boolean
  /** Estilo para campo desabilitado */
  disabled?: boolean
  /** Estilo para campo somente leitura */
  readOnly?: boolean
  /** Estilo para campos obrigatórios */
  required?: boolean
  /** Placeholder text */
  placeholder?: string
  /** ID para associar label e input (acessibilidade) */
  id?: string
  /** Nome para identificar o campo em formulários */
  name?: string
  /** Valor atual do input */
  value?: string | number
  /** Função chamada quando o valor muda */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  /** Classes CSS adicionais */
  className?: string
}

/**
 * Componente Input
 *
 * Componente para campos de entrada de texto que segue o Design System.
 * Suporta diferentes variantes, tamanhos, estados e validação.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      variant = 'outlined',
      size = 'medium',
      startAdornment,
      endAdornment,
      fullWidth = false,
      disabled = false,
      readOnly = false,
      required = false,
      placeholder,
      id,
      name,
      value,
      onChange,
      className,
      ...props
    },
    ref
  ) => {
    // Mapeando o tamanho do nosso Design System para o Material UI
    const muiSize = size === 'large' ? 'medium' : size

    // Determinando se deve mostrar erro
    const hasError = Boolean(error)

    // Helper text final (pode ser a mensagem de erro ou o helper text normal)
    const finalHelperText =
      hasError && typeof error === 'string' ? error : helperText

    // Preparando os adornos, se fornecidos
    const startAdornmentElement = startAdornment ? (
      <InputAdornment position="start">{startAdornment}</InputAdornment>
    ) : undefined

    const endAdornmentElement = endAdornment ? (
      <InputAdornment position="end">{endAdornment}</InputAdornment>
    ) : undefined

    // Classes adicionais para tamanho personalizado
    const sizeClasses = {
      small: 'text-sm py-1',
      medium: 'text-base py-2',
      large: 'text-lg py-3',
    }[size]

    return (
      <TextField
        id={id}
        name={name}
        label={label}
        placeholder={placeholder}
        variant={variant}
        size={muiSize}
        error={hasError}
        helperText={finalHelperText}
        disabled={disabled}
        required={required}
        fullWidth={fullWidth}
        value={value}
        onChange={onChange}
        inputRef={ref}
        inputProps={{
          readOnly,
          ...props,
          className: `${sizeClasses} ${props.className || ''}`,
        }}
        InputProps={{
          startAdornment: startAdornmentElement,
          endAdornment: endAdornmentElement,
          className: `input-root-${size} ${className || ''}`,
        }}
        FormHelperTextProps={{
          className: hasError ? 'text-red-500 dark:text-red-400' : '',
        }}
        className={`design-system-input ${disabled ? 'opacity-60' : ''}`}
        sx={{
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: hasError
                ? 'var(--color-error)'
                : 'var(--color-primary-600)',
              borderWidth: '2px',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: hasError
                ? 'var(--color-error)'
                : 'var(--color-gray-500)',
            },
          },
          '& .input-root-large': {
            fontSize: 'var(--font-size-lg)',
            padding: 'var(--spacing-3) var(--spacing-4)',
          },
          '& .MuiInputBase-input': {
            '&::placeholder': {
              opacity: 0.7,
              color: 'var(--color-gray-500)',
            },
          },
          '& .MuiFormLabel-root.Mui-focused': {
            color: hasError ? 'var(--color-error)' : 'var(--color-primary-600)',
          },
        }}
      />
    )
  }
)

Input.displayName = 'Input'

export default Input
