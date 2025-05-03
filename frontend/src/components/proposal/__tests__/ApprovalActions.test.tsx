import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ApprovalActions from '../ApprovalActions'
import proposalService from '../../../services/proposalService'

// Mock do serviço de propostas
jest.mock('../../../services/proposalService', () => ({
  approveProposal: jest.fn().mockResolvedValue({}),
  rejectProposal: jest.fn().mockResolvedValue({}),
  requestAdditionalDocuments: jest.fn().mockResolvedValue({}),
}))

describe('ApprovalActions Component', () => {
  const defaultProps = {
    proposalId: 123,
    status: 'pending',
    onStatusChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renderiza os botões de ação corretamente', () => {
    render(<ApprovalActions {...defaultProps} />)

    expect(screen.getByText('Aprovar Proposta')).toBeInTheDocument()
    expect(screen.getByText('Rejeitar Proposta')).toBeInTheDocument()
    expect(screen.getByText('Solicitar Documentos')).toBeInTheDocument()
  })

  test('desabilita botões quando o status não é pendente', () => {
    render(<ApprovalActions {...defaultProps} status="approved" />)

    expect(screen.getByText('Aprovar Proposta')).toBeDisabled()
    expect(screen.getByText('Rejeitar Proposta')).toBeDisabled()
    expect(screen.getByText('Solicitar Documentos')).toBeDisabled()
  })

  test('abre o modal de aprovação quando o botão é clicado', () => {
    render(<ApprovalActions {...defaultProps} />)

    fireEvent.click(screen.getByText('Aprovar Proposta'))

    expect(screen.getByText('Aprovar Proposta')).toBeInTheDocument()
    expect(screen.getByText('Comentários (opcional)')).toBeInTheDocument()
    expect(screen.getByText('Confirmar Aprovação')).toBeInTheDocument()
  })

  test('abre o modal de rejeição quando o botão é clicado', () => {
    render(<ApprovalActions {...defaultProps} />)

    fireEvent.click(screen.getByText('Rejeitar Proposta'))

    expect(screen.getByText('Rejeitar Proposta')).toBeInTheDocument()
    expect(screen.getByText('Motivo da Rejeição *')).toBeInTheDocument()
    expect(screen.getByText('Confirmar Rejeição')).toBeInTheDocument()
  })

  test('abre o modal de solicitação de documentos quando o botão é clicado', () => {
    render(<ApprovalActions {...defaultProps} />)

    fireEvent.click(screen.getByText('Solicitar Documentos'))

    expect(
      screen.getByText('Solicitar Documentos Adicionais')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Selecione os documentos necessários *')
    ).toBeInTheDocument()
    expect(screen.getByText('Enviar Solicitação')).toBeInTheDocument()
  })

  test('chama a API para aprovar proposta quando confirmado', async () => {
    render(<ApprovalActions {...defaultProps} />)

    // Abrir modal
    fireEvent.click(screen.getByText('Aprovar Proposta'))

    // Preencher comentário
    const commentInput = screen.getByPlaceholderText(
      'Adicione comentários sobre a aprovação...'
    )
    fireEvent.change(commentInput, {
      target: { value: 'Proposta aprovada por mérito' },
    })

    // Confirmar
    fireEvent.click(screen.getByText('Confirmar Aprovação'))

    await waitFor(() => {
      expect(proposalService.approveProposal).toHaveBeenCalledWith(
        123,
        'Proposta aprovada por mérito'
      )
      expect(defaultProps.onStatusChange).toHaveBeenCalledWith('approved')
    })
  })

  test('chama a API para rejeitar proposta quando confirmado', async () => {
    render(<ApprovalActions {...defaultProps} />)

    // Abrir modal
    fireEvent.click(screen.getByText('Rejeitar Proposta'))

    // Selecionar motivo
    const reasonSelect = screen.getByLabelText('Motivo da Rejeição *')
    fireEvent.change(reasonSelect, { target: { value: 'income_insufficient' } })

    // Preencher comentário
    const commentInput = screen.getByPlaceholderText(
      'Adicione comentários sobre a rejeição...'
    )
    fireEvent.change(commentInput, {
      target: { value: 'Renda não compatível' },
    })

    // Confirmar
    fireEvent.click(screen.getByText('Confirmar Rejeição'))

    await waitFor(() => {
      expect(proposalService.rejectProposal).toHaveBeenCalledWith(
        123,
        'income_insufficient',
        'Renda não compatível'
      )
      expect(defaultProps.onStatusChange).toHaveBeenCalledWith('rejected')
    })
  })

  test('não permite rejeitar sem informar o motivo', async () => {
    render(<ApprovalActions {...defaultProps} />)

    // Abrir modal
    fireEvent.click(screen.getByText('Rejeitar Proposta'))

    // Tentar confirmar sem selecionar o motivo
    fireEvent.click(screen.getByText('Confirmar Rejeição'))

    // Botão de confirmação deve estar desabilitado
    expect(screen.getByText('Confirmar Rejeição')).toBeDisabled()
    expect(proposalService.rejectProposal).not.toHaveBeenCalled()
  })

  test('chama a API para solicitar documentos quando confirmado', async () => {
    render(<ApprovalActions {...defaultProps} />)

    // Abrir modal
    fireEvent.click(screen.getByText('Solicitar Documentos'))

    // Selecionar documentos
    fireEvent.click(screen.getByLabelText('RG'))
    fireEvent.click(screen.getByLabelText('Comprovante de Renda'))

    // Preencher mensagem
    const messageInput = screen.getByPlaceholderText(
      'Explique o motivo da solicitação...'
    )
    fireEvent.change(messageInput, {
      target: { value: 'Documentos necessários para análise' },
    })

    // Confirmar
    fireEvent.click(screen.getByText('Enviar Solicitação'))

    await waitFor(() => {
      expect(proposalService.requestAdditionalDocuments).toHaveBeenCalledWith(
        123,
        ['rg', 'proof_income'],
        'Documentos necessários para análise'
      )
    })
  })

  test('não permite solicitar documentos sem selecionar pelo menos um', () => {
    render(<ApprovalActions {...defaultProps} />)

    // Abrir modal
    fireEvent.click(screen.getByText('Solicitar Documentos'))

    // Botão de confirmar deve estar desabilitado
    expect(screen.getByText('Enviar Solicitação')).toBeDisabled()
  })
})
