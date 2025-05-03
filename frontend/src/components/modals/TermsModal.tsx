import React from 'react'

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center"
      data-testid="terms-modal"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2
            className="text-xl font-bold text-gray-800 dark:text-white"
            data-testid="terms-modal-title"
          >
            Termos de Uso
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
            data-testid="close-terms-modal"
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
        <div className="p-6" data-testid="terms-modal-content">
          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
              1. Aceitação dos Termos
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Bem-vindo à Plataforma de Pré-Análise de Crédito da Celebra
              Capital. Ao acessar ou utilizar nossa plataforma, você reconhece
              que leu, entendeu e concorda em cumprir estes Termos de Uso e
              todas as leis e regulamentos aplicáveis. Se você não concordar com
              estes termos, não utilize nossos serviços.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
              2. Descrição dos Serviços
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              A Plataforma de Pré-Análise de Crédito da Celebra Capital oferece
              serviços de análise preliminar de crédito para servidores
              públicos, aposentados e pensionistas. Nossos serviços incluem
              coleta e processamento de informações, upload de documentos,
              assinatura digital e comunicação sobre o status da solicitação.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
              3. Elegibilidade
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Para utilizar nossos serviços, você deve ser maior de 18 anos, ser
              servidor público, aposentado ou pensionista, possuir documentação
              válida, ter CPF regular e residência fixa no Brasil, além de
              possuir conta bancária em seu nome.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
              4. Cadastro e Conta
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Você é responsável por fornecer informações precisas, manter a
              confidencialidade de suas credenciais de acesso e notificar
              imediatamente qualquer uso não autorizado da sua conta.
            </p>
          </section>

          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
              5. Uso da Plataforma
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Você deve utilizar a plataforma apenas para fins legais, não
              interfirindo no seu funcionamento ou tentando acessar áreas
              restritas sem autorização.
            </p>
          </section>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Para visualizar os termos completos, acesse nossa{' '}
              <a
                href="/termos-de-uso"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                página de Termos de Uso
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

export default TermsModal
