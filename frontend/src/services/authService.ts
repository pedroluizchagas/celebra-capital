import api from './api'

interface RegisterParams {
  name: string
  cpf: string
  phone_number: string
  email: string
  user_type: string
  monthly_income?: number
  org_name?: string
  registration_number?: string
}

interface LoginParams {
  cpf: string
  password: string
}

interface TokenResponse {
  access: string
  refresh: string
}

interface CheckCpfResponse {
  exists: boolean
  message: string
}

interface ResetPasswordRequestParams {
  email: string
}

interface ResetPasswordConfirmParams {
  uid: string
  token: string
  password: string
}

const authService = {
  /**
   * Registrar um novo usuário
   */
  register: async (userData: RegisterParams) => {
    try {
      const response = await api.post('/users/register/', userData)
      return response.data
    } catch (error) {
      console.error('Erro ao registrar usuário:', error)
      throw error
    }
  },

  /**
   * Login de usuário
   */
  login: async (credentials: LoginParams): Promise<TokenResponse> => {
    try {
      const response = await api.post('/api/token/', credentials)

      // Armazenar tokens
      localStorage.setItem('token', response.data.access)
      localStorage.setItem('refreshToken', response.data.refresh)

      return response.data
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      throw error
    }
  },

  /**
   * Logout - remover tokens do localStorage
   */
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
  },

  /**
   * Verificar CPF - verifica se o CPF já está cadastrado
   */
  checkCpf: async (cpf: string): Promise<CheckCpfResponse> => {
    try {
      const response = await api.get(`/users/check-cpf/${cpf}/`)
      return response.data
    } catch (error) {
      console.error('Erro ao verificar CPF:', error)
      throw error
    }
  },

  /**
   * Obter perfil do usuário
   */
  getUserProfile: async () => {
    try {
      const response = await api.get('/users/profile/')
      return response.data
    } catch (error) {
      console.error('Erro ao obter perfil do usuário:', error)
      throw error
    }
  },

  /**
   * Atualizar perfil do usuário
   */
  updateProfile: async (userData: Partial<RegisterParams>) => {
    try {
      const response = await api.put('/users/update-profile/', userData)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      throw error
    }
  },

  /**
   * Renovar token de acesso usando refresh token
   */
  refreshToken: async (): Promise<string> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')

      if (!refreshToken) {
        throw new Error('Refresh token não encontrado')
      }

      const response = await api.post('/api/token/refresh/', {
        refresh: refreshToken,
      })

      // Atualizar token no localStorage
      localStorage.setItem('token', response.data.access)

      return response.data.access
    } catch (error) {
      console.error('Erro ao renovar token:', error)
      authService.logout()
      throw error
    }
  },

  /**
   * Verificar se o usuário está autenticado
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token')
  },

  /**
   * Solicitar recuperação de senha
   */
  requestPasswordReset: async (params: ResetPasswordRequestParams) => {
    try {
      const response = await api.post('/users/reset-password/', params)
      return response.data
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error)
      throw error
    }
  },

  /**
   * Confirmar recuperação de senha
   */
  confirmPasswordReset: async (params: ResetPasswordConfirmParams) => {
    try {
      const response = await api.post('/users/reset-password-confirm/', params)
      return response.data
    } catch (error) {
      console.error('Erro ao confirmar recuperação de senha:', error)
      throw error
    }
  },
}

export default authService
