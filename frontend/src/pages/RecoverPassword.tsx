import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Importar componentes (assumindo que existem na aplicação)
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Alert } from '../components/Alert'

// Definir esquema de validação para o formulário de recuperação de senha
const recoverPasswordSchema = z.object({
  email: z
    .string()
    .email('Por favor, informe um email válido')
    .min(1, 'O email é obrigatório'),
})

type RecoverPasswordFormData = z.infer<typeof recoverPasswordSchema>

const RecoverPassword: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecoverPasswordFormData>({
    resolver: zodResolver(recoverPasswordSchema),
  })

  const handleRecoverPassword: SubmitHandler<RecoverPasswordFormData> = async (
    data
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      // Simular chamada à API para recuperação de senha
      // No futuro, substituir por chamada real à API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Se a recuperação de senha for bem-sucedida
      setRequestSent(true)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError(
          'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.'
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
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Recuperar Senha
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            {requestSent
              ? 'Enviamos instruções para recuperar sua senha no e-mail informado.'
              : 'Informe seu e-mail e enviaremos instruções para recuperar sua senha.'}
          </p>
        </div>

        {!requestSent ? (
          <form
            className="mt-8 space-y-6"
            onSubmit={handleSubmit(handleRecoverPassword)}
          >
            {error && (
              <Alert type="error" title="Erro" data-testid="error-message">
                {error}
              </Alert>
            )}

            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <Input
                  id="email"
                  type="email"
                  label="E-mail"
                  placeholder="seu@email.com"
                  error={errors.email?.message}
                  {...register('email')}
                  data-testid="email-input"
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                data-testid="recover-button"
              >
                Enviar instruções
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Voltar para login
                </Link>
              </div>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <Alert
              type="success"
              title="E-mail enviado"
              data-testid="success-message"
            >
              Enviamos um e-mail com instruções para recuperar sua senha. Por
              favor, verifique sua caixa de entrada.
            </Alert>

            <div className="flex flex-col space-y-4">
              <Button
                onClick={() => navigate('/login')}
                data-testid="back-to-login-button"
              >
                Voltar para login
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setRequestSent(false)
                  setError(null)
                }}
                data-testid="try-again-button"
              >
                Tentar com outro e-mail
              </Button>
            </div>
          </div>
        )}

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Ainda não tem uma conta?{' '}
            <Link
              to="/cadastro"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RecoverPassword
