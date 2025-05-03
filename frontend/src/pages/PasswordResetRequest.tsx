import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Form, FormField } from '../components/Form'
import useAnalytics from '../hooks/useAnalytics'
import api from '../services/api'

// Schema de validação
const resetSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
})

type ResetFormData = z.infer<typeof resetSchema>

const PasswordResetRequest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [error, setError] = useState('')
  const analytics = useAnalytics()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ResetFormData) => {
    try {
      setIsLoading(true)
      setError('')
      setSuccessMessage('')

      const response = await api.post('/users/reset-password/', {
        email: data.email,
      })

      setSuccessMessage(
        'Se o email existir em nossa base, enviaremos um link para redefinição de senha.'
      )

      // Rastrear solicitação de recuperação
      analytics.trackEvent('PASSWORD_RESET_REQUEST', {
        status: 'success',
      })
    } catch (err) {
      // Em caso de erro da API
      if (err instanceof Error) {
        setError(err.message || 'Ocorreu um erro. Tente novamente mais tarde.')
        analytics.trackError(
          err.message,
          'PASSWORD_RESET_REQUEST_ERROR',
          'PasswordResetRequestPage'
        )
      } else {
        setError('Ocorreu um erro desconhecido. Tente novamente mais tarde.')
        analytics.trackError(
          'Erro desconhecido',
          'PASSWORD_RESET_REQUEST_ERROR',
          'PasswordResetRequestPage'
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img
            className="mx-auto h-16 w-auto"
            src="/logo.svg"
            alt="Celebra Capital"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Recuperação de Senha
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Digite seu email para receber um link de recuperação de senha
          </p>
        </div>

        {error && (
          <div
            className="bg-red-50 border-l-4 border-red-400 p-4 mb-4"
            role="alert"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div
            className="bg-green-50 border-l-4 border-green-400 p-4 mb-4"
            role="alert"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {!successMessage && (
          <Form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm -space-y-px">
              <FormField
                id="email"
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                {...register('email')}
                error={errors.email?.message}
                required
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70"
                aria-disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <svg
                        className="animate-spin h-5 w-5 text-primary-300"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    </span>
                    Enviando...
                  </>
                ) : (
                  'Enviar link de recuperação'
                )}
              </button>
            </div>
          </Form>
        )}

        <div className="text-center mt-4">
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PasswordResetRequest
