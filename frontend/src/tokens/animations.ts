/**
 * Design System - Animações e Transições
 *
 * Este arquivo define as variáveis de animações e transições utilizadas no Design System da Celebra Capital.
 * As animações são cuidadosamente projetadas para serem sutis, úteis e acessíveis.
 */

// Curvas de aceleração (timing functions)
export const easings = {
  // Básicos
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',

  // Específicos (baseados em curvas de Bézier)
  emphasized: 'cubic-bezier(0.2, 0.0, 0, 1.0)', // Para elementos importantes
  emphatic: 'cubic-bezier(0.85, 0, 0.15, 1)', // Para movimentos dramáticos
  energetic: 'cubic-bezier(0.3, 0.7, 0.4, 1.5)', // Para movimentos com "bounce"
  accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)', // Rápido no final
  decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)', // Rápido no início
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)', // Rápido no início e no final
}

// Durações para transições e animações
export const durations = {
  fastest: '50ms',
  faster: '100ms',
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '400ms',
  slowest: '500ms',

  // Para movimentos ou transições específicas
  emphasis: '700ms', // Para transições importantes
  page: '300ms', // Para transições de página
  dialog: '250ms', // Para diálogos/modais
  tooltip: '150ms', // Para tooltips
}

// Delays padrão
export const delays = {
  none: '0ms',
  short: '50ms',
  medium: '100ms',
  long: '200ms',
}

// Transições pré-definidas para propriedades comuns
export const transitions = {
  // Transições padrão
  default: `all ${durations.normal} ${easings.easeInOut}`,

  // Transições específicas por propriedade
  color: `color ${durations.fast} ${easings.easeInOut}`,
  backgroundColor: `background-color ${durations.normal} ${easings.easeInOut}`,
  border: `border ${durations.fast} ${easings.easeInOut}`,
  borderColor: `border-color ${durations.fast} ${easings.easeInOut}`,
  shadow: `box-shadow ${durations.normal} ${easings.easeInOut}`,
  opacity: `opacity ${durations.normal} ${easings.easeInOut}`,
  transform: `transform ${durations.normal} ${easings.easeInOut}`,

  // Transições para componentes
  button: `all ${durations.fast} ${easings.easeOut}`,
  input: `all ${durations.fast} ${easings.easeInOut}`,
  dialog: `all ${durations.normal} ${easings.emphasized}`,
  tooltip: `all ${durations.fast} ${easings.accelerate}`,
  menu: `all ${durations.normal} ${easings.decelerate}`,
  toast: `all ${durations.normal} ${easings.sharp}`,
}

// Keyframes para animações comuns
export const keyframes = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
  },
  scaleIn: {
    from: { opacity: 0, transform: 'scale(0.95)' },
    to: { opacity: 1, transform: 'scale(1)' },
  },
  scaleOut: {
    from: { opacity: 1, transform: 'scale(1)' },
    to: { opacity: 0, transform: 'scale(0.95)' },
  },
  slideInBottom: {
    from: { opacity: 0, transform: 'translateY(10px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  slideOutBottom: {
    from: { opacity: 1, transform: 'translateY(0)' },
    to: { opacity: 0, transform: 'translateY(10px)' },
  },
  slideInTop: {
    from: { opacity: 0, transform: 'translateY(-10px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  slideOutTop: {
    from: { opacity: 1, transform: 'translateY(0)' },
    to: { opacity: 0, transform: 'translateY(-10px)' },
  },
  pulse: {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.05)' },
    '100%': { transform: 'scale(1)' },
  },
  spin: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
  shimmer: {
    '0%': { backgroundPosition: '-500px 0' },
    '100%': { backgroundPosition: '500px 0' },
  },
}

// Animações nomeadas para uso rápido
export const animations = {
  // Básicas
  fadeIn: `fadeIn ${durations.normal} ${easings.easeOut} forwards`,
  fadeOut: `fadeOut ${durations.normal} ${easings.easeIn} forwards`,

  // Escalas
  scaleIn: `scaleIn ${durations.normal} ${easings.emphasized} forwards`,
  scaleOut: `scaleOut ${durations.normal} ${easings.emphasized} forwards`,

  // Slides
  slideInBottom: `slideInBottom ${durations.normal} ${easings.decelerate} forwards`,
  slideOutBottom: `slideOutBottom ${durations.normal} ${easings.accelerate} forwards`,
  slideInTop: `slideInTop ${durations.normal} ${easings.decelerate} forwards`,
  slideOutTop: `slideOutTop ${durations.normal} ${easings.accelerate} forwards`,

  // Utilitárias
  pulse: `pulse ${durations.slower} ${easings.easeInOut} infinite`,
  spin: `spin ${durations.slower} ${easings.linear} infinite`,
  shimmer: `shimmer ${durations.emphasis} ${easings.easeInOut} infinite`,

  // Para acessibilidade - nenhuma animação
  // Usar quando o usuário preferir movimento reduzido
  noAnimation: 'none',
}

// Configurações especiais para acessibilidade
export const reducedMotion = {
  duration: durations.fastest,
  transition: `all ${durations.fastest} ${easings.easeInOut}`,
}

export default {
  easings,
  durations,
  delays,
  transitions,
  keyframes,
  animations,
  reducedMotion,
}
