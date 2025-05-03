/**
 * Gerenciador de Sincronização em Segundo Plano para o PWA da Celebra Capital
 * Gerencia a sincronização de dados quando o dispositivo está offline
 */

class BackgroundSyncManager {
  constructor() {
    // Configurações
    this.config = {
      dbName: 'celebra-sync-db',
      dbVersion: 1,
      syncTag: 'sync-proposals',
      proposalStore: 'proposals',
      formDataStore: 'form-data',
      maxRetries: 5,
      retryInterval: 60000, // 1 minuto
      debugMode: false,
    }

    // Referência do banco de dados
    this.db = null

    // Inicializar
    this.init()
  }

  /**
   * Inicializar o gerenciador
   */
  async init() {
    // Verificar suporte para background sync
    if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
      console.warn('[Background Sync] API de sincronização não suportada')
      return
    }

    try {
      // Inicializar banco de dados
      await this.openDatabase()

      // Ouvir eventos de status de rede
      this.setupNetworkListeners()

      if (this.config.debugMode) {
        console.log('[Background Sync] Inicializado com sucesso')
      }
    } catch (error) {
      console.error('[Background Sync] Erro ao inicializar:', error)
    }
  }

  /**
   * Abrir e inicializar o banco de dados IndexedDB
   */
  openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.dbVersion)

      request.onerror = (event) => {
        console.error(
          '[Background Sync] Erro ao abrir banco de dados:',
          event.target.error
        )
        reject(event.target.error)
      }

      request.onsuccess = (event) => {
        this.db = event.target.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // Criar object stores para dados que precisam ser sincronizados
        if (!db.objectStoreNames.contains(this.config.proposalStore)) {
          db.createObjectStore(this.config.proposalStore, { keyPath: 'id' })
        }

        if (!db.objectStoreNames.contains(this.config.formDataStore)) {
          db.createObjectStore(this.config.formDataStore, { keyPath: 'id' })
        }
      }
    })
  }

  /**
   * Configurar ouvintes de eventos de rede
   */
  setupNetworkListeners() {
    // Quando o dispositivo ficar online, tentar sincronizar
    window.addEventListener('online', () => {
      this.triggerSync()
    })

    // Opcionalmente configurar temporizador para verificar periodicamente
    setInterval(() => {
      if (navigator.onLine) {
        this.checkPendingSyncItems()
      }
    }, this.config.retryInterval)
  }

  /**
   * Salvar uma proposta para sincronização posterior
   */
  async saveProposalForSync(proposal) {
    if (!this.db) {
      await this.openDatabase()
    }

    // Gerar ID único se não tiver um
    if (!proposal.id) {
      proposal.id = `local_${Date.now()}_${Math.floor(Math.random() * 1000000)}`
    }

    // Adicionar metadata de sincronização
    proposal.syncMetadata = {
      createdAt: new Date().toISOString(),
      attempts: 0,
      status: 'pending',
      deviceId: this.getDeviceId(),
    }

    try {
      // Salvar no banco de dados local
      await this.saveToStore(this.config.proposalStore, proposal)

      // Tentar acionar sincronização em segundo plano
      this.triggerSync()

      return proposal.id
    } catch (error) {
      console.error('[Background Sync] Erro ao salvar proposta:', error)
      throw error
    }
  }

  /**
   * Salvar dados de formulário para sincronização posterior
   */
  async saveFormDataForSync(formData) {
    if (!this.db) {
      await this.openDatabase()
    }

    // Gerar ID único se não tiver um
    if (!formData.id) {
      formData.id = `form_${Date.now()}_${Math.floor(Math.random() * 1000000)}`
    }

    // Adicionar metadata de sincronização
    formData.syncMetadata = {
      createdAt: new Date().toISOString(),
      attempts: 0,
      status: 'pending',
      deviceId: this.getDeviceId(),
    }

    try {
      // Salvar no banco de dados local
      await this.saveToStore(this.config.formDataStore, formData)

      // Tentar acionar sincronização em segundo plano
      this.triggerSync()

      return formData.id
    } catch (error) {
      console.error(
        '[Background Sync] Erro ao salvar dados de formulário:',
        error
      )
      throw error
    }
  }

  /**
   * Salvar item em uma store
   */
  saveToStore(storeName, item) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(item)

      request.onsuccess = () => resolve(request.result)
      request.onerror = (event) => reject(event.target.error)
    })
  }

  /**
   * Obter item de uma store
   */
  getFromStore(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result)
      request.onerror = (event) => reject(event.target.error)
    })
  }

  /**
   * Obter todos os itens de uma store
   */
  getAllFromStore(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = (event) => reject(event.target.error)
    })
  }

  /**
   * Remover item de uma store
   */
  removeFromStore(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = (event) => reject(event.target.error)
    })
  }

  /**
   * Obter ID único para o dispositivo (usado para evitar duplicações)
   */
  getDeviceId() {
    let deviceId = localStorage.getItem('celebra-device-id')

    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.floor(Math.random() * 1000000)}`
      localStorage.setItem('celebra-device-id', deviceId)
    }

    return deviceId
  }

  /**
   * Acionar sincronização em segundo plano
   */
  async triggerSync() {
    if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
      // Fallback para sincronização imediata se a API não for suportada
      this.syncDataManually()
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready
      await registration.sync.register(this.config.syncTag)

      if (this.config.debugMode) {
        console.log('[Background Sync] Sincronização agendada')
      }
    } catch (error) {
      console.error('[Background Sync] Erro ao agendar sincronização:', error)

      // Fallback para sincronização imediata
      this.syncDataManually()
    }
  }

  /**
   * Verificar itens pendentes de sincronização
   */
  async checkPendingSyncItems() {
    if (!navigator.onLine) return

    try {
      // Verificar propostas pendentes
      const pendingProposals = await this.getAllFromStore(
        this.config.proposalStore
      )

      if (pendingProposals.length > 0) {
        if (this.config.debugMode) {
          console.log(
            `[Background Sync] ${pendingProposals.length} propostas pendentes de sincronização`
          )
        }

        this.triggerSync()
      }

      // Verificar dados de formulário pendentes
      const pendingFormData = await this.getAllFromStore(
        this.config.formDataStore
      )

      if (pendingFormData.length > 0) {
        if (this.config.debugMode) {
          console.log(
            `[Background Sync] ${pendingFormData.length} formulários pendentes de sincronização`
          )
        }

        this.triggerSync()
      }
    } catch (error) {
      console.error(
        '[Background Sync] Erro ao verificar itens pendentes:',
        error
      )
    }
  }

  /**
   * Sincronizar dados manualmente (fallback quando a API Background Sync não é suportada)
   */
  async syncDataManually() {
    if (!navigator.onLine) return

    try {
      // Sincronizar propostas
      await this.syncProposals()

      // Sincronizar dados de formulário
      await this.syncFormData()
    } catch (error) {
      console.error('[Background Sync] Erro na sincronização manual:', error)
    }
  }

  /**
   * Sincronizar propostas pendentes
   */
  async syncProposals() {
    if (!navigator.onLine) return

    try {
      const proposals = await this.getAllFromStore(this.config.proposalStore)

      if (proposals.length === 0) return

      if (this.config.debugMode) {
        console.log(
          `[Background Sync] Sincronizando ${proposals.length} propostas`
        )
      }

      // Processar cada proposta
      for (const proposal of proposals) {
        try {
          // Verificar número de tentativas
          if (proposal.syncMetadata.attempts >= this.config.maxRetries) {
            console.warn(
              `[Background Sync] Proposta ${proposal.id} excedeu o número máximo de tentativas`
            )
            continue
          }

          // Incrementar contador de tentativas
          proposal.syncMetadata.attempts++
          proposal.syncMetadata.lastAttempt = new Date().toISOString()
          await this.saveToStore(this.config.proposalStore, proposal)

          // Enviar para o servidor
          const response = await fetch('/api/proposals', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Sync-ID': proposal.id,
              'X-Device-ID': this.getDeviceId(),
            },
            body: JSON.stringify(proposal),
          })

          if (response.ok) {
            // Remover do banco local após sincronização bem-sucedida
            await this.removeFromStore(this.config.proposalStore, proposal.id)

            if (this.config.debugMode) {
              console.log(
                `[Background Sync] Proposta ${proposal.id} sincronizada com sucesso`
              )
            }

            // Disparar evento personalizado
            this.dispatchSyncEvent('proposal-synced', {
              id: proposal.id,
              success: true,
              data: proposal,
            })
          } else {
            const errorData = await response.json().catch(() => ({}))
            console.error(
              `[Background Sync] Erro ao sincronizar proposta ${proposal.id}:`,
              response.status,
              errorData
            )

            proposal.syncMetadata.lastError = {
              status: response.status,
              message: errorData.message || 'Erro desconhecido',
              timestamp: new Date().toISOString(),
            }

            await this.saveToStore(this.config.proposalStore, proposal)

            // Disparar evento personalizado
            this.dispatchSyncEvent('proposal-sync-failed', {
              id: proposal.id,
              success: false,
              error: proposal.syncMetadata.lastError,
            })
          }
        } catch (error) {
          console.error(
            `[Background Sync] Erro ao processar proposta ${proposal.id}:`,
            error
          )
        }
      }
    } catch (error) {
      console.error('[Background Sync] Erro ao sincronizar propostas:', error)
    }
  }

  /**
   * Sincronizar dados de formulário pendentes
   */
  async syncFormData() {
    if (!navigator.onLine) return

    try {
      const formDataItems = await this.getAllFromStore(
        this.config.formDataStore
      )

      if (formDataItems.length === 0) return

      if (this.config.debugMode) {
        console.log(
          `[Background Sync] Sincronizando ${formDataItems.length} formulários`
        )
      }

      // Processar cada item
      for (const formData of formDataItems) {
        try {
          // Verificar número de tentativas
          if (formData.syncMetadata.attempts >= this.config.maxRetries) {
            console.warn(
              `[Background Sync] Formulário ${formData.id} excedeu o número máximo de tentativas`
            )
            continue
          }

          // Incrementar contador de tentativas
          formData.syncMetadata.attempts++
          formData.syncMetadata.lastAttempt = new Date().toISOString()
          await this.saveToStore(this.config.formDataStore, formData)

          // Enviar para o servidor
          const endpoint = formData.endpoint || '/api/form-data'
          const response = await fetch(endpoint, {
            method: formData.method || 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Sync-ID': formData.id,
              'X-Device-ID': this.getDeviceId(),
              ...formData.headers,
            },
            body: JSON.stringify(formData.data),
          })

          if (response.ok) {
            // Remover do banco local após sincronização bem-sucedida
            await this.removeFromStore(this.config.formDataStore, formData.id)

            if (this.config.debugMode) {
              console.log(
                `[Background Sync] Formulário ${formData.id} sincronizado com sucesso`
              )
            }

            // Disparar evento personalizado
            this.dispatchSyncEvent('form-synced', {
              id: formData.id,
              success: true,
              data: formData,
            })
          } else {
            const errorData = await response.json().catch(() => ({}))
            console.error(
              `[Background Sync] Erro ao sincronizar formulário ${formData.id}:`,
              response.status,
              errorData
            )

            formData.syncMetadata.lastError = {
              status: response.status,
              message: errorData.message || 'Erro desconhecido',
              timestamp: new Date().toISOString(),
            }

            await this.saveToStore(this.config.formDataStore, formData)

            // Disparar evento personalizado
            this.dispatchSyncEvent('form-sync-failed', {
              id: formData.id,
              success: false,
              error: formData.syncMetadata.lastError,
            })
          }
        } catch (error) {
          console.error(
            `[Background Sync] Erro ao processar formulário ${formData.id}:`,
            error
          )
        }
      }
    } catch (error) {
      console.error('[Background Sync] Erro ao sincronizar formulários:', error)
    }
  }

  /**
   * Disparar evento personalizado
   */
  dispatchSyncEvent(type, detail) {
    const event = new CustomEvent(`sync:${type}`, { detail })
    window.dispatchEvent(event)
  }

  /**
   * Obter status de sincronização
   */
  async getSyncStatus() {
    try {
      const proposals = await this.getAllFromStore(this.config.proposalStore)
      const formData = await this.getAllFromStore(this.config.formDataStore)

      return {
        pendingProposals: proposals.length,
        pendingFormData: formData.length,
        lastSync: localStorage.getItem('celebra-last-sync') || null,
        isOnline: navigator.onLine,
        supportsBackgroundSync: 'SyncManager' in window,
      }
    } catch (error) {
      console.error(
        '[Background Sync] Erro ao obter status de sincronização:',
        error
      )
      return {
        error: true,
        isOnline: navigator.onLine,
        supportsBackgroundSync: 'SyncManager' in window,
      }
    }
  }

  /**
   * Registrar timestamp da última sincronização bem-sucedida
   */
  recordSyncSuccess() {
    const timestamp = new Date().toISOString()
    localStorage.setItem('celebra-last-sync', timestamp)
    return timestamp
  }
}

// Criar e exportar uma instância global
window.BackgroundSyncManager = new BackgroundSyncManager()
