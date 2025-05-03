import api from './api'
import { handleApiError } from '../utils/errorHandler'

// Tipos
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'analista' | 'cliente'
  status: 'active' | 'inactive' | 'blocked'
  lastLogin?: string
  createdAt: string
}

export interface CreateUserParams {
  name: string
  email: string
  role: string
  password: string
}

export interface UpdateUserParams {
  id: string
  name?: string
  email?: string
  role?: string
  status?: string
  password?: string
}

export interface UserListResponse {
  results: User[]
  total: number
  total_pages: number
  page: number
}

/**
 * Serviço para operações relacionadas a usuários
 */
const userService = {
  /**
   * Buscar lista de usuários com filtros e paginação
   */
  getUsers: async (params: {
    page?: number
    search?: string
    role?: string
    status?: string
  }): Promise<UserListResponse> => {
    try {
      const queryParams = new URLSearchParams()

      if (params.page) queryParams.append('page', params.page.toString())
      if (params.search) queryParams.append('search', params.search)
      if (params.role) queryParams.append('role', params.role)
      if (params.status) queryParams.append('status', params.status)

      const response = await api.get(`/api/users?${queryParams.toString()}`)
      return response.data
    } catch (error) {
      handleApiError(error)
      throw new Error('Não foi possível buscar a lista de usuários')
    }
  },

  /**
   * Buscar usuário pelo ID
   */
  getUserById: async (id: string): Promise<User> => {
    try {
      const response = await api.get(`/api/users/${id}`)
      return response.data
    } catch (error) {
      handleApiError(error)
      throw new Error('Não foi possível buscar o usuário')
    }
  },

  /**
   * Criar um novo usuário
   */
  createUser: async (userData: CreateUserParams): Promise<User> => {
    try {
      const response = await api.post('/api/users', userData)
      return response.data
    } catch (error) {
      handleApiError(error)
      throw new Error('Não foi possível criar o usuário')
    }
  },

  /**
   * Atualizar um usuário existente
   */
  updateUser: async (userData: UpdateUserParams): Promise<User> => {
    try {
      const { id, ...data } = userData
      const response = await api.put(`/api/users/${id}`, data)
      return response.data
    } catch (error) {
      handleApiError(error)
      throw new Error('Não foi possível atualizar o usuário')
    }
  },

  /**
   * Alterar o status de um usuário
   */
  updateUserStatus: async (id: string, status: string): Promise<User> => {
    try {
      const response = await api.put(`/api/users/${id}/status`, { status })
      return response.data
    } catch (error) {
      handleApiError(error)
      throw new Error('Não foi possível alterar o status do usuário')
    }
  },

  /**
   * Excluir um usuário
   */
  deleteUser: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/users/${id}`)
    } catch (error) {
      handleApiError(error)
      throw new Error('Não foi possível excluir o usuário')
    }
  },

  /**
   * Obter estatísticas de usuários por tipo e status
   */
  getUserStatistics: async (): Promise<{
    totalUsers: number
    byRole: Record<string, number>
    byStatus: Record<string, number>
  }> => {
    try {
      const response = await api.get('/api/users/statistics')
      return response.data
    } catch (error) {
      handleApiError(error)
      throw new Error('Não foi possível obter as estatísticas de usuários')
    }
  },

  /**
   * Resetar a senha de um usuário
   */
  resetUserPassword: async (id: string): Promise<{ tempPassword: string }> => {
    try {
      const response = await api.post(`/api/users/${id}/reset-password`)
      return response.data
    } catch (error) {
      handleApiError(error)
      throw new Error('Não foi possível resetar a senha do usuário')
    }
  },

  /**
   * Obter o perfil do usuário logado
   */
  getCurrentUserProfile: async (): Promise<User> => {
    try {
      const response = await api.get('/api/users/me')
      return response.data
    } catch (error) {
      handleApiError(error)
      throw new Error('Não foi possível obter o perfil do usuário')
    }
  },

  /**
   * Atualizar o perfil do usuário logado
   */
  updateCurrentUserProfile: async (data: {
    name?: string
    email?: string
    password?: string
    currentPassword?: string
  }): Promise<User> => {
    try {
      const response = await api.put('/api/users/me', data)
      return response.data
    } catch (error) {
      handleApiError(error)
      throw new Error('Não foi possível atualizar o perfil')
    }
  },
}

export default userService
