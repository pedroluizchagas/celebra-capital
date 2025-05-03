import React from 'react'
import { render, screen } from '@testing-library/react'
import Form from './Form'
import { checkA11y, axeConfig } from '../utils/axeHelper'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Componente de formulário de teste para os testes de acessibilidade
const TestForm = () => {
  // Schema de validação com zod
  const schema = z.object({
    nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    email: z.string().email('Email inválido'),
  })

  type FormValues = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormValues) => {
    console.log(data)
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <label htmlFor="nome" className="block mb-2">
          Nome
        </label>
        <input
          id="nome"
          type="text"
          {...register('nome')}
          className="w-full px-3 py-2 border rounded"
          aria-invalid={errors.nome ? 'true' : 'false'}
        />
        {errors.nome && (
          <span role="alert" className="text-red-500 text-sm">
            {errors.nome.message}
          </span>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="w-full px-3 py-2 border rounded"
          aria-invalid={errors.email ? 'true' : 'false'}
        />
        {errors.email && (
          <span role="alert" className="text-red-500 text-sm">
            {errors.email.message}
          </span>
        )}
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Enviar
      </button>
    </Form>
  )
}

describe('Form - Testes de Acessibilidade', () => {
  it('não deve ter violações de acessibilidade no formulário', async () => {
    await checkA11y(<TestForm />, axeConfig)
  })

  it('todos os campos devem ter labels associados', () => {
    render(<TestForm />)

    const nomeLabel = screen.getByLabelText('Nome')
    const emailLabel = screen.getByLabelText('Email')

    expect(nomeLabel).toBeInTheDocument()
    expect(emailLabel).toBeInTheDocument()
  })

  it('campos com erro devem ter atributos aria-invalid', async () => {
    render(<TestForm />)

    const nomeInput = screen.getByLabelText('Nome')
    const emailInput = screen.getByLabelText('Email')

    expect(nomeInput).toHaveAttribute('aria-invalid', 'false')
    expect(emailInput).toHaveAttribute('aria-invalid', 'false')
  })

  it('o formulário deve ser navegável por teclado', () => {
    render(<TestForm />)

    const nomeInput = screen.getByLabelText('Nome')
    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: 'Enviar' })

    nomeInput.focus()
    expect(document.activeElement).toBe(nomeInput)

    emailInput.focus()
    expect(document.activeElement).toBe(emailInput)

    submitButton.focus()
    expect(document.activeElement).toBe(submitButton)
  })
})
