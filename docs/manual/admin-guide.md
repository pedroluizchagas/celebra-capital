# Manual do Administrador - Plataforma de Pré-Análise de Crédito

## Índice

1. [Introdução](#introdução)
2. [Acesso Administrativo](#acesso-administrativo)
3. [Dashboard Administrativo](#dashboard-administrativo)
4. [Gerenciamento de Propostas](#gerenciamento-de-propostas)
5. [Gerenciamento de Usuários](#gerenciamento-de-usuários)
6. [Configurações do Sistema](#configurações-do-sistema)
7. [Relatórios e Análises](#relatórios-e-análises)
8. [Sistema de Notificações](#sistema-de-notificações)
9. [Registros e Auditoria](#registros-e-auditoria)
10. [Resolução de Problemas](#resolução-de-problemas)

## Introdução

Este manual destina-se a administradores da Plataforma de Pré-Análise de Crédito da Celebra Capital, fornecendo instruções detalhadas sobre como gerenciar todos os aspectos do sistema.

## Acesso Administrativo

### Credenciais de Administrador

Para acessar o painel administrativo:

1. Acesse [https://app.celebracapital.com.br/admin](https://app.celebracapital.com.br/admin)
2. Utilize suas credenciais de administrador
3. Autenticação de dois fatores será solicitada (se habilitada)

### Níveis de Acesso Administrativo

A plataforma possui três níveis administrativos:

| Nível                     | Função                     | Permissões                                 |
| ------------------------- | -------------------------- | ------------------------------------------ |
| Administrador Máster      | Super usuário              | Acesso completo a todas as funcionalidades |
| Administrador de Crédito  | Gerenciamento de propostas | Aprovação, rejeição e análise de propostas |
| Administrador de Usuários | Gerenciamento de contas    | Criação e edição de usuários               |

## Dashboard Administrativo

O dashboard administrativo apresenta:

- **Indicadores de Desempenho (KPIs)**:

  - Total de propostas (pendentes, aprovadas, rejeitadas)
  - Taxa de aprovação
  - Valor médio aprovado
  - Tempo médio de análise

- **Gráficos Analíticos**:

  - Propostas por status (gráfico de pizza)
  - Propostas por período (gráfico de linha)
  - Distribuição por tipo de crédito (gráfico de barras)
  - Score médio por tipo de cliente (gráfico de barras)

- **Alertas do Sistema**:
  - Propostas aguardando há mais de 48 horas
  - Usuários com atividades suspeitas
  - Erros de sistema recentes

## Gerenciamento de Propostas

### Lista de Propostas

Para acessar a lista completa de propostas:

1. No menu lateral, clique em "Propostas"
2. Utilize os filtros avançados para refinar sua busca:
   - **Filtros de Status**: Pendente, Em Análise, Aprovada, Rejeitada, Cancelada
   - **Filtros de Data**: Data de criação, Data de análise
   - **Filtros Financeiros**: Valor solicitado (mín/máx), Score de crédito
   - **Filtros de Cliente**: Tipo de cliente, Segmento

### Análise de Propostas

Para analisar uma proposta em detalhes:

1. Clique no número da proposta na lista
2. A página de detalhes mostrará todas as informações da proposta:
   - **Informações do Solicitante**: Dados pessoais e de contato
   - **Dados da Empresa**: CNPJ, porte, faturamento, setor
   - **Dados Financeiros**: Valor solicitado, finalidade, prazo, garantias
   - **Documentação**: Todos os documentos enviados pelo cliente
   - **Análise Automática**: Score de crédito, verificações automáticas
   - **Histórico**: Linha do tempo completa da proposta

### Processo de Aprovação/Rejeição

Para aprovar uma proposta:

1. Verifique todos os documentos e informações necessárias
2. Clique no botão "Aprovar Proposta"
3. Adicione comentários justificando a aprovação (opcional)
4. Selecione as condições aprovadas (valor, prazo, taxa)
5. Clique em "Confirmar Aprovação"

Para rejeitar uma proposta:

1. Clique no botão "Rejeitar Proposta"
2. Selecione o motivo da rejeição (obrigatório)
3. Adicione comentários detalhados sobre o motivo da rejeição
4. Clique em "Confirmar Rejeição"

Para solicitar mais documentos:

1. Clique no botão "Solicitar Documentos"
2. Selecione os documentos necessários
3. Adicione instruções detalhadas para o cliente
4. Defina um prazo para envio (opcional)
5. Clique em "Enviar Solicitação"

### Exportação de Dados

Para exportar dados de propostas:

1. Na lista de propostas, selecione as propostas desejadas ou aplique filtros
2. Clique no botão "Exportar"
3. Selecione o formato de exportação:
   - CSV (dados brutos)
   - Excel (formatado com abas)
   - PDF (relatório formatado)
4. Selecione os campos a serem incluídos na exportação
5. Clique em "Confirmar Exportação"

## Gerenciamento de Usuários

### Criação de Usuários

Para criar um novo usuário:

1. Acesse "Administração > Usuários"
2. Clique em "Novo Usuário"
3. Preencha os campos obrigatórios:
   - Nome completo
   - Email (será o login)
   - Perfil de acesso
   - Departamento
4. Configure permissões específicas:
   - Aprovação de propostas
   - Visualização de relatórios
   - Gerenciamento de clientes
5. Defina uma senha temporária ou use a opção "Enviar convite"
6. Clique em "Criar Usuário"

### Edição de Perfis e Permissões

Para editar perfis e permissões:

1. Acesse "Administração > Perfis"
2. Selecione um perfil existente ou crie um novo
3. Configure as permissões por módulo:
   - Propostas: Visualizar, Criar, Editar, Aprovar, Rejeitar
   - Clientes: Visualizar, Criar, Editar, Deletar
   - Relatórios: Visualizar, Exportar
   - Configurações: Acessar, Modificar
4. Defina restrições de acesso:
   - Limite de valor para aprovação
   - Restrição por região
   - Restrição por tipo de crédito
5. Clique em "Salvar Perfil"

### Auditoria de Ações de Usuários

Para auditar ações de usuários:

1. Acesse "Administração > Logs de Auditoria"
2. Filtre por:
   - Usuário
   - Tipo de ação
   - Data/hora
   - Módulo do sistema
3. Visualize detalhes da ação:
   - Dados antes da modificação
   - Dados após modificação
   - IP de acesso
   - Dispositivo utilizado

## Configurações do Sistema

### Parâmetros de Análise de Crédito

Para configurar parâmetros de análise:

1. Acesse "Configurações > Parâmetros de Crédito"
2. Configure os limites de score:
   - Score mínimo para aprovação automática
   - Score mínimo para análise manual
   - Score para rejeição automática
3. Configure limites financeiros:
   - Valor máximo para aprovação automática
   - Valor máximo por tipo de crédito
   - Taxa de juros padrão por score
4. Configure documentos obrigatórios por tipo de proposta
5. Clique em "Salvar Configurações"

### Integração com Serviços Externos

Para configurar integrações:

1. Acesse "Configurações > Integrações"
2. Configure as APIs de:
   - Bureaus de crédito (Serasa, SPC, etc.)
   - Serviços bancários
   - Validação de documentos
   - Análise automática de fraude
3. Configure parâmetros de cada integração:
   - Chaves de API
   - Credenciais de acesso
   - URLs de serviço
   - Frequência de atualização
4. Teste as integrações antes de salvar
5. Clique em "Salvar Configurações"

## Relatórios e Análises

### Relatórios Padrão

A plataforma oferece os seguintes relatórios padrão:

1. **Relatório de Desempenho**:

   - Taxa de conversão de propostas
   - Tempo médio de análise
   - Distribuição de propostas por status

2. **Relatório Financeiro**:

   - Volume total de crédito aprovado
   - Ticket médio por tipo de crédito
   - Projeção de receita de juros

3. **Relatório de Clientes**:
   - Novos clientes por período
   - Distribuição demográfica
   - Taxa de retorno

### Personalização de Relatórios

Para criar relatórios personalizados:

1. Acesse "Relatórios > Personalizar"
2. Clique em "Novo Relatório"
3. Selecione os campos de dados desejados
4. Configure filtros e agrupamentos
5. Selecione visualizações (tabelas, gráficos)
6. Defina programação de envio automático (opcional)
7. Clique em "Salvar Relatório"

## Sistema de Notificações

### Configuração de Notificações

Para configurar notificações do sistema:

1. Acesse "Configurações > Notificações"
2. Configure eventos que geram notificações:
   - Nova proposta
   - Documentos enviados
   - Proposta aprovada/rejeitada
   - Alerta de fraude
3. Configure canais de notificação por tipo de evento:
   - Interface do sistema
   - Email
   - SMS
   - Push mobile (aplicativo)
4. Configure destinatários por tipo de evento:
   - Usuários específicos
   - Grupos de usuários
   - Perfis de acesso
5. Clique em "Salvar Configurações"

### Gerenciamento de Notificações

Para gerenciar notificações como administrador:

1. Acesse "Administração > Notificações"
2. Visualize todas as notificações enviadas
3. Filtre por:
   - Tipo de notificação
   - Destinatário
   - Status (lida/não lida)
   - Data de envio
4. Execute ações em massa:
   - Marcar como lidas
   - Reenviar
   - Excluir

## Registros e Auditoria

### Logs de Sistema

Para acessar logs de sistema:

1. Acesse "Administração > Logs do Sistema"
2. Filtre por:
   - Nível (Informação, Aviso, Erro, Crítico)
   - Módulo
   - Período
   - Código de erro
3. Visualize detalhes do log:
   - Timestamp
   - Usuário associado (se aplicável)
   - Detalhes técnicos do evento
   - Stack trace (para erros)

### Backup e Restauração

Para gerenciar backups:

1. Acesse "Administração > Backup"
2. Visualize backups automáticos:
   - Diários (últimos 7 dias)
   - Semanais (últimas 4 semanas)
   - Mensais (últimos 12 meses)
3. Crie um backup manual:
   - Clique em "Criar Backup"
   - Selecione os módulos a incluir
   - Adicione uma descrição
4. Restaure a partir de um backup:
   - Selecione o backup desejado
   - Clique em "Restaurar"
   - Confirme a operação

## Resolução de Problemas

### Problemas Comuns e Soluções

#### Erro de Login

- **Problema**: Usuário não consegue fazer login
- **Solução**:
  1. Verifique se o email está correto
  2. Utilize a opção "Esqueci minha senha"
  3. Verifique se o usuário está ativo no sistema
  4. Confira os logs de acesso para detectar bloqueios

#### Erros na Análise de Crédito

- **Problema**: Sistema não está calculando o score corretamente
- **Solução**:
  1. Verifique as configurações de cálculo de score
  2. Confirme se as integrações com bureaus estão funcionando
  3. Verifique os logs de integrações
  4. Contate o suporte técnico

#### Problemas com Notificações

- **Problema**: Notificações não estão sendo enviadas
- **Solução**:
  1. Verifique as configurações de notificações
  2. Confirme se o servidor de email está operacional
  3. Verifique logs de envio de notificações
  4. Teste envios manuais

### Contato com Suporte Técnico

Para situações que requerem suporte técnico avançado:

- **Email**: suporte.tecnico@celebracapital.com.br
- **Telefone**: (11) 3333-5555
- **Horário de Atendimento**: 24/7 para questões críticas
- **Portal de Suporte**: [support.celebracapital.com.br](https://support.celebracapital.com.br)
