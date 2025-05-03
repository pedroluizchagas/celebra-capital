import React from 'react'

interface PrivacyModalProps {
  isOpen: boolean
  onClose: () => void
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center"
      data-testid="privacy-modal"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2
            className="text-xl font-bold text-gray-800 dark:text-white"
            data-testid="privacy-modal-title"
          >
            Política de Privacidade
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
            data-testid="close-privacy-modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-6" data-testid="privacy-modal-content">
          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
              Introdução
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              A Celebra Capital valoriza a privacidade de seus usuários e está
              comprometida com a transparência no tratamento de dados pessoais.
              Esta Política de Privacidade descreve como coletamos, usamos,
              compartilhamos e protegemos suas informações quando você utiliza
              nossa Plataforma de Pré-Análise de Crédito.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
              1. Coleta de Dados Pessoais
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Coletamos dados que você nos fornece diretamente, como dados de
              identificação, contato, profissionais e financeiros, além de dados
              coletados automaticamente sobre sua interação com a plataforma.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
              2. Finalidades do Tratamento
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Tratamos seus dados para prestação de serviços, comunicação,
              prevenção à fraude, cumprimento legal, melhoria de serviços e,
              quando autorizado, para marketing.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
              3. Compartilhamento de Dados
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Podemos compartilhar seus dados com instituições financeiras
              parceiras, prestadores de serviços, bureaus de crédito e
              autoridades governamentais quando necessário.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
              4. Seus Direitos
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Você tem direito à confirmação, acesso, correção, anonimização,
              portabilidade, eliminação de dados e revogação do consentimento,
              conforme previsto na LGPD.
            </p>
          </section>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Para visualizar a política completa, acesse nossa{' '}
              <a
                href="/politica-de-privacidade"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                página de Política de Privacidade
              </a>
            </p>
          </div>
        </div>
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200"
          >
            Entendi e Concordo
          </button>
        </div>
      </div>
    </div>
  )
}

export default PrivacyModal
