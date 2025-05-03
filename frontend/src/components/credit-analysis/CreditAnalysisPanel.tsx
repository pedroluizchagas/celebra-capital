import React, { useState, useEffect } from 'react'
import creditAnalysisService, {
  CreditAnalysis,
} from '../../services/creditAnalysisService'
import CreditAnalysisSummary from './CreditAnalysisSummary'
import RequestCreditAnalysis from './RequestCreditAnalysis'
import { useError } from '../../contexts/ErrorContext'

interface CreditAnalysisPanelProps {
  proposalId: number
}

const CreditAnalysisPanel: React.FC<CreditAnalysisPanelProps> = ({
  proposalId,
}) => {
  const [analyses, setAnalyses] = useState<CreditAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<number | null>(
    null
  )
  const { setError } = useError()

  // Carregar análises existentes
  const loadAnalyses = async () => {
    try {
      setLoading(true)
      const data = await creditAnalysisService.listAnalyses({
        proposal_id: proposalId,
      })
      setAnalyses(data)

      // Selecionar a análise mais recente
      if (data.length > 0) {
        setSelectedAnalysisId(data[0].id)
      }
    } catch (error) {
      console.error('Erro ao carregar análises de crédito:', error)
      setError('Não foi possível carregar as análises de crédito.')
    } finally {
      setLoading(false)
    }
  }

  // Verificar status de análises em andamento
  const checkPendingAnalysesStatus = async () => {
    const pendingAnalyses = analyses.filter(
      (a) => a.status === 'pending' || a.status === 'processing'
    )

    if (pendingAnalyses.length === 0) return

    const updatedAnalyses = [...analyses]

    for (const analysis of pendingAnalyses) {
      try {
        const result = await creditAnalysisService.checkAnalysisStatus(
          analysis.id
        )

        // Atualizar análise na lista
        const index = updatedAnalyses.findIndex((a) => a.id === analysis.id)
        if (index >= 0) {
          updatedAnalyses[index] = result.analysis
        }
      } catch (error) {
        console.error(
          `Erro ao verificar status da análise ${analysis.id}:`,
          error
        )
      }
    }

    setAnalyses(updatedAnalyses)
  }

  // Efeito para carregar análises ao montar o componente
  useEffect(() => {
    loadAnalyses()
  }, [proposalId])

  // Efeito para verificar status periodicamente
  useEffect(() => {
    // Verificar status a cada 10 segundos se houver análises pendentes
    const hasPendingAnalyses = analyses.some(
      (a) => a.status === 'pending' || a.status === 'processing'
    )

    if (!hasPendingAnalyses) return

    const interval = setInterval(() => {
      checkPendingAnalysesStatus()
    }, 10000)

    return () => clearInterval(interval)
  }, [analyses])

  // Selecionar análise específica
  const handleSelectAnalysis = (id: number) => {
    setSelectedAnalysisId(id)
  }

  // Callback quando uma nova análise é solicitada
  const handleAnalysisRequested = (analysisId: number) => {
    loadAnalyses()
  }

  // Obter a análise selecionada
  const selectedAnalysis = analyses.find((a) => a.id === selectedAnalysisId)

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Análise de Crédito</h2>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
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
        </div>
      ) : (
        <div>
          {analyses.length === 0 ? (
            <RequestCreditAnalysis
              proposalId={proposalId}
              onSuccess={handleAnalysisRequested}
            />
          ) : (
            <div>
              {/* Lista de análises realizadas */}
              {analyses.length > 1 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    Histórico de Análises
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analyses.map((analysis) => (
                      <button
                        key={analysis.id}
                        className={`px-3 py-1 text-sm rounded-full transition-colors
                          ${
                            selectedAnalysisId === analysis.id
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        onClick={() => handleSelectAnalysis(analysis.id)}
                      >
                        #{analysis.id} -{' '}
                        {new Date(analysis.created_at).toLocaleDateString(
                          'pt-BR'
                        )}
                      </button>
                    ))}

                    {/* Botão para nova análise */}
                    <button
                      className="px-3 py-1 text-sm rounded-full bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => {
                        const requestAnalysis = document.createElement('div')
                        requestAnalysis.style.display = 'none'
                        document.body.appendChild(requestAnalysis)

                        const requestComponent = (
                          <RequestCreditAnalysis
                            proposalId={proposalId}
                            onSuccess={handleAnalysisRequested}
                          />
                        )

                        // Simular clique no botão de solicitar análise
                        setTimeout(() => {
                          if (
                            requestComponent.props &&
                            typeof requestComponent.props.onSuccess ===
                              'function'
                          ) {
                            requestComponent.props.onSuccess(0)
                          }
                          document.body.removeChild(requestAnalysis)
                        }, 0)
                      }}
                    >
                      + Nova Análise
                    </button>
                  </div>
                </div>
              )}

              {/* Análise selecionada */}
              {selectedAnalysis ? (
                <CreditAnalysisSummary
                  analysis={selectedAnalysis}
                  showDetails={true}
                />
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900/10 text-yellow-800 dark:text-yellow-300 p-4 rounded-lg">
                  Selecione uma análise para visualizar os detalhes.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CreditAnalysisPanel
