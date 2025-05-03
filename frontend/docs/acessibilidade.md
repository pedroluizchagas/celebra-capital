# Acessibilidade na Celebra Capital

Este documento descreve a estratégia, implementação e ferramentas de acessibilidade na plataforma da Celebra Capital. Nosso objetivo é atingir e manter a conformidade com WCAG 2.1 nível AA.

## 🎯 Visão Geral

A Celebra Capital está comprometida em criar uma plataforma inclusiva que possa ser usada por todas as pessoas, incluindo aquelas com deficiências. Nosso trabalho de acessibilidade inclui:

1. **Desenvolvimento com foco em acessibilidade** desde o início
2. **Testes automatizados** com ferramentas como axe-core
3. **Testes manuais** com tecnologias assistivas como leitores de tela
4. **Documentação e treinamento** para toda a equipe

## 📋 Checklist de Acessibilidade

Usamos um [checklist de acessibilidade WCAG AA](/docs/a11y-checklist.md) para verificar a conformidade de cada componente e página. Este checklist deve ser consultado durante o desenvolvimento e antes de qualquer merge.

## 🧰 Componentes de Acessibilidade

Implementamos uma série de componentes e utilitários de acessibilidade para uso em toda a aplicação:

- `SkipLink` - Permite usuários de teclado pular para o conteúdo principal
- `ScreenReaderAnnouncement` - Anuncia conteúdo dinâmico para leitores de tela
- `useFocusTrap` - Hook para gerenciar o foco em modais e drawers
- `AccessibilitySettings` - Componente que permite usuários ajustarem contraste, tamanho de fonte e mais
- `HighContrastToggle` - Alternador de modo de alto contraste

## 🛠️ Ferramentas de Auditoria

### Auditoria Automatizada

Implementamos um script de auditoria automatizada que verifica a conformidade WCAG AA em todas as páginas da aplicação:

```bash
# Executar auditoria de acessibilidade completa
npm run audit:a11y

# Executar auditoria com resultados mockados (para desenvolvimento rápido)
npm run audit:a11y:mock

# Gerar e abrir relatório HTML detalhado
npm run a11y:report
```

### Testes de Componentes Individuais

Além da auditoria de páginas completas, também implementamos testes de acessibilidade para componentes individuais:

```bash
# Testar acessibilidade de botões
npm run test:a11y:button

# Outros componentes específicos
npm run test:a11y:components
```

Para mais detalhes sobre como testar componentes individuais, consulte a [documentação de testes de componentes](./a11y-component-testing.md).

### Como funciona a auditoria

1. O script `a11y-audit.js` navega automaticamente por todas as páginas da aplicação
2. Cada página é testada em três tamanhos de tela (desktop, tablet, mobile)
3. A biblioteca axe-core executa verificações de conformidade WCAG AA
4. Os resultados são agregados e um relatório HTML detalhado é gerado
5. Um relatório JSON com dados brutos também é salvo para referência

### Integração com CI/CD

A auditoria de acessibilidade está integrada ao nosso pipeline CI/CD através do GitHub Actions:

- Executa automaticamente após cada push no branch principal
- Roda semanalmente para monitoramento contínuo
- Falha o build se a pontuação estiver abaixo de 70%
- Armazena os relatórios como artefatos para análise posterior

### Relatório de Acessibilidade

O relatório gerado inclui:

- Pontuação geral de conformidade
- Detalhes de todas as violações encontradas
- Categorização de problemas por impacto (crítico, sério, moderado, menor)
- Recomendações para correção com links para documentação
- Análise por página e por tamanho de tela
- Design visual consistente com a identidade da Celebra Capital

### Testes Manuais

Além dos testes automatizados, realizamos testes manuais com:

- NVDA (Windows)
- VoiceOver (macOS)
- Navegação exclusivamente por teclado
- Configurações de alto contraste e ampliação

## 📊 Status Atual

| Área                 | Status      | Observações                     |
| -------------------- | ----------- | ------------------------------- |
| Login/Registro       | 75% WCAG AA | Melhorar mensagens de erro      |
| Formulário Principal | 90% WCAG AA | Quase conforme, ajustes finais  |
| Upload de Documentos | 80% WCAG AA | Melhorar feedback do processo   |
| Painel de Admin      | 60% WCAG AA | Precisa de trabalho substancial |
| Dashboard            | 85% WCAG AA | Melhorar navegação por teclado  |

## 📚 Como Contribuir

1. **Revise o [checklist de acessibilidade](/docs/a11y-checklist.md)** antes de iniciar o desenvolvimento
2. **Use os componentes acessíveis** existentes sempre que possível
3. **Execute testes automatizados** regularmente durante o desenvolvimento
4. **Teste manualmente** com navegação por teclado e leitores de tela
5. **Documente exceções** quando não for possível atingir conformidade completa

## 🔍 Recursos e Referências

- [WCAG 2.1 em Português](https://www.w3c.br/traducoes/wcag/wcag21-pt-BR/)
- [WebAIM: Web Accessibility In Mind](https://webaim.org/)
- [Deque University](https://dequeuniversity.com/)
- [A11Y Project](https://www.a11yproject.com/)

---

## 🔄 Próximos Passos

1. Concluir testes manuais com leitores de tela em todos os fluxos principais
2. Implementar correções para os problemas críticos e sérios identificados no relatório
3. Integrar a validação de acessibilidade nos componentes do Storybook
4. Realizar treinamento da equipe em desenvolvimento acessível
5. Implementar testes automatizados de acessibilidade no processo de PR

---

_Última atualização: Abril 2024_
