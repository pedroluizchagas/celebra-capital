# Guia de Testes com Leitores de Tela

Este documento fornece instruções sobre como testar a acessibilidade da plataforma da Celebra Capital usando leitores de tela.

## Índice

1. [Introdução](#introdução)
2. [Leitores de Tela Recomendados](#leitores-de-tela-recomendados)
3. [Preparação para Testes](#preparação-para-testes)
4. [Testes com NVDA (Windows)](#testes-com-nvda-windows)
5. [Testes com VoiceOver (macOS/iOS)](#testes-com-voiceover-macosios)
6. [Matriz de Testes](#matriz-de-testes)
7. [Comandos Úteis](#comandos-úteis)
8. [Relatórios de Testes](#relatórios-de-testes)

## Introdução

Os leitores de tela são ferramentas essenciais para usuários com deficiência visual. Testar nossa aplicação com leitores de tela garante que ela seja utilizável por todos os usuários, independentemente de suas capacidades visuais.

## Leitores de Tela Recomendados

Recomendamos testar em pelo menos dois leitores de tela diferentes:

### Windows

- **NVDA** (NonVisual Desktop Access) - Gratuito e de código aberto
  - [Download do NVDA](https://www.nvaccess.org/download/)

### macOS / iOS

- **VoiceOver** - Integrado ao sistema operacional
  - Para ativar no macOS: `Cmd + F5` ou em Preferências do Sistema > Acessibilidade > VoiceOver
  - Para ativar no iOS: Configurações > Acessibilidade > VoiceOver

### Outros

- **JAWS** (Job Access With Speech) - Comercial, muito utilizado em ambientes corporativos
- **TalkBack** - Integrado aos dispositivos Android

## Preparação para Testes

Antes de iniciar os testes:

1. **Instale o leitor de tela** apropriado para seu sistema operacional
2. **Familiarize-se com os comandos básicos** do leitor de tela
3. **Desative o mouse** durante os testes para simular a experiência de um usuário que depende exclusivamente do teclado e do leitor de tela
4. **Prepare os cenários de teste** utilizando a [Matriz de Testes](#matriz-de-testes)

## Testes com NVDA (Windows)

### Instalação e Configuração

1. Baixe o NVDA do [site oficial](https://www.nvaccess.org/download/)
2. Instale seguindo as instruções do instalador
3. Inicie o NVDA (ele anunciará sua ativação)
4. Ajuste a velocidade da fala (Insert + Ctrl + setas para cima/baixo)

### Comandos Básicos

- **Iniciar/Parar leitura**: Insert + Seta para baixo
- **Ler linha atual**: Insert + Seta para cima
- **Navegação por elementos**:
  - Tab: Próximo elemento interativo
  - Shift + Tab: Elemento interativo anterior
  - H: Próximo cabeçalho
  - F: Próximo formulário
  - B: Próximo botão
  - Ctrl + Home: Ir para o topo da página

## Testes com VoiceOver (macOS/iOS)

### Ativação no macOS

1. Pressione `Cmd + F5` ou ative em Preferências do Sistema > Acessibilidade > VoiceOver
2. Faça o tutorial de introdução que é oferecido na primeira execução

### Comandos Básicos

- **Tecla modificadora**: VO (Control + Option)
- **Ler tudo**: VO + A
- **Parar leitura**: Control
- **Navegação por elementos**:
  - Tab: Próximo elemento interativo
  - Shift + Tab: Elemento interativo anterior
  - VO + Seta direita/esquerda: Navegar entre elementos
  - VO + Espaço: Ativar elemento selecionado
  - VO + U: Abrir rotor (para navegar por tipos específicos de elementos)

## Matriz de Testes

Utilize a matriz abaixo para documentar os testes realizados:

| ID  | Cenário                               | Componente | NVDA  | VoiceOver | Resultado     | Observações |
| --- | ------------------------------------- | ---------- | ----- | --------- | ------------- | ----------- |
| 1   | Navegação pelo formulário de cadastro | FormField  | ✅/❌ | ✅/❌     | Passou/Falhou |             |
| 2   | Preenchimento de campo com erro       | FormField  |       |           |               |             |
| 3   | Seleção de opções no dropdown         | Select     |       |           |               |             |
| 4   | Marcação de checkbox                  | Checkbox   |       |           |               |             |
| 5   | Seleção de opção em radio buttons     | Radio      |       |           |               |             |
| 6   | Preenchimento de texto multilinha     | Textarea   |       |           |               |             |
| 7   | Upload de arquivo                     | FileInput  |       |           |               |             |
| 8   | Submissão de formulário               | Form       |       |           |               |             |
| 9   | Verificação de erros de validação     | Form       |       |           |               |             |
| 10  | Feedback durante envio (loading)      | Form       |       |           |               |             |

## Comandos Úteis

### NVDA

| Ação                       | Comando               |
| -------------------------- | --------------------- |
| Ativar/Desativar NVDA      | Ctrl + Alt + N        |
| Pausar/Continuar fala      | Shift                 |
| Modo de foco (formulários) | NVDA + Espaço         |
| Anunciar título da página  | Insert + T            |
| Lista de elementos         | Insert + F7           |
| Lista de cabeçalhos        | Insert + F7, depois H |
| Lista de landmarks         | Insert + F7, depois D |

### VoiceOver

| Ação                                | Comando              |
| ----------------------------------- | -------------------- |
| Ativar/Desativar VoiceOver          | Cmd + F5             |
| Ler seleção                         | VO + S               |
| Ler da posição atual até o final    | VO + A               |
| Itens no rotor                      | VO + U, depois setas |
| Ir para próximo cabeçalho           | VO + Command + H     |
| Ir para próxima tabela              | VO + Command + T     |
| Ir para próximo campo de formulário | VO + Command + J     |

## Relatórios de Testes

Após realizar os testes, documente os resultados utilizando o seguinte formato:

```markdown
## Relatório de Testes com Leitor de Tela

### Informações Gerais

- **Data do teste:** DD/MM/AAAA
- **Testador:** Nome do testador
- **Ambiente:** Sistema operacional, navegador, versão do leitor de tela
- **Componentes testados:** Lista de componentes

### Resultados

#### Cenário 1: [Nome do cenário]

- **Resultado:** Passou/Falhou
- **Observações:** Detalhes sobre o comportamento, problemas encontrados
- **Gravidade:** Alta/Média/Baixa
- **Recomendações:** Sugestões de correção

[Repita para cada cenário testado]

### Conclusão

Resumo dos resultados e próximos passos
```

---

## Recursos Adicionais

- [Guia do NVDA (PDF)](https://www.nvaccess.org/files/nvda/documentation/userGuide.html)
- [Guia do VoiceOver para macOS](https://support.apple.com/pt-br/guide/voiceover/welcome/mac)
- [WebAIM: Testing with Screen Readers](https://webaim.org/articles/screenreader_testing/)
- [Deque University: Screen Reader Basics](https://dequeuniversity.com/screenreaders/)

---

**Dúvidas ou sugestões sobre este guia?**  
Entre em contato com a equipe de desenvolvimento em [dev@celebracapital.com.br](mailto:dev@celebracapital.com.br)
