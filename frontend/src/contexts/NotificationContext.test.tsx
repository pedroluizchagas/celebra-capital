import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import { NotificationProvider, useNotifications } from './NotificationContext'
import { useAuth } from './AuthContext'
import notificationService from '../services/notificationService'

// Mock do AuthContext
jest.mock('./AuthContext', () => ({
  useAuth: jest.fn(() => ({
    isAuthenticated: true,
  })),
}))

// Mock do notificationService
jest.mock('../services/notificationService', () => ({
  getNotifications: jest.fn(),
  getUnreadCount: jest.fn(),
  getSettings: jest.fn(),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
  updateSettings: jest.fn(),
  savePushSubscription: jest.fn(),
}))

// Componente de teste para usar o hook de notificações
const TestComponent = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    settings,
    markAsRead,
    markAllAsRead,
    loadNotifications,
    updateSettings,
  } = useNotifications()

  return (
    <div>
      <div data-testid="notifications">{JSON.stringify(notifications)}</div>
      <div data-testid="unread-count">{unreadCount}</div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="settings">{JSON.stringify(settings)}</div>
      <button onClick={() => markAsRead(1)}>Marcar como lida</button>
      <button onClick={() => markAllAsRead()}>Marcar todas como lidas</button>
      <button onClick={() => loadNotifications()}>Carregar notificações</button>
      <button
        onClick={() =>
          updateSettings({
            email_notifications: true,
            push_notifications: false,
          })
        }
      >
        Atualizar configurações
      </button>
    </div>
  )
}

