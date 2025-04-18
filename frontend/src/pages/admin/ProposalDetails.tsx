import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import proposalService, { Proposal } from '../../services/proposalService'
import documentService from '../../services/documentService'

interface Document {
  id: number
  document_type: string
  file_name: string
  created_at: string
  verification_status: string
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
  const [comments, setComments] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)

  // Estado para documentos adicionais
  const [showRequestDocsModal, setShowRequestDocsModal] = useState(false)
  const [requestingDocs, setRequestingDocs] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')
  const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>([])

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
        comments
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
        comments
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Cabeçalho */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div>
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Proposta {proposal.proposal_number}
            </h2>
            <span
              className={`ml-4 px-2 py-1 rounded-full text-xs 
              ${
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
                : proposal.status === 'processing'
                ? 'Em processamento'
                : proposal.status === 'cancelled'
                ? 'Cancelada'
                : 'Pendente'}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Criada em {formatDate(proposal.created_at)}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate('/admin/proposals')}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Voltar
          </button>

          {proposal.status === 'pending' && (
            <>
              <button
                onClick={() => setShowRequestDocsModal(true)}
                className="px-3 py-1 border border-purple-500 text-purple-500 rounded hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                Solicitar Documentos
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Rejeitar
              </button>
              <button
                onClick={() => setShowApproveModal(true)}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Aprovar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Informações do Cliente */}
          <div className="col-span-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Informações do Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nome</p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {proposal.user.first_name} {proposal.user.last_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Email
                </p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {proposal.user.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ID do Usuário
                </p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {proposal.user.id}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Última Atualização
                </p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {formatDate(proposal.updated_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Detalhes da Proposta */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Detalhes da Proposta
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Valor do Crédito
                </p>
                <p className="text-xl font-bold text-celebra-blue">
                  {formatCurrency(proposal.credit_value)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tipo de Crédito
                </p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {proposal.credit_type === 'personal' && 'Pessoal'}
                  {proposal.credit_type === 'consignment' && 'Consignado'}
                  {proposal.credit_type === 'fgts' && 'FGTS'}
                  {proposal.credit_type === 'secured' && 'Garantido'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Status dos Documentos
                </p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {proposal.documents_complete ? 'Completos' : 'Incompletos'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Status da Assinatura
                </p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {proposal.signature_complete ? 'Assinado' : 'Pendente'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Documentos Enviados */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Documentos Enviados
          </h3>
          {documents.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              Nenhum documento enviado ainda.
            </p>
          ) : (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Tipo
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Arquivo
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Data de Envio
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {doc.document_type === 'rg' && 'RG'}
                        {doc.document_type === 'cpf' && 'CPF'}
                        {doc.document_type === 'proof_income' &&
                          'Comprovante de Renda'}
                        {doc.document_type === 'address_proof' &&
                          'Comprovante de Residência'}
                        {doc.document_type === 'selfie' && 'Selfie'}
                        {doc.document_type === 'fgts' && 'Extrato FGTS'}
                        {doc.document_type === 'other' && 'Outro'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        <a
                          href="#" // Substituir com link real do documento
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {doc.file_name}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {formatDate(doc.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderDocumentStatus(doc.verification_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a
                          href="#" // Substituir com link real do documento
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-celebra-blue hover:text-blue-800 dark:hover:text-blue-400 mr-4"
                        >
                          Visualizar
                        </a>
                        <button
                          className="text-purple-600 hover:text-purple-800 dark:hover:text-purple-400"
                          onClick={() => {
                            // Implementar visualização do OCR
                            alert(
                              'Visualização de OCR não implementada nesta versão'
                            )
                          }}
                        >
                          Ver OCR
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Histórico de atividades (simplificado) */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Histórico de Atividades
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center mt-1">
                  <span className="text-white text-xs">1</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    Proposta criada
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(proposal.created_at)} às{' '}
                    {new Date(proposal.created_at).toLocaleTimeString('pt-BR')}
                  </p>
                </div>
              </li>
              {documents.length > 0 && (
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-purple-500 flex items-center justify-center mt-1">
                    <span className="text-white text-xs">2</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      Documentos enviados ({documents.length})
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(documents[0].created_at)} às{' '}
                      {new Date(documents[0].created_at).toLocaleTimeString(
                        'pt-BR'
                      )}
                    </p>
                  </div>
                </li>
              )}
              {proposal.signature_complete && (
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center mt-1">
                    <span className="text-white text-xs">3</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      Assinatura realizada
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(proposal.updated_at)} às{' '}
                      {new Date(proposal.updated_at).toLocaleTimeString(
                        'pt-BR'
                      )}
                    </p>
                  </div>
                </li>
              )}
              {(proposal.status === 'approved' ||
                proposal.status === 'rejected') && (
                <li className="flex items-start">
                  <div
                    className={`flex-shrink-0 h-5 w-5 rounded-full ${
                      proposal.status === 'approved'
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    } flex items-center justify-center mt-1`}
                  >
                    <span className="text-white text-xs">4</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      Proposta{' '}
                      {proposal.status === 'approved'
                        ? 'aprovada'
                        : 'rejeitada'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(proposal.updated_at)} às{' '}
                      {new Date(proposal.updated_at).toLocaleTimeString(
                        'pt-BR'
                      )}
                    </p>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Modal de Aprovação */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Aprovar Proposta
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Tem certeza que deseja aprovar esta proposta? Esta ação não pode
              ser desfeita.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Comentários (opcional)
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm"
                rows={3}
                placeholder="Adicione comentários sobre sua decisão..."
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={isApproving}
              >
                Cancelar
              </button>
              <button
                onClick={handleApproveProposal}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                disabled={isApproving}
              >
                {isApproving ? 'Aprovando...' : 'Confirmar Aprovação'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Rejeição */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Rejeitar Proposta
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Por favor, informe o motivo da rejeição desta proposta.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Motivo da Rejeição <span className="text-red-500">*</span>
              </label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm"
                required
              >
                <option value="">Selecione o motivo</option>
                <option value="insufficient_income">Renda insuficiente</option>
                <option value="incomplete_documents">
                  Documentação incompleta
                </option>
                <option value="invalid_documents">Documentação inválida</option>
                <option value="negative_credit_score">
                  Score de crédito negativo
                </option>
                <option value="high_debt_ratio">
                  Elevado índice de endividamento
                </option>
                <option value="other">Outro motivo</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Comentários (opcional)
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm"
                rows={3}
                placeholder="Adicione detalhes adicionais sobre sua decisão..."
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={isRejecting}
              >
                Cancelar
              </button>
              <button
                onClick={handleRejectProposal}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                disabled={isRejecting || !rejectReason}
              >
                {isRejecting ? 'Rejeitando...' : 'Confirmar Rejeição'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Solicitação de Documentos */}
      {showRequestDocsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Solicitar Documentos Adicionais
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Selecione os documentos adicionais que deseja solicitar ao
              cliente.
            </p>
            <div className="mb-4">
              <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Documentos <span className="text-red-500">*</span>
              </p>
              <div className="space-y-2">
                {[
                  'rg',
                  'cpf',
                  'proof_income',
                  'address_proof',
                  'selfie',
                  'fgts',
                  'other',
                ].map((docType) => (
                  <div key={docType} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`doc-${docType}`}
                      checked={selectedDocTypes.includes(docType)}
                      onChange={() => handleDocTypeSelection(docType)}
                      className="h-4 w-4 text-celebra-blue focus:ring-celebra-blue border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`doc-${docType}`}
                      className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                    >
                      {docType === 'rg' && 'RG'}
                      {docType === 'cpf' && 'CPF'}
                      {docType === 'proof_income' && 'Comprovante de Renda'}
                      {docType === 'address_proof' &&
                        'Comprovante de Residência'}
                      {docType === 'selfie' && 'Selfie'}
                      {docType === 'fgts' && 'Extrato FGTS'}
                      {docType === 'other' && 'Outro documento'}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mensagem para o cliente
              </label>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm"
                rows={3}
                placeholder="Informe por que estes documentos são necessários..."
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRequestDocsModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={requestingDocs}
              >
                Cancelar
              </button>
              <button
                onClick={handleRequestDocuments}
                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50"
                disabled={requestingDocs || selectedDocTypes.length === 0}
              >
                {requestingDocs ? 'Enviando...' : 'Enviar Solicitação'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProposalDetails
