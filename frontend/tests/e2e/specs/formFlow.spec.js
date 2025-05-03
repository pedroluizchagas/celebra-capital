/**
 * Teste E2E - Fluxo de Formulário de Solicitação de Crédito
 * Este teste verifica o preenchimento completo do formulário de solicitação de crédito
 */

describe('Fluxo de Formulário de Solicitação de Crédito', () => {
  beforeEach(() => {
    // Mockear chamadas à API
    cy.mockApiCalls()

    // Acessar a página inicial
    cy.visit('/')
  })

  it('deve permitir preencher todo o formulário e enviar com sucesso', () => {
    // Iniciar o fluxo de formulário
    cy.get('[data-testid=start-form-button]').click()

    // Preencher a primeira etapa do formulário - Dados Pessoais
    cy.get('[data-testid=input-name]').type('João da Silva')
    cy.get('[data-testid=input-cpf]').type('123.456.789-00')
    cy.get('[data-testid=input-email]').type('joao@example.com')
    cy.get('[data-testid=input-phone]').type('(11) 98765-4321')
    cy.get('[data-testid=next-button]').click()

    // Preencher a segunda etapa - Dados Profissionais
    cy.get('[data-testid=input-occupation]').type('Servidor Público')
    cy.get('[data-testid=input-employer]').type('Prefeitura Municipal')
    cy.get('[data-testid=input-income]').type('5000')
    cy.get('[data-testid=input-employment-time]').type('5')
    cy.get('[data-testid=next-button]').click()

    // Preencher a terceira etapa - Dados do Empréstimo
    cy.get('[data-testid=input-loan-amount]').type('15000')
    cy.get('[data-testid=input-loan-term]').type('36')
    cy.get('[data-testid=input-loan-purpose]').select('Pagamento de dívidas')
    cy.get('[data-testid=next-button]').click()

    // Verificar resumo dos dados antes de prosseguir
    cy.get('[data-testid=summary-container]')
      .should('contain', 'João da Silva')
      .and('contain', '123.456.789-00')
      .and('contain', 'R$ 15.000,00')
      .and('contain', '36 meses')

    cy.get('[data-testid=confirm-button]').click()

    // Verificar redirecionamento para a página de upload de documentos
    cy.url().should('include', '/documentos')

    // Simular upload de documentos
    cy.fixture('teste-rg.jpg', null).as('rgFile')
    cy.get('[data-testid=upload-rg]').selectFile('@rgFile')

    cy.fixture('teste-cpf.jpg', null).as('cpfFile')
    cy.get('[data-testid=upload-cpf]').selectFile('@cpfFile')

    cy.fixture('teste-comprovante.jpg', null).as('comprovantFile')
    cy.get('[data-testid=upload-income]').selectFile('@comprovantFile')

    cy.get('[data-testid=next-button]').click()

    // Verificar redirecionamento para a página de assinatura
    cy.url().should('include', '/assinatura')

    // Assinar o contrato
    cy.get('[data-testid=signature-pad]').then(($canvas) => {
      const canvas = $canvas[0]
      const ctx = canvas.getContext('2d')

      // Simular assinatura
      ctx.moveTo(50, 50)
      ctx.lineTo(200, 50)
      ctx.stroke()
    })

    cy.get('[data-testid=confirm-signature]').click()

    // Verificar redirecionamento para a página de sucesso
    cy.url().should('include', '/sucesso')
    cy.get('[data-testid=success-message]')
      .should('be.visible')
      .and('contain', 'Solicitação enviada com sucesso')

    // Verificar número do protocolo
    cy.get('[data-testid=protocol-number]').should('be.visible')
  })

  it('deve validar campos obrigatórios e exibir mensagens de erro', () => {
    // Iniciar o fluxo de formulário
    cy.get('[data-testid=start-form-button]').click()

    // Tentar avançar sem preencher os campos
    cy.get('[data-testid=next-button]').click()

    // Verificar mensagens de erro
    cy.get('[data-testid=input-name-error]').should('be.visible')
    cy.get('[data-testid=input-cpf-error]').should('be.visible')
    cy.get('[data-testid=input-email-error]').should('be.visible')
    cy.get('[data-testid=input-phone-error]').should('be.visible')
  })

  it('deve permitir navegar entre as etapas do formulário', () => {
    // Iniciar o fluxo de formulário
    cy.get('[data-testid=start-form-button]').click()

    // Preencher a primeira etapa
    cy.get('[data-testid=input-name]').type('João da Silva')
    cy.get('[data-testid=input-cpf]').type('123.456.789-00')
    cy.get('[data-testid=input-email]').type('joao@example.com')
    cy.get('[data-testid=input-phone]').type('(11) 98765-4321')
    cy.get('[data-testid=next-button]').click()

    // Verificar se está na segunda etapa
    cy.get('[data-testid=input-occupation]').should('be.visible')

    // Voltar para a primeira etapa
    cy.get('[data-testid=back-button]').click()

    // Verificar se voltou para a primeira etapa
    cy.get('[data-testid=input-name]').should('have.value', 'João da Silva')

    // Avançar novamente para a segunda etapa
    cy.get('[data-testid=next-button]').click()

    // Verificar se está na segunda etapa novamente
    cy.get('[data-testid=input-occupation]').should('be.visible')
  })
})
