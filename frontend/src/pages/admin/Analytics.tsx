import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'
import AdminLayout from '../../layouts/AdminLayout'
import DateRangePicker from '../../components/form/DateRangePicker'
import StatCard from '../../components/dashboard/StatCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import api from '../../services/api'

// Registrar componentes Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface AnalyticsData {
  totalProposals: number
  approvedProposals: number
  rejectedProposals: number
  pendingProposals: number
  conversionRate: number
  avgProcessingTime: number
  proposalsByStatus: {
    labels: string[]
    data: number[]
  }
  proposalsByMonth: {
    labels: string[]
    approved: number[]
    rejected: number[]
    pending: number[]
  }
  proposalsByType: {
    labels: string[]
    data: number[]
  }
}

// Cores para os gráficos
const chartColors = {
  blue: 'rgba(53, 162, 235, 0.8)',
  lightBlue: 'rgba(53, 162, 235, 0.5)',
  green: 'rgba(75, 192, 92, 0.8)',
  red: 'rgba(255, 99, 132, 0.8)',
  yellow: 'rgba(255, 206, 86, 0.8)',
  purple: 'rgba(153, 102, 255, 0.8)',
  grey: 'rgba(201, 203, 207, 0.8)',
}

const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState<{
    startDate: Date
    endDate: Date
  }>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
  })
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalyticsData()
  }, [dateRange])

  const fetchAnalyticsData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Formatar datas para a API
      const start = dateRange.startDate.toISOString().split('T')[0]
      const end = dateRange.endDate.toISOString().split('T')[0]

      const response = await api.get(
        `/api/analytics/proposals?start_date=${start}&end_date=${end}`
      )
      setAnalyticsData(response.data)
    } catch (err: any) {
      console.error('Erro ao carregar dados de análise:', err)
      setError(
        'Não foi possível carregar os dados de análise. Tente novamente mais tarde.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Opções para o gráfico de linha
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Propostas por Mês',
      },
    },
  }

  // Dados para o gráfico de linha
  const lineData = analyticsData
    ? {
        labels: analyticsData.proposalsByMonth.labels,
        datasets: [
          {
            label: 'Aprovadas',
            data: analyticsData.proposalsByMonth.approved,
            borderColor: chartColors.green,
            backgroundColor: chartColors.green,
          },
          {
            label: 'Rejeitadas',
            data: analyticsData.proposalsByMonth.rejected,
            borderColor: chartColors.red,
            backgroundColor: chartColors.red,
          },
          {
            label: 'Pendentes',
            data: analyticsData.proposalsByMonth.pending,
            borderColor: chartColors.yellow,
            backgroundColor: chartColors.yellow,
          },
        ],
      }
    : null

  // Dados para o gráfico de pizza
  const pieData = analyticsData
    ? {
        labels: analyticsData.proposalsByStatus.labels,
        datasets: [
          {
            data: analyticsData.proposalsByStatus.data,
            backgroundColor: [
              chartColors.green,
              chartColors.red,
              chartColors.yellow,
              chartColors.grey,
            ],
            borderWidth: 1,
          },
        ],
      }
    : null

  // Dados para o gráfico de barras
  const barData = analyticsData
    ? {
        labels: analyticsData.proposalsByType.labels,
        datasets: [
          {
            label: 'Propostas por Tipo de Usuário',
            data: analyticsData.proposalsByType.data,
            backgroundColor: chartColors.blue,
          },
        ],
      }
    : null

  // Opções para o gráfico de barras
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Propostas por Tipo de Usuário',
      },
    },
  }

  const handleDateRangeChange = (range: { startDate: Date; endDate: Date }) => {
    setDateRange(range)
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>Análise de Dados | Celebra Capital</title>
      </Helmet>

      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1
            className="text-2xl font-bold text-gray-800 dark:text-white"
            data-testid="main-chart"
          >
            Análise de Dados
          </h1>
          <div className="flex items-center" data-testid="date-filter">
            <DateRangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
            />
            <button
              onClick={fetchAnalyticsData}
              className="ml-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Atualizar
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        ) : analyticsData ? (
          <div className="space-y-6" data-testid="filtered-data">
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total de Propostas"
                value={analyticsData.totalProposals.toString()}
                icon="clipboard-list"
                color="blue"
                testId="total-proposals-stat"
              />
              <StatCard
                title="Taxa de Aprovação"
                value={`${analyticsData.conversionRate}%`}
                icon="chart-pie"
                color="green"
                testId="approval-rate-stat"
              />
              <StatCard
                title="Tempo Médio de Análise"
                value={`${analyticsData.avgProcessingTime} dias`}
                icon="clock"
                color="yellow"
                testId="avg-time-stat"
              />
              <StatCard
                title="Propostas Pendentes"
                value={analyticsData.pendingProposals.toString()}
                icon="hourglass"
                color="purple"
                testId="pending-proposals-stat"
              />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                  Evolução de Propostas
                </h2>
                {lineData && <Line options={lineOptions} data={lineData} />}
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                  Propostas por Status
                </h2>
                <div
                  className="flex justify-center"
                  style={{ height: '300px' }}
                >
                  {pieData && <Pie data={pieData} />}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                Propostas por Tipo de Usuário
              </h2>
              {barData && <Bar options={barOptions} data={barData} />}
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                Insights e Recomendações
              </h2>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <p className="text-gray-700 dark:text-gray-300">
                      {analyticsData.conversionRate > 60
                        ? 'Alta taxa de aprovação indica bom processo de pré-qualificação.'
                        : 'Taxa de aprovação abaixo de 60% - revisar critérios de pré-qualificação.'}
                    </p>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <p className="text-gray-700 dark:text-gray-300">
                      {analyticsData.avgProcessingTime < 3
                        ? 'Tempo médio de processamento excelente!'
                        : 'Considere melhorias no tempo de processamento, média atual acima de 3 dias.'}
                    </p>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <p className="text-gray-700 dark:text-gray-300">
                      {analyticsData.pendingProposals >
                      analyticsData.totalProposals * 0.3
                        ? 'Número elevado de propostas pendentes - aumente a equipe de análise.'
                        : 'Proporção de propostas pendentes em níveis aceitáveis.'}
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-100 text-yellow-700 p-4 rounded-md mb-6">
            Nenhum dado disponível para o período selecionado.
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default Analytics
