import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import { ErrorProvider, useError } from './ErrorContext'

// Componente simples para testar o hook useError
const TestComponent = () => {
  const {
    error,
    apiErrors,
    formErrors,
    setError,
    setApiErrors,
    setFormErrors,
    addFormFieldError,
    clearErrors,
    clearApiErrors,
    clearFormErrors,
  } = useError()

  return (
    <div>
      <div data-testid="error">{error || 'sem erro'}</div>
      <div data-testid="api-errors">{JSON.stringify(apiErrors)}</div>
      <div data-testid="form-errors">{JSON.stringify(formErrors)}</div>
      <button onClick={() => setError('Erro de teste')}>Set Error</button>
      <button
        onClick={() =>
          setApiErrors({ campo1: ['Erro API 1'], campo2: ['Erro API 2'] })
        }
      >
        Set API Errors
      </button>
      <button
        onClick={() => setFormErrors('form1', { nome: ['Nome inválido'] })}
      >
        Set Form Errors
      </button>
      <button
        onClick={() => addFormFieldError('form1', 'email', 'Email inválido')}
      >
        Add Form Field Error
      </button>
      <button onClick={() => clearErrors()}>Clear All Errors</button>
      <button onClick={() => clearApiErrors()}>Clear API Errors</button>
      <button onClick={() => clearFormErrors('form1')}>
        Clear Form Errors with ID
      </button>
      <button onClick={() => clearFormErrors()}>Clear All Form Errors</button>
    </div>
  )
}

// Wrapper para testes
const renderWithErrorProvider = (ui: React.ReactElement) => {
  return render(<ErrorProvider>{ui}</ErrorProvider>)
}

describe('ErrorContext', () => {
  test('lança erro quando useError é usado fora do provedor', () => {
    // Suprimir erros de console durante o teste
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    expect(() => render(<TestComponent />)).toThrow(
      'useError deve ser usado dentro de um ErrorProvider'
    )

    consoleError.mockRestore()
  })

  test('fornece estado inicial correto', () => {
    renderWithErrorProvider(<TestComponent />)

    expect(screen.getByTestId('error')).toHaveTextContent('sem erro')
    expect(screen.getByTestId('api-errors')).toHaveTextContent('{}')
    expect(screen.getByTestId('form-errors')).toHaveTextContent('{}')
  })

  test('permite definir e limpar erros globais', async () => {
    renderWithErrorProvider(<TestComponent />)

    // Verificar estado inicial
    expect(screen.getByTestId('error')).toHaveTextContent('sem erro')

    // Definir erro
    act(() => {
      screen.getByText('Set Error').click()
    })

    // Verificar que o erro foi definido
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Erro de teste')
    })

    // Limpar todos os erros
    act(() => {
      screen.getByText('Clear All Errors').click()
    })

    // Verificar que o erro foi limpo
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('sem erro')
    })
  })

  test('permite definir e limpar erros de API', async () => {
    renderWithErrorProvider(<TestComponent />)

    // Verificar estado inicial
    expect(screen.getByTestId('api-errors')).toHaveTextContent('{}')

    // Definir erros de API
    act(() => {
      screen.getByText('Set API Errors').click()
    })

    // Verificar que os erros de API foram definidos
    await waitFor(() => {
      const content = screen.getByTestId('api-errors').textContent
      expect(content).toContain('campo1')
      expect(content).toContain('Erro API 1')
      expect(content).toContain('campo2')
      expect(content).toContain('Erro API 2')
    })

    // Limpar erros de API
    act(() => {
      screen.getByText('Clear API Errors').click()
    })

    // Verificar que os erros de API foram limpos
    await waitFor(() => {
      expect(screen.getByTestId('api-errors')).toHaveTextContent('{}')
    })
  })

  test('permite definir, adicionar e limpar erros de formulário', async () => {
    renderWithErrorProvider(<TestComponent />)

    // Verificar estado inicial
    expect(screen.getByTestId('form-errors')).toHaveTextContent('{}')

    // Definir erros de formulário
    act(() => {
      screen.getByText('Set Form Errors').click()
    })

    // Verificar que os erros de formulário foram definidos
    await waitFor(() => {
      const content = screen.getByTestId('form-errors').textContent
      expect(content).toContain('form1')
      expect(content).toContain('nome')
      expect(content).toContain('Nome inválido')
    })

    // Adicionar erro de campo ao formulário
    act(() => {
      screen.getByText('Add Form Field Error').click()
    })

    // Verificar que o erro de campo foi adicionado
    await waitFor(() => {
      const content = screen.getByTestId('form-errors').textContent
      expect(content).toContain('form1')
      expect(content).toContain('nome')
      expect(content).toContain('Nome inválido')
      expect(content).toContain('email')
      expect(content).toContain('Email inválido')
    })

    // Limpar erros de formulário com ID específico
    act(() => {
      screen.getByText('Clear Form Errors with ID').click()
    })

    // Verificar que os erros do formulário específico foram limpos
    await waitFor(() => {
      expect(screen.getByTestId('form-errors')).toHaveTextContent('{}')
    })

    // Adicionar erro de campo ao formulário novamente
    act(() => {
      screen.getByText('Add Form Field Error').click()
    })

    // Verificar que o erro de campo foi adicionado
    await waitFor(() => {
      const content = screen.getByTestId('form-errors').textContent
      expect(content).toContain('form1')
      expect(content).toContain('email')
      expect(content).toContain('Email inválido')
    })

    // Limpar todos os erros de formulário
    act(() => {
      screen.getByText('Clear All Form Errors').click()
    })

    // Verificar que todos os erros de formulário foram limpos
    await waitFor(() => {
      expect(screen.getByTestId('form-errors')).toHaveTextContent('{}')
    })
  })

  test('permite definir array de erros para um campo de formulário', async () => {
    const TestArrayErrorComponent = () => {
      const { formErrors, addFormFieldError } = useError()

      return (
        <div>
          <div data-testid="form-errors">{JSON.stringify(formErrors)}</div>
          <button
            onClick={() =>
              addFormFieldError('form1', 'password', [
                'Muito curta',
                'Precisa de números',
              ])
            }
          >
            Add Multiple Errors
          </button>
        </div>
      )
    }

    renderWithErrorProvider(<TestArrayErrorComponent />)

    // Verificar estado inicial
    expect(screen.getByTestId('form-errors')).toHaveTextContent('{}')

    // Adicionar múltiplos erros para um campo
    act(() => {
      screen.getByText('Add Multiple Errors').click()
    })

    // Verificar que os múltiplos erros foram definidos
    await waitFor(() => {
      const content = screen.getByTestId('form-errors').textContent
      expect(content).toContain('form1')
      expect(content).toContain('password')
      expect(content).toContain('Muito curta')
      expect(content).toContain('Precisa de números')
    })
  })
})
