import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChartLine,
  faExclamationTriangle,
  faCheckCircle,
  faTimesCircle,
  faFileAlt,
  faHistory,
  faMapMarkerAlt,
  faBuilding,
  faChevronDown,
  faChevronUp,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons'
import type {
  CreditBureauReport as CreditBureauReportType,
  FinancialRestriction,
} from '../../services/creditBureauService'

interface CreditBureauReportProps {
  report: CreditBureauReportType
  isLoading?: boolean
  onRequestNewReport?: () => void
}

const CreditBureauReport: React.FC<CreditBureauReportProps> = ({
  report,
  isLoading = false,
  onRequestNewReport,
}) => {
  const [activeTabs, setActiveTabs] = useState<{
    restrictions: boolean
    history: boolean
    companies: boolean
    address: boolean
  }>({
    restrictions: true,
    history: false,
    companies: false,
    address: false,
  })

  const toggleTab = (tab: keyof typeof activeTabs) => {
    setActiveTabs((prev) => ({
      ...prev,
      [tab]: !prev[tab],
    }))
  }

  const getScoreColor = (score: number, max: number) => {
    if (score > max * 0.8) return 'text-green-600 dark:text-green-400'
    if (score > max * 0.6) return 'text-blue-600 dark:text-blue-400'
    if (score > max * 0.4) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBgColor = (score: number, max: number) => {
    if (score > max * 0.8) return 'bg-green-100 dark:bg-green-900/30'
    if (score > max * 0.6) return 'bg-blue-100 dark:bg-blue-900/30'
    if (score > max * 0.4) return 'bg-yellow-100 dark:bg-yellow-900/30'
    return 'bg-red-100 dark:bg-red-900/30'
  }

  const getScoreLabel = (classification: string) => {
    const labels: Record<string, string> = {
      baixo: 'Baixo Risco',
      medio: 'Médio Risco',
      alto: 'Alto Risco',
      muito_alto: 'Muito Alto Risco',
    }
    return labels[classification] || classification
  }

  const getRestrictionStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
            Ativo
          </span>
        )
      case 'regularizado':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
            Regularizado
          </span>
        )
      case 'contestado':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
            Contestado
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            {status}
          </span>
        )
    }
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

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Cabeçalho */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
          <FontAwesomeIcon
            icon={faFileAlt}
            className="mr-2 text-blue-600 dark:text-blue-400"
          />
          Relatório de Crédito
          <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
            Gerado em: {formatDate(report.requestDate)}
          </span>
        </h3>
      </div>

      {/* Score e Resumo */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Score */}
          <div
            className={`col-span-1 p-4 rounded-lg flex flex-col items-center justify-center ${getScoreBgColor(
              report.score.score,
              report.score.scoreRange.max
            )}`}
          >
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Score de Crédito
            </h4>
            <div
              className={`text-4xl font-bold ${getScoreColor(
                report.score.score,
                report.score.scoreRange.max
              )}`}
            >
              {report.score.score}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              de {report.score.scoreRange.min} a {report.score.scoreRange.max}
            </div>
            <div
              className={`mt-2 text-sm font-medium ${getScoreColor(
                report.score.score,
                report.score.scoreRange.max
              )}`}
            >
              {getScoreLabel(report.score.classification)}
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Dívidas Ativas
              </div>
              <div className="text-xl font-semibold text-gray-800 dark:text-white mt-1">
                {report.summaryData.activeDebts}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Valor Total
              </div>
              <div className="text-xl font-semibold text-gray-800 dark:text-white mt-1">
                {formatCurrency(report.summaryData.totalDebtAmount)}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Protestos
              </div>
              <div className="text-xl font-semibold text-gray-800 dark:text-white mt-1">
                {report.summaryData.protests}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Processos
              </div>
              <div className="text-xl font-semibold text-gray-800 dark:text-white mt-1">
                {report.summaryData.lawsuits}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Cartões
              </div>
              <div className="text-xl font-semibold text-gray-800 dark:text-white mt-1">
                {report.summaryData.creditCards}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Empréstimos
              </div>
              <div className="text-xl font-semibold text-gray-800 dark:text-white mt-1">
                {report.summaryData.loans}
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Restrições */}
        <div className="mb-4">
          <button
            className="flex justify-between items-center w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            onClick={() => toggleTab('restrictions')}
          >
            <div className="flex items-center text-lg font-medium text-gray-700 dark:text-white">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="mr-2 text-red-500"
              />
              Restrições Financeiras
              {report.restrictions.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs rounded-full">
                  {report.restrictions.length}
                </span>
              )}
            </div>
            <FontAwesomeIcon
              icon={activeTabs.restrictions ? faChevronUp : faChevronDown}
              className="text-gray-500"
            />
          </button>

          {activeTabs.restrictions && (
            <div className="mt-2 overflow-x-auto">
              {report.restrictions.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Nenhuma restrição financeira encontrada.
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Tipo
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Valor
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Credor
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Data
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {report.restrictions.map((restriction) => (
                      <tr key={restriction.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {restriction.type === 'protesto' && 'Protesto'}
                          {restriction.type === 'divida' && 'Dívida'}
                          {restriction.type === 'acao_judicial' &&
                            'Ação Judicial'}
                          {restriction.type === 'cheque' && 'Cheque sem Fundos'}
                          {restriction.type === 'outro' && 'Outra Restrição'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {restriction.value
                            ? formatCurrency(restriction.value)
                            : '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {restriction.creditor || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {restriction.date
                            ? formatDate(restriction.date)
                            : '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {getRestrictionStatusBadge(restriction.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Seção de Histórico de Consultas */}
        <div className="mb-4">
          <button
            className="flex justify-between items-center w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            onClick={() => toggleTab('history')}
          >
            <div className="flex items-center text-lg font-medium text-gray-700 dark:text-white">
              <FontAwesomeIcon
                icon={faHistory}
                className="mr-2 text-blue-500"
              />
              Histórico de Consultas
            </div>
            <FontAwesomeIcon
              icon={activeTabs.history ? faChevronUp : faChevronDown}
              className="text-gray-500"
            />
          </button>

          {activeTabs.history && (
            <div className="mt-2 overflow-x-auto">
              {report.consultationHistory.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Nenhuma consulta anterior registrada.
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Data
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Instituição
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Tipo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {report.consultationHistory.map((consultation, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(consultation.date)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {consultation.institution}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {consultation.type}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Outras seções (Endereço e Empresas) colapsáveis */}
        {/* Seção de Endereço */}
        <div className="mb-4">
          <button
            className="flex justify-between items-center w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            onClick={() => toggleTab('address')}
          >
            <div className="flex items-center text-lg font-medium text-gray-700 dark:text-white">
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                className="mr-2 text-green-500"
              />
              Verificação de Endereço
            </div>
            <FontAwesomeIcon
              icon={activeTabs.address ? faChevronUp : faChevronDown}
              className="text-gray-500"
            />
          </button>

          {activeTabs.address && (
            <div className="mt-2 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center">
                {report.addressVerification.isValid ? (
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="mr-2 text-green-500 text-xl"
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faTimesCircle}
                    className="mr-2 text-red-500 text-xl"
                  />
                )}
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">
                    {report.addressVerification.isValid
                      ? 'Endereço verificado'
                      : 'Endereço não verificado'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Última verificação:{' '}
                    {formatDate(report.addressVerification.lastUpdate)}
                  </div>
                  {report.addressVerification.details && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      {report.addressVerification.details}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Seção de Relações Empresariais */}
        <div className="mb-4">
          <button
            className="flex justify-between items-center w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            onClick={() => toggleTab('companies')}
          >
            <div className="flex items-center text-lg font-medium text-gray-700 dark:text-white">
              <FontAwesomeIcon
                icon={faBuilding}
                className="mr-2 text-purple-500"
              />
              Relações Empresariais
            </div>
            <FontAwesomeIcon
              icon={activeTabs.companies ? faChevronUp : faChevronDown}
              className="text-gray-500"
            />
          </button>

          {activeTabs.companies && (
            <div className="mt-2 overflow-x-auto">
              {report.companyRelationships.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Nenhuma relação empresarial encontrada.
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Empresa
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        CNPJ
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Posição
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Início
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {report.companyRelationships.map((company, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {company.companyName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {company.cnpj}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {company.position}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(company.startDate)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {company.isActive ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              Ativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              Inativo
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Ações */}
        {onRequestNewReport && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={onRequestNewReport}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Solicitar Nova Consulta
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreditBureauReport
