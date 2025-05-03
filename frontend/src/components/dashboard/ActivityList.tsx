import React from 'react'
import { ActivityItem } from '../../services/dashboardService'

interface ActivityListProps {
  activities: ActivityItem[]
  isLoading?: boolean
}

const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  isLoading = false,
}) => {
  const renderIcon = (iconType: ActivityItem['icon_type']) => {
    switch (iconType) {
      case 'approve':
        return (
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
        )
      case 'reject':
        return (
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
        )
      case 'new_user':
        return (
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
        )
      case 'document':
        return (
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
        )
      case 'new_proposal':
        return (
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
        )
      default:
        return (
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3, 4, 5].map((index) => (
          <div key={index} className="flex items-start">
            <div className="flex-shrink-0 w-5 h-5 mt-1 rounded-full bg-gray-300 dark:bg-gray-600"></div>
            <div className="ml-3 w-full">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 dark:text-gray-400">
          Nenhuma atividade recente encontrada
        </p>
      </div>
    )
  }

  return (
    <ul className="space-y-4">
      {activities.map((activity) => (
        <li key={activity.id} className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            {renderIcon(activity.icon_type)}
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
  )
}

export default ActivityList
