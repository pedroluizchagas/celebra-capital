import React from 'react'
import { useNavigate } from 'react-router-dom'
import { RecentProposal } from '../../services/dashboardService'

interface ProposalListProps {
  proposals: RecentProposal[]
  isLoading?: boolean
  showViewAll?: boolean
}

const ProposalList: React.FC<ProposalListProps> = ({
  proposals,
  isLoading = false,
  showViewAll = true,
}) => {
  const navigate = useNavigate()

  const getStatusClass = (status: string) => {
    const statusClasses = {
      pending:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      approved:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      processing:
        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      cancelled:
        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    }

    return (
      statusClasses[status as keyof typeof statusClasses] ||
      statusClasses.pending
    )
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente'
      case 'approved':
        return 'Aprovada'
      case 'rejected':
        return 'Rejeitada'
      case 'processing':
        return 'Em processamento'
      case 'cancelled':
        return 'Cancelada'
      default:
        return 'Pendente'
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-6"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="flex items-center">
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mr-2"></div>
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mx-2"></div>
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-1/5 mx-2"></div>
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-1/6 mx-2"></div>
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-1/6 ml-2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!proposals || proposals.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          Nenhuma proposta encontrada
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Cliente</th>
            <th className="px-4 py-2">Valor</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Data</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {proposals.map((proposal, index) => (
            <tr
              key={index}
              className="hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
            >
              <td className="px-4 py-3 whitespace-nowrap text-blue-500">
                <button
                  onClick={() => navigate(`/admin/proposals/${proposal.id}`)}
                  className="hover:underline"
                >
                  {proposal.id}
                </button>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{proposal.client}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                {formatCurrency(proposal.value)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${getStatusClass(
                    proposal.status
                  )}`}
                >
                  {getStatusLabel(proposal.status)}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{proposal.date}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showViewAll && (
        <div className="mt-4 text-right">
          <button
            onClick={() => navigate('/admin/proposals')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Ver todas as propostas →
          </button>
        </div>
      )}
    </div>
  )
}

export default ProposalList
