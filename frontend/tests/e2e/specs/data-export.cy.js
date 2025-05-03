/**
 * Testes E2E para o módulo de exportação de dados
 * Testa as funcionalidades de exportação em diferentes formatos (CSV, Excel, PDF)
 */

describe('Módulo de Exportação de Dados', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.login('admin@celebracapital.com.br', 'senha123', 'admin')

    // Interceptar API de listagem de propostas
    cy.intercept('GET', '**/api/proposals*', {
      fixture: 'proposals/list.json',
    }).as('getProposals')

    cy.visit('/admin/proposals')
    cy.wait('@getProposals')
  })

  it('deve exportar lista de propostas em formato CSV', () => {
    // Interceptar chamada de download
    cy.intercept('GET', '**/api/export/proposals?format=csv*', {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=propostas.csv',
      },
      body: 'id,razao_social,cnpj,status,valor_solicitado\n1050,Martins Consultoria LTDA,45.678.901/0001-23,completed,150000\n1025,Empresa Teste LTDA,12.345.678/0001-90,pending,25000',
    }).as('exportCsv')

    // Clicar no botão de exportar
    cy.get('[data-testid=export-button]').click()

    // Selecionar formato CSV
    cy.get('[data-testid=format-select]').select('csv')

    // Adicionar filtros específicos para exportação
    cy.get('[data-testid=export-date-range-start]').type('2023-11-01')
    cy.get('[data-testid=export-date-range-end]').type('2023-11-30')

    // Confirmar exportação
    cy.get('[data-testid=confirm-export-button]').click()

    // Verificar se o download foi iniciado
    cy.wait('@exportCsv')
  })

  it('deve exportar lista de propostas em formato Excel', () => {
    // Interceptar chamada de download
    cy.intercept('GET', '**/api/export/proposals?format=excel*', {
      statusCode: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=propostas.xlsx',
      },
      // Não é possível testar o corpo binário do Excel diretamente
    }).as('exportExcel')

    // Clicar no botão de exportar
    cy.get('[data-testid=export-button]').click()

    // Selecionar formato Excel
    cy.get('[data-testid=format-select]').select('excel')

    // Selecionar todos os campos para exportação
    cy.get('[data-testid=select-all-fields]').check()

    // Confirmar exportação
    cy.get('[data-testid=confirm-export-button]').click()

    // Verificar se o download foi iniciado
    cy.wait('@exportExcel')
  })

  it('deve exportar detalhes de uma proposta específica em PDF', () => {
    // Interceptar API de obtenção de proposta
    cy.intercept('GET', '**/api/proposals/1050', {
      fixture: 'proposals/completed-proposal.json',
    }).as('getProposal')

    // Acessar detalhes de uma proposta
    cy.contains(
      '[data-testid=proposal-row]',
      'Martins Consultoria LTDA'
    ).click()
    cy.wait('@getProposal')

    // Interceptar chamada de download PDF
    cy.intercept('GET', '**/api/export/proposals/1050?format=pdf*', {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=proposta-1050.pdf',
      },
      // Não é possível testar o corpo binário do PDF diretamente
    }).as('exportPdf')

    // Clicar no botão de exportar
    cy.get('[data-testid=export-proposal-button]').click()

    // Selecionar opções do PDF
    cy.get('[data-testid=include-docs-checkbox]').check()
    cy.get('[data-testid=include-history-checkbox]').check()

    // Confirmar exportação
    cy.get('[data-testid=confirm-export-button]').click()

    // Verificar se o download foi iniciado
    cy.wait('@exportPdf')
  })

  it('deve exportar relatório analítico de propostas', () => {
    // Navegar para página de relatórios
    cy.get('[data-testid=reports-link]').click()

    // Interceptar API de dados analíticos
    cy.intercept('GET', '**/api/analytics/proposals*', {
      fixture: 'analytics/proposal-analytics.json',
    }).as('getAnalytics')

    cy.wait('@getAnalytics')

    // Interceptar chamada de download de relatório
    cy.intercept('GET', '**/api/export/reports/proposals*', {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition':
          'attachment; filename=relatorio-analitico-propostas.pdf',
      },
      // Não é possível testar o corpo binário do PDF diretamente
    }).as('exportReport')

    // Configurar parâmetros do relatório
    cy.get('[data-testid=report-date-range-start]').type('2023-01-01')
    cy.get('[data-testid=report-date-range-end]').type('2023-11-30')
    cy.get('[data-testid=report-type-select]').select('analytic')
    cy.get('[data-testid=include-charts-checkbox]').check()

    // Confirmar exportação
    cy.get('[data-testid=generate-report-button]').click()

    // Verificar se o download foi iniciado
    cy.wait('@exportReport')
  })
})
