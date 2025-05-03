# Documentação de Conformidade WCAG 2.1 AA - Celebra Capital

## Introdução e Escopo

Este documento descreve a conformidade da plataforma de Pré-Análise de Crédito da Celebra Capital com as diretrizes de acessibilidade WCAG 2.1 nível AA. A avaliação abrange todos os fluxos principais do usuário, incluindo:

- Fluxo de autenticação (login/registro)
- Fluxo principal de análise de crédito (formulários)
- Upload de documentos
- Assinatura digital
- Notificações
- Páginas administrativas

## Metodologia de Teste

A verificação de conformidade foi realizada utilizando múltiplas abordagens:

1. **Análise Automatizada**:

   - Testes com axe DevTools em todas as páginas
   - Análise via Lighthouse (acessibilidade)
   - Validação de contraste com WebAIM Color Contrast Checker

2. **Testes Manuais**:

   - Navegação exclusiva por teclado
   - Teste com leitores de tela (NVDA no Windows, VoiceOver no macOS)
   - Simulação de diferentes deficiências visuais usando ferramentas como NoCoffee

3. **Revisão por Especialistas**:
   - Avaliação por profissionais de UX com experiência em acessibilidade
   - Verificação de componentes contra padrões de design acessível

## Resultados por Diretriz

### 1. Perceptível

#### 1.1 Alternativas de Texto

| Critério                       | Status      | Implementação                                                                                 |
| ------------------------------ | ----------- | --------------------------------------------------------------------------------------------- |
| 1.1.1 Conteúdo não textual (A) | ✅ Conforme | Todas as imagens possuem texto alternativo adequado. SVGs informativos utilizam `aria-label`. |

#### 1.2 Mídia Baseada no Tempo

| Critério                       | Status          | Implementação                                |
| ------------------------------ | --------------- | -------------------------------------------- |
| 1.2.1 Apenas áudio e vídeo (A) | ✅ Conforme     | Vídeos tutoriais incluem transcrição textual |
| 1.2.2 Legendas (A)             | ✅ Conforme     | Todos os vídeos possuem legendas             |
| 1.2.3 Audiodescrição (A)       | ✅ Conforme     | Vídeos tutoriais incluem audiodescrição      |
| 1.2.4 Legendas ao vivo (AA)    | 🔄 Em andamento | Em implementação para webinars               |
| 1.2.5 Audiodescrição (AA)      | ✅ Conforme     | Implementado para todos os vídeos tutoriais  |

#### 1.3 Adaptável

| Critério                                         | Status      | Implementação                                                         |
| ------------------------------------------------ | ----------- | --------------------------------------------------------------------- |
| 1.3.1 Informações e relações (A)                 | ✅ Conforme | Uso de elementos semânticos (`<nav>`, `<main>`, etc) e ARIA landmarks |
| 1.3.2 Sequência significativa (A)                | ✅ Conforme | Ordem lógica do DOM em todos os componentes                           |
| 1.3.3 Características sensoriais (A)             | ✅ Conforme | Instruções não dependem de formato, cor ou localização                |
| 1.3.4 Orientação (AA)                            | ✅ Conforme | Aplicação responde a orientações retrato e paisagem                   |
| 1.3.5 Identificação do propósito da entrada (AA) | ✅ Conforme | Campos utilizam autocomplete apropriado                               |

#### 1.4 Distinguível

| Critério                               | Status      | Implementação                                                               |
| -------------------------------------- | ----------- | --------------------------------------------------------------------------- |
| 1.4.1 Uso da cor (A)                   | ✅ Conforme | Informações não são transmitidas apenas por cor                             |
| 1.4.2 Controle de áudio (A)            | ✅ Conforme | Não há áudio que inicie automaticamente                                     |
| 1.4.3 Contraste (AA)                   | ✅ Conforme | Taxa de contraste mínima de 4.5:1 para texto normal e 3:1 para texto grande |
| 1.4.4 Redimensionar texto (AA)         | ✅ Conforme | Texto pode ser ampliado até 200% sem quebras de layout                      |
| 1.4.5 Imagens de texto (AA)            | ✅ Conforme | Não utilizamos imagens de texto                                             |
| 1.4.10 Reflow (AA)                     | ✅ Conforme | Conteúdo é responsivo e não requer rolagem horizontal até 320px             |
| 1.4.11 Contraste não textual (AA)      | ✅ Conforme | Elementos de interface mantêm contraste mínimo de 3:1                       |
| 1.4.12 Espaçamento de texto (AA)       | ✅ Conforme | Implementado via AccessibilitySettings com controle de espaçamento          |
| 1.4.13 Conteúdo em hover ou focus (AA) | ✅ Conforme | Tooltips e popovers podem ser dispensados e não bloqueiam conteúdo          |

