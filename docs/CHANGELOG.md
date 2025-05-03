# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/spec/v2.0.0.html).

## [0.2.3] - 2023-10-19

### Adicionado

- Documentação completa de usuário:

  - Guia rápido para usuários básicos
  - Manual detalhado para administradores
  - Instruções para todos os fluxos de trabalho principais
  - Solução de problemas comuns

- Configuração para testes End-to-End:
  - Estrutura inicial para testes com Cypress
  - Comandos personalizados para ações comuns
  - Mocks para APIs e serviços externos
  - Exemplo de teste de aprovação de propostas

### Alterado

- Atualização da estrutura de diretórios com novos documentos
- Atualização do README.md com referências à documentação

## [0.2.2] - 2023-10-18

### Adicionado

- Framework para testes de integração:

  - Configuração do Mock Service Worker (MSW)
  - Handlers para simular a API durante os testes
  - Configuração do ambiente de teste de integração
  - Scripts para execução separada de testes unitários e de integração

- Testes de integração para fluxos completos:
  - Testes para o fluxo de aprovação de propostas
  - Testes para o fluxo de rejeição de propostas
  - Testes para solicitação de documentos adicionais
  - Testes para o fluxo de notificações
  - Testes para navegação entre notificações e propostas

### Alterado

- Estrutura do projeto com novos diretórios para testes de integração
- Atualização do README.md com instruções para testes de integração
- Versão do projeto atualizada para 0.2.2

## [0.2.1] - 2023-10-17

### Adicionado

- Testes unitários completos para todos os componentes:
  - Testes para ProposalFilters
  - Testes para ExportOptions
  - Testes para componentes de UI (LoadingSpinner, PageLoader, SkeletonLoader)
  - Testes para NotificationDropdown

### Corrigido

- Pequenos ajustes de estilo e acessibilidade nos componentes

## [0.2.0] - 2023-10-14

### Adicionado

- Sistema completo de notificações:

  - Componente NotificationIcon com contador de não lidas
  - NotificationDropdown para visualização rápida
  - Página de listagem de notificações com filtros
  - Serviço notificationService para gerenciar notificações

- Melhorias na página de detalhes de propostas:

  - Componente ApprovalActions para aprovação/rejeição de propostas
  - Componente ProposalFeedback para comentários e feedback
  - Integração com notificações

- Componentes de UI reutilizáveis:

  - LoadingSpinner para estados de carregamento
  - PageLoader para carregamento de páginas inteiras
  - SkeletonLoader para carregamento de conteúdo
  - ProposalFilters para filtros avançados
  - ExportOptions para exportação de dados

- Testes unitários:
  - Testes para o componente ApprovalActions
  - Testes para o componente ProposalFeedback
  - Testes para o componente NotificationIcon

### Alterado

- Melhoria na estrutura de diretórios dos componentes
- README atualizado com novas funcionalidades e status do projeto

## [0.1.0] - 2023-10-10

### Adicionado

- MVP inicial da plataforma
- Dashboard administrativo com:
  - Estatísticas
  - Listagem de propostas
  - Atividades recentes
  - Gráficos de dados
