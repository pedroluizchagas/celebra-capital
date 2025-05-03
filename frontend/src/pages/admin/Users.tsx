import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import AdminLayout from '../../layouts/AdminLayout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import UserForm from '../../components/users/UserForm'
import api from '../../services/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEdit,
  faLock,
  faUnlock,
  faTrash,
  faPlus,
  faSearch,
  faFilter,
} from '@fortawesome/free-solid-svg-icons'

// Tipos
interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'analista' | 'cliente'
  status: 'active' | 'inactive' | 'blocked'
  lastLogin?: string
  createdAt: string
}

interface UserFilters {
  search?: string
  role?: string
  status?: string
}

const UserRoleLabels: Record<string, string> = {
  admin: 'Administrador',
  analista: 'Analista',
  cliente: 'Cliente',
}

const UserStatusLabels: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  blocked: 'Bloqueado',
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<UserFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [showUserForm, setShowUserForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [filters, currentPage])

  const fetchUsers = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Preparar os parâmetros para a chamada da API
      const params = new URLSearchParams()
      params.append('page', currentPage.toString())

      if (filters.search) params.append('search', filters.search)
      if (filters.role) params.append('role', filters.role)
      if (filters.status) params.append('status', filters.status)

      const response = await api.get(`/api/users?${params.toString()}`)

      setUsers(response.data.results)
      setTotalPages(response.data.total_pages)
    } catch (err: any) {
      console.error('Erro ao carregar usuários:', err)
      setError('Não foi possível carregar a lista de usuários.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value === '' ? undefined : value,
    }))
    setCurrentPage(1) // Resetar para a primeira página ao filtrar
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers()
  }

  const handleAddUser = () => {
    setSelectedUser(null)
    setShowUserForm(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setShowUserForm(true)
  }

  const handleStatusChange = async (
    userId: string,
    newStatus: 'active' | 'inactive' | 'blocked'
  ) => {
    try {
      await api.put(`/api/users/${userId}/status`, { status: newStatus })
      // Atualizar o estado de usuários localmente
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      )
    } catch (err) {
      console.error('Erro ao alterar status do usuário:', err)
      setError('Não foi possível alterar o status do usuário.')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return

    try {
      await api.delete(`/api/users/${userId}`)
      // Remover usuário do estado local
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId))
    } catch (err) {
      console.error('Erro ao excluir usuário:', err)
      setError('Não foi possível excluir o usuário.')
    }
  }

  const handleSaveUser = async (userData: any) => {
    try {
      if (userData.id) {
        // Atualizar usuário existente
        await api.put(`/api/users/${userData.id}`, userData)
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userData.id ? { ...user, ...userData } : user
          )
        )
      } else {
        // Criar novo usuário
        const response = await api.post('/api/users', userData)
        setUsers((prevUsers) => [...prevUsers, response.data])
      }

      setShowUserForm(false)
    } catch (err) {
      console.error('Erro ao salvar usuário:', err)
      setError('Não foi possível salvar o usuário.')
    }
  }

  const renderStatusBadge = (status: string) => {
    const colorClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      blocked: 'bg-red-100 text-red-800',
    }

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          colorClasses[status as keyof typeof colorClasses]
        }`}
      >
        {UserStatusLabels[status]}
      </span>
    )
  }

  const renderPagination = () => {
    const pages = []
    const maxPagesToShow = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded ${
            currentPage === i
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      )
    }

    return (
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Anterior
        </button>

        <div className="flex space-x-1">{pages}</div>

        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded ${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Próximo
        </button>
      </div>
    )
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>Gerenciamento de Usuários | Celebra Capital</title>
      </Helmet>

      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Gerenciamento de Usuários
          </h1>

          <button
            onClick={handleAddUser}
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Adicionar Usuário</span>
          </button>
        </div>

        {/* Barra de pesquisa e filtros */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-wrap md:flex-nowrap items-center space-y-2 md:space-y-0 md:space-x-4"
          >
            <div className="w-full md:w-1/3 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
              </span>
              <input
                type="text"
                name="search"
                placeholder="Buscar por nome ou email"
                value={filters.search || ''}
                onChange={handleFilterChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <FontAwesomeIcon icon={faFilter} className="mr-2" />
              Filtros
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Buscar
            </button>
          </form>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Função
                </label>
                <select
                  id="role"
                  name="role"
                  value={filters.role || ''}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Todos</option>
                  <option value="admin">Administrador</option>
                  <option value="analista">Analista</option>
                  <option value="cliente">Cliente</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={filters.status || ''}
                  onChange={handleFilterChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Todos</option>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="blocked">Bloqueado</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Lista de usuários */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
        ) : users.length === 0 ? (
          <div className="bg-yellow-100 text-yellow-700 p-4 rounded-md">
            Nenhum usuário encontrado com os filtros selecionados.
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Nome
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Função
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Último Acesso
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          {UserRoleLabels[user.role]}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          {user.lastLogin
                            ? new Date(user.lastLogin).toLocaleString('pt-BR')
                            : 'Nunca'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Editar"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>

                          {user.status === 'blocked' ? (
                            <button
                              onClick={() =>
                                handleStatusChange(user.id, 'active')
                              }
                              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                              title="Desbloquear"
                            >
                              <FontAwesomeIcon icon={faUnlock} />
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleStatusChange(user.id, 'blocked')
                              }
                              className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                              title="Bloquear"
                            >
                              <FontAwesomeIcon icon={faLock} />
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Excluir"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                {renderPagination()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de formulário de usuário */}
      <UserForm
        isOpen={showUserForm}
        onClose={() => setShowUserForm(false)}
        user={selectedUser}
        onSave={handleSaveUser}
      />
    </AdminLayout>
  )
}

export default UsersPage
