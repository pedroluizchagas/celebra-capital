import { create } from 'zustand'

// Tipos para os erros
type FormFieldErrors = Record<string, string[]>
type FormErrors = Record<string, FormFieldErrors>

interface ErrorState {
  error: string | null
  apiErrors: Record<string, string[]>
  formErrors: FormErrors

  // Actions
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

const useErrorStore = create<ErrorState>((set) => ({
  error: null,
  apiErrors: {},
  formErrors: {},

  setError: (message: string | null) => {
    set({ error: message })
  },

  setApiErrors: (errors: Record<string, string[]>) => {
    set({ apiErrors: errors })
  },

  setFormErrors: (formId: string, errors: FormFieldErrors) => {
    set((state) => ({
      formErrors: {
        ...state.formErrors,
        [formId]: errors,
      },
    }))
  },

  addFormFieldError: (
    formId: string,
    fieldName: string,
    errorMessage: string | string[]
  ) => {
    const errors = Array.isArray(errorMessage) ? errorMessage : [errorMessage]

    set((state) => {
      const formFields = state.formErrors[formId] || {}
      return {
        formErrors: {
          ...state.formErrors,
          [formId]: {
            ...formFields,
            [fieldName]: errors,
          },
        },
      }
    })
  },

  clearErrors: () => {
    set({ error: null, apiErrors: {}, formErrors: {} })
  },

  clearApiErrors: () => {
    set({ apiErrors: {} })
  },

  clearFormErrors: (formId?: string) => {
    if (formId) {
      set((state) => {
        const newFormErrors = { ...state.formErrors }
        delete newFormErrors[formId]
        return { formErrors: newFormErrors }
      })
    } else {
      set({ formErrors: {} })
    }
  },
}))

export default useErrorStore
