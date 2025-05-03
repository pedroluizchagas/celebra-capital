/**
 * Configuração para testes de integração
 * Este arquivo configura o ambiente de testes de integração com Jest e Testing Library
 */

import '@testing-library/jest-dom'
import { server } from './mocks/server'

// Aumentar o timeout para testes de integração
jest.setTimeout(15000)

// Configurar o Mock Service Worker antes de todos os testes
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))

// Resetar os handlers entre os testes
afterEach(() => server.resetHandlers())

// Limpar após todos os testes
afterAll(() => server.close())

// Suprimir logs de console durante os testes
// Remova ou comente estas linhas se quiser ver os logs durante a execução
const originalConsoleError = console.error
const originalConsoleWarn = console.warn
const originalConsoleLog = console.log

beforeAll(() => {
  console.error = jest.fn()
  console.warn = jest.fn()
  console.log = jest.fn()
})

afterAll(() => {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
  console.log = originalConsoleLog
})

// Mock para localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
})

// Mock para sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
})

// Mock para matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock para scrollTo
window.scrollTo = jest.fn()
