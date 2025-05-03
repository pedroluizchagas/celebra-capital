/**
 * Design System - Tokens
 *
 * Este arquivo exporta todos os tokens do Design System para uso no projeto.
 * Os tokens são as variáveis fundamentais que definem a linguagem visual da interface.
 */

import colors, { semanticColors } from './colors'
import typography from './typography'
import spacing from './spacing'
import shadows from './shadows'
import animations from './animations'
import borders from './borders'

// Exportar todos os tokens em um único objeto
const tokens = {
  colors,
  semanticColors,
  typography,
  spacing,
  shadows,
  animations,
  borders,
}

// Exportar individualmente para uso específico
export {
  colors,
  semanticColors,
  typography,
  spacing,
  shadows,
  animations,
  borders,
}

// Exportar como objeto padrão
export default tokens
