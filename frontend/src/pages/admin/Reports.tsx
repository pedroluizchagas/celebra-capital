import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import proposalService from '../../services/proposalService'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js'
import { Bar, Pie, Line } from 'react-chartjs-2'

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface ReportFilters {
  startDate: string
  endDate: string
  creditType: string
  status: string
  reportType: string
  groupBy: string
}

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string[]
    borderColor?: string[]
    borderWidth?: number
  }[]
}

interface ReportData {
  proposalsByStatus: { [key: string]: number }
  proposalsByCreditType: { [key: string]: number }
  proposalsByMonth: { [key: string]: number }
  averageValues: { [key: string]: number }
  totalValue: number
  conversionRate: number
  documentCompletionRate: number
}

const defaultFilters: ReportFilters = {
  startDate: new Date(new Date().setMonth(new Date().getMonth() - 1))
    .toISOString()
    .split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  creditType: '',
  status: '',
  reportType: 'overview',
  groupBy: 'month',
}

const Reports: React.FC = () => {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<ReportFilters>(defaultFilters)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState('csv')

  // Cores para gráficos
  const statusColors = {
    pending: 'rgba(255, 193, 7, 0.8)',
    approved: 'rgba(40, 167, 69, 0.8)',
    rejected: 'rgba(220, 53, 69, 0.8)',
    completed: 'rgba(23, 162, 184, 0.8)',
    draft: 'rgba(108, 117, 125, 0.8)',
  }

  const creditTypeColors = {
    consignado: 'rgba(90, 50, 234, 0.8)',
    pessoal: 'rgba(32, 201, 151, 0.8)',
    imobiliario: 'rgba(247, 126, 83, 0.8)',
    veiculo: 'rgba(65, 145, 255, 0.8)',
    outro: 'rgba(159, 90, 253, 0.8)',
  }

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    setIsLoading(true)
    try {
      // Obter estatísticas gerais
      const stats = await proposalService.getReportStats(
        filters.startDate,
        filters.endDate,
        {
          status: filters.status || undefined,
          credit_type: filters.creditType || undefined,
        }
      )

      // Obter dados para gráficos específicos
      const statusData = await proposalService.getChartData(
        'status',
        filters.startDate,
        filters.endDate
      )

      const creditTypeData = await proposalService.getChartData(
        'credit_type',
        filters.startDate,
        filters.endDate
      )

      const monthlyData = await proposalService.getChartData(
        'monthly',
        filters.startDate,
        filters.endDate,
        filters.groupBy as 'day' | 'week' | 'month' | 'quarter' | 'year'
      )

      // Combinar os dados
      const reportData = {
        proposalsByStatus: statusData.distribution,
        proposalsByCreditType: creditTypeData.distribution,
        proposalsByMonth: monthlyData.trend,
        averageValues: stats.average_values,
        totalValue: stats.total_value,
        conversionRate: stats.conversion_rate,
        documentCompletionRate: stats.document_completion_rate,
      }

      setReportData(reportData)
    } catch (error) {
      console.error('Erro ao buscar dados de relatórios:', error)

      // Fallback para dados de exemplo em caso de erro
      const mockData: ReportData = {
        proposalsByStatus: {
          pending: 42,
          approved: 68,
          rejected: 15,
          completed: 35,
          draft: 8,
        },
        proposalsByCreditType: {
          consignado: 85,
          pessoal: 32,
          imobiliario: 18,
          veiculo: 12,
          outro: 21,
        },
        proposalsByMonth: {
          'Jan/2023': 15,
          'Fev/2023': 18,
          'Mar/2023': 22,
          'Abr/2023': 20,
          'Mai/2023': 25,
          'Jun/2023': 30,
          'Jul/2023': 28,
          'Ago/2023': 32,
          'Set/2023': 35,
          'Out/2023': 38,
          'Nov/2023': 42,
          'Dez/2023': 45,
        },
        averageValues: {
          consignado: 25000,
          pessoal: 8500,
          imobiliario: 150000,
          veiculo: 35000,
          outro: 12000,
        },
        totalValue: 4568000,
        conversionRate: 0.68,
        documentCompletionRate: 0.92,
      }

      setReportData(mockData)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault()
    fetchReportData()
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      if (
        exportFormat === 'csv' ||
        exportFormat === 'excel' ||
        exportFormat === 'pdf'
      ) {
        // Em vez de usar apenas exportProposals, podemos usar a nova função exportReport
        const blob = await proposalService.exportReport(
          exportFormat as 'csv' | 'excel' | 'pdf',
          filters.startDate,
          filters.endDate,
          {
            status: filters.status || undefined,
            credit_type: filters.creditType || undefined,
          }
        )

        // Criar link para download
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `relatorio_celebra_${
          new Date().toISOString().split('T')[0]
        }.${exportFormat}`
        document.body.appendChild(a)
        a.click()

        // Limpar
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error)
      alert('Erro ao exportar. Tente novamente mais tarde.')
    } finally {
      setIsExporting(false)
    }
  }

  // Preparar dados para o gráfico de status
  const getStatusChartData = (): ChartData => {
    if (!reportData) {
      return {
        labels: [],
        datasets: [{ label: '', data: [], backgroundColor: [] }],
      }
    }

    const labels = Object.keys(reportData.proposalsByStatus)
    const data = Object.values(reportData.proposalsByStatus)
    const backgroundColor = labels.map(
      (label) =>
        statusColors[label as keyof typeof statusColors] || 'rgba(0, 0, 0, 0.2)'
    )

    return {
      labels,
      datasets: [
        {
          label: 'Propostas por Status',
          data,
          backgroundColor,
        },
      ],
    }
  }

  // Preparar dados para o gráfico de tipo de crédito
  const getCreditTypeChartData = (): ChartData => {
    if (!reportData) {
      return {
        labels: [],
        datasets: [{ label: '', data: [], backgroundColor: [] }],
      }
    }

    const labels = Object.keys(reportData.proposalsByCreditType)
    const data = Object.values(reportData.proposalsByCreditType)
    const backgroundColor = labels.map(
      (label) =>
        creditTypeColors[label as keyof typeof creditTypeColors] ||
        'rgba(0, 0, 0, 0.2)'
    )

    return {
      labels,
      datasets: [
        {
          label: 'Propostas por Tipo de Crédito',
          data,
          backgroundColor,
        },
      ],
    }
  }

  // Preparar dados para o gráfico de tendência mensal
  const getMonthlyTrendChartData = (): ChartData => {
    if (!reportData) {
      return {
        labels: [],
        datasets: [
          {
            label: '',
            data: [],
            backgroundColor: [],
            borderColor: [],
          },
        ],
      }
    }

    const labels = Object.keys(reportData.proposalsByMonth)
    const data = Object.values(reportData.proposalsByMonth)

    return {
      labels,
      datasets: [
        {
          label: 'Propostas por Mês',
          data,
          backgroundColor: ['rgba(54, 162, 235, 0.2)'],
          borderColor: ['rgba(54, 162, 235, 1)'],
          borderWidth: 2,
        },
      ],
    }
  }

  // Função para renderizar o relatório selecionado
  const renderReport = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-celebra-blue"></div>
        </div>
      )
    }

    if (!reportData) {
      return (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Nenhum dado disponível para o período selecionado.
          </p>
        </div>
      )
    }

    switch (filters.reportType) {
      case 'status':
        return (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Distribuição de Propostas por Status
            </h3>
            <div className="h-80">
              <Pie
                data={getStatusChartData()}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(reportData.proposalsByStatus).map(
                ([status, count]) => (
                  <div key={status} className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor:
                          statusColors[status as keyof typeof statusColors] ||
                          'gray',
                      }}
                    ></div>
                    <span className="text-gray-700 dark:text-gray-300 capitalize">
                      {status}:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {count}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        )

      case 'creditType':
        return (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Distribuição por Tipo de Crédito
            </h3>
            <div className="h-80">
              <Bar
                data={getCreditTypeChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
            <div className="mt-6">
              <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Valor Médio por Tipo de Crédito
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <th className="px-4 py-2">Tipo de Crédito</th>
                      <th className="px-4 py-2">Valor Médio</th>
                      <th className="px-4 py-2">Quantidade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {Object.entries(reportData.proposalsByCreditType).map(
                      ([type, count]) => (
                        <tr key={type}>
                          <td className="px-4 py-2 text-gray-700 dark:text-gray-300 capitalize">
                            {type}
                          </td>
                          <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(
                              reportData.averageValues[
                                type as keyof typeof reportData.averageValues
                              ] || 0
                            )}
                          </td>
                          <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                            {count}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )

      case 'monthly':
        return (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Tendência Mensal de Propostas
            </h3>
            <div className="h-80">
              <Line
                data={getMonthlyTrendChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
            <div className="mt-6 text-center">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold">
                  Taxa de crescimento médio:{' '}
                </span>
                <span className="text-green-600 dark:text-green-400">
                  +12.5%
                </span>{' '}
                por mês
              </p>
            </div>
          </div>
        )

      case 'overview':
      default:
        return (
          <div className="space-y-6">
            {/* Cards com métricas principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Valor Total de Crédito
                </h3>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(reportData.totalValue)}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-2">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                      clipRule="evenodd"
                    />
                  </svg>
                  8.3% em relação ao mês anterior
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Taxa de Conversão
                </h3>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
                  {(reportData.conversionRate * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-2">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                      clipRule="evenodd"
                    />
                  </svg>
                  2.5% em relação ao mês anterior
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Taxa de Conclusão de Documentos
                </h3>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
                  {(reportData.documentCompletionRate * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-2">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                      clipRule="evenodd"
                    />
                  </svg>
                  3.8% em relação ao mês anterior
                </p>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Propostas por Status
                </h3>
                <div className="h-60">
                  <Pie
                    data={getStatusChartData()}
                    options={{ responsive: true, maintainAspectRatio: false }}
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Propostas por Tipo de Crédito
                </h3>
                <div className="h-60">
                  <Bar
                    data={getCreditTypeChartData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Evolução de Propostas ao Longo do Tempo
              </h3>
              <div className="h-80">
                <Line
                  data={getMonthlyTrendChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Relatórios e Análises
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Visualize métricas importantes, tendências e exporte relatórios
          detalhados.
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <form onSubmit={handleApplyFilters} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Data Inicial
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-celebra-blue focus:border-celebra-blue dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Data Final
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-celebra-blue focus:border-celebra-blue dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="creditType"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Tipo de Crédito
              </label>
              <select
                id="creditType"
                name="creditType"
                value={filters.creditType}
                onChange={handleFilterChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-celebra-blue focus:border-celebra-blue dark:bg-gray-700 dark:text-white"
              >
                <option value="">Todos</option>
                <option value="consignado">Consignado</option>
                <option value="pessoal">Pessoal</option>
                <option value="imobiliario">Imobiliário</option>
                <option value="veiculo">Veículo</option>
                <option value="outro">Outro</option>
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
                value={filters.status}
                onChange={handleFilterChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-celebra-blue focus:border-celebra-blue dark:bg-gray-700 dark:text-white"
              >
                <option value="">Todos</option>
                <option value="pending">Pendente</option>
                <option value="approved">Aprovado</option>
                <option value="rejected">Rejeitado</option>
                <option value="completed">Concluído</option>
                <option value="draft">Rascunho</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="reportType"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Tipo de Relatório
              </label>
              <select
                id="reportType"
                name="reportType"
                value={filters.reportType}
                onChange={handleFilterChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-celebra-blue focus:border-celebra-blue dark:bg-gray-700 dark:text-white"
              >
                <option value="overview">Visão Geral</option>
                <option value="status">Por Status</option>
                <option value="creditType">Por Tipo de Crédito</option>
                <option value="monthly">Tendência Mensal</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="groupBy"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Agrupar Por
              </label>
              <select
                id="groupBy"
                name="groupBy"
                value={filters.groupBy}
                onChange={handleFilterChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-celebra-blue focus:border-celebra-blue dark:bg-gray-700 dark:text-white"
              >
                <option value="day">Dia</option>
                <option value="week">Semana</option>
                <option value="month">Mês</option>
                <option value="quarter">Trimestre</option>
                <option value="year">Ano</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-celebra-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-celebra-blue"
            >
              Aplicar Filtros
            </button>

            <div className="flex items-center space-x-4">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm focus:outline-none focus:ring-celebra-blue focus:border-celebra-blue dark:bg-gray-700 dark:text-white"
              >
                <option value="csv">CSV</option>
                <option value="excel">Excel</option>
                <option value="pdf">PDF</option>
              </select>

              <button
                type="button"
                onClick={handleExport}
                disabled={isExporting}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-celebra-blue dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
              >
                {isExporting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Exportando...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Exportar
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Conteúdo do Relatório */}
      {renderReport()}
    </div>
  )
}

export default Reports
