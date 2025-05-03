/**
 * Testes E2E para as páginas de políticas e termos de uso
 * Verifica se as páginas estão acessíveis e contêm o conteúdo correto
 */

describe('Políticas e Termos de Uso', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  it('deve exibir a página de termos de uso com conteúdo correto', () => {
    cy.visit('/termos-de-uso')

    // Verificar título da página
    cy.get('[data-testid=terms-title]').should('contain', 'Termos de Uso')

    // Verificar se as seções principais existem
    cy.get('[data-testid=terms-acceptance]').should('be.visible')
    cy.get('[data-testid=terms-description]').should('be.visible')
    cy.get('[data-testid=terms-rules]').should('be.visible')
    cy.get('[data-testid=terms-liability]').should('be.visible')
    cy.get('[data-testid=terms-modifications]').should('be.visible')

    // Verificar a data da última atualização
    cy.get('[data-testid=terms-last-updated]').should('exist')

    // Verificar se existe link para a política de privacidade
    cy.get('[data-testid=privacy-policy-link]').should('be.visible')
  })

  it('deve exibir a página de política de privacidade com conteúdo correto', () => {
    cy.visit('/politica-de-privacidade')

    // Verificar título da página
    cy.get('[data-testid=privacy-title]').should(
      'contain',
      'Política de Privacidade'
    )

    // Verificar se as seções principais existem
    cy.get('[data-testid=privacy-intro]').should('be.visible')
    cy.get('[data-testid=data-collection]').should('be.visible')
    cy.get('[data-testid=data-usage]').should('be.visible')
    cy.get('[data-testid=data-sharing]').should('be.visible')
    cy.get('[data-testid=data-security]').should('be.visible')
    cy.get('[data-testid=user-rights]').should('be.visible')
    cy.get('[data-testid=cookies-policy]').should('be.visible')

    // Verificar a data da última atualização
    cy.get('[data-testid=privacy-last-updated]').should('exist')

    // Verificar se existe link para os termos de uso
    cy.get('[data-testid=terms-of-use-link]').should('be.visible')
  })

  it('deve exibir a página de termos de uso na interface de cadastro', () => {
    cy.visit('/cadastro')

    // Clicar no link de termos de uso
    cy.get('[data-testid=register-terms-link]').click()

    // Verificar se o modal de termos é aberto
    cy.get('[data-testid=terms-modal]').should('be.visible')

    // Verificar o conteúdo do modal
    cy.get('[data-testid=terms-modal-title]').should('contain', 'Termos de Uso')
    cy.get('[data-testid=terms-modal-content]').should('be.visible')

    // Fechar o modal
    cy.get('[data-testid=close-terms-modal]').click()
    cy.get('[data-testid=terms-modal]').should('not.exist')
  })

  it('deve exibir a página de política de privacidade na interface de cadastro', () => {
    cy.visit('/cadastro')

    // Clicar no link de política de privacidade
    cy.get('[data-testid=register-privacy-link]').click()

    // Verificar se o modal de privacidade é aberto
    cy.get('[data-testid=privacy-modal]').should('be.visible')

    // Verificar o conteúdo do modal
    cy.get('[data-testid=privacy-modal-title]').should(
      'contain',
      'Política de Privacidade'
    )
    cy.get('[data-testid=privacy-modal-content]').should('be.visible')

    // Fechar o modal
    cy.get('[data-testid=close-privacy-modal]').click()
    cy.get('[data-testid=privacy-modal]').should('not.exist')
  })

  it('deve navegar entre as páginas de políticas e termos', () => {
    cy.visit('/termos-de-uso')

    // Navegar para a política de privacidade através do link
    cy.get('[data-testid=privacy-policy-link]').click()
    cy.url().should('include', '/politica-de-privacidade')

    // Verificar se está na página correta
    cy.get('[data-testid=privacy-title]').should(
      'contain',
      'Política de Privacidade'
    )

    // Navegar de volta para os termos de uso através do link
    cy.get('[data-testid=terms-of-use-link]').click()
    cy.url().should('include', '/termos-de-uso')

    // Verificar se está na página correta
    cy.get('[data-testid=terms-title]').should('contain', 'Termos de Uso')
  })

  it('deve exigir aceitação dos termos no cadastro', () => {
    cy.visit('/cadastro')

    // Preencher os campos do formulário
    cy.get('[data-testid=nome-input]').type('Usuário Teste')
    cy.get('[data-testid=email-input]').type('usuario@teste.com')
    cy.get('[data-testid=senha-input]').type('Senha@123')
    cy.get('[data-testid=confirmar-senha-input]').type('Senha@123')

    // Tentar submeter sem aceitar os termos
    cy.get('[data-testid=cadastro-button]').click()

    // Verificar mensagem de erro
    cy.get('[data-testid=terms-error]').should('be.visible')
    cy.get('[data-testid=terms-error]').should(
      'contain',
      'Você precisa aceitar os termos de uso e política de privacidade'
    )

    // Aceitar os termos
    cy.get('[data-testid=terms-checkbox]').check()

    // Tentar submeter novamente
    cy.get('[data-testid=cadastro-button]').click()

    // Verificar se o erro não aparece mais
    cy.get('[data-testid=terms-error]').should('not.exist')
  })
})
