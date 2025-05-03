import React from 'react'
import { CreditAnalysis } from '../../services/creditAnalysisService'

interface CreditAnalysisSummaryProps {
  analysis: CreditAnalysis
  showDetails?: boolean
}

const CreditAnalysisSummary: React.FC<CreditAnalysisSummaryProps> = ({
  analysis,
  showDetails = false,
}) => {
  // Formatar data
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  // Obter cor baseada no resultado
  const getResultColor = () => {
    switch (analysis.result) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'denied':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'manual_review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  // Obter texto do resultado
  const getResultText = () => {
    switch (analysis.result) {
      case 'approved':
        return 'Aprovado'
      case 'denied':
        return 'Negado'
      case 'manual_review':
        return 'Revisão Manual'
      case 'insufficient_data':
        return 'Dados Insuficientes'
      default:
        return 'Pendente'
    }
  }

  // Obter texto do status
  const getStatusText = () => {
    switch (analysis.status) {
      case 'pending':
        return 'Pendente'
      case 'processing':
        return 'Em Processamento'
      case 'completed':
        return 'Concluída'
      case 'failed':
        return 'Falha'
      case 'expired':
        return 'Expirada'
      default:
        return analysis.status
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">
          Análise de Crédito #{analysis.id}
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(analysis.created_at)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
          <p className="font-medium">{getStatusText()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Resultado</p>
          {analysis.result ? (
            <span
              className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getResultColor()}`}
            >
              {getResultText()}
            </span>
          ) : (
            <p className="font-medium">Aguardando</p>
          )}
        </div>
      </div>

      {analysis.score !== null && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Pontuação de Crédito
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${
                analysis.score >= 700
                  ? 'bg-green-600'
                  : analysis.score >= 500
                  ? 'bg-yellow-500'
                  : 'bg-red-600'
              }`}
              style={{
                width: `${Math.min(100, (analysis.score / 1000) * 100)}%`,
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span>{analysis.score} pontos</span>
            <span>{analysis.risk_level}</span>
          </div>
        </div>
      )}

      {showDetails && analysis.restrictions.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Restrições Encontradas</h4>
          <div className="space-y-2">
            {analysis.restrictions.map((restriction) => (
              <div
                key={restriction.id}
                className="bg-red-50 dark:bg-red-900/10 text-red-800 dark:text-red-300 p-2 rounded text-sm"
              >
                <div className="font-semibold">{restriction.description}</div>
                {restriction.value && (
                  <div>
                    Valor:{' '}
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(restriction.value)}
                  </div>
                )}
                {restriction.creditor && (
                  <div>Credor: {restriction.creditor}</div>
                )}
                {restriction.date && (
                  <div>Data: {formatDate(restriction.date)}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showDetails && (
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          <p>Solicitado por: {analysis.requested_by?.name || 'Sistema'}</p>
          <p>Concluído em: {formatDate(analysis.completed_at)}</p>
          <p>ID de Referência: {analysis.reference_id}</p>
        </div>
      )}
    </div>
  )
}

export default CreditAnalysisSummary
