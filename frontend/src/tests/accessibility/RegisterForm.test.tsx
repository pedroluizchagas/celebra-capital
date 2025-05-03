import React from 'react'
import {
  testAccessibility,
  testComponentWithAccessibility,
  generateAccessibilityReport,
} from './axe-runner'
import { RegisterForm } from '../../components/Form/examples/RegisterForm'
import { screen } from '@testing-library/react'
import fs from 'fs'
import path from 'path'

// Testes de acessibilidade para o RegisterForm
describe('RegisterForm Accessibility Tests', () => {
  // Teste básico de acessibilidade
  test('should not have any accessibility violations', async () => {
    await testAccessibility(<RegisterForm />)
  })

  // Teste completo com verificações adicionais
  testComponentWithAccessibility(
    'should render all form fields with proper accessibility attributes',
    <RegisterForm />,
    ({ getByLabelText, getAllByRole }) => {
      // Verifica se os campos têm labels acessíveis
      expect(getByLabelText(/nome completo/i)).toBeInTheDocument()
      expect(getByLabelText(/email/i)).toBeInTheDocument()
      expect(getByLabelText(/telefone/i)).toBeInTheDocument()
      expect(getByLabelText(/cargo pretendido/i)).toBeInTheDocument()

      // Verifica se os botões de opção têm roles corretos
      const radioButtons = getAllByRole('radio')
      expect(radioButtons.length).toBeGreaterThan(0)

      // Verifica se as caixas de seleção têm roles corretos
      const checkboxes = getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(0)

      // Verifica se o botão de submissão tem atributos acessíveis
      const submitButton = screen.getByRole('button', {
        name: /enviar cadastro/i,
      })
      expect(submitButton).toHaveAttribute('aria-disabled')
    }
  )

  // Gera um relatório detalhado de acessibilidade e salva em um arquivo
  // Útil para verificação manual e documentação
  test('should generate an accessibility report', async () => {
    const report = await generateAccessibilityReport(<RegisterForm />)

    // Comentado para não executar em ambientes de CI/CD
    // Descomente para gerar o relatório durante o desenvolvimento
    /*
    if (process.env.NODE_ENV === 'development') {
      const reportsDir = path.join(__dirname, '../../../reports/accessibility');
      
      // Cria o diretório se não existir
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      // Salva o relatório com timestamp
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      fs.writeFileSync(
        path.join(reportsDir, `register-form-a11y-${timestamp}.md`),
        report
      );
    }
    */

    // Verifica se o relatório foi gerado
    expect(report).toContain('Relatório de Acessibilidade')
  })
})
