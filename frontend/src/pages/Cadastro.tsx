import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Form, FormField, Select, Checkbox } from '../components/Form'
import {
  isValidCPF,
  isValidCNPJ,
  checkPasswordStrength,
  getPasswordStrengthMessage,
} from '../utils/security'
import { secureClient } from '../utils/security'

// Schema de validação
const cadastroSchema = z
  .object({
    nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    email: z.string().email('Email inválido'),
    documento: z
      .string()
      .min(11, 'CPF/CNPJ inválido')
      .refine((doc) => {
        const cleanDoc = doc.replace(/\D/g, '')
        return cleanDoc.length === 11
          ? isValidCPF(cleanDoc)
          : isValidCNPJ(cleanDoc)
      }, 'CPF/CNPJ inválido'),
    tipoConta: z.enum(['individual', 'empresa']),
    telefone: z
      .string()
      .regex(
        /^\(\d{2}\) \d{5}-\d{4}$/,
        'Telefone inválido, use o formato (XX) XXXXX-XXXX'
      ),
    password: z
      .string()
      .min(8, 'Senha deve ter pelo menos 8 caracteres')
      .refine(
        (pwd) => checkPasswordStrength(pwd) >= 3,
        'Senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais'
      ),
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
    termos: z.literal(true, {
      errorMap: () => ({
        message: 'Você deve aceitar os termos de uso e política de privacidade',
      }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  })

type CadastroFormData = z.infer<typeof cadastroSchema>

const Cadastro: React.FC = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CadastroFormData>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      tipoConta: 'individual',
      termos: false,
    },
  })

  // Observa o valor da senha para atualizar o medidor de força
  const password = watch('password')
  React.useEffect(() => {
    if (password) {
      setPasswordStrength(checkPasswordStrength(password))
    } else {
      setPasswordStrength(0)
    }
  }, [password])

  const onSubmit = async (data: CadastroFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)

      // Formatação de documento (CPF/CNPJ)
      const cleanDoc = data.documento.replace(/\D/g, '')

      const userData = {
        name: data.nome,
        email: data.email,
        document: cleanDoc,
        account_type: data.tipoConta,
        phone: data.telefone,
        password: data.password,
      }

      const response = await secureClient.post('/api/auth/register', userData)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao criar conta')
      }

      // Cadastro bem-sucedido, redirecionar para login
      navigate('/login', {
        state: {
          message: 'Cadastro realizado com sucesso! Você já pode fazer login.',
        },
      })
    } catch (err: any) {
      console.error('Erro no cadastro:', err)
      setError(
        err.message ||
          'Ocorreu um erro ao criar sua conta. Por favor, tente novamente.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Função para formatar CPF/CNPJ automaticamente
  const formatDocument = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')

    if (value.length <= 11) {
      // Formato CPF: 123.456.789-01
      if (value.length > 9) {
        value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(
          6,
          9
        )}-${value.slice(9, 11)}`
      } else if (value.length > 6) {
        value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`
      } else if (value.length > 3) {
        value = `${value.slice(0, 3)}.${value.slice(3)}`
      }
    } else {
      // Formato CNPJ: 12.345.678/0001-90
      if (value.length > 12) {
        value = `${value.slice(0, 2)}.${value.slice(2, 5)}.${value.slice(
          5,
          8
        )}/${value.slice(8, 12)}-${value.slice(12, 14)}`
      } else if (value.length > 8) {
        value = `${value.slice(0, 2)}.${value.slice(2, 5)}.${value.slice(
          5,
          8
        )}/${value.slice(8)}`
      } else if (value.length > 5) {
        value = `${value.slice(0, 2)}.${value.slice(2, 5)}.${value.slice(5)}`
      } else if (value.length > 2) {
        value = `${value.slice(0, 2)}.${value.slice(2)}`
      }
    }

    e.target.value = value
  }

  // Função para formatar telefone automaticamente
  const formatTelefone = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')

    if (value.length > 11) value = value.slice(0, 11)

    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`
    } else if (value.length > 0) {
      value = `(${value}`
    }

    e.target.value = value
  }

  const tipoContaOptions = [
    { value: 'individual', label: 'Pessoa Física' },
    { value: 'empresa', label: 'Pessoa Jurídica' },
  ]

  return (
    <div className="min-h-screen py-12 bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <img
            className="mx-auto h-16 w-auto"
            src="/logo.svg"
            alt="Celebra Capital"
          />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Crie sua conta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ou{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              acesse sua conta existente
            </Link>
          </p>
        </div>

        {error && (
          <div
            className="bg-red-50 border-l-4 border-red-400 p-4 mb-6"
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

        <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            id="nome"
            label="Nome completo"
            {...register('nome')}
            error={errors.nome?.message}
            required
          />

          <FormField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            {...register('email')}
            error={errors.email?.message}
            required
          />

          <Select
            id="tipoConta"
            label="Tipo de conta"
            options={tipoContaOptions}
            {...register('tipoConta')}
            error={errors.tipoConta?.message}
            required
          />

          <FormField
            id="documento"
            label="CPF/CNPJ"
            {...register('documento')}
            onChange={formatDocument}
            error={errors.documento?.message}
            placeholder={
              watch('tipoConta') === 'individual'
                ? '123.456.789-01'
                : '12.345.678/0001-90'
            }
            required
          />

          <FormField
            id="telefone"
            label="Telefone"
            {...register('telefone')}
            onChange={formatTelefone}
            error={errors.telefone?.message}
            placeholder="(99) 99999-9999"
            required
          />

          <FormField
            id="password"
            label="Senha"
            type="password"
            autoComplete="new-password"
            {...register('password')}
            error={errors.password?.message}
            required
          />

          {/* Medidor de força de senha */}
          {password && (
            <div className="mt-1">
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-2 w-full rounded-full ${
                      passwordStrength >= level
                        ? level === 1
                          ? 'bg-red-500'
                          : level === 2
                          ? 'bg-yellow-500'
                          : level === 3
                          ? 'bg-green-500'
                          : 'bg-green-600'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p
                className={`text-xs mt-1 ${
                  passwordStrength === 0
                    ? 'text-gray-500'
                    : passwordStrength === 1
                    ? 'text-red-500'
                    : passwordStrength === 2
                    ? 'text-yellow-500'
                    : 'text-green-500'
                }`}
              >
                {passwordStrength > 0
                  ? getPasswordStrengthMessage(passwordStrength)
                  : 'Digite sua senha'}
              </p>
            </div>
          )}

          <FormField
            id="confirmPassword"
            label="Confirme sua senha"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
            required
          />

          <Checkbox
            id="termos"
            label={
              <span>
                Concordo com os{' '}
                <Link
                  to="/termos"
                  className="text-primary-600 hover:text-primary-500"
                >
                  termos de uso
                </Link>{' '}
                e{' '}
                <Link
                  to="/privacidade"
                  className="text-primary-600 hover:text-primary-500"
                >
                  política de privacidade
                </Link>
              </span>
            }
            {...register('termos')}
            error={errors.termos?.message}
            required
          />

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70"
              aria-disabled={isSubmitting}
            >
              {isSubmitting ? 'Criando conta...' : 'Criar conta'}
            </button>
          </div>
        </Form>
      </div>
    </div>
  )
}

export default Cadastro
