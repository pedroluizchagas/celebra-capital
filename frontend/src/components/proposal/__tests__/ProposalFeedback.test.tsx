import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ProposalFeedback from '../ProposalFeedback'

describe('ProposalFeedback Component', () => {
  const mockComments = [
    {
      id: '1',
      author: 'Ana Silva',
      author_role: 'Analista de Crédito',
      text: 'Cliente com bom histórico de crédito. Documentação completa e verificada.',
      created_at: new Date().toISOString(),
      is_internal: true,
    },
    {
      id: '2',
      author: 'Carlos Santos',
      author_role: 'Gerente',
      text: 'Aprovado conforme política de crédito.',
      created_at: new Date().toISOString(),
      is_internal: false,
    },
  ]

  const mockAddComment = jest.fn().mockResolvedValue(undefined)

  const defaultProps = {
    proposalId: 123,
    comments: mockComments,
    onAddComment: mockAddComment,
    isLoading: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renderiza a lista de comentários corretamente', () => {
    render(<ProposalFeedback {...defaultProps} />)

    expect(screen.getByText('Comentários e Feedback')).toBeInTheDocument()
    expect(screen.getByText('Ana Silva')).toBeInTheDocument()
    expect(screen.getByText('Analista de Crédito')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Cliente com bom histórico de crédito. Documentação completa e verificada.'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('Carlos Santos')).toBeInTheDocument()
    expect(screen.getByText('Gerente')).toBeInTheDocument()
    expect(
      screen.getByText('Aprovado conforme política de crédito.')
    ).toBeInTheDocument()
  })

  test('exibe mensagem quando não há comentários', () => {
    render(<ProposalFeedback {...defaultProps} comments={[]} />)

    expect(screen.getByText('Nenhum comentário ainda.')).toBeInTheDocument()
  })

  test('exibe o estado de carregamento', () => {
    render(<ProposalFeedback {...defaultProps} isLoading={true} />)

    // Verificar se o componente de carregamento está sendo exibido
    // Procurando elementos que tenham a classe animate-pulse
    const loadingItems = document.querySelectorAll('.animate-pulse')
    expect(loadingItems.length).toBeGreaterThan(0)
  })

  test('diferencia comentários internos e regulares visualmente', () => {
    render(<ProposalFeedback {...defaultProps} />)

    // O comentário interno deve ter a label "Interno"
    expect(screen.getByText('Interno')).toBeInTheDocument()

    // Verificar se o comentário interno tem a classe de estilo específica
    const internalComment = screen
      .getByText(
        'Cliente com bom histórico de crédito. Documentação completa e verificada.'
      )
      .closest('div')
    expect(internalComment).toHaveClass('bg-yellow-50')

    // Verificar se o comentário regular não tem a mesma classe
    const regularComment = screen
      .getByText('Aprovado conforme política de crédito.')
      .closest('div')
    expect(regularComment).not.toHaveClass('bg-yellow-50')
  })

  test('envia um novo comentário quando o formulário é submetido', async () => {
    render(<ProposalFeedback {...defaultProps} />)

    // Preencher o campo de comentário
    const commentInput = screen.getByPlaceholderText(
      'Digite seu comentário aqui...'
    )
    fireEvent.change(commentInput, {
      target: { value: 'Novo comentário de teste' },
    })

    // Submeter o formulário
    const submitButton = screen.getByText('Adicionar Comentário')
    fireEvent.click(submitButton)

    // Verificar se a função onAddComment foi chamada com os parâmetros corretos
    await waitFor(() => {
      expect(mockAddComment).toHaveBeenCalledWith(
        'Novo comentário de teste',
        false
      )
    })
  })

  test('envia um comentário interno quando a opção está marcada', async () => {
    render(<ProposalFeedback {...defaultProps} />)

    // Preencher o campo de comentário
    const commentInput = screen.getByPlaceholderText(
      'Digite seu comentário aqui...'
    )
    fireEvent.change(commentInput, {
      target: { value: 'Comentário interno de teste' },
    })

    // Marcar a opção de comentário interno
    const internalCheckbox = screen.getByLabelText(
      'Comentário interno (não visível para o cliente)'
    )
    fireEvent.click(internalCheckbox)

    // Submeter o formulário
    const submitButton = screen.getByText('Adicionar Comentário')
    fireEvent.click(submitButton)

    // Verificar se a função onAddComment foi chamada com is_internal=true
    await waitFor(() => {
      expect(mockAddComment).toHaveBeenCalledWith(
        'Comentário interno de teste',
        true
      )
    })
  })

  test('não permite enviar comentário vazio', () => {
    render(<ProposalFeedback {...defaultProps} />)

    // O botão deve estar desabilitado inicialmente
    expect(screen.getByText('Adicionar Comentário')).toBeDisabled()

    // Adicionar um comentário vazio (apenas espaços)
    const commentInput = screen.getByPlaceholderText(
      'Digite seu comentário aqui...'
    )
    fireEvent.change(commentInput, { target: { value: '   ' } })

    // O botão ainda deve estar desabilitado
    expect(screen.getByText('Adicionar Comentário')).toBeDisabled()
  })

  test('exibe indicador de carregamento durante o envio do comentário', async () => {
    // Criar uma versão da função que não resolve imediatamente
    const delayedAddComment = jest.fn().mockImplementation(() => {
      return new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 100)
      })
    })

    render(
      <ProposalFeedback {...defaultProps} onAddComment={delayedAddComment} />
    )

    // Preencher e enviar o comentário
    const commentInput = screen.getByPlaceholderText(
      'Digite seu comentário aqui...'
    )
    fireEvent.change(commentInput, { target: { value: 'Comentário de teste' } })
    fireEvent.click(screen.getByText('Adicionar Comentário'))

    // Verificar se o texto de carregamento aparece
    expect(screen.getByText('Enviando...')).toBeInTheDocument()

    // Esperar a conclusão
    await waitFor(() => {
      expect(delayedAddComment).toHaveBeenCalled()
    })
  })

  test('limpa o campo de comentário após o envio bem-sucedido', async () => {
    render(<ProposalFeedback {...defaultProps} />)

    // Preencher o campo de comentário
    const commentInput = screen.getByPlaceholderText(
      'Digite seu comentário aqui...'
    )
    fireEvent.change(commentInput, { target: { value: 'Comentário de teste' } })

    // Submeter o formulário
    fireEvent.click(screen.getByText('Adicionar Comentário'))

    // Verificar se o campo foi limpo
    await waitFor(() => {
      expect(commentInput).toHaveValue('')
    })
  })
})
