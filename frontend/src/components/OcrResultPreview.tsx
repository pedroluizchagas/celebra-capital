import React, { useState, useEffect } from 'react'
import ocrService from '../services/ocrService'

interface OcrResultPreviewProps {
  documentId: number
  documentType: string
}

interface ExtractedField {
  label: string
  key: string
}

const OcrResultPreview: React.FC<OcrResultPreviewProps> = ({
  documentId,
  documentType,
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [ocrData, setOcrData] = useState<Record<string, any> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  // Definir campos a serem extraídos com base no tipo de documento
  const fieldsToExtract: Record<string, ExtractedField[]> = {
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
  }

  useEffect(() => {
    const checkOcrStatus = async () => {
      try {
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
        setError('Não foi possível verificar o status do processamento OCR.')
        setIsLoading(false)
      }
    }

    const loadOcrResult = async () => {
      try {
        const result = await ocrService.getOcrResult(documentId)

        if (result.ocr_complete) {
          setOcrData(result.extracted_data)
          setIsProcessing(false)
        } else {
          setIsProcessing(true)
          // Se ainda não concluído, verificar novamente em 2 segundos
          setTimeout(checkOcrStatus, 2000)
        }
      } catch (error) {
        console.error('Erro ao carregar resultado do OCR:', error)
        setError('Não foi possível carregar o resultado do OCR.')
      } finally {
        setIsLoading(false)
      }
    }

    checkOcrStatus()
  }, [documentId])

  // Verificar se há campos para o tipo de documento
  const documentFields = fieldsToExtract[documentType] || []

  if (isLoading) {
    return (
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
        <div className="flex items-center">
          <div className="mr-3 animate-spin rounded-full h-4 w-4 border-b-2 border-celebra-blue"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Carregando resultados...
          </p>
        </div>
      </div>
    )
  }

  if (isProcessing) {
    return (
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Processando documento...
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-celebra-blue h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    )
  }

  if (!ocrData) {
    return (
      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
        <p className="text-sm text-yellow-600 dark:text-yellow-400">
          Não foi possível extrair informações do documento.
        </p>
      </div>
    )
  }

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
        Verifique se as informações estão corretas. Em caso de erros, você pode
        fazer o upload novamente.
      </p>
    </div>
  )
}

export default OcrResultPreview
