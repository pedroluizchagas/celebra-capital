/**
 * Testes de Integração - Fluxo de Aprovação de Propostas
 * Testa o fluxo completo de aprovação de uma proposta
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom'
import ProposalDetails from '../../../src/pages/admin/ProposalDetails'
import AdminLayout from '../../../src/layouts/AdminLayout'

// Mock dos componentes de layout e contextos
jest.mock('../../../src/layouts/AdminLayout', () => {
  return function MockAdminLayout({ children }) {
    return <div data-testid="admin-layout">{children}</div>
  }
})

// Mock de contextos e serviços
jest.mock('../../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      name: 'Administrador',
      role: 'admin',
      permissions: ['approve_proposals'],
    },
    isAuthenticated: true,
  }),
}))

describe('Fluxo de Aprovação de Propostas', () => {
  beforeEach(() => {
    // Limpar mocks entre os testes
    jest.clearAllMocks()

    // Simular localStorage
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'authToken') return 'mock-token'
      return null
    })
  })

  test('permite a aprovação de uma proposta', async () => {
    // Renderizar a página de detalhes de proposta com um ID específico
    render(
      <MemoryRouter initialEntries={['/admin/proposals/123']}>
        <Routes>
          <Route path="/admin/proposals/:id" element={<ProposalDetails />} />
        </Routes>
      </MemoryRouter>
    )

    // Aguardar o carregamento da página
    await waitFor(() => {
      expect(screen.getByText(/Proposta #P-2023-123/i)).toBeInTheDocument()
    })

    // Verificar se o botão de aprovação existe
    const approveButton = screen.getByText('Aprovar Proposta')
    expect(approveButton).toBeInTheDocument()
    expect(approveButton).not.toBeDisabled()

    // Clicar no botão de aprovação para abrir o modal
    fireEvent.click(approveButton)

    // Verificar se o modal de aprovação foi aberto
    await waitFor(() => {
      expect(screen.getByText('Confirmar Aprovação')).toBeInTheDocument()
    })

    // Adicionar um comentário
    const commentInput = screen.getByPlaceholderText(
      'Adicione comentários sobre a aprovação...'
    )
    fireEvent.change(commentInput, {
      target: { value: 'Proposta aprovada após análise detalhada.' },
    })

    // Clicar no botão de confirmação
    fireEvent.click(screen.getByText('Confirmar Aprovação'))

    // Verificar se a aprovação foi bem-sucedida
    await waitFor(() => {
      expect(
        screen.getByText('Proposta aprovada com sucesso!')
      ).toBeInTheDocument()
    })

    // Verificar se o status da proposta foi atualizado
    await waitFor(() => {
      const statusElement = screen.getByText('Aprovada')
      expect(statusElement).toBeInTheDocument()
      expect(statusElement).toHaveClass('bg-green-100')
    })
  })

  test('permite a rejeição de uma proposta', async () => {
    // Renderizar a página de detalhes de proposta
    render(
      <MemoryRouter initialEntries={['/admin/proposals/456']}>
        <Routes>
          <Route path="/admin/proposals/:id" element={<ProposalDetails />} />
        </Routes>
      </MemoryRouter>
    )

    // Aguardar o carregamento da página
    await waitFor(() => {
      expect(screen.getByText(/Proposta #P-2023-456/i)).toBeInTheDocument()
    })

    // Verificar se o botão de rejeição existe
    const rejectButton = screen.getByText('Rejeitar Proposta')
    expect(rejectButton).toBeInTheDocument()
    expect(rejectButton).not.toBeDisabled()

    // Clicar no botão de rejeição para abrir o modal
    fireEvent.click(rejectButton)

    // Verificar se o modal de rejeição foi aberto
    await waitFor(() => {
      expect(screen.getByText('Confirmar Rejeição')).toBeInTheDocument()
    })

    // Selecionar um motivo de rejeição
    const reasonSelect = screen.getByLabelText('Motivo da Rejeição *')
    fireEvent.change(reasonSelect, { target: { value: 'income_insufficient' } })

    // Adicionar um comentário
    const commentInput = screen.getByPlaceholderText(
      'Adicione comentários sobre a rejeição...'
    )
    fireEvent.change(commentInput, {
      target: { value: 'Renda insuficiente para o valor solicitado.' },
    })

    // Clicar no botão de confirmação
    fireEvent.click(screen.getByText('Confirmar Rejeição'))

    // Verificar se a rejeição foi bem-sucedida
    await waitFor(() => {
      expect(
        screen.getByText('Proposta rejeitada com sucesso!')
      ).toBeInTheDocument()
    })

    // Verificar se o status da proposta foi atualizado
    await waitFor(() => {
      const statusElement = screen.getByText('Rejeitada')
      expect(statusElement).toBeInTheDocument()
      expect(statusElement).toHaveClass('bg-red-100')
    })
  })

  test('permite solicitar documentos adicionais', async () => {
    // Renderizar a página de detalhes de proposta
    render(
      <MemoryRouter initialEntries={['/admin/proposals/789']}>
        <Routes>
          <Route path="/admin/proposals/:id" element={<ProposalDetails />} />
        </Routes>
      </MemoryRouter>
    )

    // Aguardar o carregamento da página
    await waitFor(() => {
      expect(screen.getByText(/Proposta #P-2023-789/i)).toBeInTheDocument()
    })

    // Verificar se o botão de solicitação de documentos existe
    const requestDocsButton = screen.getByText('Solicitar Documentos')
    expect(requestDocsButton).toBeInTheDocument()
    expect(requestDocsButton).not.toBeDisabled()

    // Clicar no botão para abrir o modal
    fireEvent.click(requestDocsButton)

    // Verificar se o modal foi aberto
    await waitFor(() => {
      expect(
        screen.getByText('Solicitar Documentos Adicionais')
      ).toBeInTheDocument()
    })

    // Selecionar documentos
    fireEvent.click(screen.getByLabelText('Comprovante de Renda'))
    fireEvent.click(screen.getByLabelText('Comprovante de Residência'))

    // Adicionar uma mensagem
    const messageInput = screen.getByPlaceholderText(
      'Explique o motivo da solicitação...'
    )
    fireEvent.change(messageInput, {
      target: {
        value:
          'Precisamos de documentos atualizados para prosseguir com a análise.',
      },
    })

    // Clicar no botão de confirmação
    fireEvent.click(screen.getByText('Enviar Solicitação'))

    // Verificar se a solicitação foi bem-sucedida
    await waitFor(() => {
      expect(
        screen.getByText('Solicitação de documentos enviada com sucesso!')
      ).toBeInTheDocument()
    })
  })
})
