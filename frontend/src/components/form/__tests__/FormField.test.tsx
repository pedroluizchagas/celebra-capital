import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { testFormAccessibility } from '../../../utils/a11y-test-helpers'
import { FormField } from '../FormField'

describe('FormField Component', () => {
  it('deve passar nos testes de acessibilidade', async () => {
    await testFormAccessibility(
      <FormField
        id="test"
        name="test"
        label="Campo de Teste"
        type="text"
        required
      />
    )
  })

  it('deve renderizar o label corretamente', () => {
    render(
      <FormField id="test" name="test" label="Campo de Teste" type="text" />
    )

    const label = screen.getByLabelText(/campo de teste/i)
    expect(label).toBeInTheDocument()
  })

  it('deve mostrar o asterisco para campos obrigatórios', () => {
    render(
      <FormField
        id="test"
        name="test"
        label="Campo de Teste"
        type="text"
        required
      />
    )

    const asterisk = screen.getByText('*')
    expect(asterisk).toBeInTheDocument()
    expect(asterisk).toHaveAttribute('aria-hidden', 'true')
  })

  it('deve mostrar mensagem de erro quando houver erro', () => {
    const errorMessage = 'Campo obrigatório'
    render(
      <FormField
        id="test"
        name="test"
        label="Campo de Teste"
        type="text"
        error={errorMessage}
      />
    )

    const error = screen.getByRole('alert')
    expect(error).toHaveTextContent(errorMessage)
  })

  it('deve mostrar texto de ajuda quando fornecido', () => {
    const helperText = 'Texto de ajuda'
    render(
      <FormField
        id="test"
        name="test"
        label="Campo de Teste"
        type="text"
        helperText={helperText}
      />
    )

    const helper = screen.getByText(helperText)
    expect(helper).toBeInTheDocument()
  })

  it('deve permitir entrada de dados', async () => {
    render(
      <FormField id="test" name="test" label="Campo de Teste" type="text" />
    )

    const input = screen.getByLabelText(/campo de teste/i)
    await userEvent.type(input, 'teste')

    expect(input).toHaveValue('teste')
  })

  it('deve aplicar estilos de erro quando houver erro', () => {
    render(
      <FormField
        id="test"
        name="test"
        label="Campo de Teste"
        type="text"
        error="Erro"
      />
    )

    const input = screen.getByLabelText(/campo de teste/i)
    expect(input).toHaveClass('border-red-500')
  })
})
