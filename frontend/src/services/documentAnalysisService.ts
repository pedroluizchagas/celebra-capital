import api from './api'
import { handleApiError } from '../utils/errorHandler'

export interface DocumentVerificationResult {
  id: string
  documentId: number
  documentType: string
  status: 'pending' | 'processing' | 'verified' | 'rejected' | 'needs_review'
  createdAt: string
  completedAt: string | null
  confidence: number
  verificationDetails: {
    isAuthentic: boolean
    manipulationDetected: boolean
    isExpired: boolean
    isValidFormat: boolean
    warnings: string[]
  }
  extractedData: Record<string, any>
  errors: string[]
}

export interface FaceMatchResult {
  id: string
  selfieDocumentId: number
  idDocumentId: number
  status: 'pending' | 'processing' | 'verified' | 'rejected' | 'needs_review'
  createdAt: string
  completedAt: string | null
  score: number
  isMatch: boolean | null
  details: {
    faceDetected: boolean
    multipleFaces: boolean
    livelinessScore: number
    warnings: string[]
  }
  errors: string[]
}

export interface BatchAnalysisRequestParams {
  proposalId: number
  priority?: 'low' | 'normal' | 'high'
  callbackUrl?: string
}

export interface DocumentValidationRequestParams {
  documentId: number
  documentType: string
  validateExpiration?: boolean
  validateFormat?: boolean
  extractData?: boolean
  priority?: 'low' | 'normal' | 'high'
}

export interface FaceMatchRequestParams {
  selfieDocumentId: number
  idDocumentId: number
  checkLiveliness?: boolean
  minConfidenceScore?: number
}

/**
 * Serviço para análise e validação de documentos
 */
const documentAnalysisService = {
  /**
   * Verificar autenticidade e extrair dados de um documento
   */
  validateDocument: async (
    params: DocumentValidationRequestParams
  ): Promise<DocumentVerificationResult> => {
    try {
      const response = await api.post('/api/document-analysis/validate', params)
      return response.data
    } catch (error) {
      handleApiError(error)
      throw new Error('Não foi possível validar o documento')
    }
  },

  /**
   * Comparar face da selfie com documento de identidade
   */
  performFaceMatch: async (
    params: FaceMatchRequestParams
  ): Promise<FaceMatchResult> => {
    try {
      const response = await api.post(
        '/api/document-analysis/face-match',
        params
      )
      return response.data
    } catch (error) {
      handleApiError(error)
      throw new Error('Não foi possível realizar a comparação facial')
    }
  },

  /**
   * Obter resultado de uma validação de documento específica
   */
  getDocumentValidationResult: async (
    resultId: string
  ): Promise<DocumentVerificationResult> => {
    try {
      const response = await api.get(
        `/api/document-analysis/validation/${resultId}`
      )
      return response.data
    } catch (error) {
      handleApiError(error)
      throw new Error('Não foi possível obter o resultado da validação')
    }
  },

  /**
   * Obter resultado de uma comparação facial específica
   */
  getFaceMatchResult: async (resultId: string): Promise<FaceMatchResult> => {
    try {
      const response = await api.get(
        `/api/document-analysis/face-match/${resultId}`
      )
      return response.data
    } catch (error) {
      handleApiError(error)
      throw new Error('Não foi possível obter o resultado da comparação facial')
    }
  },

  /**
   * Verificar status atual de uma análise
   */
  checkAnalysisStatus: async (
    analysisType: 'document' | 'face-match',
    resultId: string
  ): Promise<DocumentVerificationResult | FaceMatchResult> => {
    try {
      const response = await api.get(
        `/api/document-analysis/${analysisType}/${resultId}/status`
      )
      return response.data
    } catch (error) {
      handleApiError(error)
      throw new Error('Não foi possível verificar o status da análise')
    }
  },

  /**
   * Iniciar análise em lote de todos os documentos de uma proposta
   */
  startBatchAnalysis: async (
    params: BatchAnalysisRequestParams
  ): Promise<{
    batchId: string
    status: string
    documentsQueued: number
  }> => {
    try {
      const response = await api.post('/api/document-analysis/batch', params)
      return response.data
    } catch (error) {
      handleApiError(error)
      throw new Error('Não foi possível iniciar a análise em lote')
    }
  },

  /**
   * Obter status de uma análise em lote
   */
  getBatchAnalysisStatus: async (
    batchId: string
  ): Promise<{
    batchId: string
    status: string
    progress: {
      total: number
      completed: number
      failed: number
      pending: number
    }
    results: {
      documentValidations: DocumentVerificationResult[]
      faceMatches: FaceMatchResult[]
    }
  }> => {
    try {
      const response = await api.get(`/api/document-analysis/batch/${batchId}`)
      return response.data
    } catch (error) {
      handleApiError(error)
      throw new Error('Não foi possível obter o status da análise em lote')
    }
  },

  /**
   * Obter todos os resultados de análise de uma proposta
   */
  getProposalAnalysisResults: async (
    proposalId: number
  ): Promise<{
    documentValidations: DocumentVerificationResult[]
    faceMatches: FaceMatchResult[]
  }> => {
    try {
      const response = await api.get(
        `/api/document-analysis/proposal/${proposalId}/results`
      )
      return response.data
    } catch (error) {
      handleApiError(error)
      throw new Error(
        'Não foi possível obter os resultados de análise desta proposta'
      )
    }
  },

  /**
   * Marcar resultado de análise como revisado manualmente
   */
  markAnalysisAsReviewed: async (
    analysisType: 'document' | 'face-match',
    resultId: string,
    reviewData: {
      reviewerUserId: string
      reviewResult: 'approved' | 'rejected'
      notes: string
    }
  ): Promise<any> => {
    try {
      const response = await api.post(
        `/api/document-analysis/${analysisType}/${resultId}/review`,
        reviewData
      )
      return response.data
    } catch (error) {
      handleApiError(error)
      throw new Error('Não foi possível registrar a revisão')
    }
  },

  /**
   * Obter histórico de submissões de um documento específico
   */
  getDocumentSubmissionHistory: async (
    documentId: number
  ): Promise<DocumentVerificationResult[]> => {
    try {
      const response = await api.get(
        `/api/document-analysis/document/${documentId}/history`
      )
      return response.data
    } catch (error) {
      handleApiError(error)
      throw new Error('Não foi possível obter o histórico de submissões')
    }
  },
}

export default documentAnalysisService
