/**
 * Serviço para gerenciar armazenamento offline utilizando IndexedDB
 * Permite que a aplicação funcione em modo offline armazenando dados importantes
 */

// Nome do banco e versão
const DB_NAME = 'celebra-offline-db'
const DB_VERSION = 1

// Nomes de stores
const STORE = {
  PROPOSALS: 'proposals',
  USER_DATA: 'userData',
  FORM_DATA: 'formData',
  PENDING_ACTIONS: 'pendingActions',
}

/**
 * Inicializa o banco de dados IndexedDB
 */
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Propostas
      if (!db.objectStoreNames.contains(STORE.PROPOSALS)) {
        const proposalsStore = db.createObjectStore(STORE.PROPOSALS, {
          keyPath: 'id',
        })
        proposalsStore.createIndex('userId', 'user.id', { unique: false })
        proposalsStore.createIndex('status', 'status', { unique: false })
        proposalsStore.createIndex('updatedAt', 'updated_at', { unique: false })
      }

      // Dados do usuário
      if (!db.objectStoreNames.contains(STORE.USER_DATA)) {
        db.createObjectStore(STORE.USER_DATA, { keyPath: 'id' })
      }

      // Dados de formulários
      if (!db.objectStoreNames.contains(STORE.FORM_DATA)) {
        const formStore = db.createObjectStore(STORE.FORM_DATA, {
          keyPath: 'id',
          autoIncrement: true,
        })
        formStore.createIndex('type', 'type', { unique: false })
        formStore.createIndex('timestamp', 'timestamp', { unique: false })
      }

      // Ações pendentes para sincronização
      if (!db.objectStoreNames.contains(STORE.PENDING_ACTIONS)) {
        const actionStore = db.createObjectStore(STORE.PENDING_ACTIONS, {
          keyPath: 'id',
          autoIncrement: true,
        })
        actionStore.createIndex('type', 'type', { unique: false })
        actionStore.createIndex('timestamp', 'timestamp', { unique: false })
        actionStore.createIndex('status', 'status', { unique: false })
      }
    }

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      resolve(db)
    }

    request.onerror = (event) => {
      console.error('Erro ao abrir o banco IndexedDB:', event)
      reject((event.target as IDBOpenDBRequest).error)
    }
  })
}

/**
 * Armazena uma proposta no banco offline
 */
export const saveProposal = async (proposal: any): Promise<void> => {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE.PROPOSALS], 'readwrite')
      const store = transaction.objectStore(STORE.PROPOSALS)

      // Adicionar timestamp para tracking offline
      const proposalWithTimestamp = {
        ...proposal,
        _offlineTimestamp: Date.now(),
        _offlineSync: false,
      }

      const request = store.put(proposalWithTimestamp)

      request.onsuccess = () => resolve()
      request.onerror = (event) => reject((event.target as IDBRequest).error)

      transaction.oncomplete = () => db.close()
    })
  } catch (error) {
    console.error('Erro ao salvar proposta offline:', error)
    throw error
  }
}

/**
 * Recupera todas as propostas armazenadas offline
 */
export const getProposals = async (): Promise<any[]> => {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE.PROPOSALS], 'readonly')
      const store = transaction.objectStore(STORE.PROPOSALS)
      const request = store.getAll()

      request.onsuccess = (event) => {
        resolve((event.target as IDBRequest).result)
      }

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error)
      }

      transaction.oncomplete = () => db.close()
    })
  } catch (error) {
    console.error('Erro ao recuperar propostas offline:', error)
    return []
  }
}

/**
 * Recupera uma proposta específica
 */
export const getProposal = async (id: number): Promise<any | null> => {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE.PROPOSALS], 'readonly')
      const store = transaction.objectStore(STORE.PROPOSALS)
      const request = store.get(id)

      request.onsuccess = (event) => {
        resolve((event.target as IDBRequest).result || null)
      }

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error)
      }

      transaction.oncomplete = () => db.close()
    })
  } catch (error) {
    console.error(`Erro ao recuperar proposta ${id} offline:`, error)
    return null
  }
}

/**
 * Salva dados do formulário para envio posterior
 */
export const saveFormData = async (
  type: string,
  data: any
): Promise<number> => {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE.FORM_DATA], 'readwrite')
      const store = transaction.objectStore(STORE.FORM_DATA)

      const entry = {
        type,
        data,
        timestamp: Date.now(),
        synced: false,
      }

      const request = store.add(entry)

      request.onsuccess = (event) => {
        resolve((event.target as IDBRequest).result as number)
      }

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error)
      }

      transaction.oncomplete = () => db.close()
    })
  } catch (error) {
    console.error('Erro ao salvar dados de formulário offline:', error)
    throw error
  }
}

/**
 * Armazena uma ação pendente para sincronização posterior
 */
export const addPendingAction = async (
  type: string,
  data: any,
  endpoint: string,
  method: string
): Promise<number> => {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE.PENDING_ACTIONS], 'readwrite')
      const store = transaction.objectStore(STORE.PENDING_ACTIONS)

      const action = {
        type,
        data,
        endpoint,
        method,
        timestamp: Date.now(),
        status: 'pending',
        retries: 0,
      }

      const request = store.add(action)

      request.onsuccess = (event) => {
        resolve((event.target as IDBRequest).result as number)

        // Registrar ação para Background Sync se disponível
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          navigator.serviceWorker.ready.then((registration) => {
            // @ts-ignore - O tipo ServiceWorkerRegistration não inclui 'sync' na definição padrão
            registration.sync
              .register('sync-pending-actions')
              .catch((err: Error) =>
                console.error('Erro ao registrar sync:', err)
              )
          })
        }
      }

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error)
      }

      transaction.oncomplete = () => db.close()
    })
  } catch (error) {
    console.error('Erro ao adicionar ação pendente:', error)
    throw error
  }
}

/**
 * Recupera todas as ações pendentes
 */
export const getPendingActions = async (): Promise<any[]> => {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE.PENDING_ACTIONS], 'readonly')
      const store = transaction.objectStore(STORE.PENDING_ACTIONS)
      const request = store.index('status').getAll('pending')

      request.onsuccess = (event) => {
        resolve((event.target as IDBRequest).result)
      }

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error)
      }

      transaction.oncomplete = () => db.close()
    })
  } catch (error) {
    console.error('Erro ao recuperar ações pendentes:', error)
    return []
  }
}

/**
 * Atualiza o status de uma ação pendente
 */
export const updatePendingAction = async (
  id: number,
  status: 'synced' | 'failed',
  error?: string
): Promise<void> => {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE.PENDING_ACTIONS], 'readwrite')
      const store = transaction.objectStore(STORE.PENDING_ACTIONS)

      // Primeiro, buscar o item atual
      const getRequest = store.get(id)

      getRequest.onsuccess = (event) => {
        const action = (event.target as IDBRequest).result

        if (!action) {
          reject(new Error(`Ação pendente com id ${id} não encontrada`))
          return
        }

        // Atualizar os campos
        action.status = status
        if (status === 'failed') {
          action.retries = (action.retries || 0) + 1
          action.lastError = error || 'Erro desconhecido'
          action.lastAttempt = Date.now()
        } else {
          action.syncedAt = Date.now()
        }

        // Salvar de volta
        const updateRequest = store.put(action)

        updateRequest.onsuccess = () => resolve()
        updateRequest.onerror = (event) =>
          reject((event.target as IDBRequest).error)
      }

      getRequest.onerror = (event) => {
        reject((event.target as IDBRequest).error)
      }

      transaction.oncomplete = () => db.close()
    })
  } catch (error) {
    console.error(`Erro ao atualizar ação pendente ${id}:`, error)
    throw error
  }
}

/**
 * Salva ou atualiza dados do usuário logado para acesso offline
 */
export const saveUserData = async (userData: any): Promise<void> => {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE.USER_DATA], 'readwrite')
      const store = transaction.objectStore(STORE.USER_DATA)

      // Remover dados sensíveis antes de armazenar
      const sanitizedData = { ...userData }
      delete sanitizedData.token
      delete sanitizedData.refreshToken

      // Adicionar timestamp
      sanitizedData._offlineTimestamp = Date.now()

      const request = store.put(sanitizedData)

      request.onsuccess = () => resolve()
      request.onerror = (event) => reject((event.target as IDBRequest).error)

      transaction.oncomplete = () => db.close()
    })
  } catch (error) {
    console.error('Erro ao salvar dados do usuário offline:', error)
    throw error
  }
}

/**
 * Recupera os dados do usuário para uso offline
 */
export const getUserData = async (): Promise<any | null> => {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE.USER_DATA], 'readonly')
      const store = transaction.objectStore(STORE.USER_DATA)
      const request = store.getAll()

      request.onsuccess = (event) => {
        const results = (event.target as IDBRequest).result
        resolve(results && results.length > 0 ? results[0] : null)
      }

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error)
      }

      transaction.oncomplete = () => db.close()
    })
  } catch (error) {
    console.error('Erro ao recuperar dados do usuário offline:', error)
    return null
  }
}

/**
 * Limpa todos os dados armazenados offline
 */
export const clearOfflineData = async (): Promise<void> => {
  try {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const stores = [
        STORE.PROPOSALS,
        STORE.USER_DATA,
        STORE.FORM_DATA,
        STORE.PENDING_ACTIONS,
      ]
      let completed = 0

      for (const storeName of stores) {
        const transaction = db.transaction([storeName], 'readwrite')
        const store = transaction.objectStore(storeName)
        const request = store.clear()

        request.onsuccess = () => {
          completed++
          if (completed === stores.length) {
            resolve()
            db.close()
          }
        }

        request.onerror = (event) => {
          reject((event.target as IDBRequest).error)
          db.close()
        }
      }
    })
  } catch (error) {
    console.error('Erro ao limpar dados offline:', error)
    throw error
  }
}

/**
 * Verifica se a aplicação está online
 */
export const isOnline = (): boolean => {
  return navigator.onLine
}

/**
 * Registra evento de conexão/desconexão
 */
