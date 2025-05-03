import React, { createContext, useContext, useState, ReactNode } from 'react'

// Tipos para os erros
type FormFieldErrors = Record<string, string[]>
type FormErrors = Record<string, FormFieldErrors>

export interface ErrorContextType {
  error: string | null
  apiErrors: Record<string, string[]>
  formErrors: FormErrors
  setError: (message: string | null) => void
  setApiErrors: (errors: Record<string, string[]>) => void
  setFormErrors: (formId: string, errors: FormFieldErrors) => void
  addFormFieldError: (
    formId: string,
    fieldName: string,
    error: string | string[]
  ) => void
  clearErrors: () => void
  clearApiErrors: () => void
  clearFormErrors: (formId?: string) => void
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

export const useError = () => {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error('useError deve ser usado dentro de um ErrorProvider')
  }
  return context
}

interface ErrorProviderProps {
  children: ReactNode
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [error, setError] = useState<string | null>(null)
  const [apiErrors, setApiErrors] = useState<Record<string, string[]>>({})
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const addFormFieldError = (
    formId: string,
    fieldName: string,
    errorMessage: string | string[]
  ) => {
    const errors = Array.isArray(errorMessage) ? errorMessage : [errorMessage]

    setFormErrors((prev) => {
      const formFields = prev[formId] || {}
      return {
        ...prev,
        [formId]: {
          ...formFields,
          [fieldName]: errors,
        },
      }
    })
  }

  const updateFormErrors = (formId: string, errors: FormFieldErrors) => {
    setFormErrors((prev) => ({
      ...prev,
      [formId]: errors,
    }))
  }

  const clearAllErrors = () => {
    setError(null)
    setApiErrors({})
    setFormErrors({})
  }

  const clearApiErrors = () => {
    setApiErrors({})
  }

  const clearFormErrors = (formId?: string) => {
    if (formId) {
      setFormErrors((prev) => {
        const newFormErrors = { ...prev }
        delete newFormErrors[formId]
        return newFormErrors
      })
    } else {
      setFormErrors({})
    }
  }

  return (
    <ErrorContext.Provider
      value={{
        error,
        apiErrors,
        formErrors,
        setError,
        setApiErrors,
        setFormErrors: updateFormErrors,
        addFormFieldError,
        clearErrors: clearAllErrors,
        clearApiErrors,
        clearFormErrors,
      }}
    >
      {children}
    </ErrorContext.Provider>
  )
}

export default ErrorProvider
