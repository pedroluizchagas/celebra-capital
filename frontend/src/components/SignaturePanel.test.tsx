import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import SignaturePanel from './SignaturePanel'
import proposalService from '../services/proposalService'

// Mock do serviço de proposta
jest.mock('../services/proposalService', () => ({
  getSignatureStatus: jest.fn(),
  getSignedDocumentUrl: jest.fn(),
}))

describe('SignaturePanel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock da função window.open
    global.open = jest.fn()
  })

  test('deve mostrar o loading state inicialmente', () => {
    // Mock da resposta da API
    ;(proposalService.getSignatureStatus as jest.Mock).mockResolvedValueOnce({
      status: 'pending',
    })

    render(<SignaturePanel proposalId={123} />)

    expect(screen.getByText('Carregando status...')).toBeInTheDocument()
  })

  test('deve exibir status "pendente" quando a assinatura estiver em processamento', async () => {
    // Mock da resposta da API
    ;(proposalService.getSignatureStatus as jest.Mock).mockResolvedValueOnce({
      status: 'pending',
    })

    render(<SignaturePanel proposalId={123} />)

    await waitFor(() => {
      expect(
        screen.getByText('Assinatura em processamento...')
      ).toBeInTheDocument()
    })
  })

  test('deve exibir status "completado" e botão de download quando a assinatura for concluída', async () => {
    // Mock da resposta da API
    ;(proposalService.getSignatureStatus as jest.Mock)
      .mockResolvedValueOnce({
        status: 'completed',
        document_url: 'https://example.com/document.pdf',
      })
      (
        // Mock da URL para download
        proposalService.getSignedDocumentUrl as jest.Mock
      )
      .mockReturnValue('https://example.com/download/123')

    render(<SignaturePanel proposalId={123} />)

    await waitFor(() => {
      expect(
        screen.getByText('Documento assinado com sucesso!')
      ).toBeInTheDocument()
      expect(screen.getByText('Baixar Documento Assinado')).toBeInTheDocument()
    })
  })

  test('deve exibir mensagem de erro quando falhar ao buscar status', async () => {
    // Mock do erro
    ;(proposalService.getSignatureStatus as jest.Mock).mockRejectedValueOnce(
      new Error('API Error')
    )

    render(<SignaturePanel proposalId={123} />)

    await waitFor(() => {
      expect(
        screen.getByText('Erro ao carregar status da assinatura')
      ).toBeInTheDocument()
    })
  })

  test('deve abrir uma nova janela ao clicar no botão de download', async () => {
    // Mock da resposta da API
    ;(proposalService.getSignatureStatus as jest.Mock)
      .mockResolvedValueOnce({
        status: 'completed',
      })
      (
        // Mock da URL para download
        proposalService.getSignedDocumentUrl as jest.Mock
      )
      .mockReturnValue('https://example.com/download/123')

    render(<SignaturePanel proposalId={123} />)

    await waitFor(() => {
      expect(screen.getByText('Baixar Documento Assinado')).toBeInTheDocument()
    })

    // Simular clique no botão de download
    act(() => {
      screen.getByText('Baixar Documento Assinado').click()
    })

    expect(global.open).toHaveBeenCalledWith(
      'https://example.com/download/123',
      '_blank'
    )
  })
})
