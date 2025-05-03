import * as React from 'react'
import {
  FormControl,
  FormControlProps,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select as MuiSelect,
  SelectChangeEvent,
  useTheme,
  Theme,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import Typography, { TypographyColor } from './Typography'

// Tipos para variantes do select
export type SelectVariant = 'outlined' | 'filled' | 'standard'

// Tipos para tamanhos do select
export type SelectSize = 'small' | 'medium'

// Tipo para opções do select
export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  component?: React.ReactNode
}

// Props do componente
export interface SelectProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Label para o select */
  label: string
  /** Valor atual do select */
  value: string | string[]
  /** Função chamada quando o valor muda */
  onChange: (value: string | string[]) => void
  /** Opções disponíveis para seleção */
  options: SelectOption[]
  /** Placeholder quando nenhuma opção está selecionada */
  placeholder?: string
  /** Texto auxiliar abaixo do select */
  helperText?: string
  /** Mensagem de erro (quando aplicável) */
  error?: boolean
  /** Se o select está desabilitado */
  disabled?: boolean
  /** Se o select é obrigatório */
  required?: boolean
  /** Variante visual do select */
  variant?: SelectVariant
  /** Tamanho do select */
  size?: SelectSize
  /** Se o select deve ocupar toda a largura disponível */
  fullWidth?: boolean
  /** Se permite múltiplas seleções */
  multiple?: boolean
  /** Estilos CSS adicionais */
  style?: React.CSSProperties
  /** Classes CSS adicionais */
  className?: string
  /** ID do elemento */
  id?: string
}

interface StyledFormControlProps {
  theme: Theme
}

const StyledFormControl = styled(FormControl)<FormControlProps>(
  ({ theme }: StyledFormControlProps) => ({
    marginBottom: theme.spacing(2),
    minWidth: 200,

    '& .MuiInputLabel-root': {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: theme.palette.text.primary,
    },

    '& .MuiSelect-select': {
      display: 'flex',
      alignItems: 'center',
      minHeight: 42,
    },

    '& .MuiFormHelperText-root': {
      marginLeft: 0,
      fontSize: '0.75rem',
    },
  })
)

/**
 * Componente Select personalizado do design system
 *
 * Permite ao usuário selecionar uma ou múltiplas opções de uma lista.
 * Suporta diferentes variantes, tamanhos, estados e validação.
 */
const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      label,
      value,
      onChange,
      options,
      placeholder,
      helperText,
      error = false,
      disabled = false,
      required = false,
      variant = 'outlined',
      size = 'medium',
      fullWidth = false,
      multiple = false,
      style,
      className,
      id,
      ...props
    }: SelectProps,
    ref: React.Ref<HTMLDivElement>
  ) => {
    const theme = useTheme()
    const selectId =
      id ||
      `select-${
        label?.toLowerCase().replace(/\s+/g, '-') ||
        Math.random().toString(36).substring(2, 9)
      }`
    const labelId = `${selectId}-label`

    const [selectedValue, setSelectedValue] = React.useState<string | string[]>(
      value !== undefined ? value : multiple ? [] : ''
    )

    const handleChange = React.useCallback(
      (event: SelectChangeEvent<string | string[]>) => {
        const newValue = event.target.value
        setSelectedValue(newValue)
        if (onChange) {
          onChange(newValue)
        }
      },
      [onChange]
    )

    // Atualiza o valor interno quando o valor externo mudar
    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value)
      }
    }, [value])

    return (
      <StyledFormControl
        error={error}
        disabled={disabled}
        required={required}
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        style={style}
        className={className}
        ref={ref}
      >
        {label && (
          <InputLabel id={labelId} required={required}>
            {label}
          </InputLabel>
        )}
        <MuiSelect
          labelId={labelId}
          id={selectId}
          label={label}
          value={selectedValue}
          onChange={handleChange}
          multiple={multiple}
          displayEmpty={!!placeholder}
          renderValue={(selected: string | string[]) => {
            if (multiple) {
              const selectedArray = selected as string[]
              if (selectedArray.length === 0 && placeholder) {
                return placeholder
              }
              return selectedArray
                .map(
                  (value) =>
                    options.find((opt) => String(opt.value) === value)?.label ||
                    value
                )
                .join(', ')
            } else {
              const selectedString = selected as string
              if (selectedString === '' && placeholder) {
                return placeholder
              }
              return (
                options.find((opt) => String(opt.value) === selectedString)
                  ?.label || selectedString
              )
            }
          }}
          {...props}
        >
          {placeholder && !multiple && (
            <MenuItem value="" disabled>
              {placeholder}
            </MenuItem>
          )}
          {options.map((option) => (
            <MenuItem
              key={option.value}
              value={String(option.value)}
              disabled={option.disabled}
            >
              {option.component || option.label}
            </MenuItem>
          ))}
        </MuiSelect>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </StyledFormControl>
    )
  }
)

Select.displayName = 'Select'

export default Select
