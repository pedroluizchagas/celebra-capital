import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { testFormAccessibility } from '../../../utils/a11y-test-helpers'
import { FileInput } from '../FileInput'

describe('FileInput Component', () => {
  it('deve passar nos testes de acessibilidade', async () => {
    await testFormAccessibility(
      <FileInput id="test" name="test" label="Enviar documentos" required />
    )
  })

  it('deve renderizar o label corretamente', () => {
    render(<FileInput id="test" name="test" label="Enviar documentos" />)

    expect(screen.getByText('Enviar documentos')).toBeInTheDocument()
  })

  it('deve mostrar o asterisco para campos obrigatórios', () => {
    render(
      <FileInput id="test" name="test" label="Enviar documentos" required />
    )

    const asterisk = screen.getByText('*')
    expect(asterisk).toBeInTheDocument()
    expect(asterisk).toHaveAttribute('aria-hidden', 'true')
  })

  it('deve mostrar mensagem de erro quando houver erro', () => {
    const errorMessage = 'Campo obrigatório'
    render(
      <FileInput
        id="test"
        name="test"
        label="Enviar documentos"
        error={errorMessage}
      />
    )

    const error = screen.getByRole('alert')
    expect(error).toHaveTextContent(errorMessage)
  })

  it('deve mostrar texto de ajuda quando fornecido', () => {
    const helperText = 'Texto de ajuda'
    render(
      <FileInput
        id="test"
        name="test"
        label="Enviar documentos"
        helperText={helperText}
      />
    )

    const helper = screen.getByText(helperText)
    expect(helper).toBeInTheDocument()
  })

  it('deve mostrar tipos de arquivo aceitos', () => {
    render(
      <FileInput
        id="test"
        name="test"
        label="Enviar documentos"
        accept=".jpg,.png,.pdf"
      />
    )

    expect(screen.getByText('.JPG, .PNG, .PDF')).toBeInTheDocument()
  })

  it('deve permitir personalizar o texto do botão', () => {
    render(
      <FileInput
        id="test"
        name="test"
        label="Enviar documentos"
        buttonText="Escolher arquivo"
      />
    )

    expect(screen.getByText('Escolher arquivo')).toBeInTheDocument()
  })

  it('deve mostrar o nome do arquivo selecionado', async () => {
    render(
      <FileInput id="test" name="test" label="Enviar documentos" showFileName />
    )

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/enviar documentos/i)

    await userEvent.upload(input, file)

    expect(screen.getByText('test.jpg')).toBeInTheDocument()
  })

  it('deve chamar o callback onChange quando arquivo for selecionado', async () => {
    const handleChange = jest.fn()
    render(
      <FileInput
        id="test"
        name="test"
        label="Enviar documentos"
        onChange={handleChange}
      />
    )

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/enviar documentos/i)

    await userEvent.upload(input, file)

    expect(handleChange).toHaveBeenCalled()
  })

  it('deve validar o tamanho máximo do arquivo', async () => {
    render(
      <FileInput
        id="test"
        name="test"
        label="Enviar documentos"
        maxFileSize={1000} // 1KB
      />
    )

    // Criar arquivo maior que 1KB
    const largeFile = new File([new ArrayBuffer(2000)], 'large.jpg', {
      type: 'image/jpeg',
    })
    const input = screen.getByLabelText(/enviar documentos/i)

    await userEvent.upload(input, largeFile)

    const error = screen.getByRole('alert')
    expect(error).toHaveTextContent(/tamanho máximo/i)
  })

  it('deve ser acessível por teclado', async () => {
    const handleChange = jest.fn()
    render(
      <FileInput
        id="test"
        name="test"
        label="Enviar documentos"
        onChange={handleChange}
      />
    )

    const dropArea = screen.getByRole('button')
    expect(dropArea).toHaveAttribute('tabIndex', '0')

    // Simular pressionar Enter no dropArea
    fireEvent.keyDown(dropArea, { key: 'Enter' })
    expect(dropArea).toHaveFocus()
  })

  it('deve mostrar feedback visual quando arquivo for arrastado', () => {
    render(<FileInput id="test" name="test" label="Enviar documentos" />)

    const dropArea = screen.getByRole('button')

    // Simular arrastar arquivo sobre a área
    fireEvent.dragOver(dropArea)
    expect(dropArea).toHaveClass('border-primary-500')

    // Simular quando arquivo sai da área
    fireEvent.dragLeave(dropArea)
    expect(dropArea).not.toHaveClass('border-primary-500')
  })

  it('deve ser desabilitado quando a prop disabled é true', () => {
    render(
      <FileInput id="test" name="test" label="Enviar documentos" disabled />
    )

    const input = screen.getByLabelText(/enviar documentos/i)
    const dropArea = screen.getByRole('button')

    expect(input).toBeDisabled()
    expect(dropArea).toHaveAttribute('aria-disabled', 'true')
    expect(dropArea).toHaveClass('bg-gray-100')
  })
})
