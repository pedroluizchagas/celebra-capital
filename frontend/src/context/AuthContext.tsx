import React, { createContext, useContext, useState, useEffect } from 'react'
import { secureClient } from '../utils/security'
import { useNavigate } from 'react-router-dom'

// Definição de tipos
export type UserRole = 'admin' | 'analista' | 'cliente'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  permissions: string[]
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hasPermission: (permission: string) => boolean
  hasRole: (roles: UserRole | UserRole[]) => boolean
}

// Valor padrão do contexto
const defaultContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => {},
  logout: () => {},
  hasPermission: () => false,
  hasRole: () => false,
}

// Criação do contexto
const AuthContext = createContext<AuthContextType>(defaultContext)

// Hook personalizado para usar o contexto
export const useAuth = () => useContext(AuthContext)

// Provedor do contexto
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  // Verifica o estado de autenticação ao carregar a aplicação
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true)
        // Tenta obter o usuário atual do localStorage ou de um cookie
        const storedUser = localStorage.getItem('user')

        if (storedUser) {
          setUser(JSON.parse(storedUser))
        } else {
          // Se não encontrar no localStorage, verifica no backend
          const response = await secureClient.get('/api/auth/me')
          if (response.ok) {
            const userData = await response.json()
            setUser(userData)
            localStorage.setItem('user', JSON.stringify(userData))
          }
        }
      } catch (err) {
        console.error('Erro ao verificar autenticação:', err)
        // Não definimos um erro aqui para não mostrar mensagens na inicialização
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  // Função de login
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await secureClient.post('/api/auth/login', {
        email,
        password,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Falha na autenticação')
      }

      const userData = await response.json()
      setUser(userData.user)

      // Armazena informações de autenticação
      localStorage.setItem('user', JSON.stringify(userData.user))
      localStorage.setItem('token', userData.token)

      // Redireciona para a página inicial após login
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login')
      console.error('Erro de login:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Função de logout
  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    navigate('/login')
  }

  // Verifica se o usuário tem uma permissão específica
  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    return user.permissions.includes(permission)
  }

  // Verifica se o usuário tem um dos papéis especificados
  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false
    if (Array.isArray(roles)) {
      return roles.includes(user.role)
    }
    return user.role === roles
  }

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    hasPermission,
    hasRole,
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

export default AuthContext