### 2. Operável

#### 2.1 Acessível por Teclado

| Critério                          | Status      | Implementação                                   |
| --------------------------------- | ----------- | ----------------------------------------------- |
| 2.1.1 Teclado (A)                 | ✅ Conforme | Todas as funcionalidades acessíveis via teclado |
| 2.1.2 Sem bloqueio de teclado (A) | ✅ Conforme | Não há armadilhas de foco                       |
| 2.1.4 Atalhos de teclado (A)      | ✅ Conforme | Atalhos podem ser configurados ou desativados   |

#### 2.2 Tempo Suficiente

| Critério                         | Status      | Implementação                                 |
| -------------------------------- | ----------- | --------------------------------------------- |
| 2.2.1 Tempo ajustável (A)        | ✅ Conforme | Sessões expiram com aviso e opção de extensão |
| 2.2.2 Pausar, parar, ocultar (A) | ✅ Conforme | Conteúdo em movimento pode ser pausado        |

#### 2.3 Convulsões e Reações Físicas

| Critério               | Status      | Implementação                                          |
| ---------------------- | ----------- | ------------------------------------------------------ |
| 2.3.1 Três flashes (A) | ✅ Conforme | Não há conteúdo que pisque mais de 3 vezes por segundo |

#### 2.4 Navegável

| Critério                        | Status      | Implementação                                                 |
| ------------------------------- | ----------- | ------------------------------------------------------------- |
| 2.4.1 Ignorar blocos (A)        | ✅ Conforme | Implementado SkipLink para pular para conteúdo principal      |
| 2.4.2 Página com título (A)     | ✅ Conforme | Todas as páginas possuem títulos descritivos                  |
| 2.4.3 Ordem do foco (A)         | ✅ Conforme | Ordem do foco segue sequência lógica                          |
| 2.4.4 Finalidade do link (A)    | ✅ Conforme | Propósito do link determinável pelo texto ou contexto         |
| 2.4.5 Várias formas (AA)        | ✅ Conforme | Múltiplos meios de localização (busca, menu, breadcrumbs)     |
| 2.4.6 Cabeçalhos e rótulos (AA) | ✅ Conforme | Títulos e labels são descritivos e únicos                     |
| 2.4.7 Foco visível (AA)         | ✅ Conforme | Indicadores de foco claramente visíveis em todos os elementos |

#### 2.5 Modalidades de Entrada

| Critério                           | Status      | Implementação                                    |
| ---------------------------------- | ----------- | ------------------------------------------------ |
| 2.5.1 Gestos de ponteiro (A)       | ✅ Conforme | Funções multipontos possuem alternativas simples |
| 2.5.2 Cancelamento de ponteiro (A) | ✅ Conforme | Ações completadas apenas ao soltar (up-event)    |
| 2.5.3 Rótulo no nome (A)           | ✅ Conforme | Nomes acessíveis contêm o texto visível          |
| 2.5.4 Atuação por movimento (A)    | ✅ Conforme | Não há funcionalidades acionadas por movimento   |

### 3. Compreensível

#### 3.1 Legível

| Critério                     | Status      | Implementação                                            |
| ---------------------------- | ----------- | -------------------------------------------------------- |
| 3.1.1 Idioma da página (A)   | ✅ Conforme | Atributo lang definido corretamente em todas as páginas  |
| 3.1.2 Idioma das partes (AA) | ✅ Conforme | Trechos em idiomas diferentes são marcados adequadamente |

