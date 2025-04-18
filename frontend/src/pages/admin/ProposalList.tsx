import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import proposalService, {
  Proposal,
  ProposalFilters,
} from '../../services/proposalService'

const ProposalList: React.FC = () => {
  const navigate = useNavigate()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  // Estado para paginação
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Estado para filtros
  const [filters, setFilters] = useState<ProposalFilters>({
    status: '',
    credit_type: '',
    min_value: undefined,
    max_value: undefined,
    search: '',
    page: 1,
    page_size: 10,
  })

  // Status de exportação
  const [exporting, setExporting] = useState(false)

  // Efeito para carregar propostas
  useEffect(() => {
    fetchProposals()
  }, [page, pageSize, filters])

  const fetchProposals = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Atualizar filtros com página atual
      const currentFilters = {
        ...filters,
        page,
        page_size: pageSize,
      }

      const response = await proposalService.getProposals(currentFilters)
      setProposals(response.results)
      setTotalCount(response.count)
    } catch (err) {
      console.error('Erro ao carregar propostas:', err)
      setError(
        'Não foi possível carregar as propostas. Tente novamente mais tarde.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    // Converter valores numéricos
    if (name === 'min_value' || name === 'max_value') {
      const numValue = value === '' ? undefined : Number(value)
      setFilters((prev) => ({ ...prev, [name]: numValue }))
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }))
    }

    // Resetar para a primeira página quando os filtros mudam
    setPage(1)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProposals()
  }

  const handleResetFilters = () => {
    setFilters({
      status: '',
      credit_type: '',
      min_value: undefined,
      max_value: undefined,
      search: '',
      page: 1,
      page_size: pageSize,
    })
    setPage(1)
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const blob = await proposalService.exportProposals(filters)

      // Criar link para download
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `propostas_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()

      // Limpar
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Erro ao exportar propostas:', err)
      alert('Erro ao exportar propostas. Tente novamente mais tarde.')
    } finally {
      setExporting(false)
    }
  }

  // Calcular número total de páginas
  const totalPages = Math.ceil(totalCount / pageSize)

  // Status para exibição
  const statusClasses = {
    pending:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    approved:
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  }

  const getStatusClass = (status: string) => {
    return (
      statusClasses[status as keyof typeof statusClasses] ||
      statusClasses.pending
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Filtros */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-wrap -mx-2">
            <div className="px-2 w-full md:w-1/3 lg:w-1/4 mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Buscar
              </label>
              <input
                type="text"
                name="search"
                value={filters.search || ''}
                onChange={handleFilterChange}
                placeholder="Nome, ID, Email..."
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm placeholder-gray-500 shadow-sm focus:border-celebra-blue focus:outline-none focus:ring-1 focus:ring-celebra-blue"
              />
            </div>

            <div className="px-2 w-full md:w-1/3 lg:w-1/4 mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                name="status"
                value={filters.status || ''}
                onChange={handleFilterChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm placeholder-gray-500 shadow-sm focus:border-celebra-blue focus:outline-none focus:ring-1 focus:ring-celebra-blue"
              >
                <option value="">Todos</option>
                <option value="pending">Pendente</option>
                <option value="approved">Aprovado</option>
                <option value="rejected">Rejeitado</option>
                <option value="processing">Em processamento</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            <div className="px-2 w-full md:w-1/3 lg:w-1/4 mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de Crédito
              </label>
              <select
                name="credit_type"
                value={filters.credit_type || ''}
                onChange={handleFilterChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm placeholder-gray-500 shadow-sm focus:border-celebra-blue focus:outline-none focus:ring-1 focus:ring-celebra-blue"
              >
                <option value="">Todos</option>
                <option value="personal">Pessoal</option>
                <option value="consignment">Consignado</option>
                <option value="fgts">FGTS</option>
                <option value="secured">Garantido</option>
              </select>
            </div>

            <div className="px-2 w-full md:w-1/3 lg:w-1/4 mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valor Mínimo
              </label>
              <input
                type="number"
                name="min_value"
                value={filters.min_value || ''}
                onChange={handleFilterChange}
                placeholder="R$"
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm placeholder-gray-500 shadow-sm focus:border-celebra-blue focus:outline-none focus:ring-1 focus:ring-celebra-blue"
              />
            </div>

            <div className="px-2 w-full md:w-1/3 lg:w-1/4 mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valor Máximo
              </label>
              <input
                type="number"
                name="max_value"
                value={filters.max_value || ''}
                onChange={handleFilterChange}
                placeholder="R$"
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm placeholder-gray-500 shadow-sm focus:border-celebra-blue focus:outline-none focus:ring-1 focus:ring-celebra-blue"
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-between items-center">
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-celebra-blue text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-celebra-blue"
              >
                Buscar
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Limpar Filtros
              </button>
            </div>

            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {exporting ? 'Exportando...' : 'Exportar CSV'}
            </button>
          </div>
        </form>
      </div>

      {/* Tabela de Propostas */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-celebra-blue border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Carregando propostas...
            </p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500 dark:text-red-400">{error}</p>
            <button
              className="mt-4 text-celebra-blue hover:underline"
              onClick={fetchProposals}
            >
              Tentar novamente
            </button>
          </div>
        ) : proposals.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Nenhuma proposta encontrada.
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Cliente
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Valor
                </th>
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
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Data
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {proposals.map((proposal) => (
                <tr
                  key={proposal.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                    <button
                      onClick={() =>
                        navigate(`/admin/proposals/${proposal.id}`)
                      }
                      className="hover:underline"
                    >
                      {proposal.proposal_number}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {`${proposal.user.first_name} ${proposal.user.last_name}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(proposal.credit_value)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {proposal.credit_type === 'personal' && 'Pessoal'}
                    {proposal.credit_type === 'consignment' && 'Consignado'}
                    {proposal.credit_type === 'fgts' && 'FGTS'}
                    {proposal.credit_type === 'secured' && 'Garantido'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                        proposal.status
                      )}`}
                    >
                      {proposal.status === 'pending' && 'Pendente'}
                      {proposal.status === 'approved' && 'Aprovado'}
                      {proposal.status === 'rejected' && 'Rejeitado'}
                      {proposal.status === 'processing' && 'Em processamento'}
                      {proposal.status === 'cancelled' && 'Cancelado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {new Date(proposal.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() =>
                        navigate(`/admin/proposals/${proposal.id}`)
                      }
                      className="text-celebra-blue hover:text-blue-800 dark:hover:text-blue-400"
                    >
                      Visualizar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginação */}
      <div className="px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Mostrando{' '}
                <span className="font-medium">
                  {proposals.length === 0 ? 0 : (page - 1) * pageSize + 1}
                </span>{' '}
                a{' '}
                <span className="font-medium">
                  {Math.min(page * pageSize, totalCount)}
                </span>{' '}
                de <span className="font-medium">{totalCount}</span> resultados
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium 
                  ${
                    page === 1
                      ? 'text-gray-300 dark:text-gray-600'
                      : 'text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="sr-only">Anterior</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setPage(index + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium
                    ${
                      page === index + 1
                        ? 'z-10 bg-celebra-blue text-white dark:bg-celebra-blue dark:text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium 
                  ${
                    page === totalPages
                      ? 'text-gray-300 dark:text-gray-600'
                      : 'text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="sr-only">Próximo</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProposalList
