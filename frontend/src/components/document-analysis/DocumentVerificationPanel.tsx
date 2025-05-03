import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFileAlt,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faSpinner,
  faInfoCircle,
  faSearchPlus,
  faRedo,
  faCamera,
  faUserCheck,
  faIdCard,
} from '@fortawesome/free-solid-svg-icons'
import type {
  DocumentVerificationResult,
  FaceMatchResult,
} from '../../services/documentAnalysisService'
import documentAnalysisService from '../../services/documentAnalysisService'
import LoadingSpinner from '../common/LoadingSpinner'

interface DocumentVerificationPanelProps {
  proposalId: number
  documentId?: number
  onRequestAnalysis?: () => void
  onAnalysisComplete?: (results: any) => void
}

/**
 * Componente para exibir verificações de documentos e comparação facial
 */
const DocumentVerificationPanel: React.FC<DocumentVerificationPanelProps> = ({
  proposalId,
  documentId,
  onRequestAnalysis,
  onAnalysisComplete,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [documentResults, setDocumentResults] = useState<
    DocumentVerificationResult[]
  >([])
  const [faceMatchResults, setFaceMatchResults] = useState<FaceMatchResult[]>(
    []
  )
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  )
  const [selectedFaceMatchId, setSelectedFaceMatchId] = useState<string | null>(
    null
  )
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Carregar resultados quando o componente é montado
  useEffect(() => {
    fetchAnalysisResults()
  }, [proposalId])

  // Função para buscar resultados de análise
  const fetchAnalysisResults = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const results = await documentAnalysisService.getProposalAnalysisResults(
        proposalId
      )
      setDocumentResults(results.documentValidations)
      setFaceMatchResults(results.faceMatches)

      // Selecionar o primeiro resultado por padrão, se existir
      if (results.documentValidations.length > 0 && !selectedDocumentId) {
        setSelectedDocumentId(results.documentValidations[0].id)
      }
      if (results.faceMatches.length > 0 && !selectedFaceMatchId) {
        setSelectedFaceMatchId(results.faceMatches[0].id)
      }

      // Chamar callback se fornecido
      if (onAnalysisComplete) {
        onAnalysisComplete(results)
      }
    } catch (error) {
      console.error('Erro ao carregar resultados de análise:', error)
      setError(
        'Não foi possível carregar os resultados de análise de documentos.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Verificar status de análises pendentes
  const checkPendingAnalysesStatus = async () => {
    setIsRefreshing(true)

    try {
      // Verificar documentos pendentes
      const pendingDocuments = documentResults.filter(
        (doc) => doc.status === 'pending' || doc.status === 'processing'
      )

      // Verificar comparações faciais pendentes
      const pendingFaceMatches = faceMatchResults.filter(
        (match) => match.status === 'pending' || match.status === 'processing'
      )

      // Atualizar análises de documentos pendentes
      for (const doc of pendingDocuments) {
        try {
          const result = await documentAnalysisService.checkAnalysisStatus(
            'document',
            doc.id
          )

          // Atualizar no estado local
          setDocumentResults((prev) =>
            prev.map((d) =>
              d.id === doc.id ? (result as DocumentVerificationResult) : d
            )
          )
        } catch (err) {
          console.error(
            `Erro ao verificar status da análise de documento ${doc.id}:`,
            err
          )
        }
      }

      // Atualizar comparações faciais pendentes
      for (const match of pendingFaceMatches) {
        try {
          const result = await documentAnalysisService.checkAnalysisStatus(
            'face-match',
            match.id
          )

          // Atualizar no estado local
          setFaceMatchResults((prev) =>
            prev.map((m) =>
              m.id === match.id ? (result as FaceMatchResult) : m
            )
          )
        } catch (err) {
          console.error(
            `Erro ao verificar status da comparação facial ${match.id}:`,
            err
          )
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status das análises:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Solicitar uma nova análise em lote
  const handleRequestBatchAnalysis = async () => {
    if (!onRequestAnalysis) {
      try {
        setIsLoading(true)
        setError(null)

        const result = await documentAnalysisService.startBatchAnalysis({
          proposalId: proposalId,
        })

        console.log('Análise em lote iniciada:', result)

        // Recarregar após um pequeno delay para dar tempo de iniciar o processamento
        setTimeout(() => {
          fetchAnalysisResults()
        }, 2000)
      } catch (error) {
        console.error('Erro ao solicitar análise em lote:', error)
        setError('Não foi possível iniciar a análise em lote dos documentos.')
      } finally {
        setIsLoading(false)
      }
    } else {
      onRequestAnalysis()
    }
  }

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  // Renderizar status com ícone
  const renderStatus = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
            Verificado
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <FontAwesomeIcon icon={faTimesCircle} className="mr-1" />
            Rejeitado
          </span>
        )
      case 'needs_review':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
            Requer Revisão
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
            Pendente
          </span>
        )
      case 'processing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
            <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
            Processando
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            {status}
          </span>
        )
    }
  }

  // Obter informações do documento selecionado
  const selectedDocumentResult = selectedDocumentId
    ? documentResults.find((doc) => doc.id === selectedDocumentId)
    : null

  // Obter informações da comparação facial selecionada
  const selectedFaceMatchResult = selectedFaceMatchId
    ? faceMatchResults.find((match) => match.id === selectedFaceMatchId)
    : null

  if (isLoading && !documentResults.length && !faceMatchResults.length) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner size="lg" />
          <span className="ml-2 text-gray-500 dark:text-gray-400">
            Carregando análises de documentos...
          </span>
        </div>
      </div>
    )
  }

  // Verificar se há análises pendentes
  const hasPendingAnalyses =
    documentResults.some(
      (doc) => doc.status === 'pending' || doc.status === 'processing'
    ) ||
    faceMatchResults.some(
      (match) => match.status === 'pending' || match.status === 'processing'
    )

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Cabeçalho */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Análise de Documentos
        </h3>

        <div className="flex space-x-2">
          {hasPendingAnalyses && (
            <button
              onClick={checkPendingAnalysesStatus}
              disabled={isRefreshing}
              className={`px-3 py-1 text-sm rounded-md flex items-center ${
                isRefreshing
                  ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isRefreshing ? (
                <>
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="mr-1 animate-spin"
                  />
                  Atualizando...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faRedo} className="mr-1" />
                  Atualizar Status
                </>
              )}
            </button>
          )}

          <button
            onClick={handleRequestBatchAnalysis}
            disabled={isLoading}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
          >
            <FontAwesomeIcon icon={faFileAlt} className="mr-1" />
            {documentResults.length || faceMatchResults.length
              ? 'Nova Análise'
              : 'Analisar Documentos'}
          </button>
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="m-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
          <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
          {error}
        </div>
      )}

      <div className="p-4">
        {/* Tabs para alternar entre verificação de documentos e comparação facial */}
        <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              className={`mr-2 py-2 px-4 font-medium text-sm border-b-2 ${
                !selectedFaceMatchId
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-700'
              }`}
              onClick={() => setSelectedFaceMatchId(null)}
            >
              <FontAwesomeIcon icon={faFileAlt} className="mr-1" />
              Verificação de Documentos ({documentResults.length})
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm border-b-2 ${
                selectedFaceMatchId
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-700'
              }`}
              onClick={() => {
                if (faceMatchResults.length > 0) {
                  setSelectedFaceMatchId(faceMatchResults[0].id)
                }
              }}
            >
              <FontAwesomeIcon icon={faUserCheck} className="mr-1" />
              Comparação Facial ({faceMatchResults.length})
            </button>
          </nav>
        </div>

        {/* Conteúdo da Tab - Verificação de Documentos */}
        {!selectedFaceMatchId && (
          <div>
            {documentResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FontAwesomeIcon icon={faFileAlt} className="text-4xl mb-2" />
                <p>Nenhuma verificação de documento encontrada.</p>
                <button
                  onClick={handleRequestBatchAnalysis}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Iniciar Análise de Documentos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Lista de documentos */}
                <div className="lg:col-span-1 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg max-h-96 overflow-y-auto">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-white mb-2">
                    Documentos Analisados
                  </h4>
                  <div className="space-y-2">
                    {documentResults.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDocumentId(doc.id)}
                        className={`w-full text-left p-2 rounded-md transition-colors ${
                          selectedDocumentId === doc.id
                            ? 'bg-blue-100 dark:bg-blue-900/30'
                            : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-800 dark:text-white">
                            {doc.documentType}
                          </span>
                          <span>{renderStatus(doc.status)}</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          ID: {doc.documentId}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Detalhes do documento selecionado */}
                <div className="lg:col-span-3">
                  {selectedDocumentResult ? (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            {selectedDocumentResult.documentType}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Análise iniciada em{' '}
                            {formatDate(selectedDocumentResult.createdAt)}
                          </p>
                        </div>
                        <div>{renderStatus(selectedDocumentResult.status)}</div>
                      </div>

                      {/* Status e detalhes da verificação */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-white mb-2">
                            Status da Verificação
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-300">
                                Confiança:
                              </span>
                              <span className="font-medium text-gray-800 dark:text-white">
                                {Math.round(
                                  selectedDocumentResult.confidence * 100
                                )}
                                %
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-300">
                                Autêntico:
                              </span>
                              <span>
                                {selectedDocumentResult.verificationDetails
                                  .isAuthentic ? (
                                  <FontAwesomeIcon
                                    icon={faCheckCircle}
                                    className="text-green-500"
                                  />
                                ) : (
                                  <FontAwesomeIcon
                                    icon={faTimesCircle}
                                    className="text-red-500"
                                  />
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-300">
                                Manipulação detectada:
                              </span>
                              <span>
                                {selectedDocumentResult.verificationDetails
                                  .manipulationDetected ? (
                                  <FontAwesomeIcon
                                    icon={faExclamationTriangle}
                                    className="text-red-500"
                                  />
                                ) : (
                                  <FontAwesomeIcon
                                    icon={faCheckCircle}
                                    className="text-green-500"
                                  />
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-300">
                                Expirado:
                              </span>
                              <span>
                                {selectedDocumentResult.verificationDetails
                                  .isExpired ? (
                                  <FontAwesomeIcon
                                    icon={faExclamationTriangle}
                                    className="text-red-500"
                                  />
                                ) : (
                                  <FontAwesomeIcon
                                    icon={faCheckCircle}
                                    className="text-green-500"
                                  />
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-300">
                                Formato válido:
                              </span>
                              <span>
                                {selectedDocumentResult.verificationDetails
                                  .isValidFormat ? (
                                  <FontAwesomeIcon
                                    icon={faCheckCircle}
                                    className="text-green-500"
                                  />
                                ) : (
                                  <FontAwesomeIcon
                                    icon={faTimesCircle}
                                    className="text-red-500"
                                  />
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Avisos e erros */}
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-white mb-2">
                            Avisos e Erros
                          </h4>
                          {selectedDocumentResult.verificationDetails.warnings
                            .length === 0 &&
                          selectedDocumentResult.errors.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Nenhum aviso ou erro encontrado.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {selectedDocumentResult.verificationDetails.warnings.map(
                                (warning, index) => (
                                  <div
                                    key={index}
                                    className="text-sm text-yellow-600 dark:text-yellow-400 flex"
                                  >
                                    <FontAwesomeIcon
                                      icon={faExclamationTriangle}
                                      className="mr-1 mt-1 flex-shrink-0"
                                    />
                                    <span>{warning}</span>
                                  </div>
                                )
                              )}
                              {selectedDocumentResult.errors.map(
                                (error, index) => (
                                  <div
                                    key={index}
                                    className="text-sm text-red-600 dark:text-red-400 flex"
                                  >
                                    <FontAwesomeIcon
                                      icon={faTimesCircle}
                                      className="mr-1 mt-1 flex-shrink-0"
                                    />
                                    <span>{error}</span>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Dados extraídos */}
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-white mb-2">
                          Dados Extraídos
                        </h4>
                        {Object.keys(selectedDocumentResult.extractedData)
                          .length === 0 ? (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Nenhum dado extraído disponível.
                          </p>
                        ) : (
                          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {Object.entries(
                                selectedDocumentResult.extractedData
                              ).map(([key, value]) => (
                                <div key={key} className="text-sm">
                                  <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {key}:
                                  </span>{' '}
                                  <span className="text-gray-800 dark:text-white">
                                    {typeof value === 'string'
                                      ? value
                                      : JSON.stringify(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-gray-500 dark:text-gray-400">
                        Selecione um documento para ver detalhes
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Conteúdo da Tab - Comparação Facial */}
        {selectedFaceMatchId && (
          <div>
            {faceMatchResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FontAwesomeIcon icon={faUserCheck} className="text-4xl mb-2" />
                <p>Nenhuma comparação facial encontrada.</p>
                <button
                  onClick={handleRequestBatchAnalysis}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Iniciar Comparação Facial
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                {selectedFaceMatchResult && (
                  <>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                          Resultado da Comparação Facial
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Análise iniciada em{' '}
                          {formatDate(selectedFaceMatchResult.createdAt)}
                        </p>
                      </div>
                      <div>{renderStatus(selectedFaceMatchResult.status)}</div>
                    </div>

                    {/* Resultado da comparação */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-1">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex flex-col items-center">
                          <div
                            className={`text-5xl mb-2 ${
                              selectedFaceMatchResult.isMatch === true
                                ? 'text-green-500'
                                : selectedFaceMatchResult.isMatch === false
                                ? 'text-red-500'
                                : 'text-gray-400'
                            }`}
                          >
                            {selectedFaceMatchResult.isMatch === true ? (
                              <FontAwesomeIcon icon={faCheckCircle} />
                            ) : selectedFaceMatchResult.isMatch === false ? (
                              <FontAwesomeIcon icon={faTimesCircle} />
                            ) : (
                              <FontAwesomeIcon
                                icon={faSpinner}
                                className="animate-spin"
                              />
                            )}
                          </div>
                          <div className="text-xl font-bold text-center text-gray-800 dark:text-white mb-1">
                            {selectedFaceMatchResult.isMatch === true
                              ? 'Compatível'
                              : selectedFaceMatchResult.isMatch === false
                              ? 'Não Compatível'
                              : 'Processando...'}
                          </div>
                          <div className="text-center mb-4">
                            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                              {Math.round(selectedFaceMatchResult.score * 100)}%
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                              de confiança
                            </span>
                          </div>

                          <div className="w-full text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex justify-between py-1">
                              <span>Rosto detectado:</span>
                              <span>
                                {selectedFaceMatchResult.details
                                  .faceDetected ? (
                                  <FontAwesomeIcon
                                    icon={faCheckCircle}
                                    className="text-green-500"
                                  />
                                ) : (
                                  <FontAwesomeIcon
                                    icon={faTimesCircle}
                                    className="text-red-500"
                                  />
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span>Múltiplos rostos:</span>
                              <span>
                                {selectedFaceMatchResult.details
                                  .multipleFaces ? (
                                  <FontAwesomeIcon
                                    icon={faExclamationTriangle}
                                    className="text-red-500"
                                  />
                                ) : (
                                  <FontAwesomeIcon
                                    icon={faCheckCircle}
                                    className="text-green-500"
                                  />
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span>Prova de vida:</span>
                              <span className="font-medium">
                                {Math.round(
                                  selectedFaceMatchResult.details
                                    .livelinessScore * 100
                                )}
                                %
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        {/* Avisos e erros */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-white mb-2">
                            Avisos e Erros
                          </h4>
                          {selectedFaceMatchResult.details.warnings.length ===
                            0 && selectedFaceMatchResult.errors.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Nenhum aviso ou erro encontrado.
                            </p>
                          ) : (
                            <div className="space-y-2 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                              {selectedFaceMatchResult.details.warnings.map(
                                (warning, index) => (
                                  <div
                                    key={index}
                                    className="text-sm text-yellow-600 dark:text-yellow-400 flex"
                                  >
                                    <FontAwesomeIcon
                                      icon={faExclamationTriangle}
                                      className="mr-1 mt-1 flex-shrink-0"
                                    />
                                    <span>{warning}</span>
                                  </div>
                                )
                              )}
                              {selectedFaceMatchResult.errors.map(
                                (error, index) => (
                                  <div
                                    key={index}
                                    className="text-sm text-red-600 dark:text-red-400 flex"
                                  >
                                    <FontAwesomeIcon
                                      icon={faTimesCircle}
                                      className="mr-1 mt-1 flex-shrink-0"
                                    />
                                    <span>{error}</span>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>

                        {/* Informações dos documentos */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-white mb-2">
                              <FontAwesomeIcon
                                icon={faCamera}
                                className="mr-1"
                              />
                              Selfie
                            </h4>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              <div className="py-1">
                                <span className="font-medium">
                                  ID do Documento:
                                </span>{' '}
                                {selectedFaceMatchResult.selfieDocumentId}
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-white mb-2">
                              <FontAwesomeIcon
                                icon={faIdCard}
                                className="mr-1"
                              />
                              Documento de Identidade
                            </h4>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              <div className="py-1">
                                <span className="font-medium">
                                  ID do Documento:
                                </span>{' '}
                                {selectedFaceMatchResult.idDocumentId}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default DocumentVerificationPanel
