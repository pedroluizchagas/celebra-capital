import React, { useState } from 'react'
import proposalService from '../../services/proposalService'
import Button from '../../components/Button'

interface ApprovalActionsProps {
  proposalId: number
  status: string
  onStatusChange: (newStatus: string) => void
}

const ApprovalActions: React.FC<ApprovalActionsProps> = ({
  proposalId,
  status,
  onStatusChange,
}) => {
  // Estados para controle dos modais
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showRequestDocsModal, setShowRequestDocsModal] = useState(false)

  // Estados para formulários
  const [isLoading, setIsLoading] = useState(false)
  const [comment, setComment] = useState('')
  const [isInternalComment, setIsInternalComment] = useState(false)
  const [interestRate, setInterestRate] = useState<string>('')
  const [amountApproved, setAmountApproved] = useState<string>('')
  const [installmentValue, setInstallmentValue] = useState<string>('')
  const [rejectReason, setRejectReason] = useState('')
  const [requestMessage, setRequestMessage] = useState('')

  // Lista predefinida de tipos de documento
  const documentTypes = [
    'CPF',
    'RG',
    'Comprovante de Residência',
    'Comprovante de Renda',
    'Contracheque',
    'Extrato Bancário',
    'Declaração de IR',
    'CNPJ',
    'Contrato Social',
    'Demonstrações Financeiras',
  ]

  const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Toggle para seleção de documentos
  const handleDocTypeSelection = (type: string) => {
    setSelectedDocTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  // Reset dos estados
  const resetState = () => {
    setComment('')
    setIsInternalComment(false)
    setInterestRate('')
    setAmountApproved('')
    setInstallmentValue('')
    setRejectReason('')
    setRequestMessage('')
    setSelectedDocTypes([])
    setError(null)
    setSuccess(null)
  }

  // Aprovar proposta
  const handleApproveProposal = async () => {
    if (!proposalId) return

    // Validação básica
    if (!amountApproved || !interestRate) {
      setError('Valor aprovado e taxa de juros são obrigatórios.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = {
        interest_rate: parseFloat(interestRate),
        amount_approved: parseFloat(amountApproved),
        installment_value: installmentValue
          ? parseFloat(installmentValue)
          : undefined,
        comment: comment,
        is_internal: isInternalComment,
      }

      await proposalService.approveProposal(proposalId, comment)
      setSuccess('Proposta aprovada com sucesso!')
      onStatusChange('approved')

      setTimeout(() => {
        setShowApproveModal(false)
        setSuccess(null)
      }, 2000)
    } catch (err) {
      console.error('Erro ao aprovar proposta:', err)
      setError('Erro ao aprovar proposta. Tente novamente mais tarde.')
    } finally {
      setIsLoading(false)
    }
  }

  // Rejeitar proposta
  const handleRejectProposal = async () => {
    if (!proposalId || !rejectReason) {
      setError('É necessário informar o motivo da rejeição.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await proposalService.rejectProposal(proposalId, rejectReason, comment)
      setSuccess('Proposta rejeitada com sucesso!')
      onStatusChange('rejected')

      setTimeout(() => {
        setShowRejectModal(false)
        setSuccess(null)
      }, 2000)
    } catch (err) {
      console.error('Erro ao rejeitar proposta:', err)
      setError('Erro ao rejeitar proposta. Tente novamente mais tarde.')
    } finally {
      setIsLoading(false)
    }
  }

  // Solicitar documentos adicionais
  const handleRequestDocuments = async () => {
    if (!proposalId || selectedDocTypes.length === 0) {
      setError('Selecione pelo menos um tipo de documento.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await proposalService.requestAdditionalDocuments(
        proposalId,
        selectedDocTypes,
        requestMessage
      )

      setSuccess('Solicitação de documentos enviada com sucesso!')
      onStatusChange('waiting_docs')

      setTimeout(() => {
        setShowRequestDocsModal(false)
        setSuccess(null)
      }, 2000)
    } catch (err) {
      console.error('Erro ao solicitar documentos:', err)
      setError('Erro ao solicitar documentos. Tente novamente mais tarde.')
    } finally {
      setIsLoading(false)
    }
  }

  // Renderizar mensagem de erro
  const renderError = () => {
    if (!error) return null

    return (
      <div className="mb-4 bg-red-100 border-l-4 border-red-500 p-4 text-red-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300">
        <p>{error}</p>
      </div>
    )
  }

  // Renderizar mensagem de sucesso
  const renderSuccess = () => {
    if (!success) return null

    return (
      <div className="mb-4 bg-green-100 border-l-4 border-green-500 p-4 text-green-700 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300">
        <p>{success}</p>
      </div>
    )
  }

  // Verificar se a proposta está em um estado que pode ser alterado
  const isStatusActionable = ['pending', 'analyzing', 'waiting_docs'].includes(
    status
  )

  // Renderização do componente
  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-xl font-semibold mb-4">Ações da Proposta</h3>

      <div className="flex flex-wrap gap-4">
        <Button
          onClick={() => {
            resetState()
            setShowApproveModal(true)
          }}
          disabled={!isStatusActionable}
          variant={isStatusActionable ? 'primary' : 'outline'}
          className="px-4 py-2"
        >
          Aprovar Proposta
        </Button>

        <Button
          onClick={() => {
            resetState()
            setShowRejectModal(true)
          }}
          disabled={!isStatusActionable}
          variant={isStatusActionable ? 'secondary' : 'outline'}
          className="px-4 py-2"
        >
          Rejeitar Proposta
        </Button>

        <Button
          onClick={() => {
            resetState()
            setShowRequestDocsModal(true)
          }}
          disabled={!isStatusActionable}
          variant={isStatusActionable ? 'primary' : 'outline'}
          className="px-4 py-2"
        >
          Solicitar Documentos
        </Button>
      </div>

      {/* Modal de Aprovação */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Aprovar Proposta
            </h3>

            {renderError()}
            {renderSuccess()}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Valor Aprovado (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  value={amountApproved}
                  onChange={(e) => setAmountApproved(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Taxa de Juros (% ao mês)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Valor da Parcela (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  value={installmentValue}
                  onChange={(e) => setInstallmentValue(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Comentário (opcional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is-internal-approve"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={isInternalComment}
                  onChange={(e) => setIsInternalComment(e.target.checked)}
                  disabled={isLoading}
                />
                <label
                  htmlFor="is-internal-approve"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  Comentário interno (não visível para o cliente)
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                onClick={() => {
                  setShowApproveModal(false)
                  resetState()
                }}
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleApproveProposal}
                disabled={isLoading || !amountApproved || !interestRate}
              >
                {isLoading ? 'Processando...' : 'Confirmar Aprovação'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Rejeição */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Rejeitar Proposta
            </h3>

            {renderError()}
            {renderSuccess()}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Motivo da Rejeição <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Este motivo será informado ao cliente.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Comentário Adicional (opcional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is-internal-reject"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={isInternalComment}
                  onChange={(e) => setIsInternalComment(e.target.checked)}
                  disabled={isLoading}
                />
                <label
                  htmlFor="is-internal-reject"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  Comentário interno (não visível para o cliente)
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                onClick={() => {
                  setShowRejectModal(false)
                  resetState()
                }}
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleRejectProposal}
                disabled={isLoading || !rejectReason.trim()}
              >
                {isLoading ? 'Processando...' : 'Confirmar Rejeição'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Solicitação de Documentos */}
      {showRequestDocsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Solicitar Documentos Adicionais
            </h3>

            {renderError()}
            {renderSuccess()}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selecione os documentos necessários{' '}
                  <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {documentTypes.map((type) => (
                    <div key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`doc-${type}`}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={selectedDocTypes.includes(type)}
                        onChange={() => handleDocTypeSelection(type)}
                        disabled={isLoading}
                      />
                      <label
                        htmlFor={`doc-${type}`}
                        className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                      >
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mensagem para o Cliente
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  disabled={isLoading}
                  placeholder="Por favor, envie os documentos selecionados para darmos continuidade à análise da sua proposta."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                onClick={() => {
                  setShowRequestDocsModal(false)
                  resetState()
                }}
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleRequestDocuments}
                disabled={isLoading || selectedDocTypes.length === 0}
              >
                {isLoading ? 'Processando...' : 'Solicitar Documentos'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApprovalActions
