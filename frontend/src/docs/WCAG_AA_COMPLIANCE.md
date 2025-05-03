# Conformidade WCAG 2.1 AA

## Introdução

Este documento descreve o estado atual de conformidade da Plataforma de Pré-Análise de Crédito com as Diretrizes de Acessibilidade para Conteúdo Web (WCAG) 2.1, nível AA. Utilizamos este documento como um guia de trabalho para garantir que nossa plataforma seja acessível a todos os usuários, incluindo pessoas com deficiências visuais, auditivas, motoras e cognitivas.

## Resumo do status atual

- **Status geral**: Em conformidade parcial com WCAG 2.1 AA
- **Última auditoria**: DD/MM/AAAA
- **Próxima auditoria programada**: DD/MM/AAAA
- **Escopo**: Todos os fluxos críticos da plataforma

## Critérios de Sucesso WCAG 2.1 AA

### Princípio 1: Perceptível

#### 1.1 Alternativas em Texto

| Critério                       | Descrição                                         | Status      | Observações                                |
| ------------------------------ | ------------------------------------------------- | ----------- | ------------------------------------------ |
| 1.1.1 Conteúdo não textual (A) | Todo conteúdo não textual tem alternativa textual | ✅ Conforme | Todas as imagens possuem texto alternativo |

#### 1.2 Mídia Baseada em Tempo

| Critério                                                       | Descrição                                                       | Status      | Observações                                                    |
| -------------------------------------------------------------- | --------------------------------------------------------------- | ----------- | -------------------------------------------------------------- |
| 1.2.1 Apenas áudio e apenas vídeo (pré-gravado) (A)            | Fornecer alternativa para mídia baseada em tempo                | ✅ Conforme | A plataforma não utiliza conteúdo apenas áudio ou apenas vídeo |
| 1.2.2 Legendas (pré-gravado) (A)                               | Fornecer legendas para todo conteúdo de áudio pré-gravado       | ✅ Conforme | Não aplicável - não utilizamos áudio pré-gravado               |
| 1.2.3 Audiodescrição ou alternativa de mídia (pré-gravado) (A) | Fornecer alternativa ou audiodescrição para vídeo pré-gravado   | ✅ Conforme | Não aplicável - não utilizamos vídeo pré-gravado               |
| 1.2.4 Legendas (ao vivo) (AA)                                  | Fornecer legendas para todo conteúdo de áudio ao vivo           | ✅ Conforme | Não aplicável - não utilizamos áudio ao vivo                   |
| 1.2.5 Audiodescrição (pré-gravado) (AA)                        | Fornecer audiodescrição para todo conteúdo de vídeo pré-gravado | ✅ Conforme | Não aplicável - não utilizamos vídeo pré-gravado               |

#### 1.3 Adaptável

| Critério                                         | Descrição                                                                                     | Status      | Observações                                          |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------- | ----------- | ---------------------------------------------------- |
| 1.3.1 Informações e Relações (A)                 | Informações, estrutura e relações transmitidas visualmente são programaticamente determinadas | ✅ Conforme | Usamos HTML semântico e ARIA onde necessário         |
| 1.3.2 Sequência com Significado (A)              | A sequência de navegação e leitura é lógica e intuitiva                                       | ✅ Conforme | A ordem do DOM segue uma sequência lógica            |
| 1.3.3 Características Sensoriais (A)             | Instruções não dependem apenas de características sensoriais                                  | ✅ Conforme | Não dependemos apenas de cor, forma, etc.            |
| 1.3.4 Orientação (AA)                            | O conteúdo não restringe a visualização a uma única orientação                                | ✅ Conforme | Interface responsiva funciona em qualquer orientação |
| 1.3.5 Identificação do Propósito de Entrada (AA) | O propósito dos campos de entrada pode ser determinado programaticamente                      | ⚠️ Parcial  | Alguns campos precisam de melhor identificação       |

#### 1.4 Discernível

| Critério                               | Descrição                                                            | Status      | Observações                                             |
| -------------------------------------- | -------------------------------------------------------------------- | ----------- | ------------------------------------------------------- |
| 1.4.1 Uso da Cor (A)                   | A cor não é usada como único meio de transmitir informações          | ✅ Conforme | Usamos ícones, texto e outros indicadores além da cor   |
| 1.4.2 Controle de Áudio (A)            | Mecanismo para pausar, parar ou controlar volume de áudio            | ✅ Conforme | Não utilizamos áudio que reproduz automaticamente       |
| 1.4.3 Contraste (Mínimo) (AA)          | Contraste visual de pelo menos 4.5:1 para texto                      | ⚠️ Parcial  | Alguns elementos de UI precisam de ajustes de contraste |
| 1.4.4 Redimensionar texto (AA)         | O texto pode ser redimensionado até 200% sem perda de funcionalidade | ✅ Conforme | Layout responsivo funciona com zoom de até 200%         |
| 1.4.5 Imagens de Texto (AA)            | Usamos texto real em vez de imagens de texto                         | ✅ Conforme | Não usamos imagens de texto, exceto em logotipos        |
| 1.4.10 Reflow (AA)                     | Conteúdo pode ser apresentado sem rolagem em duas dimensões          | ✅ Conforme | Interface se adapta a diferentes tamanhos de tela       |
| 1.4.11 Contraste Não-Textual (AA)      | Elementos de interface e gráficos têm contraste suficiente           | ⚠️ Parcial  | Alguns controles precisam de ajustes de contraste       |
| 1.4.12 Espaçamento de Texto (AA)       | Sem perda de conteúdo ao personalizar espaçamento de texto           | ✅ Conforme | Implementado com componente AccessibilityToggle         |
| 1.4.13 Conteúdo em Hover ou Focus (AA) | Conteúdo adicional que aparece em hover/focus pode ser dispensado    | ✅ Conforme | Tooltips e dropdowns podem ser fechados                 |

### Princípio 2: Operável

#### 2.1 Acessível por Teclado

| Critério                                | Descrição                                                  | Status      | Observações                                           |
| --------------------------------------- | ---------------------------------------------------------- | ----------- | ----------------------------------------------------- |
| 2.1.1 Teclado (A)                       | Toda funcionalidade está disponível via teclado            | ⚠️ Parcial  | Alguns componentes customizados precisam de melhorias |
| 2.1.2 Sem Bloqueio de Teclado (A)       | O foco do teclado não fica preso em nenhum elemento        | ✅ Conforme | Implementado com componente FocusManager              |
| 2.1.4 Atalhos de Tecla de Caractere (A) | Atalhos de teclado podem ser desativados ou personalizados | ✅ Conforme | Não utilizamos atalhos de tecla de caractere único    |

#### 2.2 Tempo Suficiente

| Critério                             | Descrição                                                      | Status      | Observações                                           |
| ------------------------------------ | -------------------------------------------------------------- | ----------- | ----------------------------------------------------- |
| 2.2.1 Ajustável por Temporizador (A) | Usuários podem desativar, ajustar ou estender limites de tempo | ✅ Conforme | Sessões com timeout incluem aviso e opção de extensão |
| 2.2.2 Pausar, Parar, Ocultar (A)     | Controle para conteúdo em movimento, piscando ou rolando       | ✅ Conforme | Não utilizamos animações automáticas de longa duração |

#### 2.3 Convulsões e Reações Físicas

| Critério                                   | Descrição                                 | Status      | Observações                       |
| ------------------------------------------ | ----------------------------------------- | ----------- | --------------------------------- |
| 2.3.1 Três Flashes ou Abaixo do Limite (A) | Nada pisca mais de três vezes por segundo | ✅ Conforme | Não utilizamos conteúdo com flash |

#### 2.4 Navegável

