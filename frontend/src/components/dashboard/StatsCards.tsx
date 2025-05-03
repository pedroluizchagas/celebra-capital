import React from 'react'
import { DashboardStats } from '../../services/dashboardService'

interface StatsCardsProps {
  stats: DashboardStats | null
  isLoading?: boolean
}

const StatsCards: React.FC<StatsCardsProps> = ({
  stats,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    )
  }

  if (!stats) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Não foi possível carregar as estatísticas. Tente novamente mais
              tarde.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total de Propostas */}
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
              {stats.total_proposals}
            </p>
          </div>
        </div>
      </div>

      {/* Aguardando Análise */}
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
              {stats.pending_review}
            </p>
          </div>
        </div>
      </div>

      {/* Aprovadas */}
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
              {stats.approved}
            </p>
          </div>
        </div>
      </div>

      {/* Rejeitadas */}
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
              {stats.rejected}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsCards
