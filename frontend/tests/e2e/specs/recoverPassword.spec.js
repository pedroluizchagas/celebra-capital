/**
 * Teste E2E - Fluxo de Recuperação de Senha
 * Este teste verifica o processo de recuperação de senha
 */

describe('Fluxo de Recuperação de Senha', () => {
  beforeEach(() => {
    // Mockear chamadas à API
    cy.mockApiCalls()

    // Visitar a página de recuperação de senha
    cy.visit('/recuperar-senha')
  })

  it('deve exibir o formulário de recuperação de senha', () => {
    // Verificar elementos da página
    cy.get('h1').should('contain', 'Recuperar Senha')
    cy.get('[data-testid=email-input]').should('be.visible')
    cy.get('[data-testid=recover-button]').should('be.visible')
  })

  it('deve validar o campo de email', () => {
    // Submeter o formulário sem preencher o email
    cy.get('[data-testid=recover-button]').click()

    // Verificar mensagem de erro
    cy.get('[data-testid=email-input]').should(
      'have.attr',
      'aria-invalid',
      'true'
    )

    // Preencher com email inválido
    cy.get('[data-testid=email-input]').type('email-invalido')
    cy.get('[data-testid=recover-button]').click()

    // Verificar mensagem de erro para email inválido
    cy.get('[data-testid=email-input]').should(
      'have.attr',
      'aria-invalid',
      'true'
    )
  })

  it('deve enviar o email de recuperação e mostrar mensagem de sucesso', () => {
    // Simular sucesso na API
    cy.intercept('POST', '**/api/v1/auth/recover-password', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Email de recuperação enviado com sucesso.',
      },
    }).as('recoverPassword')

    // Preencher o formulário com email válido
    cy.get('[data-testid=email-input]').type('usuario@example.com')
    cy.get('[data-testid=recover-button]').click()

    // Aguardar a chamada da API
    cy.wait('@recoverPassword')

    // Verificar mensagem de sucesso
    cy.get('[data-testid=success-message]').should('be.visible')
    cy.get('[data-testid=back-to-login-button]').should('be.visible')
    cy.get('[data-testid=try-again-button]').should('be.visible')
  })

  it('deve exibir mensagem de erro quando a API falha', () => {
    // Simular erro na API
    cy.intercept('POST', '**/api/v1/auth/recover-password', {
      statusCode: 404,
      body: {
        success: false,
        message: 'Email não encontrado em nossa base de dados.',
      },
    }).as('recoverPasswordError')

    // Preencher o formulário com email
    cy.get('[data-testid=email-input]').type('nao-cadastrado@example.com')
    cy.get('[data-testid=recover-button]').click()

    // Aguardar a chamada da API
    cy.wait('@recoverPasswordError')

    // Verificar mensagem de erro
    cy.get('[data-testid=error-message]')
      .should('be.visible')
      .and('contain', 'Email não encontrado')
  })

  it('deve navegar para login ao clicar no link correspondente', () => {
    // Clicar no link "Voltar para login"
    cy.contains('Voltar para login').click()

    // Verificar se foi redirecionado para a página de login
    cy.url().should('include', '/login')
  })

  it('deve permitir tentar novamente após receber a mensagem de sucesso', () => {
    // Simular sucesso na API
    cy.intercept('POST', '**/api/v1/auth/recover-password', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Email de recuperação enviado com sucesso.',
      },
    }).as('recoverPassword')

    // Preencher o formulário e enviar
    cy.get('[data-testid=email-input]').type('usuario@example.com')
    cy.get('[data-testid=recover-button]').click()

    // Aguardar a chamada da API
    cy.wait('@recoverPassword')

    // Verificar mensagem de sucesso
    cy.get('[data-testid=success-message]').should('be.visible')

    // Clicar no botão "Tentar com outro e-mail"
    cy.get('[data-testid=try-again-button]').click()

    // Verificar se voltou para o formulário
    cy.get('[data-testid=email-input]').should('be.visible')
    cy.get('[data-testid=recover-button]').should('be.visible')
    cy.get('[data-testid=success-message]').should('not.exist')
  })

  it('deve mostrar loading state enquanto processa a solicitação', () => {
    // Configurar um delay na interceptação
    cy.intercept('POST', '**/api/v1/auth/recover-password', {
      statusCode: 200,
      delayMs: 1000,
      body: {
        success: true,
        message: 'Email de recuperação enviado com sucesso.',
      },
    }).as('recoverPasswordDelayed')

    // Preencher o formulário e enviar
    cy.get('[data-testid=email-input]').type('usuario@example.com')
    cy.get('[data-testid=recover-button]').click()

    // Verificar indicador de carregamento
    cy.get('[data-testid=recover-button]').should('be.disabled')
    cy.get('[data-testid=loading-indicator]').should('be.visible')

    // Aguardar a resposta
    cy.wait('@recoverPasswordDelayed')

    // Verificar mensagem de sucesso
    cy.get('[data-testid=success-message]').should('be.visible')
  })
})
