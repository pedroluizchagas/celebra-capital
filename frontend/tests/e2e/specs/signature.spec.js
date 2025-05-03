/**
 * Teste E2E - Fluxo de Assinatura Digital
 * Este teste verifica o processo de assinatura digital de documentos
 */

describe('Fluxo de Assinatura Digital', () => {
  beforeEach(() => {
    // Mockear chamadas à API
    cy.mockApiCalls()

    // Fazer login e navegar para a página de assinatura
    cy.login()
    cy.visit('/assinatura')
  })

  it('deve permitir assinar o documento e prosseguir', () => {
    // Verificar se o canvas de assinatura está visível
    cy.get('[data-testid=signature-pad]').should('be.visible')

    // Verificar se o termo de consentimento está visível
    cy.get('[data-testid=consent-text]')
      .should('be.visible')
      .and('contain', 'Eu concordo com os termos')

    // Verificar se o botão de confirmar está desabilitado inicialmente
    cy.get('[data-testid=confirm-signature]').should('be.disabled')

    // Marcar o checkbox de consentimento
    cy.get('[data-testid=consent-checkbox]').check()

    // O botão ainda deve estar desabilitado porque não há assinatura
    cy.get('[data-testid=confirm-signature]').should('be.disabled')

    // Simular a assinatura no canvas
    cy.get('[data-testid=signature-pad]').then(($canvas) => {
      const canvas = $canvas[0]
      const ctx = canvas.getContext('2d')

      // Configurar o contexto
      ctx.lineWidth = 2
      ctx.strokeStyle = '#000000'

      // Simular desenho de assinatura
      ctx.beginPath()
      ctx.moveTo(50, 50)
      ctx.lineTo(100, 50)
      ctx.lineTo(150, 70)
      ctx.lineTo(200, 50)
      ctx.stroke()

      // Disparar evento para indicar que a assinatura foi feita
      canvas.dispatchEvent(new Event('endStroke'))
    })

    // Verificar se o botão está habilitado após assinar
    cy.get('[data-testid=confirm-signature]').should('not.be.disabled')

    // Simular envio da assinatura para a API
    cy.intercept('POST', '**/api/v1/signatures', {
      statusCode: 200,
      body: {
        id: 'sig-123',
        created_at: new Date().toISOString(),
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
        success: true,
      },
    }).as('saveSignature')

    // Clicar no botão de confirmar
    cy.get('[data-testid=confirm-signature]').click()
    cy.wait('@saveSignature')

    // Verificar redirecionamento para a página de sucesso
    cy.url().should('include', '/sucesso')
  })

  it('deve permitir limpar a assinatura e tentar novamente', () => {
    // Marcar o checkbox de consentimento
    cy.get('[data-testid=consent-checkbox]').check()

    // Simular a assinatura
    cy.get('[data-testid=signature-pad]').then(($canvas) => {
      const canvas = $canvas[0]
      const ctx = canvas.getContext('2d')

      ctx.beginPath()
      ctx.moveTo(50, 50)
      ctx.lineTo(100, 50)
      ctx.stroke()

      canvas.dispatchEvent(new Event('endStroke'))
    })

    // Botão de confirmar deve estar habilitado
    cy.get('[data-testid=confirm-signature]').should('not.be.disabled')

    // Clicar no botão de limpar
    cy.get('[data-testid=clear-signature]').click()

    // Botão de confirmar deve voltar a ficar desabilitado
    cy.get('[data-testid=confirm-signature]').should('be.disabled')

    // Fazer nova assinatura
    cy.get('[data-testid=signature-pad]').then(($canvas) => {
      const canvas = $canvas[0]
      const ctx = canvas.getContext('2d')

      ctx.beginPath()
      ctx.moveTo(70, 70)
      ctx.lineTo(120, 70)
      ctx.stroke()

      canvas.dispatchEvent(new Event('endStroke'))
    })

    // Botão de confirmar deve estar habilitado novamente
    cy.get('[data-testid=confirm-signature]').should('not.be.disabled')
  })

  it('deve exibir erro quando a API de assinatura falhar', () => {
    // Marcar o checkbox de consentimento
    cy.get('[data-testid=consent-checkbox]').check()

    // Simular a assinatura
    cy.get('[data-testid=signature-pad]').then(($canvas) => {
      const canvas = $canvas[0]
      const ctx = canvas.getContext('2d')

      ctx.beginPath()
      ctx.moveTo(50, 50)
      ctx.lineTo(200, 50)
      ctx.stroke()

      canvas.dispatchEvent(new Event('endStroke'))
    })

    // Simular falha na API
    cy.intercept('POST', '**/api/v1/signatures', {
      statusCode: 500,
      body: {
        error: 'Falha no servidor ao processar a assinatura',
        message: 'Por favor, tente novamente mais tarde',
      },
    }).as('signatureError')

    // Clicar no botão de confirmar
    cy.get('[data-testid=confirm-signature]').click()
    cy.wait('@signatureError')

    // Verificar mensagem de erro
    cy.get('[data-testid=error-message]')
      .should('be.visible')
      .and('contain', 'Falha no servidor ao processar a assinatura')

    // URL não deve mudar
    cy.url().should('include', '/assinatura')
  })

  it('deve mostrar os detalhes do termo legal ao clicar no link', () => {
    // Clicar no link para ver os termos completos
    cy.get('[data-testid=view-full-terms]').click()

    // Verificar se o modal com os termos completos é exibido
    cy.get('[data-testid=terms-modal]').should('be.visible')

    // Verificar conteúdo do modal
    cy.get('[data-testid=terms-modal-content]')
      .should('contain', 'Termos e Condições Completos')
      .and('contain', 'Lei Geral de Proteção de Dados')

    // Fechar o modal
    cy.get('[data-testid=close-modal]').click()

    // Verificar se o modal foi fechado
    cy.get('[data-testid=terms-modal]').should('not.exist')
  })
})
