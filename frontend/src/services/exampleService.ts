import { apiUtils } from './api'

// Interfaces para os tipos de dados
interface ExampleData {
  id: number
  name: string
  status: string
  createdAt: string
}

interface ExampleCreateData {
  name: string
  description?: string
}

interface ExampleUpdateData {
  name?: string
  description?: string
  status?: string
}

// Serviço de exemplo com boas práticas
const exampleService = {
  /**
   * Obtém a lista de itens de exemplo
   * @param {Object} params Parâmetros de consulta (paginação, filtros, etc.)
   * @returns {Promise<ExampleData[]>} Lista de itens
   */
  async getAll(params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<ExampleData[]> {
    return apiUtils.get<ExampleData[]>('/examples', params)
  },

  /**
   * Obtém um item pelo ID
   * @param {number} id ID do item
   * @returns {Promise<ExampleData>} Dados do item
   */
  async getById(id: number): Promise<ExampleData> {
    return apiUtils.get<ExampleData>(`/examples/${id}`)
  },

  /**
   * Cria um novo item
   * @param {ExampleCreateData} data Dados do novo item
   * @returns {Promise<ExampleData>} Item criado
   */
  async create(data: ExampleCreateData): Promise<ExampleData> {
    return apiUtils.post<ExampleData>('/examples', data)
  },

  /**
   * Atualiza um item existente
   * @param {number} id ID do item
   * @param {ExampleUpdateData} data Dados a serem atualizados
   * @returns {Promise<ExampleData>} Item atualizado
   */
  async update(id: number, data: ExampleUpdateData): Promise<ExampleData> {
    return apiUtils.put<ExampleData>(`/examples/${id}`, data)
  },

  /**
   * Remove um item
   * @param {number} id ID do item
   * @returns {Promise<void>}
   */
  async delete(id: number): Promise<void> {
    return apiUtils.delete<void>(`/examples/${id}`)
  },

  /**
   * Envia um arquivo para o item
   * @param {number} id ID do item
   * @param {File} file Arquivo a ser enviado
   * @param {Object} metadata Metadados adicionais do arquivo
   * @returns {Promise<ExampleData>} Item atualizado com informações do arquivo
   */
  async uploadFile(
    id: number,
    file: File,
    metadata?: { description?: string }
  ): Promise<ExampleData> {
    return apiUtils.upload<ExampleData>(
      `/examples/${id}/upload`,
      file,
      metadata
    )
  },
}

export default exampleService
