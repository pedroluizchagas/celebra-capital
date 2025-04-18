import api from './api'

interface UploadDocumentParams {
  file: File
  document_type: string
  proposal_id?: number
}

const documentService = {
  /**
   * Upload de documento
   */
  uploadDocument: async ({
    file,
    document_type,
    proposal_id,
  }: UploadDocumentParams) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('document_type', document_type)

      if (proposal_id) {
        formData.append('proposal_id', proposal_id.toString())
      }

      const response = await api.post('/documents/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return response.data
    } catch (error) {
      console.error('Erro ao fazer upload de documento:', error)
      throw error
    }
  },

  /**
   * Upload específico para selfie
   */
  uploadSelfie: async (file: File, proposal_id?: number) => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      if (proposal_id) {
        formData.append('proposal_id', proposal_id.toString())
      }

      const response = await api.post('/documents/selfie/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return response.data
    } catch (error) {
      console.error('Erro ao fazer upload de selfie:', error)
      throw error
    }
  },

  /**
   * Listar documentos do usuário
   */
  getUserDocuments: async () => {
    try {
      const response = await api.get('/documents/')
      return response.data
    } catch (error) {
      console.error('Erro ao obter documentos do usuário:', error)
      throw error
    }
  },

  /**
   * Listar documentos necessários para uma proposta
   */
  getRequiredDocuments: async (proposalId: number) => {
    try {
      const response = await api.get(`/documents/required/${proposalId}/`)
      return response.data
    } catch (error) {
      console.error('Erro ao obter documentos necessários:', error)
      throw error
    }
  },

  /**
   * Excluir documento
   */
  deleteDocument: async (documentId: number) => {
    try {
      const response = await api.delete(`/documents/${documentId}/`)
      return response.data
    } catch (error) {
      console.error('Erro ao excluir documento:', error)
      throw error
    }
  },

  /**
   * Obter resultados de OCR para um documento
   */
  getOcrResults: async (documentId: number) => {
    try {
      const response = await api.get(`/documents/${documentId}/ocr/`)
      return response.data
    } catch (error) {
      console.error('Erro ao obter resultados de OCR:', error)
      throw error
    }
  },

  /**
   * Obter documentos associados a uma proposta específica
   */
  getDocumentsByProposal: async (proposalId: number) => {
    try {
      const response = await api.get(`/documents/proposal/${proposalId}/`)
      return response.data
    } catch (error) {
      console.error('Erro ao obter documentos da proposta:', error)
      throw error
    }
  },
}

export default documentService
