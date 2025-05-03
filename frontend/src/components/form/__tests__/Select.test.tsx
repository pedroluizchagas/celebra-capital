import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { testFormAccessibility } from '../../../utils/a11y-test-helpers'
import { Select } from '../Select'

const mockOptions = [
  { value: '1', label: 'Opção 1' },
  { value: '2', label: 'Opção 2' },
  { value: '3', label: 'Opção 3', disabled: true },
]

describe('Select Component', () => {
  it('deve passar nos testes de acessibilidade', async () => {
    await testFormAccessibility(
      <Select
        id="test"
        name="test"
        label="Selecione uma opção"
        options={mockOptions}
        required
      />
    )
  })

  it('deve renderizar o label corretamente', () => {
    render(
      <Select
        id="test"
        name="test"
        label="Selecione uma opção"
        options={mockOptions}
      />
    )

    const label = screen.getByLabelText(/selecione uma opção/i)
    expect(label).toBeInTheDocument()
  })

  it('deve mostrar o asterisco para campos obrigatórios', () => {
    render(
      <Select
        id="test"
        name="test"
        label="Selecione uma opção"
        options={mockOptions}
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
      <Select
        id="test"
        name="test"
        label="Selecione uma opção"
        options={mockOptions}
        error={errorMessage}
      />
    )

    const error = screen.getByRole('alert')
    expect(error).toHaveTextContent(errorMessage)
  })

  it('deve mostrar texto de ajuda quando fornecido', () => {
    const helperText = 'Texto de ajuda'
    render(
      <Select
        id="test"
        name="test"
        label="Selecione uma opção"
        options={mockOptions}
        helperText={helperText}
      />
    )

    const helper = screen.getByText(helperText)
    expect(helper).toBeInTheDocument()
  })

  it('deve permitir seleção de opções', async () => {
    render(
      <Select
        id="test"
        name="test"
        label="Selecione uma opção"
        options={mockOptions}
      />
    )

    const select = screen.getByLabelText(/selecione uma opção/i)
    await userEvent.selectOptions(select, '2')

    expect(select).toHaveValue('2')
  })

  it('deve aplicar estilos de erro quando houver erro', () => {
    render(
      <Select
        id="test"
        name="test"
        label="Selecione uma opção"
        options={mockOptions}
        error="Erro"
      />
    )

    const select = screen.getByLabelText(/selecione uma opção/i)
    expect(select).toHaveClass('border-red-500')
  })

  it('deve desabilitar opções marcadas como disabled', () => {
    render(
      <Select
        id="test"
        name="test"
        label="Selecione uma opção"
        options={mockOptions}
      />
    )

    const select = screen.getByLabelText(/selecione uma opção/i)
    const options = select.querySelectorAll('option')

    expect(options[2]).toBeDisabled()
  })

  it('deve anunciar mudanças de valor para leitores de tela', async () => {
    render(
      <Select
        id="test"
        name="test"
        label="Selecione uma opção"
        options={mockOptions}
        aria-live="polite"
      />
    )

    const select = screen.getByLabelText(/selecione uma opção/i)
    await userEvent.selectOptions(select, '2')

    expect(select).toHaveAttribute('aria-live', 'polite')
  })
})
