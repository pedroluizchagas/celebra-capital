/**
 * Design System - Tipografia
 *
 * Este arquivo define todas as variáveis tipográficas utilizadas no Design System da Celebra Capital.
 * A tipografia segue diretrizes da WCAG 2.1 para garantir acessibilidade.
 */

export const fontFamily = {
  // Família principal - sem serifa para melhor legibilidade na tela
  sans: ['Inter', 'system-ui', 'sans-serif'],

  // Família secundária (para casos específicos)
  serif: ['Georgia', 'serif'],

  // Família para códigos
  mono: ['SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
}

export const fontWeight = {
  thin: '100',
  extralight: '200',
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
}

// Escala de tamanhos de fonte
export const fontSize = {
  // Tamanhos de texto
  xs: '0.75rem', // 12px
  sm: '0.875rem', // 14px
  base: '1rem', // 16px (base)
  lg: '1.125rem', // 18px
  xl: '1.25rem', // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem', // 48px
  '6xl': '3.75rem', // 60px

  // Tamanhos para títulos (aliases semânticos)
  h1: '2.25rem', // 36px
  h2: '1.875rem', // 30px
  h3: '1.5rem', // 24px
  h4: '1.25rem', // 20px
  h5: '1.125rem', // 18px
  h6: '1rem', // 16px
}

// Espaçamento entre linhas
export const lineHeight = {
  none: '1', // Sem espaçamento adicional
  tight: '1.25', // Condensado
  snug: '1.375', // Ligeiramente condensado
  normal: '1.5', // Padrão (bom para leitura)
  relaxed: '1.625', // Ligeiramente expandido
  loose: '2', // Expandido

  // Para títulos
  heading: '1.2',
}

// Espaçamento entre letras
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
}

// Estilos de texto predefinidos
export const textStyles = {
  // Títulos
  h1: {
    fontSize: fontSize.h1,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.heading,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontSize: fontSize.h2,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.heading,
    letterSpacing: letterSpacing.tight,
  },
  h3: {
    fontSize: fontSize.h3,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.heading,
    letterSpacing: letterSpacing.normal,
  },
  h4: {
    fontSize: fontSize.h4,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.heading,
    letterSpacing: letterSpacing.normal,
  },
  h5: {
    fontSize: fontSize.h5,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.heading,
    letterSpacing: letterSpacing.normal,
  },
  h6: {
    fontSize: fontSize.h6,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.heading,
    letterSpacing: letterSpacing.normal,
  },

  // Corpo de texto
  bodyLarge: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.relaxed,
    letterSpacing: letterSpacing.normal,
  },
  bodyDefault: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  bodySmall: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },

  // Elementos de formulário
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  placeholder: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },

  // Outros estilos
  button: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.wide,
  },
  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.wide,
  },
  overline: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.widest,
    textTransform: 'uppercase',
  },
}

export default {
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
  textStyles,
}
