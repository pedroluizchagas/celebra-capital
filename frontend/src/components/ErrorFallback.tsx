import React from 'react'
import { FallbackProps } from 'react-error-boundary'

/**
 * Componente de fallback para erros em componentes React
 * Mostra um estado de erro amigável com opção de tentar novamente
 */
export const ErrorFallback: React.FC<FallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h2 className="mb-4 text-xl font-bold text-center text-gray-900">
          Ocorreu um erro inesperado
        </h2>

        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
          <p className="font-medium">
            Erro: {error.message || 'Erro desconhecido'}
          </p>
        </div>

        <p className="mb-4 text-sm text-center text-gray-600">
          Pedimos desculpas pelo inconveniente. Nossa equipe já foi notificada
          deste problema e estamos trabalhando para corrigi-lo.
        </p>

        <div className="flex flex-col space-y-2">
          <button
            onClick={resetErrorBoundary}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Tentar novamente
          </button>

          <button
            onClick={() => (window.location.href = '/')}
            className="w-full px-4 py-2 text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Voltar para a página inicial
          </button>
        </div>
      </div>
    </div>
  )
}
