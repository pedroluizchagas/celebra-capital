import api from './api'

interface OcrResult {
  id: number
  ocr_complete: boolean
  extracted_data: Record<string, any>
  confidence_score: number
  error_message?: string
  created_at: string
  updated_at: string
}

interface DocumentValidationResult {
  is_valid: boolean
  extracted_data: Record<string, any>
  validation_errors?: string[]
  confidence_score: number
}

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
   */
  checkOcrStatus: async (
    documentId: number
  ): Promise<{ complete: boolean; progress?: number }> => {
    try {
      const response = await api.get(`/documents/${documentId}/ocr/status/`)
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
}

export default ocrService
