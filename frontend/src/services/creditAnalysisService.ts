import api from './api'
import { createErrorHandler } from './errorHandler'

export interface CreditAnalysis {
  id: number
  proposal: {
    id: number
    title: string
  }
  reference_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired'
  result: 'approved' | 'denied' | 'manual_review' | 'insufficient_data' | null
  score: number | null
  risk_level: string | null
  requested_by: {
    id: number
    name: string
  } | null
  created_at: string
  updated_at: string
  completed_at: string | null
  restrictions: CreditRestriction[]
  events: CreditEvent[]
}

export interface CreditRestriction {
  id: number
  restriction_type:
    | 'financial'
    | 'protest'
    | 'lawsuit'
    | 'bankruptcy'
    | 'default'
    | 'other'
  description: string
  value: number | null
  creditor: string | null
  date: string | null
  details: any
}

export interface CreditEvent {
  id: number
  event_type: string
  details: any
  user: {
    id: number
    name: string
  } | null
  created_at: string
}

// Criar um manipulador de erros para uso fora de componentes React
const errorHandler = createErrorHandler()

/**
 * Serviço para gerenciar análises de crédito (integração com Serasa)
 */
const creditAnalysisService = {
  /**
   * Solicitar uma nova análise de crédito para uma proposta
   */
  requestAnalysis: async (proposalId: number): Promise<CreditAnalysis> => {
    try {
      const response = await api.post('/credit-analysis/analyses/', {
        proposal_id: proposalId,
      })
      return response.data
    } catch (error) {
      errorHandler.handleApiError(error)
      throw new Error('Erro ao solicitar análise de crédito')
    }
  },

  /**
   * Obter uma análise de crédito específica
   */
  getAnalysis: async (analysisId: number): Promise<CreditAnalysis> => {
    try {
      const response = await api.get(`/credit-analysis/analyses/${analysisId}/`)
      return response.data
    } catch (error) {
      errorHandler.handleApiError(error)
      throw new Error('Erro ao buscar análise de crédito')
    }
  },

  /**
   * Verificar status atual de uma análise
   */
  checkAnalysisStatus: async (
    analysisId: number
  ): Promise<{
    status: string
    analysis: CreditAnalysis
  }> => {
    try {
      const response = await api.get(
        `/credit-analysis/analyses/${analysisId}/check_status/`
      )
      return response.data
    } catch (error) {
      errorHandler.handleApiError(error)
      throw new Error('Erro ao verificar status da análise')
    }
  },

  /**
   * Listar análises de crédito com filtros opcionais
   */
  listAnalyses: async (filters?: {
    status?: string
    result?: string
    proposal_id?: number
  }): Promise<CreditAnalysis[]> => {
    try {
      const response = await api.get('/credit-analysis/analyses/', {
        params: filters,
      })
      return response.data.results
    } catch (error) {
      errorHandler.handleApiError(error)
      throw new Error('Erro ao listar análises de crédito')
    }
  },

  /**
   * Atualizar manualmente o resultado de uma análise
   * (apenas para usuários admin/staff)
   */
  updateAnalysisResult: async (
    analysisId: number,
    result: 'approved' | 'denied' | 'manual_review' | 'insufficient_data'
  ): Promise<CreditAnalysis> => {
    try {
      const response = await api.post(
        `/credit-analysis/analyses/${analysisId}/update_result/`,
        { result }
      )
      return response.data
    } catch (error) {
      errorHandler.handleApiError(error)
      throw new Error('Erro ao atualizar resultado da análise')
    }
  },
}

export default creditAnalysisService
