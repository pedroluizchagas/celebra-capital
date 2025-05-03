import { createErrorHandler, useErrorHandler } from './errorHandler'
import { useError } from '../contexts/ErrorContext'
import { renderHook } from '@testing-library/react'
import { ErrorProvider } from '../contexts/ErrorContext'
import React from 'react'

// Mock do ErrorContext
jest.mock('../contexts/ErrorContext', () => {
  const mockErrorContext = {
    error: null,
    apiErrors: {},
    formErrors: {},
    setError: jest.fn(),
    setApiErrors: jest.fn(),
    setFormErrors: jest.fn(),
    addFormFieldError: jest.fn(),
    clearErrors: jest.fn(),
    clearApiErrors: jest.fn(),
    clearFormErrors: jest.fn(),
  }

  return {
    useError: jest.fn(() => mockErrorContext),
    ErrorProvider: ({ children }: { children: React.ReactNode }) => children,
  }
})

describe('errorHandler', () => {
  let mockErrorContext: ReturnType<typeof useError>

  beforeEach(() => {
    jest.clearAllMocks()

    // Criar mock para o contexto de erro
    mockErrorContext = {
      error: null,
      apiErrors: {},
      formErrors: {},
      setError: jest.fn(),
      setApiErrors: jest.fn(),
      setFormErrors: jest.fn(),
      addFormFieldError: jest.fn(),
      clearErrors: jest.fn(),
      clearApiErrors: jest.fn(),
      clearFormErrors: jest.fn(),
    }

    // Configurar o mock para retornar nosso contexto mock
    ;(useError as jest.Mock).mockReturnValue(mockErrorContext)
  })

  describe('createErrorHandler', () => {
    test('retorna um handler com as funções corretas', () => {
      const handler = createErrorHandler()

      expect(handler).toHaveProperty('handleApiError')
      expect(handler).toHaveProperty('handleFormError')
      expect(handler).toHaveProperty('setFormErrors')
      expect(handler).toHaveProperty('setError')
      expect(handler).toHaveProperty('clearErrors')
    })

    test('não funciona se não tiver contexto de erro', () => {
      // Simular que o hook useError falhou
      ;(useError as jest.Mock).mockImplementation(() => {
        throw new Error('Hook error')
      })

      // globalErrorHandler.errorContext também será null
      const handler = createErrorHandler()

      // Deve ser possível chamar funções sem erros
      expect(() => handler.setError('Teste')).not.toThrow()
      expect(() => handler.clearErrors()).not.toThrow()
      expect(() =>
        handler.handleApiError({ response: { status: 400, data: {} } })
      ).not.toThrow()
      expect(() =>
        handler.handleFormError('form1', 'field1', 'Error')
      ).not.toThrow()
      expect(() =>
        handler.setFormErrors('form1', { field1: ['Error'] })
      ).not.toThrow()
    })
  })

  describe('handleApiError', () => {
    test('processa erro 400 com dados de objeto', () => {
      const handler = createErrorHandler()
      const mockError = {
        response: {
          status: 400,
          data: {
            email: 'Email inválido',
            password: ['Senha fraca', 'Muito curta'],
          },
        },
      }

      handler.handleApiError(mockError)

      expect(mockErrorContext.clearApiErrors).toHaveBeenCalled()
      expect(mockErrorContext.setApiErrors).toHaveBeenCalledWith({
        email: ['Email inválido'],
        password: ['Senha fraca', 'Muito curta'],
      })
    })

    test('processa erro 400 sem dados de objeto', () => {
      const handler = createErrorHandler()
      const mockError = {
        response: {
          status: 400,
          data: 'Bad Request',
        },
      }

      handler.handleApiError(mockError)

      expect(mockErrorContext.clearApiErrors).toHaveBeenCalled()
      expect(mockErrorContext.setError).toHaveBeenCalledWith(
        'Requisição inválida. Verifique os dados e tente novamente.'
      )
    })

    test('processa erro 403', () => {
      const handler = createErrorHandler()
      const mockError = {
        response: {
          status: 403,
          data: {},
        },
      }

      handler.handleApiError(mockError)

      expect(mockErrorContext.clearApiErrors).toHaveBeenCalled()
      expect(mockErrorContext.setError).toHaveBeenCalledWith(
        'Você não tem permissão para realizar esta ação.'
      )
    })

    test('processa erro 404', () => {
      const handler = createErrorHandler()
      const mockError = {
        response: {
          status: 404,
          data: {},
        },
      }

      handler.handleApiError(mockError)

      expect(mockErrorContext.clearApiErrors).toHaveBeenCalled()
      expect(mockErrorContext.setError).toHaveBeenCalledWith(
        'O recurso solicitado não foi encontrado.'
      )
    })

    test('processa erro 500', () => {
      const handler = createErrorHandler()
      const mockError = {
        response: {
          status: 500,
          data: {},
        },
      }

      handler.handleApiError(mockError)

      expect(mockErrorContext.clearApiErrors).toHaveBeenCalled()
      expect(mockErrorContext.setError).toHaveBeenCalledWith(
        'Ocorreu um erro no servidor. Por favor, tente novamente mais tarde.'
      )
    })

    test('processa erro de rede (sem resposta)', () => {
      const handler = createErrorHandler()
      const mockError = {
        request: {},
      }

      handler.handleApiError(mockError)

      expect(mockErrorContext.setError).toHaveBeenCalledWith(
        'Não foi possível conectar ao servidor. Verifique sua conexão de internet.'
      )
    })

    test('processa erro de configuração', () => {
      const handler = createErrorHandler()
      const mockError = {
        message: 'Erro de configuração',
      }

      handler.handleApiError(mockError)

      expect(mockErrorContext.setError).toHaveBeenCalledWith(
        'Ocorreu um erro ao processar sua solicitação: Erro de configuração'
      )
    })
  })

  describe('handleFormError', () => {
    test('adiciona erro de campo ao formulário', () => {
      const handler = createErrorHandler()

      handler.handleFormError('form1', 'email', 'Email inválido')

      expect(mockErrorContext.addFormFieldError).toHaveBeenCalledWith(
        'form1',
        'email',
        'Email inválido'
      )
    })

    test('adiciona múltiplos erros de campo ao formulário', () => {
      const handler = createErrorHandler()

      handler.handleFormError('form1', 'password', [
        'Muito curta',
        'Precisa de números',
      ])

      expect(mockErrorContext.addFormFieldError).toHaveBeenCalledWith(
        'form1',
        'password',
        ['Muito curta', 'Precisa de números']
      )
    })
  })

  describe('setFormErrors', () => {
    test('define erros de formulário', () => {
      const handler = createErrorHandler()
      const errors = {
        nome: ['Nome é obrigatório'],
        email: ['Email inválido'],
      }

      handler.setFormErrors('form1', errors)

      expect(mockErrorContext.setFormErrors).toHaveBeenCalledWith(
        'form1',
        errors
      )
    })
  })

  describe('setError', () => {
    test('define erro global', () => {
      const handler = createErrorHandler()

      handler.setError('Erro global')

      expect(mockErrorContext.setError).toHaveBeenCalledWith('Erro global')
    })
  })

  describe('clearErrors', () => {
    test('limpa todos os erros', () => {
      const handler = createErrorHandler()

      handler.clearErrors()

      expect(mockErrorContext.clearErrors).toHaveBeenCalled()
    })
  })
})
