import creditAnalysisService from './creditAnalysisService'
import api from './api'
import { createErrorHandler } from './errorHandler'

// Mock das dependências
jest.mock('./api')
jest.mock('./errorHandler', () => ({
  createErrorHandler: jest.fn().mockReturnValue({
    handleApiError: jest.fn(),
  }),
}))

describe('creditAnalysisService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockAnalysis = {
    id: 1,
    proposal: {
      id: 123,
      title: 'Proposta de Teste',
    },
    reference_id: 'ABC123',
    status: 'completed' as const,
    result: 'approved' as const,
    score: 750,
    risk_level: 'low',
    requested_by: {
      id: 1,
      name: 'João Silva',
    },
    created_at: '2023-01-15T10:30:00Z',
    updated_at: '2023-01-15T10:35:00Z',
    completed_at: '2023-01-15T10:35:00Z',
    restrictions: [],
    events: [],
  }

  describe('requestAnalysis', () => {
    it('deve enviar uma solicitação POST para criar análise de crédito', async () => {
      // Configurar mock do axios para retornar uma resposta bem-sucedida
      ;(api.post as jest.Mock).mockResolvedValueOnce({
        data: mockAnalysis,
      })

      // Executar o método
      const result = await creditAnalysisService.requestAnalysis(123)

      // Verificar se a função post foi chamada corretamente
      expect(api.post).toHaveBeenCalledWith('/credit-analysis/analyses/', {
        proposal_id: 123,
      })

      // Verificar se o resultado está correto
      expect(result).toEqual(mockAnalysis)
    })

    it('deve tratar erros ao solicitar análise', async () => {
      // Configurar mock do axios para lançar um erro
      const mockError = new Error('Falha na API')
      ;(api.post as jest.Mock).mockRejectedValueOnce(mockError)

      // Executar o método e esperar que lance um erro
      await expect(creditAnalysisService.requestAnalysis(123)).rejects.toThrow(
        'Erro ao solicitar análise de crédito'
      )

      // Verificar se o handler de erro foi chamado
      expect(createErrorHandler().handleApiError).toHaveBeenCalledWith(
        mockError
      )
    })
  })

  describe('getAnalysis', () => {
    it('deve buscar uma análise por ID', async () => {
      // Configurar mock do axios
      ;(api.get as jest.Mock).mockResolvedValueOnce({
        data: mockAnalysis,
      })

      // Executar o método
      const result = await creditAnalysisService.getAnalysis(1)

      // Verificar se a função get foi chamada corretamente
      expect(api.get).toHaveBeenCalledWith('/credit-analysis/analyses/1/')

      // Verificar se o resultado está correto
      expect(result).toEqual(mockAnalysis)
    })
  })

  describe('checkAnalysisStatus', () => {
    it('deve verificar o status de uma análise', async () => {
      // Configurar mock do axios
      const mockStatusResponse = {
        status: 'completed',
        analysis: mockAnalysis,
      }

      ;(api.get as jest.Mock).mockResolvedValueOnce({
        data: mockStatusResponse,
      })

      // Executar o método
      const result = await creditAnalysisService.checkAnalysisStatus(1)

      // Verificar se a função get foi chamada corretamente
      expect(api.get).toHaveBeenCalledWith(
        '/credit-analysis/analyses/1/check_status/'
      )

      // Verificar se o resultado está correto
      expect(result).toEqual(mockStatusResponse)
    })
  })

  describe('listAnalyses', () => {
    it('deve listar análises com filtros', async () => {
      // Configurar mock do axios
      ;(api.get as jest.Mock).mockResolvedValueOnce({
        data: {
          results: [mockAnalysis],
        },
      })

      // Executar o método com filtros
      const filters = {
        status: 'completed',
        proposal_id: 123,
      }

      const result = await creditAnalysisService.listAnalyses(filters)

      // Verificar se a função get foi chamada corretamente
      expect(api.get).toHaveBeenCalledWith('/credit-analysis/analyses/', {
        params: filters,
      })

      // Verificar se o resultado está correto
      expect(result).toEqual([mockAnalysis])
    })

    it('deve listar análises sem filtros', async () => {
      // Configurar mock do axios
      ;(api.get as jest.Mock).mockResolvedValueOnce({
        data: {
          results: [mockAnalysis],
        },
      })

      // Executar o método sem filtros
      const result = await creditAnalysisService.listAnalyses()

      // Verificar se a função get foi chamada corretamente
      expect(api.get).toHaveBeenCalledWith('/credit-analysis/analyses/', {
        params: undefined,
      })

      // Verificar se o resultado está correto
      expect(result).toEqual([mockAnalysis])
    })
  })

  describe('updateAnalysisResult', () => {
    it('deve atualizar o resultado de uma análise', async () => {
      // Configurar mock do axios
      ;(api.post as jest.Mock).mockResolvedValueOnce({
        data: mockAnalysis,
      })

      // Executar o método
      const result = await creditAnalysisService.updateAnalysisResult(
        1,
        'approved'
      )

      // Verificar se a função post foi chamada corretamente
      expect(api.post).toHaveBeenCalledWith(
        '/credit-analysis/analyses/1/update_result/',
        { result: 'approved' }
      )

      // Verificar se o resultado está correto
      expect(result).toEqual(mockAnalysis)
    })
  })
})
