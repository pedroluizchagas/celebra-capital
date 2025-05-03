import React from 'react'
import LoadingSpinner from './LoadingSpinner'

interface PageLoaderProps {
  message?: string
}

const PageLoader: React.FC<PageLoaderProps> = ({
  message = 'Carregando dados...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
      <LoadingSpinner size="large" color="primary" />
      <p className="mt-4 text-gray-600 dark:text-gray-300">{message}</p>
    </div>
  )
}

export default PageLoader
