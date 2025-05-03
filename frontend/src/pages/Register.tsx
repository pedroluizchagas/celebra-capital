import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authService from '../services/authService'
import TermsModal from '../components/modals/TermsModal'
import PrivacyModal from '../components/modals/PrivacyModal'

const Register: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    email: '',
    phone_number: '',
    user_type: 'public_server', // Valor padrão
    monthly_income: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Dados pessoais, 2: Credenciais
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
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

    setFormData((prev) => ({
      ...prev,
      cpf: value,
    }))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Formatação automática do telefone: (11) 99999-9999
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 11) value = value.slice(0, 11)

    if (value.length > 10) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`
    } else if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`
    }

    setFormData((prev) => ({
      ...prev,
      phone_number: value,
    }))
  }

  const validateStep1 = () => {
    // Validar nome
    if (formData.name.trim().length < 5) {
      setError('Por favor, digite seu nome completo.')
      return false
    }

    // Validar CPF
    const cpfDigits = formData.cpf.replace(/\D/g, '')
    if (cpfDigits.length !== 11) {
      setError('CPF inválido. Por favor, digite os 11 dígitos.')
      return false
    }

    // Validar email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(formData.email)) {
      setError('Email inválido. Por favor, digite um email válido.')
      return false
    }

    // Validar telefone
    const phoneDigits = formData.phone_number.replace(/\D/g, '')
    if (phoneDigits.length < 10) {
      setError('Telefone inválido. Por favor, digite um número válido.')
      return false
    }

    // Validar renda
    if (
      formData.monthly_income.trim() === '' ||
      parseFloat(formData.monthly_income) <= 0
    ) {
      setError('Por favor, informe sua renda mensal.')
      return false
    }

    return true
  }

  const validateStep2 = () => {
    // Validar senha
    if (formData.password.length < 6) {
      setError('A senha deve conter pelo menos 6 caracteres.')
      return false
    }

    // Validar confirmação de senha
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.')
      return false
    }

    // Verificar aceitação dos termos
    if (!termsAccepted) {
      setError(
        'Você precisa aceitar os termos de uso e política de privacidade'
      )
      return false
    }

    return true
  }

  const handleNextStep = () => {
    if (validateStep1()) {
      setError(null)
      setStep(2)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep2()) {
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      // Formatação básica de CPF (remover pontos e traços)
      const formattedCpf = formData.cpf.replace(/\D/g, '')
      const formattedPhone = formData.phone_number.replace(/\D/g, '')

      // Verificar se CPF já existe
      const checkResult = await authService.checkCpf(formattedCpf)

      if (checkResult.exists) {
        setError('Este CPF já está cadastrado. Tente fazer login.')
        setIsLoading(false)
        return
      }

      // Preparar dados para registro
      const userData = {
        name: formData.name,
        cpf: formattedCpf,
        email: formData.email,
        phone_number: formattedPhone,
        user_type: formData.user_type,
        monthly_income: parseFloat(formData.monthly_income),
        password: formData.password,
      }

      // Chamar o serviço de registro
      await authService.register(userData)

      // Fazer login automático após registro bem-sucedido
      await authService.login({
        cpf: formattedCpf,
        password: formData.password,
      })

      // Redirecionar para a página inicial
      navigate('/')
    } catch (error: any) {
      console.error('Erro ao registrar:', error)
      setError(
        error.response?.data?.message ||
          'Erro ao criar conta. Por favor, tente novamente.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card p-8 max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Crie sua conta
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          {step === 1
            ? 'Preencha seus dados pessoais'
            : 'Defina suas credenciais de acesso'}
        </p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span>Passo {step} de 2</span>
          <span className="text-celebra-blue">
            {step === 1 ? '50%' : '100%'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-celebra-blue h-2 rounded-full transition-all duration-500"
            style={{
              width: step === 1 ? '50%' : '100%',
            }}
          ></div>
        </div>
      </div>

      {step === 1 ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleNextStep()
          }}
        >
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Nome Completo
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Seu nome completo"
              className="input-field"
              required
            />
          </div>

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
              name="cpf"
              value={formData.cpf}
              onChange={handleCpfChange}
              placeholder="123.456.789-00"
              className="input-field"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              className="input-field"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="phone_number"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Telefone
            </label>
            <input
              type="text"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handlePhoneChange}
              placeholder="(11) 99999-9999"
              className="input-field"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="user_type"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Tipo de Usuário
            </label>
            <select
              id="user_type"
              name="user_type"
              value={formData.user_type}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="public_server">Servidor Público</option>
              <option value="retiree">Aposentado</option>
              <option value="pensioner">Pensionista</option>
            </select>
          </div>

          <div className="mb-6">
            <label
              htmlFor="monthly_income"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Renda Mensal (R$)
            </label>
            <input
              type="number"
              id="monthly_income"
              name="monthly_income"
              value={formData.monthly_income}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="input-field"
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 px-4 bg-celebra-blue hover:bg-blue-700 text-white font-medium rounded-md transition duration-200"
            disabled={isLoading}
          >
            {isLoading ? 'Carregando...' : 'Continuar'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Sua senha"
              className="input-field"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres</p>
          </div>

          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Confirme sua Senha
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirme sua senha"
              className="input-field"
              required
            />
          </div>

          <div className="mb-6">
            <label className="flex items-start">
              <input
                type="checkbox"
                className="mt-1 mr-2"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                data-testid="terms-checkbox"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Eu li e concordo com os{' '}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-celebra-blue hover:underline"
                  data-testid="register-terms-link"
                >
                  Termos de Uso
                </button>{' '}
                e a{' '}
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(true)}
                  className="text-celebra-blue hover:underline"
                  data-testid="register-privacy-link"
                >
                  Política de Privacidade
                </button>
              </span>
            </label>
            {!termsAccepted && error && error.includes('termos') && (
              <p
                className="text-red-500 text-sm mt-1"
                data-testid="terms-error"
              >
                Você precisa aceitar os termos de uso e política de privacidade
              </p>
            )}
          </div>

          {error && !error.includes('termos') && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition duration-200"
            >
              Voltar
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-celebra-blue hover:bg-blue-700 text-white font-medium rounded-md transition duration-200"
              disabled={isLoading}
              data-testid="cadastro-button"
            >
              {isLoading ? 'Carregando...' : 'Criar Conta'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Já tem uma conta?{' '}
        <Link
          to="/login"
          className="text-celebra-blue hover:underline font-medium"
        >
          Entrar
        </Link>
      </div>

      {/* Modais de Termos e Privacidade */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
      <PrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </div>
  )
}

export default Register
