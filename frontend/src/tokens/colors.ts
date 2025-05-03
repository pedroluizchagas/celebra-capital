/**
 * Design System - Cores
 *
 * Este arquivo define todas as cores utilizadas no Design System da Celebra Capital.
 * As cores seguem diretrizes da WCAG 2.1 para garantir contraste adequado (AA).
 */

export const colors = {
  // Cores Primárias
  celebraBlue: {
    50: '#ecf0ff',
    100: '#dce2ff',
    200: '#bbc8ff',
    300: '#96a3ff',
    400: '#7a80ff',
    500: '#6860fa',
    600: '#5548e8',
    700: '#473ad1',
    800: '#3a30a9',
    900: '#2f2d80',
    950: '#1a1a4b',
    base: '#0111a2',
  },

  // Cores Secundárias
  celebraOrange: {
    50: '#fff5ec',
    100: '#ffe9d5',
    200: '#ffd0aa',
    300: '#ffb275',
    400: '#ff8c3d',
    500: '#ff6f1b',
    600: '#ed5000',
    700: '#c54104',
    800: '#9c360c',
    900: '#7e300f',
    950: '#441505',
    base: '#d23a07',
  },

  // Escala de Cinza
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Feedback
  feedback: {
    success: {
      light: '#10b981',
      dark: '#059669',
      bg: '#ecfdf5',
      text: '#065f46',
    },
    error: {
      light: '#ef4444',
      dark: '#b91c1c',
      bg: '#fee2e2',
      text: '#991b1b',
    },
    warning: {
      light: '#f59e0b',
      dark: '#d97706',
      bg: '#fffbeb',
      text: '#92400e',
    },
    info: {
      light: '#3b82f6',
      dark: '#2563eb',
      bg: '#eff6ff',
      text: '#1e40af',
    },
  },
}

// Aliases semânticos
export const semanticColors = {
  // Tema claro
  light: {
    background: {
      primary: '#ffffff',
      secondary: colors.gray[50],
      tertiary: colors.gray[100],
    },
    text: {
      primary: colors.gray[900],
      secondary: colors.gray[700],
      tertiary: colors.gray[600],
      disabled: colors.gray[400],
      inverse: '#ffffff',
    },
    border: {
      primary: colors.gray[200],
      secondary: colors.gray[300],
      focus: colors.celebraBlue[400],
    },
    action: {
      primary: colors.celebraBlue.base,
      primaryHover: colors.celebraBlue[700],
      secondary: colors.celebraOrange.base,
      secondaryHover: colors.celebraOrange[700],
      disabled: colors.gray[300],
    },
  },

  // Tema escuro
  dark: {
    background: {
      primary: colors.gray[900],
      secondary: colors.gray[800],
      tertiary: colors.gray[700],
    },
    text: {
      primary: '#ffffff',
      secondary: colors.gray[200],
      tertiary: colors.gray[300],
      disabled: colors.gray[500],
      inverse: colors.gray[900],
    },
    border: {
      primary: colors.gray[700],
      secondary: colors.gray[600],
      focus: colors.celebraBlue[400],
    },
    action: {
      primary: colors.celebraBlue[500],
      primaryHover: colors.celebraBlue[400],
      secondary: colors.celebraOrange[500],
      secondaryHover: colors.celebraOrange[400],
      disabled: colors.gray[700],
    },
  },
}

export default colors
