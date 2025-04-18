import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authService from '../services/authService'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const [cpf, setCpf] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Formatação básica de CPF (remover pontos e traços)
      const formattedCpf = cpf.replace(/\D/g, '')

      // Validação simples de CPF
      if (formattedCpf.length !== 11) {
        setError('CPF inválido. Por favor, digite os 11 dígitos.')
        setIsLoading(false)
        return
      }

      // Validação simples de senha
      if (password.length < 6) {
        setError('A senha deve conter pelo menos 6 caracteres.')
        setIsLoading(false)
        return
      }

      // Chamar o serviço de autenticação
      await authService.login({
        cpf: formattedCpf,
        password,
      })

      // Redirecionar para a página inicial após login bem-sucedido
      navigate('/')
    } catch (error: any) {
      console.error('Erro ao fazer login:', error)
      setError(
        error.response?.data?.message ||
          'Erro ao fazer login. Verifique suas credenciais.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Formatação automática do CPF: 123.456.789-00
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 11) value = value.slice(0, 11)

    if (value.length > 9) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(
        6,
        9
      )}-${value.slice(9)}`
    } else if (value.length > 6) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`
    } else if (value.length > 3) {
      value = `${value.slice(0, 3)}.${value.slice(3)}`
    }

    setCpf(value)
  }

  return (
    <div className="card p-8 max-w-sm mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Acesse sua conta
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Digite seu CPF e senha para continuar
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="cpf"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            CPF
          </label>
          <input
            type="text"
            id="cpf"
            value={cpf}
            onChange={handleCpfChange}
            placeholder="123.456.789-00"
            className="input-field"
            required
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Senha
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sua senha"
            className="input-field"
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Não tem uma conta?{' '}
            <Link
              to="/register"
              className="text-celebra-blue font-medium hover:underline"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}

export default Login
