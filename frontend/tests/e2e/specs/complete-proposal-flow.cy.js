/**
 * Testes E2E para o fluxo completo de uma proposta de crédito
 * Este teste simula todo o ciclo de vida de uma proposta:
 * - Criação pelo cliente
 * - Upload de documentos
 * - Revisão pelo analista
 * - Aprovação pelo administrador
 * - Assinatura do contrato
 */

describe('Fluxo Completo de Proposta de Crédito', () => {
  // Dados de teste
  const clientUser = {
    email: 'cliente@teste.com',
    password: 'senha123',
    name: 'Cliente Teste',
  }

  const analystUser = {
    email: 'analista@celebracapital.com.br',
    password: 'senha123',
    name: 'Analista Teste',
  }

  const adminUser = {
    email: 'admin@celebracapital.com.br',
    password: 'senha123',
    name: 'Admin Teste',
  }

  const proposalData = {
    razaoSocial: 'Empresa Teste LTDA',
    cnpj: '12.345.678/0001-90',
    segmento: 'tecnologia',
    tempoExistencia: 5,
    faturamentoAnual: 1200000,
    faturamentoMensal: 100000,
    margemLucro: 25,
    endividamento: 15000,
    valorSolicitado: 300000,
    finalidade: 'expansao',
    prazo: 36,
    garantias: ['imovel', 'recebivel'],
    historicoCredito: 'bom',
  }

  // Interceptações comuns
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.mockApiCalls()
  })

  it('deve completar o fluxo inteiro de uma proposta de crédito', () => {
    // 1. Login como cliente
    cy.log('Etapa 1: Login como cliente e criação da proposta')
    cy.visit('/login')
    cy.get('[data-testid=email-input]').type(clientUser.email)
    cy.get('[data-testid=password-input]').type(clientUser.password)
    cy.get('[data-testid=login-button]').click()

    // Intercept API para criar proposta
    cy.intercept('POST', '**/api/proposals', {
      statusCode: 201,
      body: {
        id: 2001,
        status: 'pending',
        message: 'Proposta criada com sucesso',
      },
    }).as('createProposal')

    // 2. Criar nova proposta
    cy.get('[data-testid=new-proposal-button]').click()
    cy.url().should('include', '/nova-proposta')

    // Preencher formulário de proposta
    cy.get('[data-testid=razao-social-input]').type(proposalData.razaoSocial)
    cy.get('[data-testid=cnpj-input]').type(proposalData.cnpj)
    cy.get('[data-testid=segmento-select]').select(proposalData.segmento)
    cy.get('[data-testid=tempo-existencia-input]').type(
      proposalData.tempoExistencia
    )
    cy.get('[data-testid=faturamento-anual-input]').type(
      proposalData.faturamentoAnual
    )
    cy.get('[data-testid=faturamento-mensal-input]').type(
      proposalData.faturamentoMensal
    )
    cy.get('[data-testid=margem-lucro-input]').type(proposalData.margemLucro)
    cy.get('[data-testid=endividamento-input]').type(proposalData.endividamento)
    cy.get('[data-testid=valor-solicitado-input]').type(
      proposalData.valorSolicitado
    )
    cy.get('[data-testid=finalidade-select]').select(proposalData.finalidade)
    cy.get('[data-testid=prazo-select]').select(proposalData.prazo.toString())

    // Selecionar garantias
    proposalData.garantias.forEach((garantia) => {
      cy.get(`[data-testid=garantia-${garantia}]`).check()
    })

    cy.get('[data-testid=historico-credito-radio]').check(
      proposalData.historicoCredito
    )

    // Simular upload de arquivo
    cy.get('[data-testid=documentos-upload]').attachFile(
      'documento_exemplo.pdf'
    )

    // Submeter formulário
    cy.get('[data-testid=submit-proposal-button]').click()
    cy.wait('@createProposal')

    // Verificar redirecionamento para página de sucesso
    cy.url().should('include', '/proposta-enviada')
    cy.get('[data-testid=success-message]').should('be.visible')
    cy.get('[data-testid=proposal-id]').should('contain', '2001')

    // 3. Upload de documentos adicionais
    cy.log('Etapa 2: Upload de documentos adicionais')

    cy.intercept('POST', '**/api/documents/upload', {
      statusCode: 200,
      body: {
        success: true,
        document_id: 5001,
      },
    }).as('uploadDocument')

    cy.get('[data-testid=upload-more-docs-button]').click()
    cy.url().should('include', '/documentos')

    cy.get('[data-testid=document-type-select]').select(
      'comprovante_faturamento'
    )
    cy.get('[data-testid=document-description]').type(
      'Comprovante de faturamento dos últimos 12 meses'
    )
    cy.get('[data-testid=document-file-input]').attachFile('faturamento.pdf')
    cy.get('[data-testid=upload-document-button]').click()

    cy.wait('@uploadDocument')
    cy.get('[data-testid=upload-success-message]').should('be.visible')
    cy.get('[data-testid=return-dashboard-button]').click()

    // 4. Logout como cliente
    cy.get('[data-testid=user-menu]').click()
    cy.get('[data-testid=logout-button]').click()

    // 5. Login como analista
    cy.log('Etapa 3: Análise pelo analista')
    cy.visit('/login')
    cy.get('[data-testid=email-input]').type(analystUser.email)
    cy.get('[data-testid=password-input]').type(analystUser.password)
    cy.get('[data-testid=login-button]').click()

    // Interceptar API de obtenção de proposta
    cy.intercept('GET', '**/api/proposals/2001', {
      fixture: 'proposals/proposal-2001.json',
    }).as('getProposal')

    // Ir para lista de propostas
    cy.get('[data-testid=proposals-menu]').click()

    // Filtrar propostas pendentes
    cy.get('[data-testid=status-filter]').select('pending')
    cy.get('[data-testid=apply-filters-button]').click()

    // Clicar na proposta criada
    cy.contains('[data-testid=proposal-row]', 'Empresa Teste LTDA').click()
    cy.wait('@getProposal')

    // Analisar e adicionar comentário
    cy.get('[data-testid=analyst-comment]').type(
      'Proposta com bom potencial. Cliente possui histórico positivo e garantias adequadas.'
    )

    // Atualizar status para "em análise"
    cy.intercept('PUT', '**/api/proposals/2001/status', {
      statusCode: 200,
      body: {
        success: true,
        status: 'analyzing',
      },
    }).as('updateStatus')

    cy.get('[data-testid=update-status-button]').click()
    cy.get('[data-testid=status-option-analyzing]').click()
    cy.get('[data-testid=confirm-status-change]').click()

    cy.wait('@updateStatus')
    cy.get('[data-testid=status-badge]').should('contain', 'Em Análise')

    // Logout como analista
    cy.get('[data-testid=user-menu]').click()
    cy.get('[data-testid=logout-button]').click()

    // 6. Login como administrador
    cy.log('Etapa 4: Aprovação pelo administrador')
    cy.visit('/login')
    cy.get('[data-testid=email-input]').type(adminUser.email)
    cy.get('[data-testid=password-input]').type(adminUser.password)
    cy.get('[data-testid=login-button]').click()

    // Ir para dashboard
    cy.get('[data-testid=dashboard-menu]').click()

    // Ir para propostas em análise
    cy.get('[data-testid=analyzing-proposals-link]').click()

    // Clicar na proposta
    cy.contains('[data-testid=proposal-row]', 'Empresa Teste LTDA').click()
    cy.wait('@getProposal')

    // Aprovar proposta
    cy.intercept('PUT', '**/api/proposals/2001/approve', {
      statusCode: 200,
      body: {
        success: true,
        status: 'approved',
        details: {
          interest_rate: 1.5,
          amount_approved: 280000,
          installment_value: 9723.85,
        },
      },
    }).as('approveProposal')

    // Preencher detalhes da aprovação
    cy.get('[data-testid=approved-amount-input]').type('280000')
    cy.get('[data-testid=interest-rate-input]').type('1.5')
    cy.get('[data-testid=admin-notes]').type(
      'Proposta aprovada com valor ajustado devido ao histórico de crédito.'
    )
    cy.get('[data-testid=approve-button]').click()
    cy.get('[data-testid=confirm-approval-button]').click()

    cy.wait('@approveProposal')
    cy.get('[data-testid=status-badge]').should('contain', 'Aprovada')

    // 7. Verificar geração de contrato
    cy.intercept('GET', '**/api/proposals/2001/contract', {
      statusCode: 200,
      body: {
        contract_id: '3001',
        contract_url: 'https://example.com/contracts/3001.pdf',
        signature_url: 'https://example.com/sign/3001',
      },
    }).as('getContract')

    cy.get('[data-testid=generate-contract-button]').click()
    cy.wait('@getContract')

    // 8. Enviar para assinatura
    cy.intercept('POST', '**/api/proposals/2001/signature', {
      statusCode: 200,
      body: {
        success: true,
        signature_id: '4001',
        message: 'Contrato enviado para assinatura',
      },
    }).as('sendToSignature')

    cy.get('[data-testid=send-to-signature-button]').click()
    cy.wait('@sendToSignature')
    cy.get('[data-testid=signature-success-message]').should('be.visible')
  })
})
