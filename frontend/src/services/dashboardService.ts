import api from './api'
import proposalService from './proposalService'

export interface DashboardStats {
  total_proposals: number
  pending_review: number
  approved: number
  rejected: number
  recent_submissions: number
}

export interface ActivityItem {
  id: string
  action: string
  description: string
  time: string
  time_raw: Date
  icon_type: 'approve' | 'reject' | 'new_user' | 'document' | 'new_proposal'
  entity_id?: string
}

export interface RecentProposal {
  id: string
  client: string
  value: number
  status: string
  date: string
}

const dashboardService = {
  /**
   * Obter estatísticas do dashboard
   */
  getStats: async (): Promise<DashboardStats> => {
    try {
      // Em produção, chamaríamos um endpoint real
      const response = await api.get('/dashboard/stats/')
      return response.data
    } catch (error) {
      console.error('Erro ao obter estatísticas do dashboard:', error)

      // Para demo, usar proposalService para buscar propostas e calcular as estatísticas
      try {
        const proposals = await proposalService.getProposals({ page_size: 100 })

        // Calcular estatísticas com base nas propostas
        const stats: DashboardStats = {
          total_proposals: proposals.count,
          pending_review: proposals.results.filter(
            (p) => p.status === 'pending'
          ).length,
          approved: proposals.results.filter((p) => p.status === 'approved')
            .length,
          rejected: proposals.results.filter((p) => p.status === 'rejected')
            .length,
          recent_submissions: proposals.results.filter(
            (p) =>
              new Date(p.created_at) >
              new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          ).length,
        }

        return stats
      } catch (fallbackError) {
        console.error(
          'Erro ao obter propostas para estatísticas:',
          fallbackError
        )

        // Dados simulados como último recurso
        return {
          total_proposals: 125,
          pending_review: 42,
          approved: 68,
          rejected: 15,
          recent_submissions: 8,
        }
      }
    }
  },

  /**
   * Obter propostas recentes para o dashboard
   */
  getRecentProposals: async (): Promise<RecentProposal[]> => {
    try {
      // Em produção, chamaríamos um endpoint específico para propostas recentes
      const response = await api.get('/dashboard/recent-proposals/')
      return response.data
    } catch (error) {
      console.error('Erro ao obter propostas recentes:', error)

      // Para demo, usar proposalService
      try {
        const { results } = await proposalService.getProposals({
          page: 1,
          page_size: 5,
        })

        return results.map((p) => ({
          id: p.proposal_number,
          client: `${p.user.first_name} ${p.user.last_name}`,
          value: p.credit_value,
          status: p.status,
          date: new Date(p.created_at).toLocaleDateString('pt-BR'),
        }))
      } catch (fallbackError) {
        console.error('Erro ao obter propostas recentes:', fallbackError)

        // Dados simulados como último recurso
        return [
          {
            id: 'P-2023-421',
            client: 'Carlos Oliveira',
            value: 12000,
            status: 'pending',
            date: '18/07/2023',
          },
          {
            id: 'P-2023-420',
            client: 'Maria Silva',
            value: 25000,
            status: 'approved',
            date: '17/07/2023',
          },
          {
            id: 'P-2023-419',
            client: 'João Santos',
            value: 5000,
            status: 'rejected',
            date: '15/07/2023',
          },
          {
            id: 'P-2023-418',
            client: 'Ana Costa',
            value: 18500,
            status: 'pending',
            date: '15/07/2023',
          },
          {
            id: 'P-2023-417',
            client: 'Pedro Almeida',
            value: 30000,
            status: 'approved',
            date: '14/07/2023',
          },
        ]
      }
    }
  },

  /**
   * Obter atividades recentes para o dashboard
   */
  getRecentActivities: async (): Promise<ActivityItem[]> => {
    try {
      // Em produção, chamaríamos um endpoint específico
      const response = await api.get('/dashboard/activities/')
      return response.data
    } catch (error) {
      console.error('Erro ao obter atividades recentes:', error)

      // Dados simulados
      return [
        {
          id: 'act-1',
          action: 'Proposta aprovada',
          description: 'Proposta P-2023-410 foi aprovada',
          time: '2 horas atrás',
          time_raw: new Date(Date.now() - 2 * 60 * 60 * 1000),
          icon_type: 'approve',
          entity_id: 'P-2023-410',
        },
        {
          id: 'act-2',
          action: 'Novo usuário',
          description: 'José Silva criou uma nova conta',
          time: '4 horas atrás',
          time_raw: new Date(Date.now() - 4 * 60 * 60 * 1000),
          icon_type: 'new_user',
        },
        {
          id: 'act-3',
          action: 'Documentos enviados',
          description: 'Maria Santos enviou novos documentos',
          time: '6 horas atrás',
          time_raw: new Date(Date.now() - 6 * 60 * 60 * 1000),
          icon_type: 'document',
        },
        {
          id: 'act-4',
          action: 'Proposta rejeitada',
          description: 'Proposta P-2023-405 foi rejeitada',
          time: '1 dia atrás',
          time_raw: new Date(Date.now() - 24 * 60 * 60 * 1000),
          icon_type: 'reject',
          entity_id: 'P-2023-405',
        },
        {
          id: 'act-5',
          action: 'Nova proposta',
          description: 'Carlos Ferreira enviou nova proposta',
          time: '1 dia atrás',
          time_raw: new Date(Date.now() - 25 * 60 * 60 * 1000),
          icon_type: 'new_proposal',
        },
      ]
    }
  },
}

export default dashboardService
