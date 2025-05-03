/**
 * Design System - Bordas e Cantos Arredondados
 *
 * Este arquivo define as variáveis de bordas e raios de cantos utilizadas no Design System da Celebra Capital.
 * As bordas seguem uma escala consistente para manter a coesão visual.
 */

// Espessuras de bordas
export const borderWidths = {
  none: '0px',
  thin: '1px',
  base: '2px',
  thick: '4px',
  heavy: '8px',
}

// Estilos de bordas
export const borderStyles = {
  solid: 'solid',
  dashed: 'dashed',
  dotted: 'dotted',
  double: 'double',
  none: 'none',
}

// Raios de cantos (border-radius)
export const borderRadius = {
  // Escala básica
  none: '0px',
  xs: '0.125rem', // 2px
  sm: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px', // Para elementos circulares

  // Para cantos de elementos específicos
  button: '0.375rem', // 6px
  input: '0.375rem', // 6px
  card: '0.5rem', // 8px
  badge: '9999px', // Pill shape
  tooltip: '0.25rem', // 4px
  modal: '0.75rem', // 12px
  avatar: '50%', // Circular
}

// Tokens para bordas de elementos específicos
export const borders = {
  // Tema claro
  light: {
    // Valores padrão
    default: `${borderWidths.thin} ${borderStyles.solid} #e5e7eb`, // Cinza-200
    focus: `${borderWidths.thin} ${borderStyles.solid} #6860fa`, // Primary-500
    error: `${borderWidths.thin} ${borderStyles.solid} #ef4444`, // Red-500
    success: `${borderWidths.thin} ${borderStyles.solid} #10b981`, // Green-500

    // Elementos específicos
    input: {
      default: `${borderWidths.thin} ${borderStyles.solid} #d1d5db`, // Cinza-300
      hover: `${borderWidths.thin} ${borderStyles.solid} #9ca3af`, // Cinza-400
      focus: `${borderWidths.thin} ${borderStyles.solid} #6860fa`, // Primary-500
      error: `${borderWidths.thin} ${borderStyles.solid} #ef4444`, // Red-500
      success: `${borderWidths.thin} ${borderStyles.solid} #10b981`, // Green-500
      disabled: `${borderWidths.thin} ${borderStyles.solid} #e5e7eb`, // Cinza-200
    },

    // Cards
    card: {
      default: `${borderWidths.thin} ${borderStyles.solid} #e5e7eb`, // Cinza-200
      hover: `${borderWidths.thin} ${borderStyles.solid} #d1d5db`, // Cinza-300
      selected: `${borderWidths.thin} ${borderStyles.solid} #6860fa`, // Primary-500
    },

    // Divisórias
    divider: `${borderWidths.thin} ${borderStyles.solid} #e5e7eb`, // Cinza-200

    // Botões
    button: {
      default: 'none',
      primary: 'none',
      secondary: 'none',
      outline: `${borderWidths.thin} ${borderStyles.solid} #d1d5db`, // Cinza-300
    },

    // Tabelas
    table: {
      header: `${borderWidths.thin} ${borderStyles.solid} #e5e7eb`, // Cinza-200
      cell: `${borderWidths.thin} ${borderStyles.solid} #e5e7eb`, // Cinza-200
      border: `${borderWidths.thin} ${borderStyles.solid} #f3f4f6`, // Cinza-100
    },
  },

  // Tema escuro
  dark: {
    // Valores padrão
    default: `${borderWidths.thin} ${borderStyles.solid} #4b5563`, // Cinza-600
    focus: `${borderWidths.thin} ${borderStyles.solid} #7a80ff`, // Primary-400
    error: `${borderWidths.thin} ${borderStyles.solid} #f87171`, // Red-400
    success: `${borderWidths.thin} ${borderStyles.solid} #34d399`, // Green-400

    // Elementos específicos
    input: {
      default: `${borderWidths.thin} ${borderStyles.solid} #4b5563`, // Cinza-600
      hover: `${borderWidths.thin} ${borderStyles.solid} #6b7280`, // Cinza-500
      focus: `${borderWidths.thin} ${borderStyles.solid} #7a80ff`, // Primary-400
      error: `${borderWidths.thin} ${borderStyles.solid} #f87171`, // Red-400
      success: `${borderWidths.thin} ${borderStyles.solid} #34d399`, // Green-400
      disabled: `${borderWidths.thin} ${borderStyles.solid} #374151`, // Cinza-700
    },

    // Cards
    card: {
      default: `${borderWidths.thin} ${borderStyles.solid} #374151`, // Cinza-700
      hover: `${borderWidths.thin} ${borderStyles.solid} #4b5563`, // Cinza-600
      selected: `${borderWidths.thin} ${borderStyles.solid} #7a80ff`, // Primary-400
    },

    // Divisórias
    divider: `${borderWidths.thin} ${borderStyles.solid} #374151`, // Cinza-700

    // Botões
    button: {
      default: 'none',
      primary: 'none',
      secondary: 'none',
      outline: `${borderWidths.thin} ${borderStyles.solid} #4b5563`, // Cinza-600
    },

    // Tabelas
    table: {
      header: `${borderWidths.thin} ${borderStyles.solid} #374151`, // Cinza-700
      cell: `${borderWidths.thin} ${borderStyles.solid} #374151`, // Cinza-700
      border: `${borderWidths.thin} ${borderStyles.solid} #1f2937`, // Cinza-800
    },
  },
}

// Estilos de outline para elementos com foco (acessibilidade)
export const outlines = {
  // Tema claro
  light: {
    focus: `2px solid rgba(104, 96, 250, 0.5)`, // Primary-500 com opacidade
    offset: '2px',
  },

  // Tema escuro
  dark: {
    focus: `2px solid rgba(122, 128, 255, 0.5)`, // Primary-400 com opacidade
    offset: '2px',
  },
}

export default {
  borderWidths,
  borderStyles,
  borderRadius,
  borders,
  outlines,
}
