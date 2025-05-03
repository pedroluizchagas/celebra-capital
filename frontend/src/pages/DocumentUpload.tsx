import React, {
  useState,
  useRef,
  useEffect,
  lazy,
  Suspense,
  useCallback,
  useMemo,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import documentService from '../services/documentService'
// Importar componentes pesados com lazy loading
const OcrResultPreview = lazy(() => import('../components/OcrResultPreview'))
import OptimizedImage from '../components/OptimizedImage'

// Componente de fallback enquanto carrega componentes lazy
const LoadingFallback = () => (
  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded animate-pulse">
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/2"></div>
    <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
  </div>
)

// Componente de loading mais informativo com skeleton
const DocumentSkeleton = () => (
  <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4 animate-pulse">
    <div className="flex items-center space-x-4">
      <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
    <div className="mt-4 h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
  </div>
)

interface DocumentUploadProps {}

interface DocType {
  id: string
  name: string
  description: string
  required: boolean
  uploaded?: boolean
}

// Componente para documento individual (memoizado para evitar re-renders)
const DocumentItem = React.memo(
  ({
    doc,
    previewUrl,
    isUploading,
    showOcrResult,
    onUploadClick,
    onDeleteDoc,
  }: {
    doc: DocType
    previewUrl?: string
    isUploading: boolean
    showOcrResult: boolean
    onUploadClick: (id: string) => void
    onDeleteDoc: (id: string) => void
  }) => {
    return (
      <div
        className={`bg-white dark:bg-gray-900 rounded-lg shadow-md p-4 mb-4 transition-all ${
          isUploading ? 'opacity-70' : ''
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <span
              className={`mr-2 text-xl ${
                doc.uploaded ? 'text-green-500' : 'text-gray-400'
              }`}
            >
              {doc.uploaded ? '✓' : '○'}
            </span>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {doc.name}
                {doc.required && <span className="text-red-500 ml-1">*</span>}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {doc.description}
              </p>
            </div>
          </div>
          <div>
            {previewUrl ? (
              <button
                onClick={() => onDeleteDoc(doc.id)}
                className="px-3 py-1 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/50 transition"
                disabled={isUploading}
              >
                Remover
              </button>
            ) : (
              <button
                onClick={() => onUploadClick(doc.id)}
                className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
                disabled={isUploading}
              >
                Enviar
              </button>
            )}
          </div>
        </div>

        {previewUrl && (
          <div className="mt-3">
            <div className="relative rounded-lg overflow-hidden h-48 bg-gray-100 dark:bg-gray-800">
              <OptimizedImage
                src={previewUrl}
                alt={`Preview de ${doc.name}`}
                className="w-full h-full object-contain"
              />
            </div>

            {isUploading && (
              <div className="mt-2 flex items-center justify-center">
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  Processando...
                </span>
              </div>
            )}

            {/* Resultados do OCR - carregado de forma lazy */}
            {showOcrResult && (
              <div className="mt-3">
                <Suspense fallback={<LoadingFallback />}>
                  <OcrResultPreview
                    documentType={doc.id}
                    documentId={docBackendIds[doc.id] || 0}
                  />
                </Suspense>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
)

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

  // Carregar documentos necessários com base na proposta (memoizado)
  const loadRequiredDocuments = useCallback(async () => {
    if (proposalId) {
      try {
        setIsLoading(true)
        const data = await documentService.getRequiredDocuments(proposalId)
        setRequiredDocs(data)

        // Marcar documentos já enviados
        const uploadedDocTypes = data
          .filter((doc: DocType) => doc.uploaded)
          .map((doc: DocType) => doc.id)

        // Criar objeto de documentos vazios para os já enviados
        const docsObject: Record<string, File> = {}
        const previewsObject: Record<string, string> = {}
        const backendIds: Record<string, number> = {}

        // Preencher objetos de estado com documentos já enviados
        for (const doc of data) {
          if (doc.uploaded) {
            docsObject[doc.id] = new File([], 'uploaded')

            // Se houver URL de preview disponível, usá-la
            if (doc.preview_url) {
              previewsObject[doc.id] = doc.preview_url
            }

            // Se houver ID de backend disponível, salvá-lo
            if (doc.backend_id) {
              backendIds[doc.id] = doc.backend_id
            }

            // Se for um tipo que usa OCR, mostrar resultados
            if (
              ['rg', 'cpf', 'proof_income', 'address_proof'].includes(doc.id)
            ) {
              setShowOcrResults((prev) => ({
                ...prev,
                [doc.id]: true,
              }))
            }
          }
        }

        setUploadedDocs(docsObject)
        setPreviewUrls(previewsObject)
        setDocBackendIds(backendIds)
      } catch (error) {
        console.error('Erro ao carregar documentos necessários:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }, [proposalId])

  useEffect(() => {
    loadRequiredDocuments()
  }, [loadRequiredDocuments])

  // Verificar se todos os documentos obrigatórios foram enviados (memoizado)
  const allRequiredDocsUploaded = useMemo(() => {
    const requiredDocIds = requiredDocs
      .filter((doc) => doc.required)
      .map((doc) => doc.id)

    return requiredDocIds.every((id) => Object.keys(uploadedDocs).includes(id))
  }, [requiredDocs, uploadedDocs])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
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
    },
    [activeDoc]
  )

  const handleUploadFile = useCallback(
    async (docType: string, file: File) => {
      setUploading(docType)

      try {
        // Definir configurações de otimização com base no tipo de documento
        const compressionConfig = {
          compressImage: true,
          maxWidth: docType === 'selfie' ? 1280 : 1920,
          maxHeight: docType === 'selfie' ? 720 : 1080,
          quality: docType === 'selfie' ? 0.85 : 0.8,
        }

        const response = await documentService.uploadDocument({
          file,
          document_type: docType,
          proposal_id: proposalId,
          ...compressionConfig,
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
    },
    [proposalId]
  )

  const handleUploadClick = useCallback((docId: string) => {
    setActiveDoc(docId)
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [])

  const handleDeleteDoc = useCallback(
    async (docId: string) => {
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

        // Limpar URL do objeto e revogar para liberar memória
        if (previewUrls[docId]) {
          URL.revokeObjectURL(previewUrls[docId])
        }

        // Remover do estado
        setUploadedDocs((prev) => {
          const newDocs = { ...prev }
          delete newDocs[docId]
          return newDocs
        })

        setPreviewUrls((prev) => {
          const newPreviews = { ...prev }
          delete newPreviews[docId]
          return newPreviews
        })

        setShowOcrResults((prev) => {
          const newResults = { ...prev }
          delete newResults[docId]
          return newResults
        })

        // Atualizar o status do documento na lista
        setRequiredDocs((prev) =>
          prev.map((doc) =>
            doc.id === docId ? { ...doc, uploaded: false } : doc
          )
        )
      } catch (error) {
        console.error(`Erro ao excluir o ${docId}:`, error)
        alert(`Erro ao excluir documento. Por favor, tente novamente.`)
      } finally {
        setUploading(null)
      }
    },
    [docBackendIds, previewUrls]
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setIsLoading(true)

      try {
        // Verificar se todos os documentos obrigatórios foram enviados
        const missingDocs = requiredDocs
          .filter((doc) => doc.required && !uploadedDocs[doc.id])
          .map((doc) => doc.name)

        if (missingDocs.length > 0) {
          alert(
            `Por favor, envie todos os documentos obrigatórios: ${missingDocs.join(
              ', '
            )}`
          )
          setIsLoading(false)
          return
        }

        // Se houver uma proposta, finalizar o upload
        if (proposalId) {
          await documentService.completeDocumentStep(proposalId)
        }

        // Redirecionar para a próxima etapa
        navigate('/signature', { state: { proposalId } })
      } catch (error) {
        console.error('Erro ao finalizar envio de documentos:', error)
        alert(
          'Erro ao finalizar o envio de documentos. Por favor, tente novamente.'
        )
        setIsLoading(false)
      }
    },
    [requiredDocs, uploadedDocs, proposalId, navigate]
  )

  // Componente de conteúdo memoizado
  const DocumentContent = useMemo(
    () => (
      <div className="space-y-6">
        {/* Título e instruções */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Envio de Documentos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Envie os documentos necessários para avaliarmos sua proposta.
          </p>
        </div>

        {/* Lista de documentos */}
        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,.pdf"
              className="hidden"
            />

            {/* Lista de documentos necessários */}
            <div className="space-y-4">
              {requiredDocs.map((doc) => (
                <DocumentItem
                  key={doc.id}
                  doc={doc}
                  previewUrl={previewUrls[doc.id]}
                  isUploading={uploading === doc.id}
                  showOcrResult={showOcrResults[doc.id] || false}
                  onUploadClick={handleUploadClick}
                  onDeleteDoc={handleDeleteDoc}
                />
              ))}
            </div>

            {/* Botão de próxima etapa */}
            <div className="mt-8 flex justify-center">
              <button
                type="submit"
                disabled={isLoading || !allRequiredDocsUploaded}
                className={`
                px-6 py-3 rounded-lg text-white font-medium 
                ${
                  isLoading || !allRequiredDocsUploaded
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 transform hover:-translate-y-1 transition-all duration-200'
                }
              `}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processando...
                  </span>
                ) : (
                  'Continuar para assinatura'
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Barra de progresso */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Progresso:
            </span>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {Math.round(
                (Object.keys(uploadedDocs).length / requiredDocs.length) * 100
              )}
              %
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
              style={{
                width: `${Math.round(
                  (Object.keys(uploadedDocs).length / requiredDocs.length) * 100
                )}%`,
                transition: 'width 0.5s ease',
              }}
            ></div>
          </div>
        </div>
      </div>
    ),
    [
      requiredDocs,
      handleFileChange,
      handleSubmit,
      isLoading,
      uploading,
      uploadedDocs,
      previewUrls,
      showOcrResults,
      handleUploadClick,
      handleDeleteDoc,
      allRequiredDocsUploaded,
    ]
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {isLoading && !DocumentContent ? (
          // Esqueleto de carregamento quando os dados iniciais estão sendo carregados
          <div className="space-y-4">
            <div className="text-center animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded mx-auto w-64 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mx-auto w-96"></div>
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <DocumentSkeleton key={i} />
            ))}
          </div>
        ) : (
          DocumentContent
        )}
      </div>
    </div>
  )
}

export default DocumentUpload
