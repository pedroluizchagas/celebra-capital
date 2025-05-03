# Checklist de Acessibilidade WCAG AA para Celebra Capital

Esta checklist serve como um guia para garantir que nosso projeto atenda aos padrões WCAG 2.1 nível AA.

## 📋 Como usar esta checklist

1. Use esta lista para validar seu componente ou página antes de enviar para revisão
2. Marque os itens que foram verificados e estão em conformidade
3. Documente quaisquer exceções ou problemas encontrados
4. Execute os testes automatizados de acessibilidade regularmente

## 🔍 Checklist de Acessibilidade

### Semântica e Estrutura

- [ ] **Código semântico** - Uso apropriado de elementos HTML semânticos (`<nav>`, `<main>`, `<section>`, etc.)
- [ ] **Títulos** - Estrutura hierárquica de títulos (`<h1>` a `<h6>`) sem pular níveis
- [ ] **Landmarks** - Uso das landmarks ARIA para demarcar regiões importantes da página
- [ ] **Skip links** - Links para pular para o conteúdo principal estão implementados
- [ ] **Ordem do DOM** - A ordem do DOM segue uma sequência lógica e significativa

### Teclado e Navegação

- [ ] **Acessibilidade por teclado** - Todas as funcionalidades estão acessíveis usando apenas o teclado
- [ ] **Ordem de foco** - A ordem de tabulação (Tab) segue uma sequência lógica
- [ ] **Foco visível** - O indicador de foco do teclado é claramente visível
- [ ] **Armadilhas de foco** - Não existem "armadilhas de foco" onde o usuário fica preso (exceto em modais)
- [ ] **Atalhos de teclado** - Atalhos de teclado personalizados não conflitam com atalhos do navegador/leitor de tela

### Contraste e Cores

- [ ] **Contraste de texto** - Rácio de contraste de, no mínimo, 4.5:1 para texto normal e 3:1 para texto grande
- [ ] **Foco e hover** - Elementos interativos têm estados hover e focus com contraste adequado
- [ ] **Informação por cor** - Informações não são transmitidas apenas por cor
- [ ] **Modo alto contraste** - O design é testado em modo de alto contraste

### Formulários e Inputs

- [ ] **Labels** - Todos os controles de formulário têm labels associados corretamente
- [ ] **Instruções** - Instruções para preenchimento são claras e associadas aos campos
- [ ] **Erros** - Erros de validação são identificados claramente, com sugestões de correção
- [ ] **Submissão** - Múltiplos métodos de submissão estão disponíveis (botão, Enter)
- [ ] **Agrupamento** - Campos relacionados são agrupados logicamente (fieldset/legend ou ARIA)

### Imagens e Mídia

- [ ] **Textos alternativos** - Todas as imagens informativas têm alt text adequado
- [ ] **Imagens decorativas** - Imagens decorativas têm alt="" ou são backgrounds CSS
- [ ] **SVG acessível** - SVGs têm roles e títulos apropriados
- [ ] **Controles de mídia** - Áudio e vídeo possuem controles acessíveis
- [ ] **Transcrições e legendas** - Conteúdos em áudio e vídeo têm transcrições/legendas

### Conteúdo Dinâmico

- [ ] **ARIA Live Regions** - Atualizações dinâmicas usam regiões live ou notificações acessíveis
- [ ] **Modais e Popovers** - Implementados com gerenciamento de foco e escape key
- [ ] **Carrosséis e Sliders** - São acessíveis com controles e notificações apropriadas
- [ ] **Expansão de conteúdo** - Elementos expansíveis usam ARIA expanded/controls
- [ ] **Notificações** - Alertas e mensagens de status são anunciados por leitores de tela

### Texto e Legibilidade

- [ ] **Redimensionamento** - Layout funciona até 200% de zoom sem perda de conteúdo
- [ ] **Espaçamento** - Texto pode ter espaçamento aumentado sem perda de funcionalidade
- [ ] **Orientação** - Conteúdo funciona em orientação retrato e paisagem
- [ ] **Textos responsivos** - Tamanhos de fonte são adequados em telas de diferentes tamanhos
- [ ] **Hifenização** - Linhas de texto não são muito longas (máximo 80 caracteres)

