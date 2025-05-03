import React, { useState } from 'react'
import InlineFeedback from '../a11y/InlineFeedback'

/**
 * Componente de exemplo para demonstrar uso do feedback acessível em formulários
 */
const FormExample: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const validateEmail = (value: string) => {
    if (!value) {
      return 'Email é obrigatório'
    }
    if (!/\S+@\S+\.\S+/.test(value)) {
      return 'Email inválido'
    }
    return ''
  }

  const validatePassword = (value: string) => {
    if (!value) {
      return 'Senha é obrigatória'
    }
    if (value.length < 8) {
      return 'Senha deve ter pelo menos 8 caracteres'
    }
    return ''
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    setEmailError(validateEmail(value))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    setPasswordError(validatePassword(value))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validação completa no envio
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)

    setEmailError(emailError)
    setPasswordError(passwordError)

    if (!emailError && !passwordError) {
      // Simulação de submissão bem-sucedida
      setSubmitted(true)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        Exemplo de Formulário Acessível
      </h2>

      {submitted ? (
        <div className="mb-4">
          <InlineFeedback
            id="form-success"
            message="Formulário enviado com sucesso!"
            type="success"
            assertive={true}
          />
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              className={`w-full px-3 py-2 border rounded-md ${
                emailError ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-describedby={emailError ? 'email-error' : undefined}
              aria-invalid={!!emailError}
            />
            {emailError && (
              <InlineFeedback
                id="email-error"
                message={emailError}
                type="error"
              />
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Senha
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              className={`w-full px-3 py-2 border rounded-md ${
                passwordError ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-describedby={passwordError ? 'password-error' : undefined}
              aria-invalid={!!passwordError}
            />
            {passwordError && (
              <InlineFeedback
                id="password-error"
                message={passwordError}
                type="error"
              />
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Enviar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default FormExample
