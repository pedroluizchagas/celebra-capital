import React, { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import proposalService from '../services/proposalService'

interface SuccessProps {}

const Success: React.FC<SuccessProps> = () => {
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [proposalDetails, setProposalDetails] = useState<any>(null)

  // Receber dados das etapas anteriores
  const answers = location.state?.answers || {}
  const documents = location.state?.documents || []
  const signed = location.state?.signed || false
  const proposalId = location.state?.proposalId || null

  // Carregar detalhes da proposta do backend
  useEffect(() => {
    const loadProposalDetails = async () => {
      if (proposalId) {
        setLoading(true)
        try {
          const details = await proposalService.getProposalDetails(proposalId)
          setProposalDetails(details)
        } catch (error) {
          console.error('Erro ao carregar detalhes da proposta:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadProposalDetails()
  }, [proposalId])

  return (
    <div className="card p-8 max-w-md mx-auto text-center">
      <div className="mb-8 flex justify-center">
        <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            className="h-12 w-12 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
        Solicitação Enviada com Sucesso!
      </h2>

      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Recebemos sua solicitação e já estamos trabalhando nela. Nossa equipe
        entrará em contato em breve.
      </p>

      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-8">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Resumo da Solicitação
        </h3>

        <ul className="space-y-2 text-sm text-left">
          {answers.name && (
            <li className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Nome:</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {answers.name}
              </span>
            </li>
          )}

          {answers.cpf && (
            <li className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">CPF:</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {answers.cpf}
              </span>
            </li>
          )}

          {answers.employeeType && (
            <li className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                Tipo de vínculo:
              </span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {answers.employeeType === 'public_server' && 'Servidor Público'}
                {answers.employeeType === 'retiree' && 'Aposentado/Pensionista'}
                {answers.employeeType === 'police_military' &&
                  'Policial/Bombeiro/Militar'}
              </span>
            </li>
          )}

          {answers.income && (
            <li className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                Renda Mensal:
              </span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                R${' '}
                {parseFloat(answers.income).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </li>
          )}

          {proposalDetails && proposalDetails.approved_amount && (
            <li className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                Valor Aprovado:
              </span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                R${' '}
                {parseFloat(proposalDetails.approved_amount).toLocaleString(
                  'pt-BR',
                  {
                    minimumFractionDigits: 2,
                  }
                )}
              </span>
            </li>
          )}

          {proposalDetails && proposalDetails.installments && (
            <li className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                Parcelas:
              </span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {proposalDetails.installments}x de R${' '}
                {(
                  parseFloat(proposalDetails.approved_amount) /
                  proposalDetails.installments
                ).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </li>
          )}

          <li className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">
              Documentos:
            </span>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {documents.length} enviados
            </span>
          </li>

          <li className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">
              Assinatura:
            </span>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {signed ? 'Concluída' : 'Pendente'}
            </span>
          </li>

          {proposalDetails && proposalDetails.protocol && (
            <li className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                Protocolo:
              </span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {proposalDetails.protocol}
              </span>
            </li>
          )}
        </ul>
      </div>

      <div className="mb-6 p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-900/30 rounded-lg text-sm">
        <p className="text-yellow-700 dark:text-yellow-500">
          <span className="font-semibold">Próximos passos:</span> Nossa equipe
          irá analisar sua solicitação e entrar em contato em até 48 horas úteis
          por telefone ou WhatsApp.
        </p>
      </div>

      <div className="flex justify-center space-x-4">
        <Link
          to="/"
          className="px-4 py-2 bg-celebra-blue text-white rounded-md hover:bg-opacity-90 transition-all"
        >
          Voltar ao Início
        </Link>
      </div>

      <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
        Dúvidas? Entre em contato pelo WhatsApp (11) 99999-9999
      </p>
    </div>
  )
}

export default Success
