/**
 * Configuração para testes E2E com Cypress
 * Este arquivo configura o ambiente para testes end-to-end
 */

// Importar comandos personalizados do Cypress
import './commands'

// Desativar o registro de erros no console durante os testes
// para evitar poluição no terminal
Cypress.on('uncaught:exception', (err, runnable) => {
  // Não falhar o teste se houver erro de excecão não capturada
  return false
})

// Configuração global antes de cada teste
beforeEach(() => {
  // Limpar localStorage e cookies antes de cada teste
  cy.clearLocalStorage()
  cy.clearCookies()
})

// Adicionar comandos personalizados para login
Cypress.Commands.add(
  'login',
  (email = 'admin@celebracapital.com.br', password = 'senha123') => {
    cy.visit('/login')
    cy.get('[data-testid=email-input]').type(email)
    cy.get('[data-testid=password-input]').type(password)
    cy.get('[data-testid=login-button]').click()

    // Aguardar redirecionamento para o dashboard
    cy.url().should('include', '/admin')
    cy.get('[data-testid=user-menu]').should('be.visible')
  }
)

// Comando para navegar até a página de detalhes de uma proposta
Cypress.Commands.add('visitProposal', (proposalId) => {
  cy.visit(`/admin/proposals/${proposalId}`)
  cy.get('[data-testid=proposal-details]').should('be.visible')
})

// Comando para aprovar uma proposta
Cypress.Commands.add('approveProposal', (comment = '') => {
  cy.get('[data-testid=approve-button]').click()
  if (comment) {
    cy.get('[data-testid=approval-comment]').type(comment)
  }
  cy.get('[data-testid=confirm-approval-button]').click()
  cy.get('[data-testid=success-message]').should('be.visible')
})

// Comando para rejeitar uma proposta
Cypress.Commands.add('rejectProposal', (reason, comment = '') => {
  cy.get('[data-testid=reject-button]').click()
  cy.get('[data-testid=reject-reason-select]').select(reason)
  if (comment) {
    cy.get('[data-testid=rejection-comment]').type(comment)
  }
  cy.get('[data-testid=confirm-rejection-button]').click()
  cy.get('[data-testid=success-message]').should('be.visible')
})

// Configuração de interceptação de requisições à API
Cypress.Commands.add('mockApiCalls', () => {
  // Interceptar chamadas de login
  cy.intercept('POST', '**/auth/login', {
    statusCode: 200,
    body: {
      access_token: 'cypress-test-token',
      refresh_token: 'cypress-refresh-token',
      user: {
        id: 1,
        name: 'Administrador de Teste',
        email: 'admin@celebracapital.com.br',
        role: 'admin',
      },
    },
  }).as('loginRequest')

  // Interceptar chamadas para obter propostas
  cy.intercept('GET', '**/proposals*', {
    statusCode: 200,
    fixture: 'proposals.json',
  }).as('getProposals')

  // Interceptar chamadas para obter detalhes de uma proposta
  cy.intercept('GET', '**/proposals/*', {
    statusCode: 200,
    fixture: 'proposal-details.json',
  }).as('getProposalDetails')

  // Interceptar chamadas de notificações
  cy.intercept('GET', '**/notifications*', {
    statusCode: 200,
    fixture: 'notifications.json',
  }).as('getNotifications')
})
