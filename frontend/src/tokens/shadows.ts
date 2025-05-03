/**
 * Design System - Sombras e Elevação
 *
 * Este arquivo define as variáveis de sombras e elevação utilizadas no Design System da Celebra Capital.
 * As sombras seguem uma escala consistente para estabelecer hierarquia visual.
 */

// Valores de sombras para tema claro
export const lightShadows = {
  // Sombras sutis
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',

  // Sombras pequenas
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',

  // Sombra padrão
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',

  // Sombras médias
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',

  // Sombras grandes
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',

  // Sombras extras grandes
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

  // Sombra interna
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',

  // Sem sombra
  none: 'none',
}

// Valores de sombras para tema escuro (com opacidade reduzida para não parecer muito intenso)
export const darkShadows = {
  // Sombras sutis
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.15)',

  // Sombras pequenas
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',

  // Sombra padrão
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',

  // Sombras médias
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15)',

  // Sombras grandes
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.14)',

  // Sombras extras grandes
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.4)',

  // Sombra interna
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)',

  // Sem sombra
  none: 'none',
}

// Sombras semânticas para componentes específicos
export const componentShadows = {
  // Tema claro
  light: {
    // Cards e superfícies
    card: lightShadows.sm,
    cardHover: lightShadows.md,

    // Elementos interativos
    button: lightShadows.sm,
    buttonHover: lightShadows.md,

    // Elementos flutuantes
    dropdown: lightShadows.lg,
    modal: lightShadows.xl,
    dialog: lightShadows.xl,
    popover: lightShadows.lg,
    tooltip: lightShadows.sm,

    // Inputs e formulários
    input: lightShadows.sm,
    inputFocus: `${lightShadows.sm}, 0 0 0 3px rgba(1, 17, 162, 0.2)`, // Cor primária com opacidade

    // Navegação
    header: lightShadows.sm,
    sidebar: lightShadows.lg,

    // Feedback
    toast: lightShadows.lg,
    alert: lightShadows.sm,
  },

  // Tema escuro
  dark: {
    // Cards e superfícies
    card: darkShadows.sm,
    cardHover: darkShadows.md,

    // Elementos interativos
    button: darkShadows.sm,
    buttonHover: darkShadows.md,

    // Elementos flutuantes
    dropdown: darkShadows.lg,
    modal: darkShadows.xl,
    dialog: darkShadows.xl,
    popover: darkShadows.lg,
    tooltip: darkShadows.sm,

    // Inputs e formulários
    input: darkShadows.sm,
    inputFocus: `${darkShadows.sm}, 0 0 0 3px rgba(104, 96, 250, 0.3)`, // Cor primária com opacidade

    // Navegação
    header: darkShadows.sm,
    sidebar: darkShadows.lg,

    // Feedback
    toast: darkShadows.lg,
    alert: darkShadows.sm,
  },
}

// Animações de transição para sombras
export const shadowTransitions = {
  fast: 'box-shadow 150ms ease-in-out',
  normal: 'box-shadow 200ms ease-in-out',
  slow: 'box-shadow 300ms ease-in-out',
}

export default {
  lightShadows,
  darkShadows,
  componentShadows,
  shadowTransitions,
}
