/**
 * Configuração para testes de acessibilidade
 *
 * Este arquivo configura o ambiente de teste para incluir suporte ao axe
 */

// Importações de tipos
import '@testing-library/jest-dom'
import { axe } from 'jest-axe'

// Exponha axe globalmente para os testes
;(global as any).axe = axe
