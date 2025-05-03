import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import proposalService, { Proposal } from '../../services/proposalService'
import documentService from '../../services/documentService'
import ApprovalActions from '../../components/proposal/ApprovalActions'
import ProposalFeedback from '../../components/proposal/ProposalFeedback'

interface Document {
  id: number
  document_type: string
  file_name: string
  created_at: string
  verification_status: string
}

interface Comment {
  id: string
  author: string
  author_role: string
  text: string
  created_at: string
  is_internal: boolean
}

const ProposalDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estados para aprovação/rejeição
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [approvalComment, setApprovalComment] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)

  // Estado para documentos adicionais
  const [showRequestDocsModal, setShowRequestDocsModal] = useState(false)
  const [requestingDocs, setRequestingDocs] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')
  const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>([])

  // Estado para comentários
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)

  useEffect(() => {
    if (!id) return

    const fetchProposalDetails = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const proposalData = await proposalService.getProposalDetails(
          Number(id)
        )
        setProposal(proposalData)

        // Obter documentos associados à proposta
        const docsData = await documentService.getDocumentsByProposal(
          Number(id)
        )
        setDocuments(docsData)

        // Carregar comentários da proposta (simulado por enquanto)
        setIsLoadingComments(true)
        // Em uma implementação real, usaríamos um serviço para buscar comentários
        // const commentsData = await commentService.getProposalComments(Number(id))

        // Dados simulados de comentários
        setTimeout(() => {
          setComments([
            {
              id: '1',
              author: 'Ana Silva',
              author_role: 'Analista de Crédito',
              text: 'Cliente com bom histórico de crédito. Documentação completa e verificada.',
              created_at: new Date(
                Date.now() - 48 * 60 * 60 * 1000
              ).toISOString(),
              is_internal: true,
            },
            {
              id: '2',
              author: 'Carlos Santos',
              author_role: 'Gerente',
              text: 'Aprovado conforme política de crédito. Valor dentro do limite pré-aprovado.',
              created_at: new Date(
                Date.now() - 24 * 60 * 60 * 1000
              ).toISOString(),
              is_internal: true,
            },
            {
              id: '3',
              author: 'Sistema',
              author_role: 'Automático',
              text: 'Documentação solicitada ao cliente: Comprovante de renda atualizado.',
              created_at: new Date(
                Date.now() - 12 * 60 * 60 * 1000
              ).toISOString(),
              is_internal: false,
            },
          ])
          setIsLoadingComments(false)
        }, 1000)
      } catch (err) {
        console.error('Erro ao carregar detalhes da proposta:', err)
        setError('Não foi possível carregar os detalhes da proposta.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProposalDetails()
  }, [id])

  const handleApproveProposal = async () => {
    if (!id) return

    setIsApproving(true)
    try {
      const updatedProposal = await proposalService.approveProposal(
        Number(id),
        approvalComment
      )
      setProposal(updatedProposal)
      setShowApproveModal(false)
      alert('Proposta aprovada com sucesso!')
    } catch (err) {
      console.error('Erro ao aprovar proposta:', err)
      alert('Erro ao aprovar proposta. Tente novamente mais tarde.')
    } finally {
      setIsApproving(false)
    }
  }

  const handleRejectProposal = async () => {
    if (!id || !rejectReason) return

    setIsRejecting(true)
    try {
      const updatedProposal = await proposalService.rejectProposal(
        Number(id),
        rejectReason,
        approvalComment
      )
      setProposal(updatedProposal)
      setShowRejectModal(false)
      alert('Proposta rejeitada com sucesso!')
    } catch (err) {
      console.error('Erro ao rejeitar proposta:', err)
      alert('Erro ao rejeitar proposta. Tente novamente mais tarde.')
    } finally {
      setIsRejecting(false)
    }
  }

  const handleRequestDocuments = async () => {
    if (!id || selectedDocTypes.length === 0) return

    setRequestingDocs(true)
    try {
      const updatedProposal = await proposalService.requestAdditionalDocuments(
        Number(id),
        selectedDocTypes,
        requestMessage
      )
      setProposal(updatedProposal)
      setShowRequestDocsModal(false)
      alert('Solicitação de documentos enviada com sucesso!')
    } catch (err) {
      console.error('Erro ao solicitar documentos:', err)
      alert('Erro ao solicitar documentos. Tente novamente mais tarde.')
    } finally {
      setRequestingDocs(false)
    }
  }

  const handleDocTypeSelection = (type: string) => {
    setSelectedDocTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const renderDocumentStatus = (status: string) => {
    const statusMap = {
      pending: {
        label: 'Pendente',
        class:
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      },
      verified: {
        label: 'Verificado',
        class:
          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      },
      rejected: {
        label: 'Rejeitado',
        class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      },
    }

    const statusInfo =
      statusMap[status as keyof typeof statusMap] || statusMap.pending

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    )
  }

  const handleStatusChange = (newStatus: string) => {
    if (proposal) {
      setProposal({ ...proposal, status: newStatus })
    }
  }

  const handleAddComment = async (text: string, isInternal: boolean) => {
    // Em uma implementação real, chamaríamos a API
    // await commentService.addComment(Number(id), text, isInternal)

    // Simulação de adição de comentário
    const newComment: Comment = {
      id: `temp-${Date.now()}`,
      author: 'Você',
      author_role: 'Administrador',
      text,
      created_at: new Date().toISOString(),
      is_internal: isInternal,
    }

    setComments([...comments, newComment])
    return Promise.resolve()
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <div className="flex justify-center items-center h-64">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-celebra-blue border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="ml-3 text-gray-500 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error || !proposal) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400 mb-4">
            {error || 'Proposta não encontrada'}
          </p>
          <button
            onClick={() => navigate('/admin/proposals')}
            className="px-4 py-2 bg-celebra-blue text-white rounded hover:bg-blue-600"
          >
            Voltar para Lista de Propostas
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho e Detalhes Básicos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Proposta #{proposal.proposal_number}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Criada em {formatDate(proposal.created_at)}
            </p>
          </div>
          <div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                proposal.status === 'approved'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : proposal.status === 'rejected'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
              }`}
            >
              {proposal.status === 'approved'
                ? 'Aprovada'
                : proposal.status === 'rejected'
                ? 'Rejeitada'
                : 'Pendente'}
            </span>
          </div>
        </div>

        {/* ... outros detalhes da proposta ... */}

        {/* Ações de Aprovação */}
        <ApprovalActions
          proposalId={proposal.id}
          status={proposal.status}
          onStatusChange={handleStatusChange}
        />
      </div>

      {/* Seção de Comentários e Feedback */}
      <ProposalFeedback
        proposalId={proposal.id}
        comments={comments}
        onAddComment={handleAddComment}
        isLoading={isLoadingComments}
      />

      {/* ... outras seções existentes ... */}
    </div>
  )
}

export default ProposalDetails
