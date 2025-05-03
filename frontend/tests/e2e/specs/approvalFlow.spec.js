/**
 * Teste E2E - Fluxo de Aprovação de Propostas
 * Este teste verifica o fluxo completo de aprovação de uma proposta de crédito
 */

describe('Fluxo de Aprovação de Propostas', () => {
  beforeEach(() => {
    // Mockear chamadas à API
    cy.mockApiCalls()

    // Realizar login
    cy.login()
  })

  it('deve permitir a aprovação de uma proposta pendente', () => {
    // Visitar a página de detalhes da proposta
    cy.visitProposal('123')

    // Verificar se a proposta está em estado pendente
    cy.get('[data-testid=status-badge]').should('contain', 'Pendente')

    // Aprovar a proposta com comentário
    cy.approveProposal('Proposta dentro dos parâmetros de crédito')

    // Verificar se o status foi atualizado
    cy.get('[data-testid=status-badge]')
      .should('contain', 'Aprovada')
      .and('have.class', 'bg-green-100')

    // Verificar se o histórico de atividades foi atualizado
    cy.get('[data-testid=activity-log]')
      .should('contain', 'Proposta aprovada')
      .and('contain', 'Proposta dentro dos parâmetros de crédito')
  })

  it('deve exibir erro ao tentar aprovar proposta já processada', () => {
    // Visitar a página de uma proposta já aprovada
    cy.intercept('GET', '**/proposals/456', {
      statusCode: 200,
      body: {
        id: 456,
        proposal_number: 'P-2023-456',
        status: 'approved',
        // outros campos...
      },
    }).as('getApprovedProposal')

    cy.visit('/admin/proposals/456')
    cy.wait('@getApprovedProposal')

    // Verificar se o botão de aprovação está desabilitado
    cy.get('[data-testid=approve-button]').should('be.disabled')

    // Tentar forçar a aprovação (remover atributo disabled via JS)
    cy.window().then((win) => {
      win.document
        .querySelector('[data-testid=approve-button]')
        .removeAttribute('disabled')
    })

    // Tentar clicar no botão (agora habilitado artificialmente)
    cy.get('[data-testid=approve-button]').click({ force: true })

    // Deve exibir mensagem de erro
    cy.get('[data-testid=error-message]')
      .should('be.visible')
      .and('contain', 'Esta proposta já foi processada')
  })

  it('permite navegar do feed de notificações para aprovar uma proposta', () => {
    // Começar na página inicial
    cy.visit('/admin')

    // Simular notificação de nova proposta
    cy.intercept('GET', '**/notifications*', {
      statusCode: 200,
      body: {
        results: [
          {
            id: '1',
            title: 'Nova proposta submetida',
            message: 'A proposta P-2023-789 foi submetida para análise',
            type: 'info',
            isRead: false,
            createdAt: new Date().toISOString(),
            link: '/admin/proposals/789',
          },
        ],
        count: 1,
        unread_count: 1,
      },
    }).as('getNotification')

    // Abrir o dropdown de notificações
    cy.get('[data-testid=notification-icon]').click()
    cy.wait('@getNotification')

    // Clicar na notificação para ir para a proposta
    cy.contains('Nova proposta submetida').click()

    // Deve navegar para a página de detalhes da proposta
    cy.url().should('include', '/admin/proposals/789')

    // Aprovar a proposta
    cy.approveProposal('Aprovada via notificação')

    // Verificar se o status foi atualizado
    cy.get('[data-testid=status-badge]').should('contain', 'Aprovada')
  })

  it('permite aprovar uma proposta com documentos pendentes após upload', () => {
    // Visitar a página de detalhes da proposta que precisa de documentos
    cy.intercept('GET', '**/proposals/999', {
      statusCode: 200,
      body: {
        id: 999,
        proposal_number: 'P-2023-999',
        status: 'pending',
        pending_documents: ['proof_income', 'address_proof'],
        // outros campos...
      },
    }).as('getPendingDocumentsProposal')

    cy.visit('/admin/proposals/999')
    cy.wait('@getPendingDocumentsProposal')

    // Verificar se há aviso de documentos pendentes
    cy.get('[data-testid=documents-warning]')
      .should('be.visible')
      .and('contain', 'Documentos pendentes')

    // Simular upload bem-sucedido de documentos
    cy.intercept('POST', '**/documents/upload', {
      statusCode: 200,
      body: {
        id: 123,
        document_type: 'proof_income',
        file_name: 'holerite.pdf',
        status: 'verified',
      },
    }).as('uploadDocument')

    // Fazer upload do primeiro documento
    cy.get('[data-testid=upload-document-button]').click()
    cy.get('input[type=file]').selectFile(
      'cypress/fixtures/test-document.pdf',
      { force: true }
    )
    cy.get('[data-testid=document-type-select]').select('proof_income')
    cy.get('[data-testid=upload-submit]').click()
    cy.wait('@uploadDocument')

    // Simular que todos os documentos foram enviados
    cy.intercept('GET', '**/proposals/999', {
      statusCode: 200,
      body: {
        id: 999,
        proposal_number: 'P-2023-999',
        status: 'pending',
        pending_documents: [], // Sem documentos pendentes
        // outros campos...
      },
    }).as('getUpdatedProposal')

    // Recarregar a página
    cy.reload()
    cy.wait('@getUpdatedProposal')

    // Verificar que aviso de documentos não aparece mais
    cy.get('[data-testid=documents-warning]').should('not.exist')

    // Agora aprovar a proposta
    cy.approveProposal('Aprovada após envio de documentos')

    // Verificar se o status foi atualizado
    cy.get('[data-testid=status-badge]').should('contain', 'Aprovada')
  })
})
