/**
 * Design Tokens
 *
 * Este arquivo contém todos os tokens de design usados no projeto.
 * Os tokens definem as constantes fundamentais do sistema: cores, tipografia, espaçamento, etc.
 * Estes tokens são usados pelos componentes do Design System para garantir consistência visual.
 */

// Cores
export const colors = {
  primary: {
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
  },
  secondary: {
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
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    750: '#333741',
    800: '#1f2937',
    850: '#1a1f2b',
    900: '#111827',
    950: '#0d1018',
  },
  celebra: {
    blue: '#0111a2',
    orange: '#d23a07',
  },
  semantic: {
    error: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981',
    info: '#3b82f6',
  },
}

// Tipografia
export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, sans-serif',
  },
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
}

// Espaçamento
export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  32: '8rem', // 128px
}

// Bordas
export const borders = {
  radius: {
    none: '0',
    sm: '0.125rem', // 2px
    default: '0.25rem', // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    '2xl': '1rem', // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px',
  },
  width: {
    none: '0',
    thin: '1px',
    thick: '2px',
    heavy: '4px',
  },
}

// Sombras
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
}

// Breakpoints (para responsividade)
export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

// Z-index
export const zIndex = {
  0: 0,
  10: 10,
  20: 20,
  30: 30,
  40: 40,
  50: 50,
  auto: 'auto',
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
}

// Exportar todos os tokens como objeto padrão
export default {
  colors,
  typography,
  spacing,
  borders,
  shadows,
  breakpoints,
  zIndex,
}
