/**
 * Testes E2E para o fluxo de autenticação
 */

describe('Fluxo de Autenticação', () => {
  beforeEach(() => {
    // Resetar cookies e localStorage antes de cada teste
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.mockApiCalls()
  })

  it('deve exibir a página de login', () => {
    cy.visit('/login')
    cy.get('[data-testid=login-form]').should('be.visible')
    cy.get('[data-testid=email-input]').should('be.visible')
    cy.get('[data-testid=password-input]').should('be.visible')
    cy.get('[data-testid=login-button]').should('be.visible')
  })

  it('deve validar campos de login obrigatórios', () => {
    cy.visit('/login')
    cy.get('[data-testid=login-button]').click()
    cy.get('[data-testid=email-error]').should('be.visible')
    cy.get('[data-testid=password-error]').should('be.visible')
  })

  it('deve realizar login com sucesso', () => {
    cy.visit('/login')
    cy.get('[data-testid=email-input]').type('admin@celebracapital.com.br')
    cy.get('[data-testid=password-input]').type('senha123')
    cy.get('[data-testid=login-button]').click()

    // Verificar redirecionamento após login bem-sucedido
    cy.url().should('include', '/admin')
    cy.get('[data-testid=user-menu]').should('be.visible')
  })

  it('deve exibir erro para credenciais inválidas', () => {
    // Configurar interceptação para simular falha de login
    cy.intercept('POST', '**/auth/login', {
      statusCode: 401,
      body: {
        message: 'Credenciais inválidas',
      },
    }).as('loginFailure')

    cy.visit('/login')
    cy.get('[data-testid=email-input]').type('usuario@invalido.com')
    cy.get('[data-testid=password-input]').type('senhaerrada')
    cy.get('[data-testid=login-button]').click()

    cy.wait('@loginFailure')
    cy.get('[data-testid=login-error]').should('be.visible')
  })

  it('deve permitir navegação para a página de recuperação de senha', () => {
    cy.visit('/login')
    cy.get('[data-testid=forgot-password-link]').click()
    cy.url().should('include', '/recuperar-senha')
  })

  it('deve permitir recuperação de senha', () => {
    cy.intercept('POST', '**/auth/reset-password', {
      statusCode: 200,
      body: {
        message: 'Email de recuperação enviado com sucesso',
      },
    }).as('resetPassword')

    cy.visit('/recuperar-senha')
    cy.get('[data-testid=email-input]').type('usuario@celebracapital.com.br')
    cy.get('[data-testid=send-reset-button]').click()

    cy.wait('@resetPassword')
    cy.get('[data-testid=reset-success-message]').should('be.visible')
  })

  it('deve realizar logout com sucesso', () => {
    // Primeiro fazer login
    cy.login()

    // Depois fazer logout
    cy.get('[data-testid=user-menu]').click()
    cy.get('[data-testid=logout-button]').click()

    // Verificar redirecionamento para a página de login
    cy.url().should('include', '/login')
  })
})
