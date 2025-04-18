import React, { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import documentService from '../services/documentService'
import OcrResultPreview from '../components/OcrResultPreview'

interface DocumentUploadProps {}

interface DocType {
  id: string
  name: string
  description: string
  required: boolean
  uploaded?: boolean
}

const DocumentUpload: React.FC<DocumentUploadProps> = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Receber dados do formulário da etapa anterior
  const formAnswers = location.state?.answers || {}

  const [activeDoc, setActiveDoc] = useState<string | null>(null)
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, File>>({})
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [requiredDocs, setRequiredDocs] = useState<DocType[]>([
    {
      id: 'rg',
      name: 'RG',
      description: 'Documento de identidade',
      required: true,
    },
    {
      id: 'cpf',
      name: 'CPF',
      description: 'Cadastro de Pessoa Física',
      required: true,
    },
    {
      id: 'proof_income',
      name: 'Comprovante de Renda',
      description: 'Contracheque ou holerite recente',
      required: true,
    },
    {
      id: 'address_proof',
      name: 'Comprovante de Residência',
      description: 'Conta de água, luz ou telefone',
      required: true,
    },
    {
      id: 'selfie',
      name: 'Selfie',
      description: 'Foto sua segurando o RG',
      required: true,
    },
  ])

  // ID da proposta (seria obtido de uma etapa anterior real)
  const proposalId = location.state?.proposalId || null

  // Objeto para armazenar os IDs dos documentos no backend
  const [docBackendIds, setDocBackendIds] = useState<Record<string, number>>({})

  // Estado para controlar a exibição dos resultados do OCR
  const [showOcrResults, setShowOcrResults] = useState<Record<string, boolean>>(
    {}
  )

  // Carregar documentos necessários com base na proposta
  useEffect(() => {
    const loadRequiredDocuments = async () => {
      if (proposalId) {
        try {
          const data = await documentService.getRequiredDocuments(proposalId)
          setRequiredDocs(data)

          // Marcar documentos já enviados
          const uploadedDocTypes = data
            .filter((doc: DocType) => doc.uploaded)
            .map((doc: DocType) => doc.id)

          // Criar objeto de documentos vazios para os já enviados
          const docsObject: Record<string, File> = {}
          uploadedDocTypes.forEach((docType) => {
            docsObject[docType] = new File([], 'uploaded')
          })

          setUploadedDocs(docsObject)
        } catch (error) {
          console.error('Erro ao carregar documentos necessários:', error)
        }
      }
    }

    loadRequiredDocuments()
  }, [proposalId])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !activeDoc) return

    const file = e.target.files[0]
    if (!file) return

    // Criar preview
    const url = URL.createObjectURL(file)

    // Atualizar estado
    setUploadedDocs((prev) => ({
      ...prev,
      [activeDoc]: file,
    }))

    setPreviewUrls((prev) => ({
      ...prev,
      [activeDoc]: url,
    }))

    // Fazer upload para o servidor
    handleUploadFile(activeDoc, file)
  }

  const handleUploadFile = async (docType: string, file: File) => {
    setUploading(docType)

    try {
      const response = await documentService.uploadDocument({
        file,
        document_type: docType,
        proposal_id: proposalId,
      })

      // Salvar o ID do documento retornado pelo backend
      setDocBackendIds((prev) => ({
        ...prev,
        [docType]: response.id,
      }))

      // Marcar documento como enviado no estado local
      setRequiredDocs((prev) =>
        prev.map((doc) =>
          doc.id === docType ? { ...doc, uploaded: true } : doc
        )
      )

      // Para documentos que precisam de OCR, mostrar os resultados
      if (['rg', 'cpf', 'proof_income', 'address_proof'].includes(docType)) {
        setShowOcrResults((prev) => ({
          ...prev,
          [docType]: true,
        }))
      }
    } catch (error) {
      console.error(`Erro ao fazer upload do ${docType}:`, error)
      alert(`Erro ao fazer upload do documento. Por favor, tente novamente.`)

      // Remover do estado se falhar
      setUploadedDocs((prev) => {
        const newDocs = { ...prev }
        delete newDocs[docType]
        return newDocs
      })

      setPreviewUrls((prev) => {
        const newPreviews = { ...prev }
        delete newPreviews[docType]
        return newPreviews
      })
    } finally {
      setUploading(null)
    }
  }

  const handleUploadClick = (docId: string) => {
    setActiveDoc(docId)
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleDeleteDoc = async (docId: string) => {
    setUploading(docId)

    try {
      // Verificar se temos o ID do backend para este documento
      const backendId = docBackendIds[docId]

      if (backendId) {
        // Chamar a API para excluir o documento
        await documentService.deleteDocument(backendId)

        // Remover o ID do backend
        const newBackendIds = { ...docBackendIds }
        delete newBackendIds[docId]
        setDocBackendIds(newBackendIds)
      }

      // Remover documento e preview
      const newDocs = { ...uploadedDocs }
      const newPreviews = { ...previewUrls }

      if (newPreviews[docId]) {
        URL.revokeObjectURL(newPreviews[docId])
      }

      delete newDocs[docId]
      delete newPreviews[docId]

      setUploadedDocs(newDocs)
      setPreviewUrls(newPreviews)

      // Remover resultados OCR
      setShowOcrResults((prev) => {
        const newResults = { ...prev }
        delete newResults[docId]
        return newResults
      })

      // Atualizar estado dos documentos requeridos
      setRequiredDocs((prev) =>
        prev.map((doc) =>
          doc.id === docId ? { ...doc, uploaded: false } : doc
        )
      )
    } catch (error) {
      console.error('Erro ao excluir documento:', error)
      alert('Erro ao excluir documento. Por favor, tente novamente.')
    } finally {
      setUploading(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Verificar se todos os documentos obrigatórios foram enviados
    const requiredDocIds = requiredDocs
      .filter((doc) => doc.required)
      .map((doc) => doc.id)
    const uploadedDocIds = Object.keys(uploadedDocs)

    const missingDocs = requiredDocIds.filter(
      (id) => !uploadedDocIds.includes(id)
    )

    if (missingDocs.length > 0) {
      const missingDocNames = missingDocs
        .map((id) => requiredDocs.find((doc) => doc.id === id)?.name)
        .join(', ')

      alert(`Por favor, envie os seguintes documentos: ${missingDocNames}`)
      return
    }

    setIsLoading(true)

    try {
      // Em uma API real, poderíamos finalizar a etapa de documentos aqui
      // await documentService.completeDocumentStep(proposalId)

      // Navegar para a próxima etapa
      setTimeout(() => {
        setIsLoading(false)
        navigate('/signature', {
          state: {
            answers: formAnswers,
            documents: Object.keys(uploadedDocs),
            proposalId,
          },
        })
      }, 1000)
    } catch (error) {
      console.error('Erro ao finalizar etapa de documentos:', error)
      alert('Erro ao finalizar a etapa. Por favor, tente novamente.')
      setIsLoading(false)
    }
  }

  return (
    <div className="card p-8 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-6">Envio de Documentos</h2>

      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Por favor, envie os documentos abaixo para análise da sua proposta.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,.pdf"
          className="hidden"
        />

        <div className="space-y-4 mb-8">
          {requiredDocs.map((doc) => (
            <div key={doc.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-medium">{doc.name}</h3>
                  <p className="text-sm text-gray-500">{doc.description}</p>
                </div>

                {uploading === doc.id ? (
                  <div className="text-sm text-gray-500">Enviando...</div>
                ) : doc.uploaded || previewUrls[doc.id] ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteDoc(doc.id)}
                    className="text-red-500 text-sm"
                  >
                    Remover
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleUploadClick(doc.id)}
                    className="text-celebra-blue text-sm font-medium"
                  >
                    Enviar
                  </button>
                )}
              </div>

              {previewUrls[doc.id] && (
                <div className="mt-2">
                  <div className="h-28 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden flex items-center justify-center">
                    {uploadedDocs[doc.id]?.type.includes('image') ? (
                      <img
                        src={previewUrls[doc.id]}
                        alt={`Preview de ${doc.name}`}
                        className="max-h-full object-contain"
                      />
                    ) : (
                      <div className="text-center px-4 py-2">
                        <p>📄 {uploadedDocs[doc.id]?.name}</p>
                        <p className="text-xs text-gray-500">
                          {Math.round((uploadedDocs[doc.id]?.size || 0) / 1024)}{' '}
                          KB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {doc.uploaded && !previewUrls[doc.id] && (
                <div className="mt-2 text-sm text-green-500 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Documento já enviado
                </div>
              )}

              {/* Exibir resultados do OCR se disponíveis */}
              {showOcrResults[doc.id] && docBackendIds[doc.id] && (
                <OcrResultPreview
                  documentId={docBackendIds[doc.id]}
                  documentType={doc.id}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Voltar
          </button>
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? 'Enviando...' : 'Continuar'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default DocumentUpload
