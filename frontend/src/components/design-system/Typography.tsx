import React, { ReactNode } from 'react'
import { styled } from '@mui/material/styles'
import { Box } from '@mui/material'

// Tipos de variantes de tipografia
export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'overline'

// Tipos de cores para o texto
export type TypographyColor =
  | 'primary'
  | 'secondary'
  | 'error'
  | 'warning'
  | 'info'
  | 'success'
  | 'inherit'

// Tipos de alinhamento de texto
export type TypographyAlign = 'left' | 'center' | 'right' | 'justify'

// Tipos de peso de fonte
export type TypographyWeight =
  | 'light'
  | 'regular'
  | 'medium'
  | 'semibold'
  | 'bold'

export interface TypographyProps {
  /** Conteúdo a ser exibido */
  children: ReactNode
  /** Variante da tipografia */
  variant?: TypographyVariant
  /** Cor do texto */
  color?: TypographyColor
  /** Alinhamento do texto */
  align?: TypographyAlign
  /** Peso da fonte */
  weight?: TypographyWeight
  /** Aplicar transformação para texto em maiúsculas */
  uppercase?: boolean
  /** Aplicar transformação para texto em itálico */
  italic?: boolean
  /** Aplicar decoração de texto sublinhado */
  underline?: boolean
  /** Truncar texto com reticências quando overflow */
  truncate?: boolean
  /** Classe CSS personalizada */
  className?: string
  /** Propriedades adicionais do elemento */
  [x: string]: any
}

// Mapeamento de variantes para classes CSS
const variantClasses: Record<TypographyVariant, string> = {
  h1: 'text-4xl font-semibold leading-tight',
  h2: 'text-3xl font-semibold leading-tight',
  h3: 'text-2xl font-semibold leading-tight',
  h4: 'text-xl font-semibold leading-tight',
  h5: 'text-lg font-semibold leading-tight',
  h6: 'text-base font-semibold leading-tight',
  subtitle1: 'text-lg font-medium leading-normal',
  subtitle2: 'text-base font-medium leading-normal',
  body1: 'text-base font-normal leading-relaxed',
  body2: 'text-sm font-normal leading-relaxed',
  caption: 'text-xs font-normal leading-normal',
  overline: 'text-xs font-medium leading-normal uppercase tracking-wider',
}

// Mapeamento de cores para classes CSS
const colorClasses: Record<TypographyColor, string> = {
  primary: 'text-gray-900 dark:text-gray-100',
  secondary: 'text-gray-700 dark:text-gray-300',
  error: 'text-red-600 dark:text-red-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  info: 'text-blue-600 dark:text-blue-400',
  success: 'text-green-600 dark:text-green-400',
  inherit: 'text-inherit',
}

// Mapeamento de alinhamentos para classes CSS
const alignClasses: Record<TypographyAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
}

// Mapeamento de pesos de fonte para classes CSS
const weightClasses: Record<TypographyWeight, string> = {
  light: 'font-light',
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
}

// Mapeamento de variantes para elementos HTML
const variantElements: Record<TypographyVariant, keyof JSX.IntrinsicElements> =
  {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    subtitle1: 'h6',
    subtitle2: 'h6',
    body1: 'p',
    body2: 'p',
    caption: 'span',
    overline: 'span',
  }

/**
 * Componente Typography
 *
 * Componente para renderizar texto com estilos consistentes seguindo o Design System.
 * Suporta diferentes variantes, cores, alinhamentos e pesos de fonte.
 */
const Typography = ({
  children,
  variant = 'body1',
  color = 'primary',
  align = 'left',
  weight,
  uppercase = false,
  italic = false,
  underline = false,
  truncate = false,
  className = '',
  ...props
}: TypographyProps) => {
  // Construindo as classes com base nas props
  const classNames = [
    variantClasses[variant],
    colorClasses[color],
    alignClasses[align],
    weight ? weightClasses[weight] : '',
    uppercase ? 'uppercase' : '',
    italic ? 'italic' : '',
    underline ? 'underline' : '',
    truncate ? 'truncate' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  // Determinando o elemento HTML com base na variante
  const Component = variantElements[variant]

  return (
    <Box component={Component} className={classNames} {...props}>
      {children}
    </Box>
  )
}

export default Typography
