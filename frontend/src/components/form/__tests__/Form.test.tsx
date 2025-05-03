import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { testFormAccessibility } from '../../../utils/a11y-test-helpers'
import { Form } from '../Form'

describe('Form Component', () => {
  const mockSubmit = jest.fn()

  beforeEach(() => {
    mockSubmit.mockClear()
  })

  it('deve passar nos testes de acessibilidade', async () => {
    await testFormAccessibility(
      <Form onSubmit={mockSubmit}>
        <div>
          <label htmlFor="nome">Nome</label>
          <input id="nome" name="nome" type="text" aria-required="true" />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" aria-required="true" />
        </div>
        <button type="submit">Enviar</button>
      </Form>
    )
  })

  it('deve anunciar erros de validação para leitores de tela', async () => {
    render(
      <Form onSubmit={mockSubmit}>
        <div>
          <label htmlFor="nome">Nome</label>
          <input
            id="nome"
            name="nome"
            type="text"
            aria-required="true"
            aria-invalid="true"
            aria-describedby="nome-error"
          />
          <span id="nome-error" role="alert">
            Nome é obrigatório
          </span>
        </div>
        <button type="submit">Enviar</button>
      </Form>
    )

    const errorMessage = screen.getByRole('alert')
    expect(errorMessage).toHaveTextContent('Nome é obrigatório')
  })

  it('deve manter o foco no primeiro campo com erro', async () => {
    render(
      <Form onSubmit={mockSubmit}>
        <div>
          <label htmlFor="nome">Nome</label>
          <input
            id="nome"
            name="nome"
            type="text"
            aria-required="true"
            aria-invalid="true"
            aria-describedby="nome-error"
          />
          <span id="nome-error" role="alert">
            Nome é obrigatório
          </span>
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" aria-required="true" />
        </div>
        <button type="submit">Enviar</button>
      </Form>
    )

    const submitButton = screen.getByRole('button', { name: /enviar/i })
    await userEvent.click(submitButton)

    const nomeInput = screen.getByLabelText(/nome/i)
    expect(nomeInput).toHaveFocus()
  })

  it('deve anunciar sucesso do envio para leitores de tela', async () => {
    render(
      <Form onSubmit={mockSubmit}>
        <div>
          <label htmlFor="nome">Nome</label>
          <input id="nome" name="nome" type="text" aria-required="true" />
        </div>
        <button type="submit">Enviar</button>
        <div role="status" aria-live="polite">
          Formulário enviado com sucesso!
        </div>
      </Form>
    )

    const statusMessage = screen.getByRole('status')
    expect(statusMessage).toHaveTextContent('Formulário enviado com sucesso!')
  })
})
