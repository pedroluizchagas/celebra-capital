import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'
import authService from '../services/authService'

// Mock do authService
jest.mock('../services/authService', () => ({
  isAuthenticated: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  getUserProfile: jest.fn(),
  refreshToken: jest.fn(),
}))

// Componente de teste para usar o hook de autenticação
const TestComponent = () => {
  const { user, isAuthenticated, isLoading, login, logout, checkAuth } =
    useAuth()

  return (
    <div>
      <div data-testid="user">{JSON.stringify(user)}</div>
      <div data-testid="is-authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="is-loading">{isLoading.toString()}</div>
      <button onClick={() => login('12345678900', 'senha123')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
      <button
        onClick={async () => {
          const result = await checkAuth()
          // Mostrar resultado da verificação
          document.getElementById('auth-result')!.textContent =
            result.toString()
        }}
      >
        Verificar Auth
      </button>
      <div id="auth-result" data-testid="auth-result"></div>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('fornece estado inicial correto', async () => {
    // Mock que retorna que não está autenticado
    ;(authService.isAuthenticated as jest.Mock).mockReturnValue(false)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Aguardar carregamento inicial
    await waitFor(() => {
      expect(screen.getByTestId('is-loading').textContent).toBe('false')
    })

    // Verificar estado inicial
    expect(screen.getByTestId('user').textContent).toBe('null')
    expect(screen.getByTestId('is-authenticated').textContent).toBe('false')
  })

  test('carrega usuário do localStorage se estiver autenticado', async () => {
    // Mock que retorna que está autenticado
    ;(authService.isAuthenticated as jest.Mock).mockReturnValue(true)
    ;(authService.getUserProfile as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'Usuário Teste',
      email: 'teste@example.com',
      cpf: '12345678900',
      user_type: 'customer',
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Aguardar carregamento inicial
    await waitFor(() => {
      expect(screen.getByTestId('is-loading').textContent).toBe('false')
    })

    // Verificar que o usuário foi carregado
    expect(screen.getByTestId('user').textContent).toContain('Usuário Teste')
    expect(screen.getByTestId('is-authenticated').textContent).toBe('true')
  })

  test('trata erro ao carregar perfil do usuário', async () => {
    // Mock que retorna que está autenticado mas falha ao carregar perfil
    ;(authService.isAuthenticated as jest.Mock).mockReturnValue(true)
    ;(authService.getUserProfile as jest.Mock).mockRejectedValue(
      new Error('Erro ao carregar perfil')
    )

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Aguardar carregamento inicial
    await waitFor(() => {
      expect(screen.getByTestId('is-loading').textContent).toBe('false')
    })

    // Verificar que o logout foi chamado
    expect(authService.logout).toHaveBeenCalled()
    expect(screen.getByTestId('is-authenticated').textContent).toBe('false')
  })

  test('realiza login com sucesso', async () => {
    // Mocks para login bem-sucedido
    ;(authService.login as jest.Mock).mockResolvedValue(undefined)
    ;(authService.getUserProfile as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'Usuário Teste',
      email: 'teste@example.com',
      cpf: '12345678900',
      user_type: 'customer',
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Clicar no botão de login
    act(() => {
      screen.getByText('Login').click()
    })

    // Verificar que o login foi chamado com as credenciais corretas
    expect(authService.login).toHaveBeenCalledWith({
      cpf: '12345678900',
      password: 'senha123',
    })

    // Verificar que o usuário foi carregado após o login
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toContain('Usuário Teste')
      expect(screen.getByTestId('is-authenticated').textContent).toBe('true')
    })
  })

  test('trata erro de login', async () => {
    // Mock que falha no login
    ;(authService.login as jest.Mock).mockRejectedValue(
      new Error('Credenciais inválidas')
    )

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Clicar no botão de login
    await act(async () => {
      screen.getByText('Login').click()
      // Espera a promessa ser rejeitada
      await new Promise(process.nextTick)
    })

    // Verificar que o erro foi registrado
    expect(console.error).toHaveBeenCalled()

    // Verificar que o usuário continua não autenticado
    expect(screen.getByTestId('is-authenticated').textContent).toBe('false')
  })

  test('realiza logout com sucesso', async () => {
    // Mock para usuário autenticado
    ;(authService.isAuthenticated as jest.Mock).mockReturnValue(true)
    ;(authService.getUserProfile as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'Usuário Teste',
      email: 'teste@example.com',
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Aguardar carregamento inicial
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toContain('Usuário Teste')
    })

    // Clicar no botão de logout
    act(() => {
      screen.getByText('Logout').click()
    })

    // Verificar que o logout foi chamado
    expect(authService.logout).toHaveBeenCalled()

    // Verificar que o usuário foi desconectado
    expect(screen.getByTestId('user').textContent).toBe('null')
    expect(screen.getByTestId('is-authenticated').textContent).toBe('false')
  })

  test('verifica autenticação com sucesso', async () => {
    // Mocks para verificação de autenticação
    ;(authService.isAuthenticated as jest.Mock).mockReturnValue(true)
    ;(authService.getUserProfile as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'Usuário Teste',
      email: 'teste@example.com',
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Aguardar carregamento inicial
    await waitFor(() => {
      expect(screen.getByTestId('is-loading').textContent).toBe('false')
    })

    // Clicar no botão de verificar autenticação
    act(() => {
      screen.getByText('Verificar Auth').click()
    })

    // Verificar que a autenticação foi verificada com sucesso
    await waitFor(() => {
      expect(screen.getByTestId('auth-result').textContent).toBe('true')
    })
  })

  test('verifica autenticação com falha', async () => {
    // Mocks para verificação de autenticação com falha
    ;(authService.isAuthenticated as jest.Mock).mockReturnValue(false)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Aguardar carregamento inicial
    await waitFor(() => {
      expect(screen.getByTestId('is-loading').textContent).toBe('false')
    })

    // Clicar no botão de verificar autenticação
    act(() => {
      screen.getByText('Verificar Auth').click()
    })

    // Verificar que a autenticação falhou
    await waitFor(() => {
      expect(screen.getByTestId('auth-result').textContent).toBe('false')
    })
  })

  test('renova token quando necessário', async () => {
    // Mocks para renovação de token
    ;(authService.isAuthenticated as jest.Mock).mockReturnValue(true)
    ;(authService.refreshToken as jest.Mock).mockResolvedValue(undefined)
    ;(authService.getUserProfile as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'Usuário Teste',
      email: 'teste@example.com',
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Aguardar carregamento inicial
    await waitFor(() => {
      expect(screen.getByTestId('is-loading').textContent).toBe('false')
    })

    // Configurar um estado onde o usuário é null mas o token ainda é válido
    await act(async () => {
      // Primeiro fazemos logout para limpar o usuário
      screen.getByText('Logout').click()

      // Verificamos que o usuário foi removido
      await waitFor(() => {
        expect(screen.getByTestId('user').textContent).toBe('null')
      })

      // Configuramos o authService para indicar que ainda há um token válido
      ;(authService.isAuthenticated as jest.Mock).mockReturnValue(true)

      // Clicamos para verificar a autenticação
      screen.getByText('Verificar Auth').click()
    })

    // Verificar que o token foi renovado
    await waitFor(() => {
      expect(authService.refreshToken).toHaveBeenCalled()
      expect(authService.getUserProfile).toHaveBeenCalled()
      expect(screen.getByTestId('auth-result').textContent).toBe('true')
    })
  })

  test('trata erro ao renovar token', async () => {
    // Mocks para erro na renovação de token
    ;(authService.isAuthenticated as jest.Mock).mockReturnValue(true)
    ;(authService.refreshToken as jest.Mock).mockRejectedValue(
      new Error('Token expirado')
    )

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Aguardar carregamento inicial e logout para limpar o usuário
    await waitFor(() => {
      expect(screen.getByTestId('is-loading').textContent).toBe('false')
    })
    act(() => {
      screen.getByText('Logout').click()
    })

    // Clicar no botão de verificar autenticação
    act(() => {
      screen.getByText('Verificar Auth').click()
    })

    // Verificar que houve tentativa de renovar o token
    await waitFor(() => {
      expect(authService.refreshToken).toHaveBeenCalled()
    })

    // Verificar que o logout foi chamado e autenticação falhou
    expect(authService.logout).toHaveBeenCalled()
    await waitFor(() => {
      expect(screen.getByTestId('auth-result').textContent).toBe('false')
    })
  })
})
