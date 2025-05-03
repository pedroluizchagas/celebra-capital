# Diretrizes de Acessibilidade Celebra Capital

Este documento estabelece as diretrizes de acessibilidade para a plataforma Celebra Capital, garantindo que nosso sistema seja acessível a todas as pessoas, incluindo aquelas com deficiências.

## Objetivos

1. Atender ao nível AA das Diretrizes de Acessibilidade para Conteúdo Web (WCAG 2.1)
2. Garantir que todos os usuários possam utilizar nosso sistema independentemente de suas limitações
3. Implementar uma cultura de acessibilidade no desenvolvimento contínuo da plataforma

## Ferramentas Utilizadas

- **axe-core/react**: Biblioteca para testes automatizados de acessibilidade
- **jest**: Framework de testes para executar validações
- **Storybook com addon-a11y**: Visualização de componentes com teste de acessibilidade
- **NVDA e VoiceOver**: Leitores de tela para testes manuais

## Checklist de Verificação

### Navegação por teclado

- [ ] Todos os elementos interativos podem ser acessados e acionados utilizando apenas o teclado
- [ ] A ordem de navegação utilizando Tab é lógica e segue o fluxo visual da interface
- [ ] Existe indicação visual clara de qual elemento está com foco
- [ ] Não existem "armadilhas de teclado" (elementos que capturam o foco e impedem a navegação)

### Estrutura Semântica

- [ ] Uso adequado de elementos HTML semânticos (`<button>`, `<a>`, `<nav>`, etc.)
- [ ] Elementos não semânticos possuem atributos ARIA adequados quando necessário
- [ ] Formulários utilizam `<label>` corretamente associados aos campos
- [ ] Títulos (`<h1>` a `<h6>`) são utilizados em ordem hierárquica correta

### Cor e Contraste

- [ ] Todas as combinações de cores de texto/fundo atendem ao contraste mínimo de 4.5:1 (AA)
- [ ] Informações não são transmitidas exclusivamente por cores
- [ ] Elementos com foco possuem indicadores visuais além de cor
- [ ] Links são distinguíveis do texto comum (por sublinhado ou outro indicador além da cor)

### Feedback e Assistência

- [ ] Erros de formulários são claramente indicados e descritos
- [ ] Campos obrigatórios são claramente identificados
- [ ] Mensagens de erro e sucesso são anunciadas por leitores de tela
- [ ] Há tempo suficiente para leitura de mensagens temporárias

### Imagens e Mídia

- [ ] Todas as imagens importantes possuem texto alternativo descritivo
- [ ] Imagens decorativas utilizam `alt=""` ou são aplicadas como CSS background
- [ ] Ícones têm rótulos acessíveis ou são ocultados de leitores de tela quando redundantes
- [ ] Vídeos possuem legendas e transcrições quando necessário

## Processo de Teste

1. **Teste Automatizado**: Cada componente da interface deve ter testes automatizados de acessibilidade utilizando axe-core
2. **Inspeção Visual**: Deve incluir verificação de contraste, indicadores de foco e padrões visuais
3. **Teste com Leitores de Tela**: Cada fluxo principal deve ser testado com NVDA (Windows) e VoiceOver (Mac)
4. **Teste de Navegação por Teclado**: Testar todos os fluxos utilizando apenas o teclado

## Métricas e Monitoramento

- Zero violações críticas de acessibilidade nos testes automatizados
- 100% dos componentes de UI devem passar nos testes automatizados de acessibilidade
- Conformidade WCAG AA verificada trimestralmente em toda a aplicação

## Recursos Adicionais

- [WCAG 2.1 (Tradução em Português)](https://www.w3c.br/traducoes/wcag/wcag21-pt-BR/)
- [WebAIM - Web Accessibility In Mind](https://webaim.org/)
- [A11Y Project](https://www.a11yproject.com/)
- [Axe Accessibility Testing Tools](https://www.deque.com/axe/)

---

**Notas para desenvolvedores:**

1. Sempre inclua testes de acessibilidade ao criar novos componentes
2. Execute os testes antes de submeter código para revisão
3. Consulte esta documentação quando tiver dúvidas sobre implementação de acessibilidade
