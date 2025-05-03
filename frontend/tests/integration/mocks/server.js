/**
 * Mock Service Worker (MSW) setup
 * Este arquivo configura um servidor mock que intercepta requisições HTTP durante os testes
 */

import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Configurar o servidor com os handlers definidos
export const server = setupServer(...handlers)
