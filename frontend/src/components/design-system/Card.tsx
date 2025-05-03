import React from 'react'
import MuiPaper, { PaperProps as MuiPaperProps } from '@mui/material/Paper'
import { useTheme } from '@mui/material/styles'

// Variantes do card
export type CardVariant = 'default' | 'outlined' | 'elevated'

// Props específicas do card
export interface CardProps extends Omit<MuiPaperProps, 'variant'> {
  variant?: CardVariant
  noPadding?: boolean
  interactive?: boolean
  selected?: boolean
}

// Componente Card
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      noPadding = false,
      interactive = false,
      selected = false,
      children,
      sx,
      ...props
    },
    ref
  ) => {
    const theme = useTheme()
    const isDarkMode = theme.palette.mode === 'dark'

    // Mapear nossa variante para o MUI
    const muiVariant: 'outlined' | undefined =
      variant === 'outlined' ? 'outlined' : undefined

    // Determinar a elevação com base na variante
    const elevation = variant === 'elevated' ? 2 : 1

    // Estilo base
    const baseStyles = {
      borderRadius: '0.5rem', // 8px card
      boxShadow:
        variant === 'default' || variant === 'elevated' ? undefined : 'none',
      padding: noPadding ? 0 : '1.5rem', // 24px
      ...(interactive && {
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      }),
      ...(selected && {
        borderColor: isDarkMode ? '#7a80ff' : '#6860fa',
        borderWidth: '2px',
        borderStyle: 'solid',
      }),
    }

    return (
      <MuiPaper
        ref={ref}
        variant={muiVariant}
        elevation={elevation}
        sx={{
          ...baseStyles,
          ...sx,
        }}
        {...props}
      >
        {children}
      </MuiPaper>
    )
  }
)

Card.displayName = 'Card'

export default Card
