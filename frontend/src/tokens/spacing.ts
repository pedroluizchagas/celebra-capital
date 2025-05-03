/**
 * Design System - Espaçamento
 *
 * Este arquivo define as variáveis de espaçamento utilizadas no Design System da Celebra Capital.
 * O sistema utiliza uma escala consistente para criar ritmo visual na interface.
 */

// Sistema de espaçamento baseado em múltiplos de 4px (0.25rem)
export const spacing = {
  px: '1px',
  0: '0',
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
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  11: '2.75rem', // 44px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px
  36: '9rem', // 144px
  40: '10rem', // 160px
  44: '11rem', // 176px
  48: '12rem', // 192px
  52: '13rem', // 208px
  56: '14rem', // 224px
  60: '15rem', // 240px
  64: '16rem', // 256px
  72: '18rem', // 288px
  80: '20rem', // 320px
  96: '24rem', // 384px
}

// Espaçamento semântico para uso em componentes específicos
export const componentSpacing = {
  // Layout
  container: {
    padding: {
      sm: spacing[4], // 1rem (16px)
      md: spacing[6], // 1.5rem (24px)
      lg: spacing[8], // 2rem (32px)
    },
    maxWidth: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },

  // Componentes
  card: {
    padding: spacing[6], // 1.5rem (24px)
    gap: spacing[4], // 1rem (16px)
    borderRadius: spacing[2], // 0.5rem (8px)
  },

  button: {
    paddingX: {
      sm: spacing[2.5], // 0.625rem (10px)
      md: spacing[4], // 1rem (16px)
      lg: spacing[6], // 1.5rem (24px)
    },
    paddingY: {
      sm: spacing[1.5], // 0.375rem (6px)
      md: spacing[2], // 0.5rem (8px)
      lg: spacing[3], // 0.75rem (12px)
    },
    gap: spacing[2], // 0.5rem (8px)
  },

  form: {
    gap: spacing[6], // 1.5rem (24px)
    fieldGap: spacing[2], // 0.5rem (8px)
    inputPaddingX: spacing[3], // 0.75rem (12px)
    inputPaddingY: spacing[2], // 0.5rem (8px)
  },

  modal: {
    padding: spacing[6], // 1.5rem (24px)
    gap: spacing[4], // 1rem (16px)
    headerGap: spacing[4], // 1rem (16px)
    contentGap: spacing[6], // 1.5rem (24px)
    footerGap: spacing[4], // 1rem (16px)
  },

  table: {
    cellPaddingX: spacing[4], // 1rem (16px)
    cellPaddingY: spacing[3], // 0.75rem (12px)
  },

  // Navegação
  navigation: {
    gap: spacing[2], // 0.5rem (8px)
    itemPaddingX: spacing[3], // 0.75rem (12px)
    itemPaddingY: spacing[2], // 0.5rem (8px)
  },

  // Mensagens
  alert: {
    padding: spacing[4], // 1rem (16px)
    gap: spacing[3], // 0.75rem (12px)
  },

  // Lists
  list: {
    gap: spacing[2], // 0.5rem (8px)
    itemPaddingX: spacing[4], // 1rem (16px)
    itemPaddingY: spacing[3], // 0.75rem (12px)
  },
}

// Escalas de z-index
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
}

export default {
  spacing,
  componentSpacing,
  zIndex,
}
