import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import NotificationIcon from '../NotificationIcon'
import notificationService from '../../../services/notificationService'

// Mock do serviço de notificações
jest.mock('../../../services/notificationService', () => ({
  getNotifications: jest.fn().mockResolvedValue({
    results: [
      {
        id: '1',
        title: 'Notificação de teste',
        message: 'Esta é uma notificação de teste',
        type: 'info',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ],
    count: 1,
    unread_count: 1,
  }),
}))

// Mock do NotificationDropdown para evitar testar sua implementação interna
jest.mock('../NotificationDropdown', () => {
  return function MockNotificationDropdown({
    isOpen,
    onClose,
  }: {
    isOpen: boolean
    onClose: () => void
  }) {
    return isOpen ? (
      <div data-testid="notification-dropdown">
        <button onClick={onClose}>Fechar</button>
      </div>
    ) : null
  }
})

describe('NotificationIcon Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renderiza o ícone de notificação corretamente', async () => {
    render(
      <BrowserRouter>
        <NotificationIcon />
      </BrowserRouter>
    )

    // Verificar se o ícone de notificação existe
    const notificationButton = screen.getByLabelText('Notificações')
    expect(notificationButton).toBeInTheDocument()

    // Verificar se o serviço foi chamado para buscar contagem de notificações
    await waitFor(() => {
      expect(notificationService.getNotifications).toHaveBeenCalled()
    })
  })

  test('exibe o contador de notificações não lidas', async () => {
    render(
      <BrowserRouter>
        <NotificationIcon />
      </BrowserRouter>
    )

    // Verificar se o contador está sendo exibido (com valor 1 do mock)
    await waitFor(() => {
      const counter = screen.getByText('1')
      expect(counter).toBeInTheDocument()
    })
  })

  test('abre o dropdown quando o ícone é clicado', async () => {
    render(
      <BrowserRouter>
        <NotificationIcon />
      </BrowserRouter>
    )

    // Clicar no ícone de notificação
    const notificationButton = screen.getByLabelText('Notificações')
    fireEvent.click(notificationButton)

    // Verificar se o dropdown foi aberto
    await waitFor(() => {
      const dropdown = screen.getByTestId('notification-dropdown')
      expect(dropdown).toBeInTheDocument()
    })
  })

  test('fecha o dropdown quando o botão de fechar é clicado', async () => {
    render(
      <BrowserRouter>
        <NotificationIcon />
      </BrowserRouter>
    )

    // Abrir o dropdown
    const notificationButton = screen.getByLabelText('Notificações')
    fireEvent.click(notificationButton)

    // Verificar se o dropdown foi aberto
    await waitFor(() => {
      const dropdown = screen.getByTestId('notification-dropdown')
      expect(dropdown).toBeInTheDocument()
    })

    // Fechar o dropdown
    const closeButton = screen.getByText('Fechar')
    fireEvent.click(closeButton)

    // Verificar se o dropdown foi fechado
    await waitFor(() => {
      const dropdown = screen.queryByTestId('notification-dropdown')
      expect(dropdown).not.toBeInTheDocument()
    })
  })

  test('não exibe contador quando não há notificações não lidas', async () => {
    // Sobrescrever o mock para retornar 0 notificações não lidas
    ;(notificationService.getNotifications as jest.Mock).mockResolvedValueOnce({
      results: [],
      count: 0,
      unread_count: 0,
    })

    render(
      <BrowserRouter>
        <NotificationIcon />
      </BrowserRouter>
    )

    // Verificar se o ícone existe
    const notificationButton = screen.getByLabelText('Notificações')
    expect(notificationButton).toBeInTheDocument()

    // Verificar se o contador NÃO está sendo exibido
    await waitFor(() => {
      const counter = screen.queryByText('0')
      expect(counter).not.toBeInTheDocument()
    })
  })

  test('exibe "9+" quando há mais de 9 notificações não lidas', async () => {
    // Sobrescrever o mock para retornar 10 notificações não lidas
    ;(notificationService.getNotifications as jest.Mock).mockResolvedValueOnce({
      results: [],
      count: 10,
      unread_count: 10,
    })

    render(
      <BrowserRouter>
        <NotificationIcon />
      </BrowserRouter>
    )

    // Verificar se o contador mostra "9+"
    await waitFor(() => {
      const counter = screen.getByText('9+')
      expect(counter).toBeInTheDocument()
    })
  })
})
