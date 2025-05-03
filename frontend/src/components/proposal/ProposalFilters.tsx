import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilter, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'

export interface ProposalFilterValues {
  search?: string
  status?: string[]
  credit_type?: string[]
  min_value?: number
  max_value?: number
  date_from?: string
  date_to?: string
}

interface ProposalFiltersProps {
  onApplyFilters: (filters: ProposalFilterValues) => void
  initialFilters?: ProposalFilterValues
}

const ProposalFilters: React.FC<ProposalFiltersProps> = ({
  onApplyFilters,
  initialFilters = {},
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<ProposalFilterValues>(initialFilters)
  const [search, setSearch] = useState(initialFilters.search || '')

  const statusOptions = [
    { value: 'pending', label: 'Pendente' },
    { value: 'processing', label: 'Em Processamento' },
    { value: 'approved', label: 'Aprovada' },
    { value: 'rejected', label: 'Rejeitada' },
    { value: 'cancelled', label: 'Cancelada' },
  ]

  const creditTypeOptions = [
    { value: 'personal', label: 'Pessoal' },
    { value: 'consignment', label: 'Consignado' },
    { value: 'fgts', label: 'FGTS' },
    { value: 'secured', label: 'Garantido' },
  ]

  const toggleFilter = (
    filterType: 'status' | 'credit_type',
    value: string
  ) => {
    setFilters((prev) => {
      const currentValues = prev[filterType] || []
      return {
        ...prev,
        [filterType]: currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value],
      }
    })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onApplyFilters({ ...filters, search })
  }

  const handleApplyFilters = () => {
    onApplyFilters({ ...filters, search })
  }

  const handleReset = () => {
    setFilters({})
    setSearch('')
    onApplyFilters({})
  }

  const isAnyFilterActive = () => {
    return (
      !!search ||
      !!filters.status?.length ||
      !!filters.credit_type?.length ||
      !!filters.min_value ||
      !!filters.max_value ||
      !!filters.date_from ||
      !!filters.date_to
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <form onSubmit={handleSearchSubmit} className="mb-4">
        <div className="flex">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon
                icon={faSearch}
                className="text-gray-400 dark:text-gray-500"
              />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-celebra-blue focus:border-celebra-blue"
              placeholder="Buscar proposta por número, cliente ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="ml-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-celebra-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-celebra-blue"
          >
            Buscar
          </button>
        </div>
      </form>

      <div className="flex justify-between items-center mb-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-celebra-blue dark:hover:text-celebra-blue"
        >
          <FontAwesomeIcon icon={faFilter} className="mr-2" />
          {isExpanded ? 'Ocultar Filtros' : 'Mostrar Filtros Avançados'}
        </button>

        {isAnyFilterActive() && (
          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center"
          >
            <FontAwesomeIcon icon={faTimes} className="mr-1" />
            Limpar Filtros
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Status */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </h4>
              <div className="space-y-2">
                {statusOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-celebra-blue focus:ring-celebra-blue border-gray-300 dark:border-gray-600 rounded"
                      checked={filters.status?.includes(option.value) || false}
                      onChange={() => toggleFilter('status', option.value)}
                    />
                    <span className="ml-2">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tipo de Crédito */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Crédito
              </h4>
              <div className="space-y-2">
                {creditTypeOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-celebra-blue focus:ring-celebra-blue border-gray-300 dark:border-gray-600 rounded"
                      checked={
                        filters.credit_type?.includes(option.value) || false
                      }
                      onChange={() => toggleFilter('credit_type', option.value)}
                    />
                    <span className="ml-2">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Valor */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Valor (R$)
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="sr-only">Valor Mínimo</label>
                  <input
                    type="number"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-celebra-blue focus:border-celebra-blue sm:text-sm dark:bg-gray-700 dark:text-white"
                    placeholder="Mínimo"
                    min="0"
                    value={filters.min_value || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        min_value: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="sr-only">Valor Máximo</label>
                  <input
                    type="number"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-celebra-blue focus:border-celebra-blue sm:text-sm dark:bg-gray-700 dark:text-white"
                    placeholder="Máximo"
                    min="0"
                    value={filters.max_value || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        max_value: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Data */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data de Criação
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="sr-only">Data Inicial</label>
                  <input
                    type="date"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-celebra-blue focus:border-celebra-blue sm:text-sm dark:bg-gray-700 dark:text-white"
                    value={filters.date_from || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        date_from: e.target.value || undefined,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="sr-only">Data Final</label>
                  <input
                    type="date"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-celebra-blue focus:border-celebra-blue sm:text-sm dark:bg-gray-700 dark:text-white"
                    value={filters.date_to || ''}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        date_to: e.target.value || undefined,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="mr-3 px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-celebra-blue"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={handleApplyFilters}
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-celebra-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-celebra-blue"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProposalFilters
