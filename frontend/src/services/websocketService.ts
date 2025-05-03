import { EventEmitter } from 'events'

interface WebSocketMessage {
  type: string
  [key: string]: any
}

class WebSocketService {
  private socket: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout: NodeJS.Timeout | null = null
  private reconnectInterval = 3000 // ms
  private isConnecting = false
  private events = new EventEmitter()
  private userId: string | null = null

  // Inicializar conexão com WebSocket
  connect(userId: string): Promise<boolean> {
    if (this.isConnecting) {
      return Promise.resolve(false)
    }

    this.userId = userId
    this.isConnecting = true

    return new Promise((resolve) => {
      // Fechar conexão existente se houver
      this.closeConnection()

      // Determinar URL do WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const host = process.env.REACT_APP_WS_URL || window.location.host
      const wsUrl = `${protocol}//${host}/ws/notifications/${userId}/`

      this.socket = new WebSocket(wsUrl)

      this.socket.onopen = () => {
        console.log('Conexão WebSocket estabelecida')
        this.isConnecting = false
        this.reconnectAttempts = 0
        resolve(true)
        this.events.emit('connected')
      }

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketMessage
          this.handleMessage(data)
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error)
        }
      }

      this.socket.onclose = (event) => {
        this.isConnecting = false
        console.log(`Conexão WebSocket fechada: ${event.code} ${event.reason}`)
        this.events.emit('disconnected')

        // Tentar reconectar se não foi fechada explicitamente
        if (!event.wasClean) {
          this.scheduleReconnect()
        }
      }

      this.socket.onerror = (error) => {
        console.error('Erro na conexão WebSocket:', error)
        this.isConnecting = false
      }
    })
  }

  // Lidar com mensagens recebidas
  private handleMessage(message: WebSocketMessage): void {
    // Emitir evento com base no tipo de mensagem
    this.events.emit(message.type, message)

    // Evento genérico para qualquer mensagem
    this.events.emit('message', message)
  }

  // Agendar tentativa de reconexão
  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts && this.userId) {
      console.log(
        `Tentativa de reconexão ${this.reconnectAttempts + 1} de ${
          this.maxReconnectAttempts
        }...`
      )

      this.reconnectTimeout = setTimeout(() => {
        this.reconnectAttempts++
        this.connect(this.userId!)
      }, this.reconnectInterval)
    } else {
      console.error('Número máximo de tentativas de reconexão atingido')
      this.events.emit('reconnect_failed')
    }
  }

  // Fechar conexão
  closeConnection(): void {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
  }

  // Enviar mensagem para o servidor
  sendMessage(message: any): boolean {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message))
      return true
    }
    return false
  }

  // Registrar handlers de eventos
  on(event: string, callback: (...args: any[]) => void): void {
    this.events.on(event, callback)
  }

  // Remover handlers de eventos
  off(event: string, callback: (...args: any[]) => void): void {
    this.events.off(event, callback)
  }

  // Verificar se está conectado
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN
  }
}

// Instância singleton
const websocketService = new WebSocketService()

export default websocketService
