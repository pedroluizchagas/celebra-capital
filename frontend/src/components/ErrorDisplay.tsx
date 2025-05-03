import React from 'react'
import { useError } from '../contexts/ErrorContext'

interface ErrorDisplayProps {
  formId?: string
  fieldName?: string
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ formId, fieldName }) => {
  const { error, apiErrors, formErrors } = useError()

  // Função para renderizar erros globais
  const renderGlobalError = () => {
    if (!error) return null

    return (
      <div
        className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 dark:bg-red-900/20 dark:border-red-700"
        role="alert"
      >
        <p className="text-red-700 dark:text-red-300">{error}</p>
      </div>
    )
  }

  // Função para renderizar erros de API
  const renderApiErrors = () => {
    if (Object.keys(apiErrors).length === 0) return null

    return (
      <div
        className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 dark:bg-red-900/20 dark:border-red-700"
        role="alert"
      >
        <h3 className="font-medium text-red-700 dark:text-red-300 mb-2">
          Ocorreram erros ao processar sua solicitação:
        </h3>
        <ul className="list-disc pl-5 text-red-700 dark:text-red-300">
          {Object.entries(apiErrors).map(([key, messages]) => (
            <li key={key}>
              <strong>{key}:</strong> {messages.join(', ')}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  // Função para renderizar erros de formulário específicos
  const renderFieldError = () => {
    if (!fieldName || !formId) return null

    const formErrorsForId = formErrors[formId]
    if (!formErrorsForId) return null

    const fieldErrors = formErrorsForId[fieldName]
    if (!fieldErrors || fieldErrors.length === 0) return null

    return (
      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
        {fieldErrors.join(', ')}
      </p>
    )
  }

  // Retorna diferentes componentes com base nos props fornecidos
  if (fieldName && formId) {
    return renderFieldError()
  }

  return (
    <>
      {renderGlobalError()}
      {renderApiErrors()}
    </>
  )
}

export default ErrorDisplay
