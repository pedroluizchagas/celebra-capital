import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { testFormAccessibility } from '../../../utils/a11y-test-helpers'
import { Textarea } from '../Textarea'

describe('Textarea Component', () => {
  it('deve passar nos testes de acessibilidade', async () => {
    await testFormAccessibility(
      <Textarea id="test" name="test" label="Mensagem" required />
    )
  })

  it('deve renderizar o label corretamente', () => {
    render(<Textarea id="test" name="test" label="Mensagem" />)

    const label = screen.getByLabelText(/mensagem/i)
    expect(label).toBeInTheDocument()
  })

  it('deve mostrar o asterisco para campos obrigatórios', () => {
    render(<Textarea id="test" name="test" label="Mensagem" required />)

    const asterisk = screen.getByText('*')
    expect(asterisk).toBeInTheDocument()
    expect(asterisk).toHaveAttribute('aria-hidden', 'true')
  })

  it('deve mostrar mensagem de erro quando houver erro', () => {
    const errorMessage = 'Campo obrigatório'
    render(
      <Textarea id="test" name="test" label="Mensagem" error={errorMessage} />
    )

    const error = screen.getByRole('alert')
    expect(error).toHaveTextContent(errorMessage)
  })

  it('deve mostrar texto de ajuda quando fornecido', () => {
    const helperText = 'Texto de ajuda'
    render(
      <Textarea
        id="test"
        name="test"
        label="Mensagem"
        helperText={helperText}
      />
    )

    const helper = screen.getByText(helperText)
    expect(helper).toBeInTheDocument()
  })

  it('deve permitir entrada de dados', async () => {
    render(<Textarea id="test" name="test" label="Mensagem" />)

    const textarea = screen.getByLabelText(/mensagem/i)
    await userEvent.type(textarea, 'Teste de mensagem')

    expect(textarea).toHaveValue('Teste de mensagem')
  })

  it('deve aplicar estilos de erro quando houver erro', () => {
    render(<Textarea id="test" name="test" label="Mensagem" error="Erro" />)

    const textarea = screen.getByLabelText(/mensagem/i)
    expect(textarea).toHaveClass('border-red-500')
  })

  it('deve mostrar contador de caracteres quando showCharCount é verdadeiro', () => {
    render(
      <Textarea
        id="test"
        name="test"
        label="Mensagem"
        maxLength={100}
        showCharCount
        value="Teste"
      />
    )

    const counter = screen.getByText('5/100')
    expect(counter).toBeInTheDocument()
  })

  it('deve mostrar aviso quando próximo do limite de caracteres', () => {
    render(
      <Textarea
        id="test"
        name="test"
        label="Mensagem"
        maxLength={10}
        showCharCount
        value="Teste text"
      />
    )

    const counter = screen.getByText('10/10')
    expect(counter).toHaveClass('text-red-600')
    expect(
      screen.getByText(/limite de caracteres atingido/i)
    ).toBeInTheDocument()
  })

  it('deve respeitar o número de linhas definido', () => {
    render(<Textarea id="test" name="test" label="Mensagem" rows={5} />)

    const textarea = screen.getByLabelText(/mensagem/i)
    expect(textarea).toHaveAttribute('rows', '5')
  })

  it('deve anunciar mudanças no contador para leitores de tela', () => {
    render(
      <Textarea
        id="test"
        name="test"
        label="Mensagem"
        maxLength={10}
        showCharCount
        value="Texto"
      />
    )

    const counter = screen.getByText('5/10')
    expect(counter).toHaveAttribute('aria-live', 'polite')
  })
})
