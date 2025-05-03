import React, { useState, useEffect, useMemo, useCallback, memo } from 'react'
import ocrService from '../services/ocrService'

interface OcrResultPreviewProps {
  documentId: number
  documentType: string
}

interface ExtractedField {
  label: string
  key: string
}

const OcrResultPreview: React.FC<OcrResultPreviewProps> = memo(
  ({ documentId, documentType }) => {
    const [isLoading, setIsLoading] = useState(true)
    const [ocrData, setOcrData] = useState<Record<string, any> | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [progress, setProgress] = useState(0)
    const [retryCount, setRetryCount] = useState(0)
    const MAX_RETRIES = 3

    // Definir campos a serem extraídos com base no tipo de documento
    const fieldsToExtract: Record<string, ExtractedField[]> = useMemo(
      () => ({
        rg: [
          { label: 'Nome', key: 'nome' },
          { label: 'RG', key: 'rg' },
          { label: 'Data de Nascimento', key: 'data_nascimento' },
        ],
        cpf: [
          { label: 'Nome', key: 'nome' },
          { label: 'CPF', key: 'cpf' },
        ],
        proof_income: [
          { label: 'Valor', key: 'valor' },
          { label: 'Data', key: 'data' },
          { label: 'Órgão/Empresa', key: 'orgao' },
        ],
        address_proof: [
          { label: 'Endereço', key: 'endereco' },
          { label: 'CEP', key: 'cep' },
          { label: 'Cidade/UF', key: 'cidade_uf' },
        ],
      }),
      []
    )

    const loadOcrResult = useCallback(async () => {
      try {
        const result = await ocrService.getOcrResult(documentId)

        if (result.ocr_complete) {
          setOcrData(result.extracted_data)
          setIsProcessing(false)
          // Resetar contagem de retry em caso de sucesso
          setRetryCount(0)
        } else {
          setIsProcessing(true)
          // Se ainda não concluído, verificar novamente em 2 segundos
          setTimeout(checkOcrStatus, 2000)
        }
      } catch (error) {
        console.error('Erro ao carregar resultado do OCR:', error)
        setError('Não foi possível carregar o resultado do OCR.')

        // Tentar novamente se não excedeu o limite de tentativas
        if (retryCount < MAX_RETRIES) {
          setRetryCount((prev) => prev + 1)
          setTimeout(loadOcrResult, 3000 * retryCount) // Espera mais tempo a cada tentativa
        }
      } finally {
        setIsLoading(false)
      }
    }, [documentId, retryCount])

    const checkOcrStatus = useCallback(async () => {
      try {
        // Limpar o cache para garantir dados atualizados
        if (retryCount > 0) {
          ocrService.clearCache(documentId)
        }

        const statusResult = await ocrService.checkOcrStatus(documentId)

        if (statusResult.complete) {
          loadOcrResult()
        } else {
          setIsProcessing(true)
          setProgress(statusResult.progress || 0)

          // Se ainda estiver processando, verificar novamente em 2 segundos
          setTimeout(checkOcrStatus, 2000)
        }
      } catch (error) {
        console.error('Erro ao verificar status do OCR:', error)

        // Tentar novamente se não excedeu o limite de tentativas
        if (retryCount < MAX_RETRIES) {
          setRetryCount((prev) => prev + 1)
          setError(
            `Verificando status (tentativa ${
              retryCount + 1
            } de ${MAX_RETRIES})...`
          )
          setTimeout(checkOcrStatus, 3000 * retryCount)
        } else {
          setError(
            'Não foi possível verificar o status do processamento OCR após várias tentativas.'
          )
        }

        setIsLoading(false)
      }
    }, [documentId, loadOcrResult, retryCount])

    useEffect(() => {
      checkOcrStatus()

      return () => {
        // Limpar o cache ao desmontar
        ocrService.clearCache(documentId)
      }
    }, [checkOcrStatus, documentId])

    // Verificar se há campos para o tipo de documento
    const documentFields = useMemo(
      () => fieldsToExtract[documentType] || [],
      [fieldsToExtract, documentType]
    )

    // Componentes de carregamento
    const loadingComponent = useMemo(
      () => (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
          <div className="flex items-center">
            <div className="mr-3 animate-spin rounded-full h-4 w-4 border-b-2 border-celebra-blue"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Carregando resultados...
            </p>
          </div>
        </div>
      ),
      []
    )

    // Componente de processamento
    const processingComponent = useMemo(
      () => (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Processando documento...
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-celebra-blue h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          {retryCount > 0 && (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
              Reconectando (tentativa {retryCount} de {MAX_RETRIES})
            </p>
          )}
        </div>
      ),
      [progress, retryCount]
    )

    // Componente de erro
    const errorComponent = useMemo(
      () =>
        error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            {retryCount < MAX_RETRIES && (
              <button
                onClick={() => {
                  setIsLoading(true)
                  setError(null)
                  checkOcrStatus()
                }}
                className="mt-2 text-xs text-white bg-red-600 hover:bg-red-700 rounded px-2 py-1"
              >
                Tentar Novamente
              </button>
            )}
          </div>
        ),
      [error, retryCount, checkOcrStatus]
    )

    // Componente para quando não há dados de OCR
    const noDataComponent = useMemo(
      () => (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            Não foi possível extrair informações do documento.
          </p>
          <button
            onClick={() => {
              setIsLoading(true)
              ocrService.clearCache(documentId)
              checkOcrStatus()
            }}
            className="mt-2 text-xs text-white bg-yellow-600 hover:bg-yellow-700 rounded px-2 py-1"
          >
            Tentar Novamente
          </button>
        </div>
      ),
      [checkOcrStatus, documentId]
    )

    // Renderização dos resultados do OCR
    const resultComponent = useMemo(() => {
      if (!ocrData) return null

      return (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
          <h4 className="text-sm font-medium text-green-700 dark:text-green-500 mb-2">
            Informações extraídas:
          </h4>
          <div className="space-y-1">
            {documentFields.map((field) => (
              <div key={field.key} className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {field.label}:
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-300">
                  {ocrData[field.key] || 'Não detectado'}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Verifique se as informações estão corretas. Em caso de erros, você
            pode fazer o upload novamente.
          </p>
        </div>
      )
    }, [ocrData, documentFields])

    if (isLoading) {
      return loadingComponent
    }

    if (isProcessing) {
      return processingComponent
    }

    if (error) {
      return errorComponent
    }

    if (!ocrData) {
      return noDataComponent
    }

    return resultComponent
  }
)

export default OcrResultPreview