#### 3.2 Previsível

| Critério                             | Status      | Implementação                                       |
| ------------------------------------ | ----------- | --------------------------------------------------- |
| 3.2.1 Em foco (A)                    | ✅ Conforme | Ganhar foco não causa alteração de contexto         |
| 3.2.2 Em entrada (A)                 | ✅ Conforme | Alterar campo não causa submissão automática        |
| 3.2.3 Navegação consistente (AA)     | ✅ Conforme | Menus e navegação consistentes em todo o site       |
| 3.2.4 Identificação consistente (AA) | ✅ Conforme | Ícones e funcionalidades similares são consistentes |

#### 3.3 Assistência de Entrada

| Critério                        | Status      | Implementação                                                      |
| ------------------------------- | ----------- | ------------------------------------------------------------------ |
| 3.3.1 Identificação de erro (A) | ✅ Conforme | Erros são claramente identificados e descritos                     |
| 3.3.2 Rótulos ou instruções (A) | ✅ Conforme | Todos os inputs possuem labels e instruções claras                 |
| 3.3.3 Sugestão de erro (AA)     | ✅ Conforme | Sugestões de correção são fornecidas quando possível               |
| 3.3.4 Prevenção de erros (AA)   | ✅ Conforme | Ações importantes podem ser verificadas, revertidas ou confirmadas |

### 4. Robusto

#### 4.1 Compatível

| Critério                       | Status      | Implementação                                           |
| ------------------------------ | ----------- | ------------------------------------------------------- |
| 4.1.1 Análise (A)              | ✅ Conforme | HTML válido sem erros de duplicação de IDs              |
| 4.1.2 Nome, função, valor (A)  | ✅ Conforme | Componentes personalizados usam ARIA para expor estados |
| 4.1.3 Mensagens de status (AA) | ✅ Conforme | Feedback de sistema usa aria-live para anúncios         |

## Plano de Remediação para Itens Pendentes

| Critério                                 | Status                                   | Plano de Remediação                                     | Prazo   |
| ---------------------------------------- | ---------------------------------------- | ------------------------------------------------------- | ------- |
| 1.2.4 Legendas ao vivo (AA)              | 🔄 Em andamento                          | Integração com serviço de legendagem para webinars      | Q2 2024 |
| 2.4.5 Várias formas (AA) - Melhoria      | ✅ Conforme, mas com melhorias previstas | Aprimorar mecanismo de busca global                     | Q1 2024 |
| 3.3.4 Prevenção de erros (AA) - Melhoria | ✅ Conforme, mas com melhorias previstas | Implementar salvamento automático de formulários longos | Q1 2024 |

## Recursos Utilizados para Testes

- **Ferramentas Automatizadas**:

  - axe DevTools 4.4
  - Lighthouse 11.0
  - Wave Evaluation Tool
  - WebAIM Color Contrast Checker

- **Leitores de Tela**:

  - NVDA 2023.1 (Windows 10)
  - VoiceOver (macOS Sonoma)

- **Navegadores**:
  - Chrome 120
  - Firefox 120
  - Safari 17
  - Edge 120

## Processo de Manutenção

Para manter a conformidade WCAG AA, implementamos:

1. **Testes automatizados** de acessibilidade em CI/CD
2. **Checklist de acessibilidade** no processo de revisão de código
3. **Treinamentos regulares** para a equipe de desenvolvimento
4. **Auditorias semestrais** por especialistas em acessibilidade
5. **Feedback de usuários** com necessidades especiais

## Conclusão

A plataforma Celebra Capital atende aos requisitos de conformidade WCAG 2.1 nível AA, com pequenas exceções sendo ativamente trabalhadas. Esta avaliação demonstra nosso compromisso com a inclusão digital e acessibilidade para todos os usuários, independentemente de suas capacidades ou limitações.

O documento será atualizado trimestralmente para refletir melhorias contínuas e garantir que o status de conformidade permaneça atual.

---

**Versão:** 1.0  
**Data:** Janeiro 2024  
**Responsável pelo documento:** Equipe de Acessibilidade Celebra Capital
