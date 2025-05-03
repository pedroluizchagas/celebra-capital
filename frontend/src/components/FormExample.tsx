import React, { useState, useRef } from 'react'
import {
  FormFieldWrapper,
  FormStatusMessage,
  useFormErrorFocus,
  getAccessibleFieldProps,
} from './a11y/FormAccessibility'

interface FormData {
  nome: string
  email: string
  telefone: string
  mensagem: string
}

interface FormErrors {
  nome?: string
  email?: string
  telefone?: string
  mensagem?: string
}

/**
 * Exemplo de formulário implementando boas práticas de acessibilidade
 */
const FormExample: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    telefone: '',
    mensagem: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [formStatus, setFormStatus] = useState('')
  const [formStatusType, setFormStatusType] = useState<
    'success' | 'error' | 'info'
  >('info')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formRef = useRef<HTMLFormElement>(null)

  // Hook para mover o foco para o primeiro campo com erro
  useFormErrorFocus(formRef, Object.keys(errors).length > 0)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpar erro do campo quando o usuário começa a digitar
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    // Validação do nome
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
    }

    // Validação do email
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido'
    }

    // Validação do telefone (opcional)
    if (
      formData.telefone &&
      !/^\d{10,11}$/.test(formData.telefone.replace(/\D/g, ''))
    ) {
      newErrors.telefone = 'Formato de telefone inválido'
    }

    // Validação da mensagem
    if (!formData.mensagem.trim()) {
      newErrors.mensagem = 'Mensagem é obrigatória'
    } else if (formData.mensagem.length < 10) {
      newErrors.mensagem = 'Mensagem deve ter pelo menos 10 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Limpar status anterior
    setFormStatus('')

    // Validar formulário
    if (!validate()) {
      setFormStatus('Por favor, corrija os erros no formulário')
      setFormStatusType('error')
      return
    }

    // Simular envio
    try {
      setIsSubmitting(true)

      // Aqui seria feita a chamada real à API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Sucesso
      setFormStatus(
        'Mensagem enviada com sucesso! Entraremos em contato em breve.'
      )
      setFormStatusType('success')
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        mensagem: '',
      })
    } catch (error) {
      // Erro
      setFormStatus('Erro ao enviar formulário. Por favor, tente novamente.')
      setFormStatusType('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="form-container max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Entre em Contato</h2>

      {/* Mensagem de status do formulário */}
      <FormStatusMessage
        message={formStatus}
        type={formStatusType}
        visible={true}
      />

      <form ref={formRef} onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">
          {/* Campo de nome com wrapper de acessibilidade */}
          <FormFieldWrapper
            id="nome"
            label="Nome"
            error={errors.nome}
            required={true}
          >
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                errors.nome ? 'border-red-500' : 'border-gray-300'
              }`}
              {...getAccessibleFieldProps('nome', errors.nome, undefined, true)}
            />
          </FormFieldWrapper>

          {/* Campo de email com wrapper de acessibilidade */}
          <FormFieldWrapper
            id="email"
            label="Email"
            error={errors.email}
            required={true}
          >
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              {...getAccessibleFieldProps(
                'email',
                errors.email,
                undefined,
                true
              )}
            />
          </FormFieldWrapper>

          {/* Campo de telefone com wrapper de acessibilidade */}
          <FormFieldWrapper
            id="telefone"
            label="Telefone"
            error={errors.telefone}
            hint="Formato: (00) 00000-0000"
          >
            <input
              type="tel"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${
                errors.telefone ? 'border-red-500' : 'border-gray-300'
              }`}
              {...getAccessibleFieldProps(
                'telefone',
                errors.telefone,
                'Formato: (00) 00000-0000'
              )}
            />
          </FormFieldWrapper>

          {/* Campo de mensagem com wrapper de acessibilidade */}
          <FormFieldWrapper
            id="mensagem"
            label="Mensagem"
            error={errors.mensagem}
            required={true}
          >
            <textarea
              name="mensagem"
              value={formData.mensagem}
              onChange={handleChange}
              rows={4}
              className={`w-full p-2 border rounded ${
                errors.mensagem ? 'border-red-500' : 'border-gray-300'
              }`}
              {...getAccessibleFieldProps(
                'mensagem',
                errors.mensagem,
                undefined,
                true
              )}
            />
          </FormFieldWrapper>

          {/* Botão de envio */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              aria-busy={isSubmitting ? 'true' : 'false'}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default FormExample
