import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import SignDocumentButton from './SignDocumentButton'
import proposalService from '../services/proposalService'

// Mock do serviço de proposta
jest.mock('../services/proposalService', () => ({
  submitSignature: jest.fn(),
}))

describe('SignDocumentButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('deve renderizar o botão de assinatura', () => {
    render(<SignDocumentButton proposalId={123} />)

    expect(screen.getByText('Assinar Documento')).toBeInTheDocument()
  })

  test('deve chamar submitSignature quando o botão for clicado', async () => {
    // Mock da função submitSignature
    ;(proposalService.submitSignature as jest.Mock).mockResolvedValueOnce({})

    // Mock da função de callback
    const onSignatureInitiated = jest.fn()

    render(
      <SignDocumentButton
        proposalId={123}
        onSignatureInitiated={onSignatureInitiated}
      />
    )

    // Clicar no botão
    fireEvent.click(screen.getByText('Assinar Documento'))

    // Verificar se a função submitSignature foi chamada
    expect(proposalService.submitSignature).toHaveBeenCalledWith(123)

    // Verificar se o callback foi chamado após a resposta da API
    await waitFor(() => {
      expect(onSignatureInitiated).toHaveBeenCalled()
    })
  })

  test('deve mostrar mensagem de erro quando a submissão falhar', async () => {
    // Mock do erro
    ;(proposalService.submitSignature as jest.Mock).mockRejectedValueOnce(
      new Error('API Error')
    )

    render(<SignDocumentButton proposalId={123} />)

    // Clicar no botão
    fireEvent.click(screen.getByText('Assinar Documento'))

    // Verificar se a mensagem de erro é exibida
    await waitFor(() => {
      expect(
        screen.getByText(
          'Não foi possível iniciar o processo de assinatura. Tente novamente.'
        )
      ).toBeInTheDocument()
    })
  })

  test('deve mostrar indicador de loading durante o processamento', async () => {
    // Mock da função submitSignature com um atraso
    ;(proposalService.submitSignature as jest.Mock).mockImplementationOnce(
      () => {
        return new Promise((resolve) => {
          setTimeout(() => resolve({}), 100)
        })
      }
    )

    render(<SignDocumentButton proposalId={123} />)

    // Clicar no botão
    fireEvent.click(screen.getByText('Assinar Documento'))

    // Verificar se o texto de processamento é exibido
    expect(screen.getByText('Processando...')).toBeInTheDocument()

    // Esperar a conclusão
    await waitFor(() => {
      expect(
        screen.getByText('Processo de assinatura iniciado com sucesso!')
      ).toBeInTheDocument()
    })
  })

  test('deve mostrar mensagem de sucesso após iniciar a assinatura com sucesso', async () => {
    // Mock da função submitSignature
    ;(proposalService.submitSignature as jest.Mock).mockResolvedValueOnce({})

    render(<SignDocumentButton proposalId={123} />)

    // Clicar no botão
    fireEvent.click(screen.getByText('Assinar Documento'))

    // Verificar se a mensagem de sucesso é exibida
    await waitFor(() => {
      expect(
        screen.getByText('Processo de assinatura iniciado com sucesso!')
      ).toBeInTheDocument()
    })
  })
})
