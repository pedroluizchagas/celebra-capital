import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form, FormInput, FormField } from './Form'
import { ErrorProvider } from '../contexts/ErrorContext'
import { z } from 'zod'

// Mock do contexto de erro
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

// Função auxiliar para renderizar com o ErrorProvider
const renderWithProviders = (ui: React.ReactElement) => {
  return render(<ErrorProvider>{ui}</ErrorProvider>)
}

describe('Form Components', () => {
  describe('Form Component', () => {
    test('renderiza o formulário com as props corretas', () => {
      const handleSubmit = jest.fn()

      renderWithProviders(
        <Form
          onSubmit={handleSubmit}
          formId="test-form"
          className="test-class"
          data-testid="form-element"
        >
          <div data-testid="form-content">Form Content</div>
        </Form>
      )

      const form = screen.getByTestId('form-element')
      expect(form).toHaveAttribute('id', 'test-form')
      expect(form).toHaveClass('test-class')
      expect(screen.getByTestId('form-content')).toBeInTheDocument()
    })

    test('chama onSubmit ao submeter o formulário', async () => {
      const handleSubmit = jest.fn()

      renderWithProviders(
        <Form
          onSubmit={handleSubmit}
          formId="test-form"
          data-testid="form-element"
        >
          <button type="submit">Submit</button>
        </Form>
      )

      fireEvent.click(screen.getByText('Submit'))

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledTimes(1)
      })
    })

    test('passa o schema de validação zod corretamente', async () => {
      // Criar um schema simples com zod
      const schema = z.object({
        name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
      })

      const handleSubmit = jest.fn()

      renderWithProviders(
        <Form
          onSubmit={handleSubmit}
          formId="test-form"
          schema={schema}
          data-testid="form-element"
        >
          {(methods) => (
            <>
              <input {...methods.register('name')} data-testid="name-input" />
              {methods.formState.errors.name && (
                <p data-testid="error-message">
                  {methods.formState.errors.name.message}
                </p>
              )}
              <button type="submit">Submit</button>
            </>
          )}
        </Form>
      )

      const input = screen.getByTestId('name-input')
      userEvent.type(input, 'ab')

      fireEvent.click(screen.getByText('Submit'))

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
        expect(
          screen.getByText('Nome deve ter pelo menos 3 caracteres')
        ).toBeInTheDocument()
      })

      expect(handleSubmit).not.toHaveBeenCalled()
    })
  })

  describe('FormField Component', () => {
    test('renderiza o campo com label e children', () => {
      renderWithProviders(
        <FormField name="test" label="Test Label" formId="test-form">
          <input data-testid="field-input" />
        </FormField>
      )

      expect(screen.getByText('Test Label')).toBeInTheDocument()
      expect(screen.getByTestId('field-input')).toBeInTheDocument()
    })

    test('renderiza o indicador de campo obrigatório quando required é true', () => {
      renderWithProviders(
        <FormField name="test" label="Test Label" formId="test-form" required>
          <input />
        </FormField>
      )

      const label = screen.getByText('Test Label')
      expect(document.querySelector('.text-red-500')).toBeInTheDocument()
    })

    test('renderiza o tooltip quando fornecido', () => {
      renderWithProviders(
        <FormField
          name="test"
          label="Test Label"
          formId="test-form"
          tooltip="Dica de ajuda"
        >
          <input />
        </FormField>
      )

      const tooltipIcon = screen.getByTitle('Dica de ajuda')
      expect(tooltipIcon).toBeInTheDocument()
    })
  })

  describe('FormInput Component', () => {
    test('renderiza o input com as props corretas', () => {
      renderWithProviders(
        <FormInput
          name="test-input"
          formId="test-form"
          label="Test Input"
          placeholder="Digite aqui"
          required
        />
      )

      expect(screen.getByText('Test Input')).toBeInTheDocument()
      const input = screen.getByPlaceholderText('Digite aqui')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('id', 'test-input')
    })
  })
})