| Critério                                   | Descrição                                                         | Status      | Observações                                        |
| ------------------------------------------ | ----------------------------------------------------------------- | ----------- | -------------------------------------------------- |
| 2.4.1 Ignorar Blocos (A)                   | Mecanismo para ignorar blocos de conteúdo repetitivos             | ✅ Conforme | Implementado com componente SkipLinks              |
| 2.4.2 Página com Título (A)                | As páginas têm títulos que descrevem o tópico ou propósito        | ✅ Conforme | Todas as páginas possuem títulos descritivos       |
| 2.4.3 Ordem de Foco (A)                    | A ordem de navegação por teclado é lógica e intuitiva             | ⚠️ Parcial  | Alguns fluxos precisam de ajustes na ordem de foco |
| 2.4.4 Finalidade do Link (no contexto) (A) | A finalidade de cada link pode ser determinada pelo texto do link | ⚠️ Parcial  | Alguns links precisam de texto mais descritivo     |
| 2.4.5 Várias Formas (AA)                   | Múltiplas formas de localizar páginas                             | ✅ Conforme | Implementado com menu, pesquisa e breadcrumbs      |
| 2.4.6 Cabeçalhos e Rótulos (AA)            | Cabeçalhos e rótulos descrevem o tópico ou propósito              | ✅ Conforme | Todos os cabeçalhos e labels são descritivos       |
| 2.4.7 Foco Visível (AA)                    | Indicador de foco do teclado é visível                            | ✅ Conforme | Implementado em todos os elementos interativos     |

#### 2.5 Modalidades de Entrada

| Critério                           | Descrição                                                               | Status      | Observações                                              |
| ---------------------------------- | ----------------------------------------------------------------------- | ----------- | -------------------------------------------------------- |
| 2.5.1 Gestos de Ponteiro (A)       | Funcionalidades com gestos complexos têm alternativas mais simples      | ✅ Conforme | Não utilizamos gestos complexos                          |
| 2.5.2 Cancelamento de Ponteiro (A) | Funções ativadas por pointer-down podem ser canceladas                  | ✅ Conforme | Eventos são acionados no clique completo, não só no down |
| 2.5.3 Rótulo no Nome (A)           | Nome acessível dos componentes contém o texto visível                   | ✅ Conforme | Os textos visíveis correspondem aos nomes acessíveis     |
| 2.5.4 Atuação por Movimento (A)    | Funcionalidades acionadas por movimento do dispositivo têm alternativas | ✅ Conforme | Não utilizamos orientação ou movimento do dispositivo    |

### Princípio 3: Compreensível

#### 3.1 Legível

| Critério                     | Descrição                                                                 | Status      | Observações                             |
| ---------------------------- | ------------------------------------------------------------------------- | ----------- | --------------------------------------- |
| 3.1.1 Idioma da Página (A)   | O idioma da página pode ser determinado programaticamente                 | ✅ Conforme | Atributo lang está presente no HTML     |
| 3.1.2 Idioma das Partes (AA) | O idioma de cada passagem ou frase pode ser determinado programaticamente | ✅ Conforme | Atributo lang é usado quando necessário |

#### 3.2 Previsível

| Critério                             | Descrição                                                                   | Status      | Observações                                          |
| ------------------------------------ | --------------------------------------------------------------------------- | ----------- | ---------------------------------------------------- |
| 3.2.1 Em Foco (A)                    | Receber foco não desencadeia alterações de contexto                         | ✅ Conforme | Nenhum elemento altera o contexto ao receber foco    |
| 3.2.2 Em Entrada (A)                 | Mudar a configuração de um componente não altera o contexto automaticamente | ✅ Conforme | Alterações de configuração exigem confirmação        |
| 3.2.3 Navegação Consistente (AA)     | Mecanismos de navegação repetidos aparecem na mesma ordem                   | ✅ Conforme | Navegação consistente em todas as páginas            |
| 3.2.4 Identificação Consistente (AA) | Componentes com mesma funcionalidade são identificados consistentemente     | ✅ Conforme | Utilizamos padrões consistentes em toda a plataforma |

#### 3.3 Assistência de Entrada

