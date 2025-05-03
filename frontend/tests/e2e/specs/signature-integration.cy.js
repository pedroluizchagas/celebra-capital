/**
 * Testes E2E para a integração com serviços de assinatura
 * Testa as integrações com D4Sign e ClickSign
 */

describe('Integração com Provedores de Assinatura', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.login('admin@celebracapital.com.br', 'senha123', 'admin')

    // Interceptar API de obtenção de proposta
    cy.intercept('GET', '**/api/proposals/1050', {
      fixture: 'proposals/approved-proposal.json',
    }).as('getApprovedProposal')

    cy.visit('/admin/proposals/1050')
    cy.wait('@getApprovedProposal')
  })

  it('deve gerar um contrato para assinatura no D4Sign', () => {
    // Verificar se o botão de gerar contrato está disponível
    cy.get('[data-testid=generate-contract-button]').should('be.visible')

    // Interceptar chamada para geração de contrato
    cy.intercept('POST', '**/api/proposals/*/contract', {
      statusCode: 200,
      body: {
        success: true,
        contract: {
          id: 'c-12345',
          url: 'https://d4sign.com.br/contracts/c-12345',
          status: 'generated',
        },
      },
    }).as('generateContract')

    // Clicar para gerar contrato
    cy.get('[data-testid=generate-contract-button]').click()
    cy.get('[data-testid=d4sign-provider]').click()
    cy.get('[data-testid=confirm-generate-contract]').click()

    cy.wait('@generateContract')

    // Verificar se o contrato foi gerado com sucesso
    cy.get('[data-testid=contract-generated-success]').should('be.visible')
    cy.get('[data-testid=contract-url]').should(
      'contain',
      'https://d4sign.com.br/contracts/c-12345'
    )

    // Interceptar chamada para envio para assinatura
    cy.intercept('POST', '**/api/proposals/*/signature', {
      statusCode: 200,
      body: {
        success: true,
        signature: {
          id: 's-d4-67890',
          url: 'https://d4sign.com.br/sign/s-d4-67890',
          status: 'pending',
        },
      },
    }).as('sendToSignature')

    // Enviar para assinatura
    cy.get('[data-testid=send-to-signature-button]').click()
    cy.get('[data-testid=confirm-send-to-signature]').click()

    cy.wait('@sendToSignature')

    // Verificar se foi enviado para assinatura com sucesso
    cy.get('[data-testid=signature-sent-success]').should('be.visible')
    cy.get('[data-testid=signature-url]').should(
      'contain',
      'https://d4sign.com.br/sign/s-d4-67890'
    )

    // Verificar se o status da proposta foi atualizado
    cy.get('[data-testid=status-badge]').should(
      'contain',
      'Aguardando Assinatura'
    )
  })

  it('deve gerar um contrato para assinatura no ClickSign', () => {
    // Verificar se o botão de gerar contrato está disponível
    cy.get('[data-testid=generate-contract-button]').should('be.visible')

    // Interceptar chamada para geração de contrato
    cy.intercept('POST', '**/api/proposals/*/contract', {
      statusCode: 200,
      body: {
        success: true,
        contract: {
          id: 'c-abcde',
          url: 'https://app.clicksign.com/contracts/c-abcde',
          status: 'generated',
        },
      },
    }).as('generateContract')

    // Clicar para gerar contrato
    cy.get('[data-testid=generate-contract-button]').click()
    cy.get('[data-testid=clicksign-provider]').click()
    cy.get('[data-testid=confirm-generate-contract]').click()

    cy.wait('@generateContract')

    // Verificar se o contrato foi gerado com sucesso
    cy.get('[data-testid=contract-generated-success]').should('be.visible')
    cy.get('[data-testid=contract-url]').should(
      'contain',
      'https://app.clicksign.com/contracts/c-abcde'
    )

    // Interceptar chamada para envio para assinatura
    cy.intercept('POST', '**/api/proposals/*/signature', {
      statusCode: 200,
      body: {
        success: true,
        signature: {
          id: 's-cs-fghij',
          url: 'https://app.clicksign.com/sign/s-cs-fghij',
          status: 'pending',
        },
      },
    }).as('sendToSignature')

    // Enviar para assinatura
    cy.get('[data-testid=send-to-signature-button]').click()
    cy.get('[data-testid=confirm-send-to-signature]').click()

    cy.wait('@sendToSignature')

    // Verificar se foi enviado para assinatura com sucesso
    cy.get('[data-testid=signature-sent-success]').should('be.visible')
    cy.get('[data-testid=signature-url]').should(
      'contain',
      'https://app.clicksign.com/sign/s-cs-fghij'
    )

    // Verificar se o status da proposta foi atualizado
    cy.get('[data-testid=status-badge]').should(
      'contain',
      'Aguardando Assinatura'
    )
  })

  it('deve registrar assinatura finalizada via webhook', () => {
    // Simular que o contrato já foi gerado e enviado para assinatura
    cy.get('[data-testid=status-badge]').should(
      'contain',
      'Aguardando Assinatura'
    )

    // Interceptar chamada de webhook para atualização de status de assinatura
    cy.intercept('POST', '**/api/webhooks/signatures', {
      statusCode: 200,
      body: {
        success: true,
      },
    }).as('signatureWebhook')

    // Simular chamada de webhook
    // (Na prática, isso seria uma chamada externa do serviço de assinatura)
    cy.request({
      method: 'POST',
      url: '/api/webhooks/signatures',
      body: {
        key: 'valid_webhook_key',
        event: 'document_signed',
        document_id: 'c-12345',
        signer: {
          email: 'cliente@teste.com',
          name: 'Cliente Teste',
          signed_at: new Date().toISOString(),
        },
      },
    })

    cy.wait('@signatureWebhook')

    // Recarregar a página para verificar a atualização de status
    cy.reload()

    // Interceptar obtenção da proposta atualizada
    cy.intercept('GET', '**/api/proposals/1050', {
      fixture: 'proposals/completed-proposal.json',
    }).as('getCompletedProposal')

    cy.wait('@getCompletedProposal')

    // Verificar se o status foi atualizado para "Concluída"
    cy.get('[data-testid=status-badge]').should('contain', 'Concluída')
    cy.get('[data-testid=signature-complete-info]').should('be.visible')
    cy.get('[data-testid=signature-date]').should('exist')
  })
})
