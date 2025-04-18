import api from './api'

interface ProposalData {
  credit_type: string
  amount_requested: number
  installments: number
  user_answers: Record<string, string>
}

interface SimulationData {
  monthly_income: number
  credit_type: string
  user_type: string
  installments?: number
}

interface Proposal {
  id: number
  user: {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
  }
  proposal_number: string
  credit_type: string
  credit_value: number
  status: string
  created_at: string
  updated_at: string
  documents_complete: boolean
  signature_complete: boolean
  additional_info?: Record<string, any>
}

interface ProposalFilters {
  status?: string
  credit_type?: string
  min_value?: number
  max_value?: number
  search?: string
  page?: number
  page_size?: number
}

const proposalService = {
  /**
   * Simulação de crédito
   */
  simulate: async (data: SimulationData) => {
    try {
      const response = await api.post('/proposals/simulate/', data)
      return response.data
    } catch (error) {
      console.error('Erro ao simular crédito:', error)
      throw error
    }
  },

  /**
   * Criar uma nova proposta
   */
  create: async (data: ProposalData) => {
    try {
      const response = await api.post('/proposals/', data)
      return response.data
    } catch (error) {
      console.error('Erro ao criar proposta:', error)
      throw error
    }
  },

  /**
   * Salvar respostas do formulário
   */
  saveAnswers: async (proposalId: number, answers: Record<string, string>) => {
    try {
      const response = await api.post(`/proposals/${proposalId}/answers/`, {
        answers,
      })
      return response.data
    } catch (error) {
      console.error('Erro ao salvar respostas:', error)
      throw error
    }
  },

  /**
   * Enviar assinatura
   */
  submitSignature: async (proposalId: number, signatureData: string) => {
    try {
      const response = await api.post(`/proposals/${proposalId}/signature/`, {
        signature_data: signatureData,
      })
      return response.data
    } catch (error) {
      console.error('Erro ao enviar assinatura:', error)
      throw error
    }
  },

  /**
   * Obter propostas do usuário atual
   */
  getUserProposals: async () => {
    try {
      const response = await api.get('/proposals/')
      return response.data
    } catch (error) {
      console.error('Erro ao obter propostas do usuário:', error)
      throw error
    }
  },

  /**
   * Obter detalhes de uma proposta
   */
  getProposalDetails: async (proposalId: number): Promise<Proposal> => {
    try {
      const response = await api.get(`/proposals/admin/${proposalId}/`)
      return response.data
    } catch (error) {
      console.error(`Erro ao obter detalhes da proposta ${proposalId}:`, error)
      throw error
    }
  },

  /**
   * Obter lista de propostas com filtros opcionais
   */
  getProposals: async (
    filters: ProposalFilters = {}
  ): Promise<{
    results: Proposal[]
    count: number
    next: string | null
    previous: string | null
  }> => {
    try {
      // Construir query params
      const params = new URLSearchParams()

      // Adicionar filtros à query
      if (filters.status) params.append('status', filters.status)
      if (filters.credit_type) params.append('credit_type', filters.credit_type)
      if (filters.min_value)
        params.append('min_value', filters.min_value.toString())
      if (filters.max_value)
        params.append('max_value', filters.max_value.toString())
      if (filters.search) params.append('search', filters.search)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.page_size)
        params.append('page_size', filters.page_size.toString())

      const response = await api.get(`/proposals/admin/?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Erro ao obter propostas:', error)
      throw error
    }
  },

  /**
   * Aprovar uma proposta
   */
  approveProposal: async (
    proposalId: number,
    comments?: string
  ): Promise<Proposal> => {
    try {
      const response = await api.post(
        `/proposals/admin/${proposalId}/approve/`,
        {
          comments,
        }
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao aprovar proposta ${proposalId}:`, error)
      throw error
    }
  },

  /**
   * Rejeitar uma proposta
   */
  rejectProposal: async (
    proposalId: number,
    reason: string,
    comments?: string
  ): Promise<Proposal> => {
    try {
      const response = await api.post(
        `/proposals/admin/${proposalId}/reject/`,
        {
          reason,
          comments,
        }
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao rejeitar proposta ${proposalId}:`, error)
      throw error
    }
  },

  /**
   * Solicitar documentos adicionais
   */
  requestAdditionalDocuments: async (
    proposalId: number,
    documentTypes: string[],
    message?: string
  ): Promise<Proposal> => {
    try {
      const response = await api.post(
        `/proposals/admin/${proposalId}/request-documents/`,
        {
          document_types: documentTypes,
          message,
        }
      )
      return response.data
    } catch (error) {
      console.error(
        `Erro ao solicitar documentos adicionais para proposta ${proposalId}:`,
        error
      )
      throw error
    }
  },

  /**
   * Exportar lista de propostas para CSV
   */
  exportProposals: async (filters: ProposalFilters = {}): Promise<Blob> => {
    try {
      // Construir query params
      const params = new URLSearchParams()

      // Adicionar filtros à query
      if (filters.status) params.append('status', filters.status)
      if (filters.credit_type) params.append('credit_type', filters.credit_type)
      if (filters.min_value)
        params.append('min_value', filters.min_value.toString())
      if (filters.max_value)
        params.append('max_value', filters.max_value.toString())
      if (filters.search) params.append('search', filters.search)

      const response = await api.get(
        `/proposals/admin/export/?${params.toString()}`,
        {
          responseType: 'blob',
        }
      )
      return response.data
    } catch (error) {
      console.error('Erro ao exportar propostas:', error)
      throw error
    }
  },

  /**
   * Obter estatísticas para relatórios
   */
  getReportStats: async (
    startDate?: string,
    endDate?: string,
    filters: ProposalFilters = {}
  ) => {
    try {
      // Construir query params
      const params = new URLSearchParams()

      // Adicionar datas e filtros à query
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)
      if (filters.status) params.append('status', filters.status)
      if (filters.credit_type) params.append('credit_type', filters.credit_type)
      if (filters.min_value)
        params.append('min_value', filters.min_value.toString())
      if (filters.max_value)
        params.append('max_value', filters.max_value.toString())

      const response = await api.get(
        `/proposals/admin/reports/stats/?${params.toString()}`
      )
      return response.data
    } catch (error) {
      console.error('Erro ao obter estatísticas para relatórios:', error)
      throw error
    }
  },

  /**
   * Exportar relatório em formato específico
   */
  exportReport: async (
    format: 'csv' | 'excel' | 'pdf',
    startDate?: string,
    endDate?: string,
    filters: ProposalFilters = {}
  ): Promise<Blob> => {
    try {
      // Construir query params
      const params = new URLSearchParams()

      // Adicionar formato, datas e filtros à query
      params.append('format', format)
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)
      if (filters.status) params.append('status', filters.status)
      if (filters.credit_type) params.append('credit_type', filters.credit_type)
      if (filters.min_value)
        params.append('min_value', filters.min_value.toString())
      if (filters.max_value)
        params.append('max_value', filters.max_value.toString())

      const response = await api.get(
        `/proposals/admin/reports/export/?${params.toString()}`,
        {
          responseType: 'blob',
        }
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao exportar relatório em formato ${format}:`, error)
      throw error
    }
  },

  /**
   * Obter dados para gráficos e visualizações
   */
  getChartData: async (
    chartType: 'status' | 'credit_type' | 'monthly' | 'conversion',
    startDate?: string,
    endDate?: string,
    groupBy: 'day' | 'week' | 'month' | 'quarter' | 'year' = 'month'
  ) => {
    try {
      // Construir query params
      const params = new URLSearchParams()

      // Adicionar tipo de gráfico, datas e agrupamento à query
      params.append('chart_type', chartType)
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)
      params.append('group_by', groupBy)

      const response = await api.get(
        `/proposals/admin/reports/chart/?${params.toString()}`
      )
      return response.data
    } catch (error) {
      console.error(`Erro ao obter dados para gráfico ${chartType}:`, error)
      throw error
    }
  },
}

export default proposalService
export type { Proposal, ProposalFilters }
