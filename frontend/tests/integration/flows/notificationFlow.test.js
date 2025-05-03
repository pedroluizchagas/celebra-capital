/**
 * Testes de Integração - Fluxo de Notificações
 * Testa o fluxo completo de visualização e interação com notificações
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import NotificationIcon from '../../../src/components/notifications/NotificationIcon'
import Notifications from '../../../src/pages/admin/Notifications'
import ProposalDetails from '../../../src/pages/admin/ProposalDetails'

// Mock de hooks e contextos
jest.mock('../../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      name: 'Administrador',
      role: 'admin',
    },
    isAuthenticated: true,
  }),
}))

// Mock dos componentes de layout
jest.mock('../../../src/layouts/AdminLayout', () => {
  return function MockAdminLayout({ children }) {
    return <div data-testid="admin-layout">{children}</div>
  }
})

describe('Fluxo de Notificações', () => {
  beforeEach(() => {
    // Limpar mocks
    jest.clearAllMocks()

    // Simular localStorage
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'authToken') return 'mock-token'
      return null
    })
  })

  test('exibe contador de notificações não lidas e abre dropdown', async () => {
    render(
      <MemoryRouter>
        <NotificationIcon />
      </MemoryRouter>
    )

    // Verificar se o contador de notificações é exibido
    await waitFor(() => {
      const counter = screen.getByText('3')
      expect(counter).toBeInTheDocument()
    })

    // Clicar no ícone de notificação
    const notificationButton = screen.getByLabelText('Notificações')
    fireEvent.click(notificationButton)

    // Verificar se o dropdown foi aberto
    await waitFor(() => {
      expect(screen.getByText('Notificação 1')).toBeInTheDocument()
      expect(screen.getByText('Notificação 2')).toBeInTheDocument()
      expect(screen.getByText('Marcar todas como lidas')).toBeInTheDocument()
    })
  })

  test('marca todas as notificações como lidas no dropdown', async () => {
    render(
      <MemoryRouter>
        <NotificationIcon />
      </MemoryRouter>
    )

    // Abrir o dropdown
    const notificationButton = screen.getByLabelText('Notificações')
    fireEvent.click(notificationButton)

    // Aguardar o carregamento das notificações
    await waitFor(() => {
      expect(screen.getByText('Marcar todas como lidas')).toBeInTheDocument()
    })

    // Clicar no botão para marcar todas como lidas
    fireEvent.click(screen.getByText('Marcar todas como lidas'))

    // Verificar que o contador de notificações foi atualizado
    await waitFor(() => {
      // O contador não deve mais ser exibido
      expect(screen.queryByText('3')).not.toBeInTheDocument()
    })
  })

  test('navega para a página de detalhes da proposta ao clicar em uma notificação', async () => {
    // Criar um mock para a função de navegação
    const mockNavigate = jest.fn()
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
    }))

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<NotificationIcon />} />
          <Route path="/admin/proposals/:id" element={<ProposalDetails />} />
        </Routes>
      </MemoryRouter>
    )

    // Abrir o dropdown
    const notificationButton = screen.getByLabelText('Notificações')
    fireEvent.click(notificationButton)

    // Aguardar o carregamento das notificações
    await waitFor(() => {
      expect(screen.getByText('Notificação 2')).toBeInTheDocument()
    })

    // Notificação com ID par deve ter um link
    fireEvent.click(screen.getByText('Notificação 2'))

    // Verificar se a navegação foi solicitada para a página de detalhes da proposta
    await waitFor(() => {
      // Como estamos usando MemoryRouter, a navegação é feita diretamente
      // Tentamos verificar se a página de detalhes da proposta foi carregada
      expect(screen.queryByText(/Proposta #/i)).toBeInTheDocument()
    })
  })

  test('filtra notificações na página de notificações', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/notifications']}>
        <Routes>
          <Route path="/admin/notifications" element={<Notifications />} />
        </Routes>
      </MemoryRouter>
    )

    // Aguardar o carregamento da página
    await waitFor(() => {
      expect(screen.getByText('Gerenciar Notificações')).toBeInTheDocument()
    })

    // Verificar se todas as notificações estão visíveis
    expect(screen.getByText('Notificação 1')).toBeInTheDocument()
    expect(screen.getByText('Notificação 2')).toBeInTheDocument()
    expect(screen.getByText('Notificação 3')).toBeInTheDocument()

    // Filtrar por status (não lidas)
    const naoLidasButton = screen.getByLabelText('Não lidas')
    fireEvent.click(naoLidasButton)

    // Verificar se o filtro foi aplicado (deve mostrar apenas as 3 primeiras)
    await waitFor(() => {
      expect(screen.getByText('Notificação 1')).toBeInTheDocument()
      expect(screen.getByText('Notificação 2')).toBeInTheDocument()
      expect(screen.getByText('Notificação 3')).toBeInTheDocument()
      expect(screen.queryByText('Notificação 4')).not.toBeInTheDocument()
    })

    // Filtrar por tipo (success)
    const tipoSelect = screen.getByLabelText('Filtrar por tipo')
    fireEvent.change(tipoSelect, { target: { value: 'success' } })

    // Verificar se o filtro foi aplicado (success corresponde ao índice 1)
    await waitFor(() => {
      // Espera-se que mostre apenas as notificações do tipo "success" (índice % 4 === 1)
      expect(screen.queryByText('Notificação 1')).not.toBeInTheDocument()
      expect(screen.queryByText('Notificação 5')).not.toBeInTheDocument()
      // Deve mostrar a notificação 2 que é do tipo "success"
      expect(screen.getByText('Notificação 2')).toBeInTheDocument()
    })
  })
})