| Critério                                                | Descrição                                                  | Status      | Observações                                               |
| ------------------------------------------------------- | ---------------------------------------------------------- | ----------- | --------------------------------------------------------- |
| 3.3.1 Identificação de Erro (A)                         | Erros são identificados e descritos ao usuário             | ✅ Conforme | Implementado com componente InlineFeedback                |
| 3.3.2 Rótulos ou Instruções (A)                         | Rótulos ou instruções são fornecidos para entrada de dados | ✅ Conforme | Todos os campos têm labels e instruções quando necessário |
| 3.3.3 Sugestão de Erro (AA)                             | Sugestões de correção são fornecidas quando possível       | ⚠️ Parcial  | Alguns formulários precisam de melhores sugestões         |
| 3.3.4 Prevenção de Erro (Legal, Financeiro, Dados) (AA) | Submissões podem ser revisadas, corrigidas e confirmadas   | ✅ Conforme | Implementado em todas as operações críticas               |

### Princípio 4: Robusto

#### 4.1 Compatível

| Critério                       | Descrição                                                                             | Status      | Observações                                           |
| ------------------------------ | ------------------------------------------------------------------------------------- | ----------- | ----------------------------------------------------- |
| 4.1.1 Análise (A)              | Markup bem formado, sem erros de duplicação de IDs                                    | ✅ Conforme | Validação de HTML implementada no pipeline CI/CD      |
| 4.1.2 Nome, Função, Valor (A)  | Nome, função e valor de todos os componentes podem ser determinados programaticamente | ⚠️ Parcial  | Alguns componentes customizados precisam de melhorias |
| 4.1.3 Mensagens de Status (AA) | Mensagens de status podem ser programaticamente determinadas                          | ✅ Conforme | Implementado com componentes LiveRegion               |

## Plano de Remediação

### Prioridade Alta

1. **1.3.5 Identificação do Propósito de Entrada**

   - Ação: Adicionar atributos `autocomplete` apropriados a todos os campos de formulário
   - Responsável: Equipe Frontend
   - Prazo: DD/MM/AAAA

2. **1.4.3 Contraste (Mínimo)**

   - Ação: Ajustar cores de texto e fundos para garantir contraste mínimo
   - Responsável: Equipe de Design
   - Prazo: DD/MM/AAAA

3. **2.1.1 Teclado**
   - Ação: Revisar e corrigir navegação por teclado em componentes customizados
   - Responsável: Equipe Frontend
   - Prazo: DD/MM/AAAA

### Prioridade Média

1. **1.4.11 Contraste Não-Textual**

   - Ação: Melhorar contraste de elementos de interface
   - Responsável: Equipe de Design
   - Prazo: DD/MM/AAAA

2. **2.4.3 Ordem de Foco**

   - Ação: Corrigir ordem de tabulação nos fluxos de cadastro e pagamento
   - Responsável: Equipe Frontend
   - Prazo: DD/MM/AAAA

3. **2.4.4 Finalidade do Link**
   - Ação: Melhorar texto dos links para serem mais descritivos
   - Responsável: Equipe de Conteúdo
   - Prazo: DD/MM/AAAA

### Prioridade Baixa

1. **3.3.3 Sugestão de Erro**

   - Ação: Melhorar mensagens de erro para incluir sugestões específicas
   - Responsável: Equipe Frontend
   - Prazo: DD/MM/AAAA

2. **4.1.2 Nome, Função, Valor**
   - Ação: Revisar e melhorar a acessibilidade de componentes customizados
   - Responsável: Equipe Frontend
   - Prazo: DD/MM/AAAA

## Monitoramento Contínuo

Para garantir a conformidade contínua:

1. **Testes automatizados**

   - Integração de testes de acessibilidade no pipeline CI/CD
   - Verificação de acessibilidade em cada PR usando axe-core

2. **Revisões periódicas**

   - Auditoria completa de acessibilidade a cada 3 meses
   - Teste com usuários reais, incluindo pessoas com deficiências

3. **Treinamento**
   - Treinamento contínuo da equipe em melhores práticas de acessibilidade
   - Workshops específicos para desenvolvedores e designers

## Considerações Finais

Este documento é atualizado regularmente à medida que melhorias são implementadas. Nossa meta é atingir e manter a conformidade total com WCAG 2.1 AA em todos os aspectos da plataforma. Reconhecemos que a acessibilidade é um processo contínuo, não um destino final, e estamos comprometidos em melhorar constantemente a experiência para todos os usuários.
