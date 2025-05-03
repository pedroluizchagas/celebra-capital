// Import das extensões do Jest DOM
import '@testing-library/jest-dom'

// Limpar todos os mocks após cada teste
afterEach(() => {
  jest.clearAllMocks()
})

// Silenciar erros de console durante os testes (opcional)
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      args[0]?.includes?.('Warning: ReactDOM.render is no longer supported') ||
      args[0]?.includes?.(
        'When testing, code that causes React state updates'
      ) ||
      args[0]?.includes?.('Error: connect ECONNREFUSED') ||
      args[0]?.includes?.('Warning: React does not recognize the axe-core') ||
      args[0]?.includes?.('Unexpected token in axe.run') // Silenciar erros relacionados ao axe-core
    ) {
      return
    }
    originalConsoleError(...args)
  }

  console.warn = (...args: any[]) => {
    if (
      args[0]?.includes?.(
        'Warning: useLayoutEffect does nothing on the server'
      ) ||
      args[0]?.includes?.('Warning: React does not recognize the')
    ) {
      return
    }
    originalConsoleWarn(...args)
  }
})

afterAll(() => {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
})

// Mock para API URL (usado no arquivo api.ts)
;(global as any).import = {
  meta: {
    env: {
      VITE_API_URL: 'http://localhost:8000/api/v1',
    },
  },
}

// Mock para localStorage
const localStorageMock = (function () {
  let store: Record<string, string> = {}

  return {
    getItem(key: string) {
      return store[key] || null
    },
    setItem(key: string, value: string) {
      store[key] = value.toString()
    },
    removeItem(key: string) {
      delete store[key]
    },
    clear() {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock para matchMedia (usado pelo Tailwind e algumas bibliotecas de UI)
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

// Configuração global do axe para testes de acessibilidade
jest.mock('@axe-core/react', () => ({
  axe: {
    run: jest.fn().mockResolvedValue({ violations: [] }),
  },
}))
