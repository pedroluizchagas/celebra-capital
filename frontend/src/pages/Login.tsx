import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Form, FormField, Checkbox } from '../components/Form'
import { useAuth } from '../context/AuthContext'
import useAnalytics from '../hooks/useAnalytics'

// Schema de validação
const loginSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  remember: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

const Login: React.FC = () => {
  const { login, isLoading, error } = useAuth()
  const analytics = useAnalytics()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  })

  // Rastrear início da interação com o formulário
  useEffect(() => {
    analytics.trackFormStart('login')
  }, [analytics])

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password)

      // Lembra o usuário se solicitado
      if (data.remember) {
        // Configura um cookie de longa duração
        document.cookie = `rememberUser=${data.email}; max-age=2592000; path=/`
      }

      // Rastrear login bem-sucedido
      analytics.trackLogin('email')
    } catch (err) {
      // Rastrear erro de login
      if (err instanceof Error) {
        analytics.trackError(err.message, 'LOGIN_ERROR', 'LoginPage')
      } else {
        analytics.trackError(
          'Erro desconhecido ao fazer login',
          'UNKNOWN_LOGIN_ERROR',
          'LoginPage'
        )
      }
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
            Acesse sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link
              to="/cadastro"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              cadastre-se agora
            </Link>
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

            <FormField
              id="password"
              label="Senha"
              type="password"
              autoComplete="current-password"
              placeholder="••••••"
              {...register('password')}
              error={errors.password?.message}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <Checkbox
              id="remember"
              label="Lembrar minha conta"
              {...register('remember')}
            />

            <div className="text-sm">
              <Link
                to="/solicitar-recuperacao"
                className="font-medium text-primary-600 hover:text-primary-500"
                onClick={() =>
                  analytics.trackEvent('CLICK', {
                    element: 'recover_password_link',
                  })
                }
              >
                Esqueceu sua senha?
              </Link>
            </div>
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
                  Entrando...
                </>
              ) : (
                <>
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg
                      className="h-5 w-5 text-primary-300"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  Entrar
                </>
              )}
            </button>
          </div>
        </Form>
      </div>
    </div>
  )
}

export default Login
