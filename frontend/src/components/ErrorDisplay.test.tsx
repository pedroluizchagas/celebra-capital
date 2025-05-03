import React from 'react'
import { render, screen } from '@testing-library/react'
import ErrorDisplay from './ErrorDisplay'
import { ErrorProvider } from '../contexts/ErrorContext'

// Mock do contexto de erro
const renderWithErrorContext = (ui: React.ReactElement, contextValues = {}) => {
  return render(<ErrorProvider>{ui}</ErrorProvider>)
}

// Mock para acessar o contexto em testes
jest.mock('../contexts/ErrorContext', () => {
  const originalModule = jest.requireActual('../contexts/ErrorContext')
  return {
    ...originalModule,
    useError: () => ({
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
    }),
  }
})

describe('ErrorDisplay Component', () => {
  beforeEach(() => {
    // Resetar os mocks antes de cada teste
    jest.clearAllMocks()

    // Redefinir o mock do contexto entre os testes
    jest
      .spyOn(require('../contexts/ErrorContext'), 'useError')
      .mockImplementation(() => ({
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
      }))
  })

  test('não renderiza nada quando não há erros', () => {
    const { container } = render(<ErrorDisplay />)
    expect(container.firstChild).toBeNull()
  })

  test('renderiza erro global quando fornecido', () => {
    jest
      .spyOn(require('../contexts/ErrorContext'), 'useError')
      .mockImplementation(() => ({
        error: 'Erro global',
        apiErrors: {},
        formErrors: {},
        setError: jest.fn(),
        setApiErrors: jest.fn(),
        setFormErrors: jest.fn(),
        addFormFieldError: jest.fn(),
        clearErrors: jest.fn(),
        clearApiErrors: jest.fn(),
        clearFormErrors: jest.fn(),
      }))

    render(<ErrorDisplay />)

    expect(screen.getByText('Erro global')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveClass('bg-red-50')
  })

  test('renderiza erros de API quando fornecidos', () => {
    jest
      .spyOn(require('../contexts/ErrorContext'), 'useError')
      .mockImplementation(() => ({
        error: null,
        apiErrors: {
          email: ['Email inválido'],
          password: ['Senha muito curta', 'Senha fraca'],
        },
        formErrors: {},
        setError: jest.fn(),
        setApiErrors: jest.fn(),
        setFormErrors: jest.fn(),
        addFormFieldError: jest.fn(),
        clearErrors: jest.fn(),
        clearApiErrors: jest.fn(),
        clearFormErrors: jest.fn(),
      }))

    render(<ErrorDisplay />)

    expect(
      screen.getByText('Ocorreram erros ao processar sua solicitação:')
    ).toBeInTheDocument()
    expect(screen.getByText('email:')).toBeInTheDocument()
    expect(screen.getByText(/Email inválido/)).toBeInTheDocument()
    expect(screen.getByText('password:')).toBeInTheDocument()
    expect(
      screen.getByText(/Senha muito curta, Senha fraca/)
    ).toBeInTheDocument()
  })

  test('renderiza erro de campo de formulário quando formId e fieldName são fornecidos', () => {
    jest
      .spyOn(require('../contexts/ErrorContext'), 'useError')
      .mockImplementation(() => ({
        error: null,
        apiErrors: {},
        formErrors: {
          'login-form': {
            email: ['Email inválido'],
          },
        },
        setError: jest.fn(),
        setApiErrors: jest.fn(),
        setFormErrors: jest.fn(),
        addFormFieldError: jest.fn(),
        clearErrors: jest.fn(),
        clearApiErrors: jest.fn(),
        clearFormErrors: jest.fn(),
      }))

    render(<ErrorDisplay formId="login-form" fieldName="email" />)

    expect(screen.getByText('Email inválido')).toBeInTheDocument()
    expect(screen.getByText('Email inválido')).toHaveClass('text-red-600')
  })

  test('não renderiza erro de campo quando o campo não tem erro', () => {
    jest
      .spyOn(require('../contexts/ErrorContext'), 'useError')
      .mockImplementation(() => ({
        error: null,
        apiErrors: {},
        formErrors: {
          'login-form': {
            password: ['Senha muito curta'],
          },
        },
        setError: jest.fn(),
        setApiErrors: jest.fn(),
        setFormErrors: jest.fn(),
        addFormFieldError: jest.fn(),
        clearErrors: jest.fn(),
        clearApiErrors: jest.fn(),
        clearFormErrors: jest.fn(),
      }))

    const { container } = render(
      <ErrorDisplay formId="login-form" fieldName="email" />
    )

    expect(container.firstChild).toBeNull()
  })
})
