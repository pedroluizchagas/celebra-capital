import React, { useState } from 'react'
import creditAnalysisService from '../../services/creditAnalysisService'
import { useError } from '../../contexts/ErrorContext'

interface RequestCreditAnalysisProps {
  proposalId: number
  onSuccess?: (analysisId: number) => void
}

const RequestCreditAnalysis: React.FC<RequestCreditAnalysisProps> = ({
  proposalId,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false)
  const { setError } = useError()

  const handleRequest = async () => {
    try {
      setLoading(true)
      const analysis = await creditAnalysisService.requestAnalysis(proposalId)
      if (onSuccess) {
        onSuccess(analysis.id)
      }
    } catch (error) {
      console.error('Erro ao solicitar análise de crédito:', error)
      setError(
        'Não foi possível solicitar a análise de crédito. Tente novamente mais tarde.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3">Análise de Crédito</h3>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Solicite uma análise de crédito automática para verificar a
        elegibilidade do cliente para aprovação de sua proposta.
      </p>

      <div className="flex flex-col space-y-2">
        <button
          type="button"
          className={`
            flex items-center justify-center px-4 py-2 rounded
            bg-blue-600 hover:bg-blue-700 text-white 
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            ${loading ? 'opacity-70 cursor-not-allowed' : ''}
          `}
          onClick={handleRequest}
          disabled={loading}
        >
          {loading ? (
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
              Solicitando...
            </>
          ) : (
            <>
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Solicitar Análise de Crédito
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          A análise pode levar alguns segundos para ser concluída. Os resultados
          serão exibidos aqui quando disponíveis.
        </p>
      </div>
    </div>
  )
}

export default RequestCreditAnalysis
