/**
 * Testes E2E para o Dashboard Administrativo
 */

describe('Dashboard Administrativo', () => {
  beforeEach(() => {
    // Fazer login como administrador antes de cada teste
    cy.login('admin@celebracapital.com.br', 'senha123', 'admin')

    // Interceptar chamadas de API para o dashboard
    cy.intercept('GET', '**/api/dashboard/stats', {
      fixture: 'dashboard/stats.json',
    }).as('getStats')

    cy.intercept('GET', '**/api/dashboard/proposals/recent', {
      fixture: 'dashboard/recent-proposals.json',
    }).as('getRecentProposals')

    cy.intercept('GET', '**/api/dashboard/activities', {
      fixture: 'dashboard/activities.json',
    }).as('getActivities')

    cy.visit('/admin')

    // Aguardar carregamento dos dados do dashboard
    cy.wait(['@getStats', '@getRecentProposals', '@getActivities'])
  })

  it('deve exibir os componentes principais do dashboard', () => {
    // Verificar se os componentes principais estão visíveis
    cy.get('[data-testid=stats-cards]').should('be.visible')
    cy.get('[data-testid=stats-chart]').should('be.visible')
    cy.get('[data-testid=recent-proposals]').should('be.visible')
    cy.get('[data-testid=activity-list]').should('be.visible')
  })

  it('deve exibir os cards com estatísticas corretas', () => {
    cy.get('[data-testid=total-proposals-card]').should('contain', '125')
    cy.get('[data-testid=pending-proposals-card]').should('contain', '32')
    cy.get('[data-testid=approved-proposals-card]').should('contain', '78')
    cy.get('[data-testid=conversion-rate-card]').should('contain', '62%')
  })

  it('deve permitir navegação para a lista de propostas', () => {
    cy.get('[data-testid=view-all-proposals]').click()
    cy.url().should('include', '/admin/proposals')
  })

  it('deve permitir visualizar detalhes de uma proposta recente', () => {
    // Clicar na primeira proposta da lista de recentes
    cy.get('[data-testid=recent-proposal-item]').first().click()

    // Verificar redirecionamento para página de detalhes da proposta
    cy.url().should('match', /\/admin\/proposals\/\d+/)

    // Verificar se os detalhes da proposta são exibidos
    cy.get('[data-testid=proposal-details]').should('be.visible')
  })

  it('deve exibir notificações e permitir marcá-las como lidas', () => {
    // Interceptar API de notificações
    cy.intercept('GET', '**/api/notifications', {
      fixture: 'notifications/list.json',
    }).as('getNotifications')

    cy.intercept('PUT', '**/api/notifications/*/read', {
      statusCode: 200,
    }).as('markAsRead')

    // Clicar no ícone de notificações
    cy.get('[data-testid=notification-icon]').click()

    // Verificar se o dropdown de notificações é exibido
    cy.get('[data-testid=notifications-dropdown]').should('be.visible')

    // Verificar se há notificações não lidas
    cy.get('[data-testid=unread-notification]').should(
      'have.length.at.least',
      1
    )

    // Marcar uma notificação como lida
    cy.get('[data-testid=notification-item]').first().click()

    // Verificar se a API foi chamada para marcar como lida
    cy.wait('@markAsRead')
  })

  it('deve mostrar gráficos e dados de análise corretos', () => {
    // Navegar para a página de analytics
    cy.get('[data-testid=analytics-link]').click()
    cy.url().should('include', '/admin/analytics')

    // Verificar se o gráfico principal está visível
    cy.get('[data-testid=main-chart]').should('be.visible')

    // Verificar filtros
    cy.get('[data-testid=date-filter]').should('be.visible')

    // Alterar o período do filtro
    cy.get('[data-testid=date-filter]').click()
    cy.get('[data-testid=last-month-option]').click()

    // Verificar se os dados são atualizados
    cy.get('[data-testid=filtered-data]').should('be.visible')
  })
})
