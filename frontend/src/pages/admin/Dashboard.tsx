import React, { useState, useEffect } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import proposalService from '../../services/proposalService'

interface DashboardStats {
  total_proposals: number
  pending_review: number
  approved: number
  rejected: number
  recent_submissions: number
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar o caminho atual para destacar a navegação
  const isPath = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    )
  }

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setIsLoading(true)
      try {
        // Em uma implementação real, teríamos um endpoint específico para estatísticas
        // Por enquanto, vamos simular com dados fixos

        // Simulação de chamada API
        await new Promise((resolve) => setTimeout(resolve, 500))

        setStats({
          total_proposals: 125,
          pending_review: 42,
          approved: 68,
          rejected: 15,
          recent_submissions: 8,
        })
      } catch (error) {
        console.error('Erro ao carregar estatísticas do dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Barra lateral de navegação */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-md">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-celebra-blue">
            Celebra Capital
            <span className="block text-sm text-gray-500 dark:text-gray-400 mt-1">
              Painel Administrativo
            </span>
          </h1>
        </div>

        <nav className="p-4">
          <ul className="space-y-1">
            <li>
              <Link
                to="/admin"
                className={`flex items-center px-4 py-2 rounded-md ${
                  isPath('/admin') && !isPath('/admin/proposals')
                    ? 'bg-celebra-blue text-white'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Visão Geral
              </Link>
            </li>
            <li>
              <Link
                to="/admin/proposals"
                className={`flex items-center px-4 py-2 rounded-md ${
                  isPath('/admin/proposals')
                    ? 'bg-celebra-blue text-white'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Propostas
              </Link>
            </li>
            <li>
              <Link
                to="/admin/users"
                className={`flex items-center px-4 py-2 rounded-md ${
                  isPath('/admin/users')
                    ? 'bg-celebra-blue text-white'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                Usuários
              </Link>
            </li>
            <li>
              <Link
                to="/admin/reports"
                className={`flex items-center px-4 py-2 rounded-md ${
                  isPath('/admin/reports')
                    ? 'bg-celebra-blue text-white'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Relatórios
              </Link>
            </li>
            <li>
              <Link
                to="/admin/settings"
                className={`flex items-center px-4 py-2 rounded-md ${
                  isPath('/admin/settings')
                    ? 'bg-celebra-blue text-white'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Configurações
              </Link>
            </li>
          </ul>

          <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              to="/"
              className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Voltar ao Site
            </Link>
          </div>
        </nav>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-auto">
        {/* Cabeçalho */}
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {isPath('/admin/proposals')
                ? 'Propostas'
                : isPath('/admin/users')
                ? 'Usuários'
                : isPath('/admin/reports')
                ? 'Relatórios'
                : isPath('/admin/settings')
                ? 'Configurações'
                : 'Visão Geral'}
            </h2>
            <div className="flex items-center">
              <button
                type="button"
                className="mr-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center text-sm focus:outline-none"
                >
                  <span className="mr-2">Administrador</span>
                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300">
                    A
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo da página */}
        <main className="p-6">
          {/* Mostrar o Outlet para as rotas aninhadas ou o conteúdo padrão do dashboard */}
          {location.pathname === '/admin' ? (
            <>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 animate-pulse"
                    >
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Cards de Estatísticas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-500 bg-opacity-10 text-blue-500 mr-4">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Total de Propostas
                          </p>
                          <p className="text-2xl font-bold text-gray-800 dark:text-white">
                            {stats?.total_proposals || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-yellow-500 bg-opacity-10 text-yellow-500 mr-4">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Aguardando Análise
                          </p>
                          <p className="text-2xl font-bold text-gray-800 dark:text-white">
                            {stats?.pending_review || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-500 bg-opacity-10 text-green-500 mr-4">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Aprovadas
                          </p>
                          <p className="text-2xl font-bold text-gray-800 dark:text-white">
                            {stats?.approved || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                      <div className="flex items-center">
                        <div className="p-3 rounded-full bg-red-500 bg-opacity-10 text-red-500 mr-4">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Rejeitadas
                          </p>
                          <p className="text-2xl font-bold text-gray-800 dark:text-white">
                            {stats?.rejected || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seções Principais */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Propostas Recentes */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          Propostas Recentes
                        </h3>
                        <button
                          onClick={() => navigate('/admin/proposals')}
                          className="text-sm text-celebra-blue hover:underline"
                        >
                          Ver todas
                        </button>
                      </div>
                      <div className="p-4">
                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead>
                              <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                <th className="px-4 py-2">ID</th>
                                <th className="px-4 py-2">Cliente</th>
                                <th className="px-4 py-2">Valor</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Data</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                              {[
                                {
                                  id: 'P-2023-421',
                                  client: 'Carlos Oliveira',
                                  value: 'R$ 12.000,00',
                                  status: 'Pendente',
                                  statusColor: 'yellow',
                                  date: '18/07/2023',
                                },
                                {
                                  id: 'P-2023-420',
                                  client: 'Maria Silva',
                                  value: 'R$ 25.000,00',
                                  status: 'Aprovada',
                                  statusColor: 'green',
                                  date: '17/07/2023',
                                },
                                {
                                  id: 'P-2023-419',
                                  client: 'João Santos',
                                  value: 'R$ 5.000,00',
                                  status: 'Rejeitada',
                                  statusColor: 'red',
                                  date: '15/07/2023',
                                },
                                {
                                  id: 'P-2023-418',
                                  client: 'Ana Costa',
                                  value: 'R$ 18.500,00',
                                  status: 'Pendente',
                                  statusColor: 'yellow',
                                  date: '15/07/2023',
                                },
                                {
                                  id: 'P-2023-417',
                                  client: 'Pedro Almeida',
                                  value: 'R$ 30.000,00',
                                  status: 'Aprovada',
                                  statusColor: 'green',
                                  date: '14/07/2023',
                                },
                              ].map((proposal, index) => (
                                <tr
                                  key={index}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                                >
                                  <td className="px-4 py-3 whitespace-nowrap text-blue-500">
                                    <button
                                      onClick={() =>
                                        navigate(
                                          `/admin/proposals/${proposal.id}`
                                        )
                                      }
                                      className="hover:underline"
                                    >
                                      {proposal.id}
                                    </button>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    {proposal.client}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    {proposal.value}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs 
                                      ${
                                        proposal.statusColor === 'green'
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                          : proposal.statusColor === 'yellow'
                                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                      }`}
                                    >
                                      {proposal.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    {proposal.date}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Atividades Recentes */}
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          Atividades Recentes
                        </h3>
                      </div>
                      <div className="p-4">
                        <ul className="space-y-4">
                          {[
                            {
                              action: 'Proposta aprovada',
                              description: 'Proposta P-2023-410 foi aprovada',
                              time: '2 horas atrás',
                              icon: (
                                <svg
                                  className="w-5 h-5 text-green-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              ),
                            },
                            {
                              action: 'Novo usuário',
                              description: 'José Silva criou uma nova conta',
                              time: '4 horas atrás',
                              icon: (
                                <svg
                                  className="w-5 h-5 text-blue-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                  />
                                </svg>
                              ),
                            },
                            {
                              action: 'Documentos enviados',
                              description:
                                'Maria Santos enviou novos documentos',
                              time: '6 horas atrás',
                              icon: (
                                <svg
                                  className="w-5 h-5 text-purple-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                  />
                                </svg>
                              ),
                            },
                            {
                              action: 'Proposta rejeitada',
                              description: 'Proposta P-2023-405 foi rejeitada',
                              time: '1 dia atrás',
                              icon: (
                                <svg
                                  className="w-5 h-5 text-red-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              ),
                            },
                            {
                              action: 'Nova proposta',
                              description:
                                'Carlos Ferreira enviou nova proposta',
                              time: '1 dia atrás',
                              icon: (
                                <svg
                                  className="w-5 h-5 text-yellow-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                              ),
                            },
                          ].map((activity, index) => (
                            <li key={index} className="flex items-start">
                              <div className="flex-shrink-0 mt-1">
                                {activity.icon}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-800 dark:text-white">
                                  {activity.action}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {activity.description}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  {activity.time}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard
