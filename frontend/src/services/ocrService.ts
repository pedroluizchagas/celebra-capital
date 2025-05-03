import api from './api'

interface OcrResult {
  id: number
  ocr_complete: boolean
  extracted_data: Record<string, any>
  confidence_score: number
  error_message?: string
  created_at: string
  updated_at: string
  current_progress: number
  retry_count: number
}

interface DocumentValidationResult {
  is_valid: boolean
  extracted_data: Record<string, any>
  validation_errors?: string[]
  confidence_score: number
}

// Cache local para evitar chamadas repetidas
const ocrStatusCache: Record<number, { timestamp: number; data: any }> = {}
const CACHE_TIMEOUT = 1000 // 1 segundo

const ocrService = {
  /**
   * Obter resultado de OCR para um documento
   */
  getOcrResult: async (documentId: number): Promise<OcrResult> => {
    try {
      const response = await api.get(`/documents/${documentId}/ocr/`)
      return response.data
    } catch (error) {
      console.error('Erro ao obter resultado de OCR:', error)
      throw error
    }
  },

  /**
   * Verificar status de processamento OCR
   * Usa cache para evitar chamadas repetidas em curto intervalo
   */
  checkOcrStatus: async (
    documentId: number
  ): Promise<{ complete: boolean; progress?: number }> => {
    try {
      const now = Date.now()
      const cachedData = ocrStatusCache[documentId]

      // Usar cache se disponível e não expirado
      if (cachedData && now - cachedData.timestamp < CACHE_TIMEOUT) {
        return cachedData.data
      }

      const response = await api.get(`/documents/${documentId}/ocr/status/`)

      // Salvar no cache
      ocrStatusCache[documentId] = {
        timestamp: now,
        data: response.data,
      }

      // Limpar cache quando o processamento estiver completo
      if (response.data.complete) {
        setTimeout(() => {
          delete ocrStatusCache[documentId]
        }, CACHE_TIMEOUT)
      }

      return response.data
    } catch (error) {
      console.error('Erro ao verificar status de OCR:', error)
      throw error
    }
  },

  /**
   * Validar documento através de OCR
   */
  validateDocument: async (
    documentId: number,
    documentType: string
  ): Promise<DocumentValidationResult> => {
    try {
      const response = await api.post(`/documents/${documentId}/validate/`, {
        document_type: documentType,
      })
      return response.data
    } catch (error) {
      console.error('Erro ao validar documento:', error)
      throw error
    }
  },

  /**
   * Extrair texto específico de um documento
   */
  extractTextFromDocument: async (
    documentId: number,
    fields: string[]
  ): Promise<Record<string, string>> => {
    try {
      const response = await api.post(`/documents/${documentId}/extract/`, {
        fields,
      })
      return response.data.extracted_fields
    } catch (error) {
      console.error('Erro ao extrair texto do documento:', error)
      throw error
    }
  },

  /**
   * Limpar cache local
   */
  clearCache: (documentId?: number) => {
    if (documentId) {
      delete ocrStatusCache[documentId]
    } else {
      Object.keys(ocrStatusCache).forEach((key) => {
        delete ocrStatusCache[parseInt(key)]
      })
    }
  },
}

export default ocrService
