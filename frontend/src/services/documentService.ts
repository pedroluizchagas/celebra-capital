import api from './api'

interface UploadDocumentParams {
  file: File
  document_type: string
  proposal_id?: number
  compressImage?: boolean
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

/**
 * Comprime uma imagem redimensionando e convertendo para formato WebP
 * antes do upload, retornando um novo File object
 */
const compressImage = async (
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Verificar se é uma imagem
    if (!file.type.startsWith('image/')) {
      return resolve(file)
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        // Calcular novas dimensões mantendo proporção
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        // Criar canvas para redimensionar
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        // Desenhar imagem redimensionada
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          return resolve(file) // fallback se não conseguir obter contexto
        }

        ctx.drawImage(img, 0, 0, width, height)

        // Verificar se o navegador suporta WebP
        const supportsWebP =
          canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
        const type = supportsWebP ? 'image/webp' : file.type

        // Converter para Blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file) // fallback se falhar
            }

            // Criar novo File
            const optimizedFile = new File(
              [blob],
              file.name.replace(
                /\.[^.]+$/,
                supportsWebP
                  ? '.webp'
                  : `_optimized${file.name.match(/\.[^.]+$/)?.[0] || '.jpg'}`
              ),
              { type }
            )

            // Retornar arquivo otimizado
            resolve(optimizedFile)
          },
          type,
          quality
        )
      }
      img.onerror = () => resolve(file) // fallback em caso de erro
    }
    reader.onerror = () => resolve(file) // fallback em caso de erro
  })
}

const documentService = {
  /**
   * Upload de documento
   */
  uploadDocument: async ({
    file,
    document_type,
    proposal_id,
    compressImage: shouldCompress = true,
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
  }: UploadDocumentParams) => {
    try {
      // Processar arquivo antes do upload se for imagem e a opção de compressão estiver ativa
      const processedFile =
        shouldCompress && file.type.startsWith('image/')
          ? await compressImage(file, maxWidth, maxHeight, quality)
          : file

      const formData = new FormData()
      formData.append('file', processedFile)
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
  uploadSelfie: async (
    file: File,
    proposal_id?: number,
    shouldCompress = true,
    maxWidth = 1280,
    maxHeight = 720,
    quality = 0.85
  ) => {
    try {
      // Processar arquivo antes do upload se for imagem e a opção de compressão estiver ativa
      const processedFile = shouldCompress
        ? await compressImage(file, maxWidth, maxHeight, quality)
        : file

      const formData = new FormData()
      formData.append('file', processedFile)

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
