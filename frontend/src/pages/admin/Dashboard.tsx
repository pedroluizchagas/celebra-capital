import React, { useState, useEffect } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import dashboardService, {
  DashboardStats,
  ActivityItem,
  RecentProposal,
} from '../../services/dashboardService'
import StatsCards from '../../components/dashboard/StatsCards'
import ProposalList from '../../components/dashboard/ProposalList'
import ActivityList from '../../components/dashboard/ActivityList'
import StatsChart from '../../components/dashboard/StatsChart'
import NotificationIcon from '../../components/notifications/NotificationIcon'

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentProposals, setRecentProposals] = useState<RecentProposal[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [chartData, setChartData] = useState<
    { labels: string[]; values: number[] } | undefined
  >(undefined)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar o caminho atual para destacar a navegação
  const isPath = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    )
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        // Carregar todos os dados do dashboard em paralelo
        const [statsData, proposalsData, activitiesData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getRecentProposals(),
          dashboardService.getRecentActivities(),
        ])

        setStats(statsData)
        setRecentProposals(proposalsData)
        setActivities(activitiesData)

        // Simular dados para o gráfico baseado nas propostas mensais
        // Em uma implementação real, esses dados viriam da API
        const monthlyData = {
          labels: [
            'Jan',
            'Fev',
            'Mar',
            'Abr',
            'Mai',
            'Jun',
            'Jul',
            'Ago',
            'Set',
            'Out',
            'Nov',
            'Dez',
          ],
          values: [12, 19, 15, 8, 22, 14, 11, 18, 20, 24, 16, 25],
        }
        setChartData(monthlyData)
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
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
              <NotificationIcon />
              <div className="relative ml-4">
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
              {/* Cards de Estatísticas */}
              <StatsCards stats={stats} isLoading={isLoading} />

              {/* Gráfico e Listas */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gráfico de Estatísticas */}
                <div className="lg:col-span-2">
                  <StatsChart isLoading={isLoading} chartData={chartData} />
                </div>

                {/* Atividades Recentes */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      Atividades Recentes
                    </h3>
                  </div>
                  <div className="p-4">
                    <ActivityList
                      activities={activities}
                      isLoading={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Propostas Recentes */}
              <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
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
                  <ProposalList
                    proposals={recentProposals}
                    isLoading={isLoading}
                    showViewAll={false}
                  />
                </div>
              </div>
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
