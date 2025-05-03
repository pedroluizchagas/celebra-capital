import React, { useState } from 'react'
import { VisuallyHidden } from '../components/a11y/VisuallyHidden'
import AccessibilityToggle from '../components/a11y/AccessibilityToggle'
import { PageContainer } from '../components/PageContainer'
import A11yDocs from '../components/a11y/A11yDocs'
import { SkipLink } from '../components/a11y/SkipLink'

/**
 * Página de testes de acessibilidade
 *
 * Esta página demonstra componentes e técnicas de acessibilidade
 */
const A11yTestPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [activeTab, setActiveTab] = useState('formulários')

  // Lidar com mudanças no formulário
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Limpar erro quando campo é preenchido
    if (value.trim() && formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      })
    }
  }

  // Validar formulário
  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório'
    }

    if (!formData.email.trim()) {
      errors.email = 'E-mail é obrigatório'
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Formato de e-mail inválido'
    }

    if (!formData.message.trim()) {
      errors.message = 'Mensagem é obrigatória'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Enviar formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      // Simulação de envio
      setTimeout(() => {
        setSubmitted(true)
        // Limpar formulário após "envio"
        setFormData({
          name: '',
          email: '',
          message: '',
        })

        // Anunciar para leitores de tela
        const liveRegion = document.getElementById('form-result')
        if (liveRegion) {
          liveRegion.textContent = 'Formulário enviado com sucesso!'
        }
      }, 1000)
    } else {
      // Focar no primeiro campo com erro
      const firstErrorField = Object.keys(formErrors)[0]
      const element = document.getElementById(firstErrorField)
      if (element) {
        element.focus()
      }

      // Anunciar erro para leitores de tela
      const liveRegion = document.getElementById('form-result')
      if (liveRegion) {
        liveRegion.textContent =
          'Há erros no formulário. Por favor, corrija-os.'
      }
    }
  }

  return (
    <>
      <SkipLink targetId="main-content" />
      <PageContainer>
        <main id="main-content">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-6">
              Testes de Acessibilidade
            </h1>
            <AccessibilityToggle />
          </div>

          <A11yDocs />

          {/* Conteúdo original pode ser removido ou movido para o A11yDocs */}
        </main>
      </PageContainer>
    </>
  )
}

export default A11yTestPage
