import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Form, FormField } from '../components/Form'
import api from '../services/api'

// Schema de validação
const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, 'A senha deve ter pelo menos 8 caracteres')
      .max(50, 'A senha não pode ter mais de 50 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type ResetFormData = z.infer<typeof resetSchema>

const PasswordReset: React.FC = () => {
  const { uid, token } = useParams<{ uid: string; token: string }>()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: ResetFormData) => {
    try {
      setIsLoading(true)
      setError('')
      setSuccessMessage('')

      if (!uid || !token) {
        setError(
          'Link de redefinição inválido. Solicite um novo link de recuperação.'
        )
        return
      }

      const response = await api.post('/users/reset-password-confirm/', {
        uid,
        token,
        password: data.password,
      })

      setSuccessMessage('Sua senha foi redefinida com sucesso!')

      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      // Em caso de erro da API
      if (err instanceof Error) {
        setError(
          err.message ||
            'O link de redefinição é inválido ou expirou. Solicite um novo link.'
        )
      } else {
        setError(
          'O link de redefinição é inválido ou expirou. Solicite um novo link.'
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Verificar se os parâmetros necessários estão presentes
  if (!uid || !token) {
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
              Link Inválido
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              O link de redefinição de senha é inválido ou expirou.
            </p>
          </div>

          <div className="text-center mt-4">
            <Link
              to="/recuperar-senha"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Solicitar novo link
            </Link>
          </div>
        </div>
      </div>
    )
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
            Redefinir Senha
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Digite sua nova senha abaixo
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
                <p className="text-sm text-green-700">
                  {successMessage} Redirecionando para a página de login...
                </p>
              </div>
            </div>
          </div>
        )}

        {!successMessage && (
          <Form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm -space-y-px">
              <FormField
                id="password"
                label="Nova Senha"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                {...register('password')}
                error={errors.password?.message}
                required
              />

              <FormField
                id="confirmPassword"
                label="Confirmar Nova Senha"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
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
                    Processando...
                  </>
                ) : (
                  'Redefinir Senha'
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

export default PasswordReset
