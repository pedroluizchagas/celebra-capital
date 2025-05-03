import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { testFormAccessibility } from '../../../utils/a11y-test-helpers'
import { Checkbox } from '../Checkbox'

describe('Checkbox Component', () => {
  it('deve passar nos testes de acessibilidade', async () => {
    await testFormAccessibility(
      <Checkbox id="test" name="test" label="Aceito os termos" required />
    )
  })

  it('deve renderizar o label corretamente', () => {
    render(<Checkbox id="test" name="test" label="Aceito os termos" />)

    const label = screen.getByLabelText(/aceito os termos/i)
    expect(label).toBeInTheDocument()
  })

  it('deve mostrar o asterisco para campos obrigatórios', () => {
    render(<Checkbox id="test" name="test" label="Aceito os termos" required />)

    const asterisk = screen.getByText('*')
    expect(asterisk).toBeInTheDocument()
    expect(asterisk).toHaveAttribute('aria-hidden', 'true')
  })

  it('deve mostrar mensagem de erro quando houver erro', () => {
    const errorMessage = 'Campo obrigatório'
    render(
      <Checkbox
        id="test"
        name="test"
        label="Aceito os termos"
        error={errorMessage}
      />
    )

    const error = screen.getByRole('alert')
    expect(error).toHaveTextContent(errorMessage)
  })

  it('deve mostrar texto de ajuda quando fornecido', () => {
    const helperText = 'Texto de ajuda'
    render(
      <Checkbox
        id="test"
        name="test"
        label="Aceito os termos"
        helperText={helperText}
      />
    )

    const helper = screen.getByText(helperText)
    expect(helper).toBeInTheDocument()
  })

  it('deve permitir alternar o estado', async () => {
    render(<Checkbox id="test" name="test" label="Aceito os termos" />)

    const checkbox = screen.getByLabelText(/aceito os termos/i)
    expect(checkbox).not.toBeChecked()

    await userEvent.click(checkbox)
    expect(checkbox).toBeChecked()

    await userEvent.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  it('deve aplicar estilos de erro quando houver erro', () => {
    render(
      <Checkbox id="test" name="test" label="Aceito os termos" error="Erro" />
    )

    const checkbox = screen.getByLabelText(/aceito os termos/i)
    expect(checkbox).toHaveClass('border-red-500')
  })

  it('deve ser desabilitado quando a prop disabled é true', () => {
    render(<Checkbox id="test" name="test" label="Aceito os termos" disabled />)

    const checkbox = screen.getByLabelText(/aceito os termos/i)
    expect(checkbox).toBeDisabled()
  })

  it('deve anunciar mudanças de estado para leitores de tela', async () => {
    render(
      <Checkbox
        id="test"
        name="test"
        label="Aceito os termos"
        aria-live="polite"
      />
    )

    const checkbox = screen.getByLabelText(/aceito os termos/i)
    await userEvent.click(checkbox)

    expect(checkbox).toHaveAttribute('aria-live', 'polite')
  })
})