export const setupConnectivityListeners = (
  onOnline: () => void,
  onOffline: () => void
): (() => void) => {
  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)

  // Retorna função para remover listeners
  return () => {
    window.removeEventListener('online', onOnline)
    window.removeEventListener('offline', onOffline)
  }
}

/**
 * Sincroniza todas as ações pendentes com o servidor quando a conexão for restaurada
 */
export const syncPendingActions = async (): Promise<{
  success: number
  failed: number
}> => {
  if (!navigator.onLine) {
    return { success: 0, failed: 0 }
  }

  try {
    const pendingActions = await getPendingActions()
    let successCount = 0
    let failedCount = 0

    for (const action of pendingActions) {
      try {
        if (action.status === 'synced') continue

        const response = await fetch(action.endpoint, {
          method: action.method,
          headers: {
            'Content-Type': 'application/json',
            // Recuperar token de autenticação do localStorage
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify(action.data),
        })

        if (response.ok) {
          await updatePendingAction(action.id, 'synced')
          successCount++
        } else {
          const errorText = await response.text()
          await updatePendingAction(action.id, 'failed', errorText)
          failedCount++
        }
      } catch (error) {
        await updatePendingAction(action.id, 'failed', String(error))
        failedCount++
      }
    }

    return { success: successCount, failed: failedCount }
  } catch (error) {
    console.error('Erro ao sincronizar ações pendentes:', error)
    return { success: 0, failed: 0 }
  }
}

/**
 * Sincroniza propostas offline com o servidor
 */
export const syncProposals = async (): Promise<{
  success: number
  failed: number
}> => {
  if (!navigator.onLine) {
    return { success: 0, failed: 0 }
  }

  try {
    const proposals = await getProposals()
    const unsyncedProposals = proposals.filter((p) => !p._offlineSync)

    let successCount = 0
    let failedCount = 0

    for (const proposal of unsyncedProposals) {
      try {
        // Remover metadados de offline antes de enviar ao servidor
        const { _offlineTimestamp, _offlineSync, ...cleanProposal } = proposal

        const endpoint = proposal.id
          ? `/api/propostas/${proposal.id}/`
          : '/api/propostas/'

        const method = proposal.id ? 'PUT' : 'POST'

        const response = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify(cleanProposal),
        })

        if (response.ok) {
          // Se for uma nova proposta, atualizar com o ID retornado pelo servidor
          if (!proposal.id) {
            const responseData = await response.json()
            proposal.id = responseData.id
          }

          // Marcar como sincronizada
          proposal._offlineSync = true
          await saveProposal(proposal)
          successCount++
        } else {
          failedCount++
        }
      } catch (error) {
        console.error(`Erro ao sincronizar proposta ${proposal.id}:`, error)
        failedCount++
      }
    }

    return { success: successCount, failed: 0 }
  } catch (error) {
    console.error('Erro ao sincronizar propostas:', error)
    return { success: 0, failed: 0 }
  }
}

/**
 * Inicia sincronização completa de todos os dados offline
 */
export const syncAllOfflineData = async (): Promise<{
  proposals: { success: number; failed: number }
  actions: { success: number; failed: number }
}> => {
  const proposalsResult = await syncProposals()
  const actionsResult = await syncPendingActions()

  return {
    proposals: proposalsResult,
    actions: actionsResult,
  }
}

/**
 * Registra listeners para sincronização automática quando a conexão for restaurada
 */
export const setupAutoSync = (): void => {
  window.addEventListener('online', async () => {
    console.log('Conexão restaurada. Iniciando sincronização automática...')
    const results = await syncAllOfflineData()
    console.log('Resultados da sincronização:', results)
  })

  // Registrar para Background Sync, se disponível
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then((registration) => {
      // @ts-ignore - O tipo ServiceWorkerRegistration não inclui 'sync' na definição padrão
      registration.sync
        .register('sync-all-data')
        .catch((err: Error) =>
          console.error('Erro ao registrar background sync:', err)
        )
    })
  }
}

/**
 * Inicia o sistema de armazenamento offline
 * Deve ser chamado na inicialização da aplicação
 */
export const initOfflineSystem = async (): Promise<void> => {
  try {
    // Inicializar banco de dados
    await initDB()

    // Configurar detecção de conectividade
    setupConnectivityListeners(
      // Callback para quando ficar online
      async () => {
        console.log('Aplicação está online. Iniciando sincronização...')
        await syncAllOfflineData()
      },
      // Callback para quando ficar offline
      () => {
        console.log('Aplicação está offline. Habilitando modo offline...')
      }
    )

    // Configurar sincronização automática
    setupAutoSync()

    console.log('Sistema offline inicializado com sucesso')
  } catch (error) {
    console.error('Erro ao inicializar sistema offline:', error)
  }
}

export default {
  saveProposal,
  getProposals,
  getProposal,
  saveFormData,
  addPendingAction,
  getPendingActions,
  updatePendingAction,
  saveUserData,
  getUserData,
  clearOfflineData,
  isOnline,
  setupConnectivityListeners,
  syncPendingActions,
  syncProposals,
  syncAllOfflineData,
  initOfflineSystem,
}
