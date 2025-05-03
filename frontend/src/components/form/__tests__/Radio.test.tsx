import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { testFormAccessibility } from '../../../utils/a11y-test-helpers'
import { Radio } from '../Radio'

const mockOptions = [
  { value: 'option1', label: 'Opção 1' },
  { value: 'option2', label: 'Opção 2' },
  { value: 'option3', label: 'Opção 3', disabled: true },
]

describe('Radio Component', () => {
  it('deve passar nos testes de acessibilidade', async () => {
    await testFormAccessibility(
      <Radio
        id="test"
        name="test"
        label="Selecione uma opção"
        options={mockOptions}
        required
      />
    )
  })

  it('deve renderizar todas as opções', () => {
    render(
      <Radio
        id="test"
        name="test"
        label="Selecione uma opção"
        options={mockOptions}
      />
    )

    expect(screen.getByLabelText('Opção 1')).toBeInTheDocument()
    expect(screen.getByLabelText('Opção 2')).toBeInTheDocument()
    expect(screen.getByLabelText('Opção 3')).toBeInTheDocument()
  })

  it('deve renderizar o label do grupo corretamente', () => {
    render(
      <Radio
        id="test"
        name="test"
        label="Selecione uma opção"
        options={mockOptions}
      />
    )

    expect(screen.getByText('Selecione uma opção')).toBeInTheDocument()
  })

  it('deve mostrar o asterisco para campos obrigatórios', () => {
    render(
      <Radio
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
      <Radio
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
      <Radio
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

  it('deve permitir selecionar uma opção', async () => {
    const handleChange = jest.fn()
    render(
      <Radio
        id="test"
        name="test"
        label="Selecione uma opção"
        options={mockOptions}
        onChange={handleChange}
      />
    )

    const radioOption = screen.getByLabelText('Opção 1')
    await userEvent.click(radioOption)

    expect(handleChange).toHaveBeenCalled()
  })

  it('deve marcar a opção selecionada', () => {
    render(
      <Radio
        id="test"
        name="test"
        label="Selecione uma opção"
        options={mockOptions}
        value="option2"
      />
    )

    const radioOption = screen.getByLabelText('Opção 2')
    expect(radioOption).toBeChecked()
  })

  it('deve desabilitar opções marcadas como disabled', () => {
    render(
      <Radio
        id="test"
        name="test"
        label="Selecione uma opção"
        options={mockOptions}
      />
    )

    const disabledOption = screen.getByLabelText('Opção 3')
    expect(disabledOption).toBeDisabled()
  })

  it('deve ter atributos ARIA corretos para acessibilidade', () => {
    render(
      <Radio
        id="test"
        name="test"
        label="Selecione uma opção"
        options={mockOptions}
        required
        error="Erro"
      />
    )

    const radioGroup = screen.getByRole('radiogroup')
    expect(radioGroup).toHaveAttribute('aria-required', 'true')
    expect(radioGroup).toHaveAttribute('aria-invalid', 'true')
    expect(radioGroup).toHaveAttribute('aria-labelledby', 'test-group-label')
    expect(radioGroup).toHaveAttribute('aria-describedby', 'test-error')
  })
})