describe('NotificationContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock padrão para serviços
    ;(notificationService.getNotifications as jest.Mock).mockResolvedValue([
      {
        id: 1,
        title: 'Notificação de teste',
        content: 'Conteúdo da notificação',
        read: false,
        created_at: '2023-01-01T12:00:00Z',
        read_at: null,
        notification_type: 'system',
        notification_type_display: 'Sistema',
        recipient: 1,
        recipient_email: 'teste@example.com',
        recipient_name: 'Usuário Teste',
        extra_data: null,
      },
    ])
    ;(notificationService.getUnreadCount as jest.Mock).mockResolvedValue(1)
    ;(notificationService.getSettings as jest.Mock).mockResolvedValue({
      id: 1,
      user: 1,
      email_notifications: true,
      push_notifications: false,
      proposal_status_updates: true,
      document_requests: true,
      proposal_approvals: true,
      proposal_rejections: true,
      system_notifications: true,
      reminders: true,
      push_subscription_json: null,
    })
    ;(notificationService.markAsRead as jest.Mock).mockResolvedValue(undefined)
    ;(notificationService.markAllAsRead as jest.Mock).mockResolvedValue(
      undefined
    )
    ;(notificationService.updateSettings as jest.Mock).mockImplementation(
      (settings) => Promise.resolve({ ...settings, id: 1, user: 1 })
    )
  })

  test('lança erro quando useNotifications é usado fora do provedor', () => {
    // Suprimir erros de console durante o teste
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    expect(() => render(<TestComponent />)).toThrow(
      'useNotifications deve ser usado dentro de um NotificationProvider'
    )

    consoleError.mockRestore()
  })

  test('carrega dados quando o usuário está autenticado', async () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
    })

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    )

    // Verificar que os serviços foram chamados
    await waitFor(() => {
      expect(notificationService.getNotifications).toHaveBeenCalled()
      expect(notificationService.getUnreadCount).toHaveBeenCalled()
      expect(notificationService.getSettings).toHaveBeenCalled()
    })

    // Verificar que os dados foram renderizados
    await waitFor(() => {
      const notificationsText = screen.getByTestId('notifications').textContent
      expect(notificationsText).toContain('Notificação de teste')
      expect(screen.getByTestId('unread-count').textContent).toBe('1')
      const settingsText = screen.getByTestId('settings').textContent
      expect(settingsText).toContain('email_notifications')
    })
  })

  test('não carrega dados quando o usuário não está autenticado', async () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
    })

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    )

    // Verificar que os serviços não foram chamados
    await waitFor(() => {
      expect(notificationService.getNotifications).not.toHaveBeenCalled()
      expect(notificationService.getUnreadCount).not.toHaveBeenCalled()
      expect(notificationService.getSettings).not.toHaveBeenCalled()
    })

    // Verificar que os dados estão vazios
    await waitFor(() => {
      expect(screen.getByTestId('notifications').textContent).toBe('[]')
      expect(screen.getByTestId('unread-count').textContent).toBe('0')
      expect(screen.getByTestId('settings').textContent).toBe('null')
    })
  })

  test('marca notificação como lida', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    )

    // Aguardar carregamento inicial
    await waitFor(() => {
      expect(screen.getByTestId('notifications').textContent).toContain(
        'Notificação de teste'
      )
    })

    // Simular notificação marcada como lida no backend
    ;(notificationService.markAsRead as jest.Mock).mockResolvedValue(undefined)

    // Simular novo valor de contagem não lidas
    ;(notificationService.getUnreadCount as jest.Mock).mockResolvedValue(0)

    // Clicar no botão para marcar como lida
    act(() => {
      screen.getByText('Marcar como lida').click()
    })

    // Verificar que o serviço foi chamado corretamente
    await waitFor(() => {
      expect(notificationService.markAsRead).toHaveBeenCalledWith(1)
      expect(notificationService.getUnreadCount).toHaveBeenCalled()
    })
  })

  test('marca todas notificações como lidas', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    )

    // Aguardar carregamento inicial
    await waitFor(() => {
      expect(screen.getByTestId('notifications').textContent).toContain(
        'Notificação de teste'
      )
    })

    // Clicar no botão para marcar todas como lidas
    act(() => {
      screen.getByText('Marcar todas como lidas').click()
    })

    // Verificar que o serviço foi chamado corretamente
    await waitFor(() => {
      expect(notificationService.markAllAsRead).toHaveBeenCalled()
    })

    // Verificar que a contagem foi zerada
    await waitFor(() => {
      expect(screen.getByTestId('unread-count').textContent).toBe('0')
    })
  })

  test('atualiza configurações', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    )

    // Aguardar carregamento inicial
    await waitFor(() => {
      expect(screen.getByTestId('settings').textContent).toContain(
        'email_notifications'
      )
    })

    // Simular resposta do serviço
    const updatedSettings = {
      id: 1,
      user: 1,
      email_notifications: true,
      push_notifications: false,
      proposal_status_updates: true,
      document_requests: true,
      proposal_approvals: true,
      proposal_rejections: true,
      system_notifications: true,
      reminders: true,
      push_subscription_json: null,
    }
    ;(notificationService.updateSettings as jest.Mock).mockResolvedValue(
      updatedSettings
    )

    // Clicar no botão para atualizar configurações
    act(() => {
      screen.getByText('Atualizar configurações').click()
    })

    // Verificar que o serviço foi chamado corretamente
    await waitFor(() => {
      expect(notificationService.updateSettings).toHaveBeenCalledWith({
        email_notifications: true,
        push_notifications: false,
      })
    })

    // Verificar que as configurações foram atualizadas
    await waitFor(() => {
      const settingsText = screen.getByTestId('settings').textContent
      expect(settingsText).toContain('email_notifications')
    })
  })

  test('trata erros ao carregar notificações', async () => {
    // Simular erro na API
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    ;(notificationService.getNotifications as jest.Mock).mockRejectedValue(
      new Error('API error')
    )

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    )

    // Verificar que o serviço foi chamado
    await waitFor(() => {
      expect(notificationService.getNotifications).toHaveBeenCalled()
    })

    // Verificar que o erro foi registrado
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled()
    })

    consoleError.mockRestore()
  })
})
