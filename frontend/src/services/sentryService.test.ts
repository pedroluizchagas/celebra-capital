import * as Sentry from '@sentry/react'
import {
  initSentry,
  captureError,
  setUserInfo,
  addBreadcrumb,
  setContext,
  setTags,
} from './sentryService'

// Mock do Sentry
jest.mock('@sentry/react', () => ({
  init: jest.fn(),
  captureMessage: jest.fn(),
  captureException: jest.fn(),
  setUser: jest.fn(),
  addBreadcrumb: jest.fn(),
  setContext: jest.fn(),
  setTag: jest.fn(),
}))

// Mock das variáveis de ambiente
const originalEnv = process.env
beforeEach(() => {
  jest.resetModules()
  process.env = { ...originalEnv }
  // Limpar todos os mocks
  jest.clearAllMocks()
})

afterAll(() => {
  process.env = originalEnv
})

describe('sentryService', () => {
  // Mock para import.meta.env
  const originalWindow = global.window
  beforeEach(() => {
    Object.defineProperty(global, 'window', {
      value: {
        ...originalWindow,
      },
    })

    // Simular import.meta.env
    Object.defineProperty(global, 'import', {
      value: {
        meta: {
          env: {
            VITE_SENTRY_DSN: 'https://test-dsn@sentry.io/12345',
            VITE_APP_VERSION: '0.1.0-test',
            VITE_APP_ENVIRONMENT: 'test',
          },
        },
      },
    })
  })

  afterEach(() => {
    Object.defineProperty(global, 'window', {
      value: originalWindow,
    })
  })

  describe('initSentry', () => {
    it('não deve inicializar o Sentry em ambiente de desenvolvimento', () => {
      console.log = jest.fn()
      initSentry('development')

      expect(Sentry.init).not.toHaveBeenCalled()
      expect(console.log).toHaveBeenCalledWith(
        'Sentry não inicializado em ambiente de desenvolvimento'
      )
    })

    it('deve avisar quando DSN não está configurado', () => {
      console.warn = jest.fn()
      // Redefinir import.meta.env sem DSN
      Object.defineProperty(global, 'import', {
        value: {
          meta: {
            env: {},
          },
        },
      })

      initSentry('production')

      expect(Sentry.init).not.toHaveBeenCalled()
      expect(console.warn).toHaveBeenCalledWith(
        'Variável de ambiente VITE_SENTRY_DSN não definida'
      )
    })

    it('deve inicializar o Sentry corretamente em produção', () => {
      initSentry('production')

      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: 'https://test-dsn@sentry.io/12345',
          environment: 'production',
          release: '0.1.0-test',
          enabled: true,
          tracesSampleRate: 0.2,
        })
      )
    })

    it('deve inicializar o Sentry com amostragem maior em staging', () => {
      initSentry('staging')

      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          tracesSampleRate: 1.0,
        })
      )
    })
  })

  describe('captureError', () => {
    it('deve capturar mensagem de erro quando o parâmetro for string', () => {
      captureError('Erro de teste')

      expect(Sentry.captureMessage).toHaveBeenCalledWith(
        'Erro de teste',
        expect.objectContaining({
          level: 'error',
        })
      )
    })

    it('deve capturar exceção quando o parâmetro for Error', () => {
      const error = new Error('Erro de teste')
      captureError(error)

      expect(Sentry.captureException).toHaveBeenCalledWith(
        error,
        expect.any(Object)
      )
    })

    it('deve incluir contexto adicional quando fornecido', () => {
      const context = { userId: '123', page: 'login' }
      captureError('Erro com contexto', context)

      expect(Sentry.captureMessage).toHaveBeenCalledWith(
        'Erro com contexto',
        expect.objectContaining({
          extra: context,
          level: 'error',
        })
      )
    })
  })

  describe('setUserInfo', () => {
    it('deve definir informações do usuário quando userId for fornecido', () => {
      setUserInfo('123', { email: 'usuario@exemplo.com' })

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: '123',
        email: 'usuario@exemplo.com',
      })
    })

    it('deve limpar informações do usuário quando userId for null', () => {
      setUserInfo(null)

      expect(Sentry.setUser).toHaveBeenCalledWith(null)
    })
  })

  describe('addBreadcrumb', () => {
    it('deve adicionar breadcrumb com os parâmetros corretos', () => {
      addBreadcrumb('auth', 'Usuário fez login', { method: 'email' })

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        category: 'auth',
        message: 'Usuário fez login',
        data: { method: 'email' },
        level: 'info',
      })
    })
  })

  describe('setContext', () => {
    it('deve definir contexto com os parâmetros corretos', () => {
      setContext('device', { model: 'iPhone', os: 'iOS 15' })

      expect(Sentry.setContext).toHaveBeenCalledWith('device', {
        model: 'iPhone',
        os: 'iOS 15',
      })
    })
  })

  describe('setTags', () => {
    it('deve definir tags com os parâmetros corretos', () => {
      setTags({ feature: 'ocr', status: 'active' })

      expect(Sentry.setTag).toHaveBeenCalledTimes(2)
      expect(Sentry.setTag).toHaveBeenNthCalledWith(1, 'feature', 'ocr')
      expect(Sentry.setTag).toHaveBeenNthCalledWith(2, 'status', 'active')
    })
  })
})
