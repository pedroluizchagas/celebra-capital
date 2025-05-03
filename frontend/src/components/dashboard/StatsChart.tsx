import React, { useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface StatsChartProps {
  isLoading?: boolean
  chartData?: { labels: string[]; values: number[] }
}

const StatsChart: React.FC<StatsChartProps> = ({
  isLoading = false,
  chartData,
}) => {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar')

  // Se não tiver dados, usar dados simulados
  const defaultData = {
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

  const data = chartData || defaultData

  const barOptions = {
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

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Tendência de Propostas',
      },
    },
  }

  const chartConfig = {
    labels: data.labels,
    datasets: [
      {
        label: 'Propostas',
        data: data.values,
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1,
      },
    ],
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="flex mb-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 mr-2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Análise de Propostas
        </h3>
        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            className={`py-2 px-4 text-sm font-medium rounded-l-lg ${
              chartType === 'bar'
                ? 'bg-celebra-blue text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => setChartType('bar')}
          >
            Barras
          </button>
          <button
            type="button"
            className={`py-2 px-4 text-sm font-medium rounded-r-lg ${
              chartType === 'line'
                ? 'bg-celebra-blue text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => setChartType('line')}
          >
            Linha
          </button>
        </div>
      </div>

      <div className="h-80">
        {chartType === 'bar' ? (
          <Bar options={barOptions} data={chartConfig} height={300} />
        ) : (
          <Line options={lineOptions} data={chartConfig} height={300} />
        )}
      </div>
    </div>
  )
}

export default StatsChart
