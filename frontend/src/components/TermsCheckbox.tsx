import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from './Modal'

interface TermsCheckboxProps {
  id?: string
  name?: string
  required?: boolean
  checked?: boolean
  onChange?: (checked: boolean) => void
  error?: string
}

const TermsCheckbox: React.FC<TermsCheckboxProps> = ({
  id = 'terms',
  name = 'terms',
  required = false,
  checked = false,
  onChange,
  error,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAccepted, setIsAccepted] = useState(checked)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsAccepted(e.target.checked)
    if (onChange) {
      onChange(e.target.checked)
    }
  }

  const handleOpenModal = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleAcceptTerms = () => {
    setIsAccepted(true)
    if (onChange) {
      onChange(true)
    }
    setIsModalOpen(false)
  }

  return (
    <div className="mt-4">
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={id}
            name={name}
            type="checkbox"
            className={`h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded ${
              error ? 'border-red-500' : ''
            }`}
            required={required}
            checked={isAccepted}
            onChange={handleChange}
            data-testid="terms-checkbox"
          />
        </div>
        <div className="ml-3 text-sm">
          <label
            htmlFor={id}
            className={`font-medium ${
              error ? 'text-red-500' : 'text-gray-700'
            }`}
          >
            Eu li e aceito os{' '}
            <button
              className="text-primary-600 hover:text-primary-500 underline focus:outline-none"
              onClick={handleOpenModal}
              data-testid="open-terms-modal"
            >
              Termos de Uso
            </button>{' '}
            e a{' '}
            <Link
              to="/termos-e-politicas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-500 underline"
            >
              Política de Privacidade
            </Link>
          </label>
          {error && (
            <p className="mt-1 text-sm text-red-500" data-testid="terms-error">
              {error}
            </p>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Termos de Uso"
        data-testid="terms-modal"
      >
        <div className="max-h-96 overflow-y-auto px-4 py-2 text-sm text-gray-700">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Termos de Uso da Celebra Capital
          </h3>

          <p className="mb-4">
            Bem-vindo à Plataforma de Pré-Análise de Crédito da Celebra Capital.
            Ao utilizar nossos serviços, você concorda com os termos e condições
            descritos abaixo.
          </p>

          <h4 className="text-md font-medium text-gray-900 mt-4 mb-2">
            1. Aceitação dos Termos
          </h4>
          <p className="mb-4">
            Ao acessar ou utilizar nossa plataforma, você reconhece que leu,
            entendeu e concorda em cumprir estes Termos de Uso e todas as leis e
            regulamentos aplicáveis. Se você não concordar com estes termos, não
            utilize nossos serviços.
          </p>

          <h4 className="text-md font-medium text-gray-900 mt-4 mb-2">
            2. Descrição dos Serviços
          </h4>
          <p className="mb-4">
            A Plataforma de Pré-Análise de Crédito da Celebra Capital oferece
            serviços de análise preliminar de crédito para servidores públicos,
            aposentados e pensionistas.
          </p>

          <h4 className="text-md font-medium text-gray-900 mt-4 mb-2">
            3. Elegibilidade
          </h4>
          <p className="mb-4">
            Para utilizar nossos serviços, você deve ser maior de 18 anos, ser
            servidor público, aposentado ou pensionista, possuir documentação
            válida e completa, e ter capacidade legal para celebrar contratos.
          </p>

          <h4 className="text-md font-medium text-gray-900 mt-4 mb-2">
            4. Uso da Plataforma
          </h4>
          <p className="mb-4">
            Ao utilizar nossa plataforma, você concorda em fornecer informações
            verdadeiras, manter a confidencialidade de suas credenciais, não
            utilizar a plataforma para fins fraudulentos ou ilegais, e não
            tentar acessar áreas restritas.
          </p>

          <p className="my-4">
            Para acessar os termos completos e a política de privacidade, visite
            nossa{' '}
            <Link
              to="/termos-e-politicas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-500 underline"
            >
              página de Termos e Políticas
            </Link>
            .
          </p>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={handleCloseModal}
            data-testid="cancel-terms"
          >
            Fechar
          </button>
          <button
            type="button"
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={handleAcceptTerms}
            data-testid="accept-terms"
          >
            Aceitar
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default TermsCheckbox
