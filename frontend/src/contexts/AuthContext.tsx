import React, { createContext, useState, useEffect, useContext } from 'react'
import authService from '../services/authService'

interface User {
  id?: number
  name?: string
  email?: string
  cpf?: string
  user_type?: string
  monthly_income?: number
}

interface AuthContextData {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (cpf: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUserFromStorage = async () => {
      // Verificar se existe token no localStorage
      if (authService.isAuthenticated()) {
        try {
          // Tentar obter informações do usuário do backend
          const profile = await authService.getUserProfile()
          setUser(profile)
        } catch (error) {
          console.error('Erro ao carregar perfil do usuário:', error)
          authService.logout()
        }
      }
      setIsLoading(false)
    }

    loadUserFromStorage()
  }, [])

  const login = async (cpf: string, password: string) => {
    setIsLoading(true)
    try {
      // Fazer login e obter token
      await authService.login({ cpf, password })

      // Obter informações do usuário
      const profile = await authService.getUserProfile()
      setUser(profile)
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const checkAuth = async (): Promise<boolean> => {
    if (!authService.isAuthenticated()) {
      return false
    }

    try {
      // Se o token estiver expirado, tentar renovar
      if (user === null) {
        await authService.refreshToken()
        const profile = await authService.getUserProfile()
        setUser(profile)
      }
      return true
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      logout()
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
