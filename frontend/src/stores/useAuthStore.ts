import { create } from 'zustand'
import authService from '../services/authService'

interface User {
  id?: number
  name?: string
  email?: string
  cpf?: string
  user_type?: string
  monthly_income?: number
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  init: () => Promise<void>
  login: (cpf: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<boolean>
  setUser: (user: User | null) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  clearUser: () => void
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  // Inicializar store verificando autenticação no localStorage
  init: async () => {
    if (authService.isAuthenticated()) {
      try {
        // Tentar obter informações do usuário do backend
        const profile = await authService.getUserProfile()
        set({ user: profile, isAuthenticated: true })
      } catch (error) {
        console.error('Erro ao carregar perfil do usuário:', error)
        authService.logout()
      }
    }
    set({ isLoading: false })
  },

  login: async (cpf: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      // Fazer login e obter token
      await authService.login({ cpf, password })

      // Obter informações do usuário
      const profile = await authService.getUserProfile()
      set({ user: profile, isAuthenticated: true, error: null })
    } catch (error) {
      console.error('Erro no login:', error)
      set({ error: 'Credenciais inválidas ou serviço indisponível' })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  logout: () => {
    authService.logout()
    set({ user: null, isAuthenticated: false })
  },

  checkAuth: async () => {
    if (!authService.isAuthenticated()) {
      return false
    }

    try {
      // Se o token estiver expirado, tentar renovar
      if (get().user === null) {
        await authService.refreshToken()
        const profile = await authService.getUserProfile()
        set({ user: profile, isAuthenticated: true })
      }
      return true
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      get().logout()
      return false
    }
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user })
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading })
  },

  setError: (error: string | null) => {
    set({ error })
  },

  clearUser: () => {
    set({ user: null, isAuthenticated: false })
  },
}))

// Inicializar verificação de autenticação quando o módulo é carregado
const initializeStore = async () => {
  const store = useAuthStore.getState()
  await store.init()
}

// Inicializar automaticamente
initializeStore()

export default useAuthStore
