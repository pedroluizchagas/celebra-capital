import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import NotificationDropdown from '../NotificationDropdown'
import notificationService from '../../../services/notificationService'

// Mock do serviço de notificações
jest.mock('../../../services/notificationService', () => ({
  getNotifications: jest.fn().mockResolvedValue({
    results: [
      {
        id: '1',
        title: 'Nova proposta',
        message: 'Uma nova proposta foi submetida',
        type: 'info',
        isRead: false,
        createdAt: new Date().toISOString(),
        link: '/admin/proposals/123',
      },
      {
        id: '2',
        title: 'Proposta aprovada',
        message: 'A proposta P-123 foi aprovada',
        type: 'success',
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    count: 2,
    unread_count: 1,
  }),
  markAsRead: jest.fn().mockResolvedValue(true),
  markAllAsRead: jest.fn().mockResolvedValue(true),
}))

// Mock de useNavigate
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

describe('NotificationDropdown Component', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('não renderiza nada quando isOpen é false', () => {
    render(
      <BrowserRouter>
        <NotificationDropdown isOpen={false} onClose={mockOnClose} />
      </BrowserRouter>
    )

    // Não deve exibir o título de notificações
    expect(screen.queryByText('Notificações')).not.toBeInTheDocument()
  })

  test('renderiza a lista de notificações quando isOpen é true', async () => {
    render(
      <BrowserRouter>
        <NotificationDropdown isOpen={true} onClose={mockOnClose} />
      </BrowserRouter>
    )

    // Deve mostrar um estado de carregamento inicialmente
    expect(screen.getByText('Notificações')).toBeInTheDocument()

    // Após carregar, deve mostrar as notificações
    await waitFor(() => {
      expect(screen.getByText('Nova proposta')).toBeInTheDocument()
      expect(screen.getByText('Proposta aprovada')).toBeInTheDocument()
    })

    // Deve mostrar a contagem de não lidos
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  test('exibe "Marcar todas como lidas" quando há notificações não lidas', async () => {
    render(
      <BrowserRouter>
        <NotificationDropdown isOpen={true} onClose={mockOnClose} />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Marcar todas como lidas')).toBeInTheDocument()
    })
  })

  test('marca uma notificação como lida quando clicada', async () => {
    render(
      <BrowserRouter>
        <NotificationDropdown isOpen={true} onClose={mockOnClose} />
      </BrowserRouter>
    )

    // Aguardar o carregamento das notificações
    await waitFor(() => {
      expect(screen.getByText('Nova proposta')).toBeInTheDocument()
    })

    // Clicar na notificação não lida
    fireEvent.click(screen.getByText('Nova proposta'))

    // Verificar se a função markAsRead foi chamada com o ID correto
    expect(notificationService.markAsRead).toHaveBeenCalledWith('1')

    // Verificar se a função navigate foi chamada com o link correto
    expect(mockNavigate).toHaveBeenCalledWith('/admin/proposals/123')

    // O dropdown deve ser fechado
    expect(mockOnClose).toHaveBeenCalled()
  })

  test('marca todas as notificações como lidas', async () => {
    render(
      <BrowserRouter>
        <NotificationDropdown isOpen={true} onClose={mockOnClose} />
      </BrowserRouter>
    )

    // Aguardar o carregamento das notificações
    await waitFor(() => {
      expect(screen.getByText('Marcar todas como lidas')).toBeInTheDocument()
    })

    // Clicar no botão de marcar todas como lidas
    fireEvent.click(screen.getByText('Marcar todas como lidas'))

    // Verificar se a função markAllAsRead foi chamada
    expect(notificationService.markAllAsRead).toHaveBeenCalled()
  })

  test('exibe mensagem quando não há notificações', async () => {
    // Sobrescrever o mock para retornar uma lista vazia
    ;(notificationService.getNotifications as jest.Mock).mockResolvedValueOnce({
      results: [],
      count: 0,
      unread_count: 0,
    })

    render(
      <BrowserRouter>
        <NotificationDropdown isOpen={true} onClose={mockOnClose} />
      </BrowserRouter>
    )

    // Após carregar, deve mostrar a mensagem de sem notificações
    await waitFor(() => {
      expect(screen.getByText('Não há notificações')).toBeInTheDocument()
    })
  })

  test('fecha o dropdown quando clicar fora dele', async () => {
    const map: Record<string, any> = {}
    document.addEventListener = jest.fn((event, cb) => {
      map[event] = cb
    })

    render(
      <BrowserRouter>
        <NotificationDropdown isOpen={true} onClose={mockOnClose} />
      </BrowserRouter>
    )

    // Aguardar o carregamento
    await waitFor(() => {
      expect(screen.getByText('Notificações')).toBeInTheDocument()
    })

    // Simular um clique fora do dropdown
    const mouseEvent = new MouseEvent('mousedown', {
      bubbles: true,
      cancelable: true,
    })

    // Disparar o evento que foi registrado pelo addEventListener
    map.mousedown(mouseEvent)

    // Verificar se a função onClose foi chamada
    expect(mockOnClose).toHaveBeenCalled()
  })

  test('renderiza ícones diferentes para cada tipo de notificação', async () => {
    // Sobrescrever o mock para incluir todos os tipos de notificação
    ;(notificationService.getNotifications as jest.Mock).mockResolvedValueOnce({
      results: [
        {
          id: '1',
          title: 'Informação',
          message: 'Notificação de informação',
          type: 'info',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Sucesso',
          message: 'Notificação de sucesso',
          type: 'success',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'Alerta',
          message: 'Notificação de alerta',
          type: 'warning',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: '4',
          title: 'Erro',
          message: 'Notificação de erro',
          type: 'error',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ],
      count: 4,
      unread_count: 4,
    })

    render(
      <BrowserRouter>
        <NotificationDropdown isOpen={true} onClose={mockOnClose} />
      </BrowserRouter>
    )

    // Verificar se todos os tipos de notificação estão presentes
    await waitFor(() => {
      expect(screen.getByText('Informação')).toBeInTheDocument()
      expect(screen.getByText('Sucesso')).toBeInTheDocument()
      expect(screen.getByText('Alerta')).toBeInTheDocument()
      expect(screen.getByText('Erro')).toBeInTheDocument()
    })

    // Verificar as classes específicas de cada tipo para confirmar que os ícones são diferentes
    const infoIcon = screen
      .getByText('Informação')
      .closest('div')?.previousSibling
    const successIcon = screen
      .getByText('Sucesso')
      .closest('div')?.previousSibling
    const warningIcon = screen
      .getByText('Alerta')
      .closest('div')?.previousSibling
    const errorIcon = screen.getByText('Erro').closest('div')?.previousSibling

    expect(infoIcon).toHaveClass('text-blue-500')
    expect(successIcon).toHaveClass('text-green-500')
    expect(warningIcon).toHaveClass('text-yellow-500')
    expect(errorIcon).toHaveClass('text-red-500')
  })
})