### Consistência e Previsibilidade

- [ ] **Navegação consistente** - Mecanismos de navegação são consistentes entre páginas
- [ ] **Convenções comuns** - Design usa convenções e padrões web comuns
- [ ] **Mudanças de contexto** - Não há mudanças inesperadas de contexto
- [ ] **Feedback** - Feedback é fornecido para todas as ações do usuário
- [ ] **Comportamento previsível** - Componentes se comportam de maneira previsível

### Tempo e Movimento

- [ ] **Timeout** - Avisos são exibidos antes de timeouts, com opção de extensão
- [ ] **Animações** - Animações podem ser pausadas, paradas ou desabilitadas
- [ ] **Auto-reprodução** - Conteúdo que se move automaticamente pode ser pausado
- [ ] **Prefers-reduced-motion** - Site respeita a preferência `prefers-reduced-motion`
- [ ] **Timing** - Não há requisitos de tempo rigorosos para interações do usuário

### Compatibilidade com Tecnologia Assistiva

- [ ] **Leitor de tela** - Teste com NVDA (Windows) e VoiceOver (macOS)
- [ ] **ARIA** - Roles, states e properties ARIA são usados corretamente
- [ ] **Nome acessível** - Todos os elementos interativos têm nomes acessíveis
- [ ] **Ações personalizadas** - Componentes personalizados respondem a eventos de forma padrão
- [ ] **Alternativas** - Alternativas acessíveis existem para conteúdos complexos

### Mobile e Touch

- [ ] **Touch targets** - Alvos de toque têm tamanho mínimo de 44x44px
- [ ] **Gestos** - Funcionalidades que usam gestos têm alternativas simples
- [ ] **Rotação de tela** - Conteúdo não é restrito a uma única orientação
- [ ] **Touchscreen** - Funcionalidades são acessíveis via toque e teclado
- [ ] **Zoom** - Conteúdo pode ser ampliado sem sobreposição ou perda

## 🧪 Testes e Validação

### Ferramentas Automatizadas

```bash
# Executar verificação de acessibilidade automatizada
npm run test:a11y

# Gerar relatório HTML detalhado
npm run a11y:report
```

### Leitores de Tela para Teste

- NVDA (Windows) - Gratuito: [https://www.nvaccess.org/](https://www.nvaccess.org/)
- VoiceOver (macOS) - Integrado ao sistema
- JAWS (Windows) - Comercial: [https://www.freedomscientific.com/products/software/jaws/](https://www.freedomscientific.com/products/software/jaws/)

### Ferramentas de Verificação

- axe DevTools (extensão do navegador)
- Lighthouse (Chrome DevTools)
- WebAIM Color Contrast Checker

## 📚 Recursos Adicionais

- [WCAG 2.1 em Português](https://www.w3c.br/traducoes/wcag/wcag21-pt-BR/)
- [WebAIM: Web Accessibility In Mind](https://webaim.org/)
- [Deque University](https://dequeuniversity.com/)
- [A11Y Project](https://www.a11yproject.com/)

## ✅ Progresso do Projeto

| Módulo               | Status      | Último teste | Responsável     |
| -------------------- | ----------- | ------------ | --------------- |
| Login/Registro       | 75% WCAG AA | 2023-12-15   | Ana Silva       |
| Formulário Principal | 90% WCAG AA | 2023-12-10   | Carlos Oliveira |
| Upload de Documentos | 80% WCAG AA | 2023-12-05   | Bruno Santos    |
| Painel de Admin      | 60% WCAG AA | 2023-11-30   | Débora Lima     |
| Dashboard            | 85% WCAG AA | 2023-12-12   | Fábio Martins   |

---

**Versão:** 1.0
**Última atualização:** Dezembro 2023
