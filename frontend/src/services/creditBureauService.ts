import api from './api'
import { handleApiError } from '../utils/errorHandler'

// Tipos para integração com bureau de crédito
export interface CreditScore {
  score: number
  scoreRange: {
    min: number
    max: number
  }
  classification: 'baixo' | 'medio' | 'alto' | 'muito_alto'
  lastUpdate: string
}

export interface FinancialRestriction {
  id: string
  type: 'protesto' | 'divida' | 'acao_judicial' | 'cheque' | 'outro'
  value: number
  date: string
  creditor: string
  details: string
  status: 'ativo' | 'regularizado' | 'contestado'
}

export interface CreditBureauReport {
  id: string
  requestDate: string
  cpf: string
  name: string
  score: CreditScore
  restrictions: FinancialRestriction[]
  addressVerification: {
    isValid: boolean
    lastUpdate: string
    details?: string
  }
  companyRelationships: {
    cnpj: string
    companyName: string
    position: string
    startDate: string
    isActive: boolean
  }[]
  consultationHistory: {
    date: string
    institution: string
    type: string
  }[]
  summaryData: {
    activeDebts: number
    totalDebtAmount: number
    bankruptcies: number
    protests: number
    lawsuits: number
    creditCards: number
    loans: number
  }
}

export interface CreditBureauRequestParams {
  cpf: string
  name: string
  birthDate: string
  proposalId?: number
}

export interface CreditMonitoringSettings {
  active: boolean
  alertSettings: {
    scoreChange: boolean
    newRestriction: boolean
    restrictionRemoved: boolean
    lawsuitChange: boolean
  }
  alertFrequency: 'immediately' | 'daily' | 'weekly'
  notificationChannels: {
    email: boolean
    sms: boolean
    push: boolean
  }
}

/**
 * Serviço para integração com bureau de crédito (Serasa, SPC, etc)
 */
const creditBureauService = {
  /**
   * Consultar score e histórico de crédito
   */
  consultCredit: async (
    params: CreditBureauRequestParams
  ): Promise<CreditBureauReport> => {
    try {
      const response = await api.post('/api/credit-bureau/consult', params)
      return response.data
    } catch (error) {
      handleApiError(error)
      throw new Error('Não foi possível realizar a consulta de crédito')
    }
  },

  /**
   * Obter uma consulta específica por ID
   */
  getReportById: async (reportId: string): Promise<CreditBureauReport> => {
    try {
      const response = await api.get(`/api/credit-bureau/reports/${reportId}`)
      return response.data
    } catch (error) {
      handleApiError(error)
      throw new Error('Não foi possível recuperar o relatório de crédito')
    }
  },

  /**
   * Obter relatórios de crédito relacionados a uma proposta
   */
  getReportsByProposal: async (
    proposalId: number
  ): Promise<CreditBureauReport[]> => {
    try {
      const response = await api.get(
        `/api/credit-bureau/proposal/${proposalId}/reports`
      )
      return response.data
    } catch (error) {
      handleApiError(error)
      throw new Error('Não foi possível recuperar os relatórios desta proposta')
    }
  },

  /**
   * Listar histórico de consultas por CPF
   */
  getReportHistoryByCpf: async (cpf: string): Promise<CreditBureauReport[]> => {
    try {
      const response = await api.get(`/api/credit-bureau/history/${cpf}`)
      return response.data
    } catch (error) {
      handleApiError(error)
      throw new Error('Não foi possível recuperar o histórico de consultas')
    }
  },

  /**
   * Ativar/desativar monitoramento de crédito
   */
  updateCreditMonitoring: async (
    cpf: string,
    settings: CreditMonitoringSettings
  ): Promise<CreditMonitoringSettings> => {
    try {
      const response = await api.put(
        `/api/credit-bureau/monitoring/${cpf}`,
        settings
      )
      return response.data
    } catch (error) {
      handleApiError(error)
      throw new Error(
        'Não foi possível atualizar as configurações de monitoramento'
      )
    }
  },

  /**
   * Obter configurações atuais de monitoramento
   */
  getCreditMonitoringSettings: async (
    cpf: string
  ): Promise<CreditMonitoringSettings> => {
    try {
      const response = await api.get(`/api/credit-bureau/monitoring/${cpf}`)
      return response.data
    } catch (error) {
      handleApiError(error)
      throw new Error(
        'Não foi possível recuperar as configurações de monitoramento'
      )
    }
  },

  /**
   * Verificar se existe relatório recente para evitar nova consulta
   */
  checkRecentReport: async (
    cpf: string
  ): Promise<{
    hasRecent: boolean
    reportId?: string
    lastUpdate?: string
  }> => {
    try {
      const response = await api.get(`/api/credit-bureau/check-recent/${cpf}`)
      return response.data
    } catch (error) {
      handleApiError(error)
      throw new Error('Não foi possível verificar consultas recentes')
    }
  },

  /**
   * Adicionar anotação manual a um relatório
   */
  addReportAnnotation: async (
    reportId: string,
    annotation: {
      text: string
      type: 'observation' | 'correction' | 'action_item'
    }
  ): Promise<any> => {
    try {
      const response = await api.post(
        `/api/credit-bureau/reports/${reportId}/annotations`,
        annotation
      )
      return response.data
    } catch (error) {
      handleApiError(error)
      throw new Error('Não foi possível adicionar anotação ao relatório')
    }
  },
}

export default creditBureauService
