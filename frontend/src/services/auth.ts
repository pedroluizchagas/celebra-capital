/**
 * Serviço de autenticação
 * Gerencia tokens JWT, login/logout e verificação de autenticação
 */

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

interface User {
  id: string
  name: string
  email: string
  role: string
}

/**
 * Armazena o token JWT no localStorage
 */
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * Recupera o token JWT do localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Armazena os dados do usuário no localStorage
 */
export const setUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

/**
 * Recupera os dados do usuário do localStorage
 */
export const getUser = (): User | null => {
  const userStr = localStorage.getItem(USER_KEY)
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch (error) {
    console.error('Erro ao parsear dados do usuário:', error)
    return null
  }
}

/**
 * Verifica se o usuário está autenticado
 */
export const isAuthenticated = (): boolean => {
  return !!getToken()
}

/**
 * Remove os dados de autenticação
 */
export const logout = (): void => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

/**
 * Realiza o login do usuário
 */
export const login = async (email: string, password: string): Promise<User> => {
  try {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erro ao realizar login')
    }

    const data = await response.json()
    setToken(data.token)
    setUser(data.user)

    return data.user
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Ocorreu um erro durante o login')
  }
}

/**
 * Verifica a validade do token JWT
 */
export const checkTokenValidity = (): boolean => {
  const token = getToken()
  if (!token) return false

  try {
    // Em um caso real, decodificaria o token JWT para verificar a expiração
    // Simplificação para o MVP
    return true
  } catch (error) {
    console.error('Erro ao verificar validade do token:', error)
    return false
  }
}

/**
 * Atualiza o token JWT
 */
export const refreshToken = async (): Promise<void> => {
  const token = getToken()
  if (!token) {
    throw new Error('Não há token para atualizar')
  }

  try {
    const response = await fetch('/api/v1/auth/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Falha ao atualizar o token')
    }

    const data = await response.json()
    setToken(data.token)
  } catch (error) {
    console.error('Erro ao atualizar token:', error)
    logout()
    throw error
  }
}
