/**
 * Teste E2E - Fluxo de Upload de Documentos
 * Este teste verifica o processo de upload e validação de documentos
 */

describe('Fluxo de Upload de Documentos', () => {
  beforeEach(() => {
    // Mockear chamadas à API
    cy.mockApiCalls()

    // Fazer login e navegar para a página de upload de documentos
    cy.login()
    cy.visit('/documentos')
  })

  it('deve permitir fazer upload de múltiplos documentos e prosseguir', () => {
    // Preparar mock para as respostas da API
    cy.intercept('POST', '**/api/v1/documents/upload', (req) => {
      const documentType = req.body.get('document_type')

      const response = {
        id: `doc-${Date.now()}`,
        file_name: req.body.get('file').name,
        document_type: documentType,
        status: 'processing',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      req.reply({
        statusCode: 200,
        body: response,
      })
    }).as('documentUpload')

    cy.intercept('GET', '**/api/v1/documents/status/*', {
      statusCode: 200,
      body: {
        id: 'doc-123',
        status: 'verified',
        ocr_data: {
          name: 'João da Silva',
          cpf: '123.456.789-00',
          rg: '12.345.678-9',
        },
      },
    }).as('documentStatus')

    // Upload do documento de identidade (RG)
    cy.get('[data-testid=upload-rg]').attachFile('teste-rg.jpg')
    cy.wait('@documentUpload')
    cy.wait('@documentStatus')

    // Verificar se o documento foi carregado com sucesso
    cy.get('[data-testid=document-rg-preview]').should('be.visible')
    cy.get('[data-testid=document-rg-status]').should('contain', 'Verificado')

    // Upload do CPF
    cy.get('[data-testid=upload-cpf]').attachFile('teste-cpf.jpg')
    cy.wait('@documentUpload')
    cy.wait('@documentStatus')

    // Verificar se o documento foi carregado com sucesso
    cy.get('[data-testid=document-cpf-preview]').should('be.visible')
    cy.get('[data-testid=document-cpf-status]').should('contain', 'Verificado')

    // Upload do comprovante de renda
    cy.get('[data-testid=upload-income]').attachFile('teste-comprovante.pdf')
    cy.wait('@documentUpload')
    cy.wait('@documentStatus')

    // Verificar se o documento foi carregado com sucesso
    cy.get('[data-testid=document-income-preview]').should('be.visible')
    cy.get('[data-testid=document-income-status]').should(
      'contain',
      'Verificado'
    )

    // Verificar botão de continuar habilitado após todos os uploads
    cy.get('[data-testid=next-button]').should('not.be.disabled')

    // Clicar para continuar
    cy.get('[data-testid=next-button]').click()

    // Verificar redirecionamento para a próxima etapa
    cy.url().should('include', '/assinatura')
  })

  it('deve exibir mensagem de erro para documento inválido', () => {
    // Simular erro no OCR
    cy.intercept('POST', '**/api/v1/documents/upload', {
      statusCode: 200,
      body: {
        id: 'doc-error',
        file_name: 'documento_invalido.jpg',
        document_type: 'rg',
        status: 'processing',
      },
    }).as('documentUpload')

    cy.intercept('GET', '**/api/v1/documents/status/*', {
      statusCode: 200,
      body: {
        id: 'doc-error',
        status: 'error',
        error_message: 'Não foi possível ler as informações do documento',
      },
    }).as('documentStatus')

    // Upload de documento inválido
    cy.get('[data-testid=upload-rg]').attachFile('teste-documento-invalido.jpg')
    cy.wait('@documentUpload')
    cy.wait('@documentStatus')

    // Verificar mensagem de erro
    cy.get('[data-testid=document-rg-error]')
      .should('be.visible')
      .and('contain', 'Não foi possível ler as informações do documento')

    // Botão de continuar deve estar desabilitado
    cy.get('[data-testid=next-button]').should('be.disabled')
  })

  it('deve permitir remover e substituir um documento', () => {
    // Upload inicial
    cy.intercept('POST', '**/api/v1/documents/upload', {
      statusCode: 200,
      body: {
        id: 'doc-123',
        file_name: 'documento.jpg',
        document_type: 'rg',
        status: 'verified',
      },
    }).as('documentUpload')

    cy.get('[data-testid=upload-rg]').attachFile('teste-rg.jpg')
    cy.wait('@documentUpload')

    // Verificar se o documento foi carregado
    cy.get('[data-testid=document-rg-preview]').should('be.visible')

    // Remover o documento
    cy.get('[data-testid=remove-document-rg]').click()

    // Confirmar remoção
    cy.get('[data-testid=confirm-remove]').click()

    // Verificar se o documento foi removido
    cy.get('[data-testid=document-rg-preview]').should('not.exist')
    cy.get('[data-testid=upload-rg]').should('be.visible')

    // Fazer upload de outro documento
    cy.intercept('POST', '**/api/v1/documents/upload', {
      statusCode: 200,
      body: {
        id: 'doc-456',
        file_name: 'novo_documento.jpg',
        document_type: 'rg',
        status: 'verified',
      },
    }).as('newDocumentUpload')

    cy.get('[data-testid=upload-rg]').attachFile('teste-rg2.jpg')
    cy.wait('@newDocumentUpload')

    // Verificar se o novo documento foi carregado
    cy.get('[data-testid=document-rg-preview]').should('be.visible')
  })

  it('deve exibir o progresso de upload para documentos grandes', () => {
    // Simular um upload lento com barra de progresso
    cy.intercept('POST', '**/api/v1/documents/upload', (req) => {
      req.on('response', (res) => {
        // Atrasar a resposta para simular upload grande
        res.setDelay(3000)
      })

      req.reply({
        statusCode: 200,
        body: {
          id: 'doc-789',
          file_name: 'documento_grande.pdf',
          document_type: 'income',
          status: 'processing',
        },
      })
    }).as('largeDocumentUpload')

    // Fazer upload do arquivo grande
    cy.get('[data-testid=upload-income]').attachFile(
      'teste-comprovante-grande.pdf'
    )

    // Verificar se a barra de progresso é exibida
    cy.get('[data-testid=upload-progress]').should('be.visible')

    // Aguardar conclusão do upload
    cy.wait('@largeDocumentUpload')

    // Verificar se o documento foi carregado com sucesso
    cy.get('[data-testid=document-income-preview]').should('be.visible')
  })
})
