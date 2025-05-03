import React, { useState, useEffect, useCallback, memo } from 'react'
import { useWebSocket } from '../hooks/useWebSocket'
import OcrResultPreview from './OcrResultPreview'
import OptimizedImage from './OptimizedImage'
import ocrService from '../services/ocrService'

interface RealTimeOcrPreviewProps {
  documentId: number
  documentType: string
  documentUrl: string
}

/**
 * Componente que exibe um preview de documento com OCR em tempo real
 * usando WebSockets para receber atualizações do processamento
 */
const RealTimeOcrPreview: React.FC<RealTimeOcrPreviewProps> = memo(
  ({ documentId, documentType, documentUrl }) => {
    const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>(
      'connecting'
    )
    const [progress, setProgress] = useState(0)
    const [ocrComplete, setOcrComplete] = useState(false)
    const [retryWithPolling, setRetryWithPolling] = useState(false)

    // Obter URL base para WebSocket baseado na URL da API
    const getWebSocketUrl = () => {
      // Pegar API URL do ambiente ou usar valor padrão
      const apiUrl =
        (import.meta.env as any).VITE_API_URL || 'http://localhost:8000/api'

      // Converter HTTP para WS ou HTTPS para WSS
      const wsBase = apiUrl.replace(/^http/, 'ws').replace(/\/api\/?$/, '')

      return `${wsBase}/ws/ocr/${documentId}/`
    }

    // URL do WebSocket
    const socketUrl = getWebSocketUrl()

    // Handler para as mensagens do WebSocket
    const handleMessage = useCallback((event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)

        // Atualizar estado com base na mensagem recebida
        if (data.type === 'ocr_status') {
          setProgress(data.progress || 0)

          if (data.complete) {
            setOcrComplete(true)
          }
        }
      } catch (error) {
        console.error('Erro ao processar mensagem do WebSocket:', error)
      }
    }, [])

    // Conectar ao WebSocket
    const { sendMessage, isConnected, reconnectCount } = useWebSocket({
      url: socketUrl,
      onOpen: () => setStatus('connected'),
      onClose: () => setStatus('connecting'),
      onError: () => {
        setStatus('error')
        // Após 3 tentativas de reconexão, usar polling como fallback
        if (reconnectCount >= 3) {
          setRetryWithPolling(true)
        }
      },
      onMessage: handleMessage,
      reconnectAttempts: 3,
    })

    // Polling como fallback quando WebSocket falha
    useEffect(() => {
      let pollingInterval: number | null = null

      if (retryWithPolling && status === 'error') {
        // Iniciar polling a cada 2 segundos
        pollingInterval = window.setInterval(async () => {
          try {
            const result = await ocrService.checkOcrStatus(documentId)
            setProgress(result.progress || 0)

            if (result.complete) {
              setOcrComplete(true)
              // Limpar intervalo quando estiver completo
              if (pollingInterval) {
                clearInterval(pollingInterval)
              }
            }
          } catch (error) {
            console.error('Erro no polling de status:', error)
          }
        }, 2000)
      }

      return () => {
        if (pollingInterval) {
          clearInterval(pollingInterval)
        }
      }
    }, [retryWithPolling, status, documentId])

    // Solicitar status inicial ao conectar
    useEffect(() => {
      if (isConnected) {
        sendMessage(
          JSON.stringify({
            action: 'get_status',
            document_id: documentId,
          })
        )
      }
    }, [isConnected, documentId, sendMessage])

    // Texto para descrever o progresso para leitores de tela
    const getProgressDescription = () => {
      if (progress < 30) {
        return (
          'Preparando documento para análise. Progresso em ' +
          progress +
          ' por cento.'
        )
      } else if (progress >= 30 && progress < 60) {
        return (
          'Processando texto e dados do documento. Progresso em ' +
          progress +
          ' por cento.'
        )
      } else if (progress >= 60 && progress < 90) {
        return (
          'Validando informações extraídas. Progresso em ' +
          progress +
          ' por cento.'
        )
      } else if (progress >= 90 && progress < 100) {
        return (
          'Finalizando e verificando resultados. Progresso em ' +
          progress +
          ' por cento.'
        )
      } else {
        return 'Processamento OCR completo com 100 por cento de conclusão.'
      }
    }

    // Renderizar status de conexão
    const renderConnectionStatus = () => {
      switch (status) {
        case 'connecting':
          return (
            <div
              className="text-sm text-amber-600 dark:text-amber-400 flex items-center"
              role="status"
              aria-live="polite"
            >
              <div
                className="mr-2 w-2 h-2 rounded-full bg-amber-500 animate-pulse"
                aria-hidden="true"
              ></div>
              Conectando ao servidor em tempo real...
            </div>
          )
        case 'error':
          return (
            <div
              className="text-sm text-red-600 dark:text-red-400 flex items-center"
              role="alert"
            >
              <div
                className="mr-2 w-2 h-2 rounded-full bg-red-500"
                aria-hidden="true"
              ></div>
              {retryWithPolling
                ? 'Usando atualizações periódicas (modo offline)'
                : 'Erro ao conectar. Tentando reconectar...'}
            </div>
          )
        default:
          return (
            <div
              className="text-sm text-green-600 dark:text-green-400 flex items-center"
              role="status"
              aria-live="polite"
            >
              <div
                className="mr-2 w-2 h-2 rounded-full bg-green-500"
                aria-hidden="true"
              ></div>
              Conectado em tempo real
            </div>
          )
      }
    }

    return (
      <div
        className="border rounded-lg p-4 bg-white dark:bg-gray-800"
        role="region"
        aria-label="Preview de processamento OCR do documento"
      >
        <div className="flex justify-between items-start mb-3">
          <h3
            className="font-medium text-gray-900 dark:text-white"
            id="ocr-preview-heading"
          >
            Processamento de Documento
          </h3>
          {renderConnectionStatus()}
        </div>

        <div className="flex flex-col md:flex-row md:space-x-4">
          {/* Preview da imagem */}
          <div className="w-full md:w-1/2 mb-4 md:mb-0">
            <OptimizedImage
              src={documentUrl}
              alt={`Documento do tipo ${documentType} - Prévia da imagem que está sendo processada`}
              className="rounded-md"
              objectFit="contain"
              height={250}
            />
          </div>

          {/* Barra de progresso e informações */}
          <div className="w-full md:w-1/2">
            <div className="mb-4">
              <div
                className="flex justify-between text-sm mb-1"
                aria-hidden="true"
              >
                <span className="text-gray-700 dark:text-gray-300">
                  Progresso do processamento OCR
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {progress}%
                </span>
              </div>
              <div
                className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-labelledby="ocr-progress-text"
              >
                <div
                  className="bg-celebra-blue h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="sr-only" id="ocr-progress-text">
                {getProgressDescription()}
              </div>
            </div>

            {/* Status detalhado */}
            <div
              className="text-sm text-gray-600 dark:text-gray-400 mb-4"
              aria-live="polite"
            >
              {progress < 30 && <p>Preparando documento para análise...</p>}
              {progress >= 30 && progress < 60 && (
                <p>Processando texto e dados do documento...</p>
              )}
              {progress >= 60 && progress < 90 && (
                <p>Validando informações extraídas...</p>
              )}
              {progress >= 90 && progress < 100 && (
                <p>Finalizando e verificando resultados...</p>
              )}
              {progress === 100 && (
                <p className="text-green-600 dark:text-green-400">
                  Processamento concluído com sucesso!
                </p>
              )}
            </div>

            {/* Exibir resultados quando o OCR estiver completo */}
            {ocrComplete && (
              <OcrResultPreview
                documentId={documentId}
                documentType={documentType}
              />
            )}

            {/* Aviso de acessibilidade para usuários de leitores de tela */}
            <div className="sr-only" aria-live="polite">
              {ocrComplete
                ? 'O processamento OCR foi concluído. Os resultados estão disponíveis para revisão.'
                : 'O documento está sendo processado. Por favor, aguarde.'}
            </div>
          </div>
        </div>
      </div>
    )
  }
)

export default RealTimeOcrPreview
