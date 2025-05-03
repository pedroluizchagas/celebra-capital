import { useState, useEffect, useCallback, useRef } from 'react'

interface WebSocketOptions {
  url: string
  reconnectAttempts?: number
  reconnectInterval?: number
  onOpen?: (event: Event) => void
  onClose?: (event: CloseEvent) => void
  onMessage?: (event: MessageEvent) => void
  onError?: (event: Event) => void
}

interface WebSocketState {
  socket: WebSocket | null
  isConnected: boolean
  isConnecting: boolean
  reconnectCount: number
}

/**
 * Hook customizado para gerenciar conexões WebSocket com reconexão automática
 * @param options Opções de configuração do WebSocket
 */
export function useWebSocket({
  url,
  reconnectAttempts = 5,
  reconnectInterval = 3000,
  onOpen,
  onClose,
  onMessage,
  onError,
}: WebSocketOptions) {
  const [state, setState] = useState<WebSocketState>({
    socket: null,
    isConnected: false,
    isConnecting: false,
    reconnectCount: 0,
  })

  // Ref para a instância WebSocket para evitar problemas com closure em useEffect
  const socketRef = useRef<WebSocket | null>(null)

  // Ref para as callbacks para evitar problemas de re-render
  const callbacksRef = useRef({ onOpen, onClose, onMessage, onError })

  // Atualizar callbacks quando mudarem
  useEffect(() => {
    callbacksRef.current = { onOpen, onClose, onMessage, onError }
  }, [onOpen, onClose, onMessage, onError])

  // Função para conectar o WebSocket
  const connect = useCallback(() => {
    if (!url) return

    // Limpar socket existente
    if (socketRef.current) {
      socketRef.current.close()
    }

    // Atualizar estado para "conectando"
    setState((prev) => ({
      ...prev,
      isConnecting: true,
    }))

    try {
      // Criar nova conexão WebSocket
      const ws = new WebSocket(url)
      socketRef.current = ws

      // Configurar handlers de eventos
      ws.onopen = (event) => {
        setState((prev) => ({
          ...prev,
          socket: ws,
          isConnected: true,
          isConnecting: false,
          reconnectCount: 0,
        }))

        if (callbacksRef.current.onOpen) {
          callbacksRef.current.onOpen(event)
        }
      }

      ws.onclose = (event) => {
        // Verificar se deve tentar reconectar
        const shouldReconnect =
          !event.wasClean && state.reconnectCount < reconnectAttempts

        setState((prev) => ({
          ...prev,
          socket: null,
          isConnected: false,
          isConnecting: shouldReconnect,
          reconnectCount: shouldReconnect
            ? prev.reconnectCount + 1
            : prev.reconnectCount,
        }))

        if (callbacksRef.current.onClose) {
          callbacksRef.current.onClose(event)
        }

        // Tentar reconectar após o intervalo
        if (shouldReconnect) {
          setTimeout(connect, reconnectInterval)
        }
      }

      ws.onmessage = (event) => {
        if (callbacksRef.current.onMessage) {
          callbacksRef.current.onMessage(event)
        }
      }

      ws.onerror = (event) => {
        if (callbacksRef.current.onError) {
          callbacksRef.current.onError(event)
        }
      }
    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error)
      setState((prev) => ({
        ...prev,
        socket: null,
        isConnected: false,
        isConnecting: false,
      }))
    }
  }, [url, reconnectAttempts, reconnectInterval, state.reconnectCount])

  // Função para enviar mensagens
  const sendMessage = useCallback(
    (message: string | ArrayBufferLike | Blob | ArrayBufferView) => {
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        socketRef.current.send(message)
        return true
      }
      return false
    },
    []
  )

  // Conectar quando o componente montar ou a URL mudar
  useEffect(() => {
    connect()

    // Limpar na desmontagem
    return () => {
      if (socketRef.current) {
        socketRef.current.close()
        socketRef.current = null
      }
    }
  }, [connect])

  return {
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    reconnectCount: state.reconnectCount,
    sendMessage,
  }
}
