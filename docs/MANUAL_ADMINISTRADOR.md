# Manual do Administrador - Plataforma de Pré-Análise de Crédito

## Introdução

Este manual fornece informações necessárias para administradores da plataforma de pré-análise de crédito da Celebra Capital. Ele contém instruções sobre configuração, gerenciamento de usuários, monitoramento do sistema e outras tarefas administrativas.

## Índice

1. [Acesso Administrativo](#acesso-administrativo)
2. [Dashboard Administrativo](#dashboard-administrativo)
3. [Gerenciamento de Usuários](#gerenciamento-de-usuários)
4. [Gerenciamento de Propostas](#gerenciamento-de-propostas)
5. [Sistema de OCR](#sistema-de-ocr)
6. [Configurações do Sistema](#configurações-do-sistema)
7. [Relatórios e Analytics](#relatórios-e-analytics)
8. [Segurança e Auditoria](#segurança-e-auditoria)
9. [Notificações do Sistema](#notificações-do-sistema)
10. [Manutenção](#manutenção)
11. [Resolução de Problemas](#resolução-de-problemas)
12. [Integração com Sistemas Externos](#integração-com-sistemas-externos)

---

## Acesso Administrativo

### Requisitos para Acesso

- Credenciais de administrador fornecidas pelo Administrador Principal
- Acesso à VPN corporativa para administração remota
- Autenticação de dois fatores (2FA) configurada

### Procedimento de Login

1. Acesse o portal administrativo em [https://admin.celebracapital.com.br](https://admin.celebracapital.com.br)
2. Insira seu nome de usuário e senha
3. Complete a verificação de dois fatores
4. Para primeira entrada, você será solicitado a alterar sua senha

### Níveis de Acesso Administrativo

- **Administrador Principal**: Acesso completo a todas as funções
- **Gerente de Operações**: Acesso a propostas, usuários e relatórios
- **Analista de Crédito**: Acesso apenas à análise de propostas
- **Suporte Técnico**: Acesso a logs e ferramentas de diagnóstico
- **Auditor**: Acesso somente leitura a logs e relatórios

---

## Dashboard Administrativo

### Visão Geral

O Dashboard Administrativo fornece uma visão geral do sistema, incluindo:

- Estatísticas de propostas (novas, em análise, aprovadas, rejeitadas)
- Métricas de desempenho do sistema
- Alertas de segurança
- Atividades recentes de usuários administradores

### Painéis Principais

- **Propostas**: Estatísticas de propostas e gráficos de tendências
- **Usuários**: Estatísticas de usuários e atividade
- **Sistema**: Métricas de desempenho e disponibilidade
- **Segurança**: Tentativas de login, alertas e ameaças detectadas

### Personalização do Dashboard

1. Clique em "Personalizar" no canto superior direito
2. Arraste e solte os widgets para reorganizar
3. Clique no ícone de engrenagem em qualquer widget para configurar
4. Selecione "Salvar Layout" para manter suas alterações

---

## Gerenciamento de Usuários

### Visualização de Usuários

1. Acesse "Administração" > "Usuários"
2. Use os filtros para encontrar usuários específicos:
   - Status (Ativo, Inativo, Bloqueado)
   - Tipo (Cliente, Administrador)
   - Data de cadastro

### Criação de Usuários Administrativos

1. Acesse "Administração" > "Usuários" > "Novo Usuário"
2. Selecione o tipo "Administrativo"
3. Preencha as informações necessárias:
   - Nome completo
   - E-mail corporativo
   - Cargo
   - Nível de acesso
4. Defina permissões específicas
5. Clique em "Criar Usuário"
6. O sistema enviará credenciais temporárias ao e-mail fornecido

### Edição de Usuários

1. Localize o usuário na lista
2. Clique no ícone de edição
3. Modifique as informações necessárias
4. Clique em "Salvar Alterações"

### Gestão de Permissões

1. Acesse "Administração" > "Permissões"
2. Selecione um perfil existente ou crie um novo
3. Configure as permissões específicas:
   - Visualização de dados
   - Edição de dados
   - Aprovação de propostas
   - Configurações do sistema
4. Clique em "Aplicar Permissões"

### Bloqueio e Desbloqueio de Contas

1. Localize o usuário na lista
2. Clique no botão "Ações" e selecione "Bloquear" ou "Desbloquear"
3. Confirme a ação
4. Registre o motivo do bloqueio/desbloqueio

---

## Gerenciamento de Propostas

### Visão Geral de Propostas

1. Acesse "Propostas" > "Todas as Propostas"
2. Use os filtros para refinar a lista:
   - Status da proposta
   - Data de criação
   - Valor solicitado
   - Tipo de proposta

### Análise Manual de Documentos

1. Selecione uma proposta na lista
2. Clique na aba "Documentos"
3. Verifique cada documento carregado:
   - Clique para ampliar
   - Use as ferramentas de zoom e rotação
   - Compare com os dados extraídos pelo OCR
4. Marque cada documento como "Verificado" ou "Requer atenção"

### Processamento de Propostas

1. Acesse a proposta que requer análise
2. Revise os dados da proposta e documentos
3. Utilize as ferramentas de avaliação de crédito
4. Selecione uma das ações:
   - Aprovar
   - Rejeitar
   - Solicitar mais informações
5. Adicione um comentário explicando a decisão
6. Clique em "Concluir Análise"

### Configuração de Regras Automáticas

1. Acesse "Configurações" > "Regras de Análise"
2. Selecione "Nova Regra" ou edite uma regra existente
3. Configure os parâmetros:
   - Critérios de aprovação/rejeição automática
   - Limites de crédito por perfil
   - Verificações adicionais necessárias
4. Defina a prioridade da regra
5. Ative ou desative a regra
6. Clique em "Salvar Regra"

---

## Sistema de OCR

### Monitoramento de Precisão do OCR

1. Acesse "Sistema" > "Desempenho do OCR"
2. Visualize as métricas de precisão por tipo de documento
3. Identifique documentos com baixa taxa de reconhecimento

### Treinamento do Sistema OCR

1. Acesse "Sistema" > "OCR" > "Treinamento"
2. Selecione o tipo de documento para treinamento
3. Carregue amostras de documentos
4. Marque manualmente os campos relevantes
5. Inicie o processo de treinamento
6. Monitore os resultados do treinamento

### Configuração de Templates

1. Acesse "Sistema" > "OCR" > "Templates"
2. Selecione "Novo Template" ou edite um existente
3. Defina as áreas de reconhecimento para cada campo
4. Configure as validações para cada campo
5. Teste o template com documentos de amostra
6. Publique o template quando estiver satisfeito

---

## Configurações do Sistema

### Configurações Gerais

1. Acesse "Configurações" > "Geral"
2. Ajuste as configurações básicas:
   - Nome da instância
   - Fuso horário
   - Formatos de data e hora
   - Configurações de cache

### Personalização da Interface

1. Acesse "Configurações" > "Aparência"
2. Personalize:
   - Cores e logotipos
   - Mensagens do sistema
   - Textos de ajuda
   - Templates de e-mail

### Gestão de Integrações

1. Acesse "Configurações" > "Integrações"
2. Configure as conexões com sistemas externos:
   - Bureaus de crédito
   - Serviços de verificação de identidade
   - Sistemas bancários
   - Serviços de assinatura digital

### Configuração de Produtos de Crédito

1. Acesse "Configurações" > "Produtos"
2. Adicione ou edite produtos de crédito:
   - Nome e descrição
   - Taxas e prazos
   - Documentos necessários
   - Regras de aprovação específicas

---

## Relatórios e Analytics

### Relatórios Pré-configurados

1. Acesse "Relatórios" > "Biblioteca"
2. Selecione um relatório da lista:
   - Desempenho de propostas
   - Atividade de usuários
   - Métricas de conversão
   - Análise de rejeições

### Criação de Relatórios Personalizados

1. Acesse "Relatórios" > "Novo Relatório"
2. Selecione o tipo de relatório
3. Escolha as dimensões e métricas
4. Configure filtros e intervalos de datas
5. Selecione a visualização (tabela, gráfico, mapa)
6. Salve o relatório

### Exportação e Compartilhamento

1. Abra o relatório desejado
2. Clique em "Exportar" e selecione o formato (PDF, Excel, CSV)
3. Para compartilhamento, clique em "Compartilhar"
4. Selecione os destinatários ou gere um link
5. Configure permissões de acesso
6. Defina a expiração do compartilhamento (se aplicável)

### Programação de Relatórios

1. Abra o relatório desejado
2. Clique em "Programar"
3. Configure a frequência (diária, semanal, mensal)
4. Selecione os destinatários
5. Escolha o formato de entrega
6. Defina o assunto e mensagem para o e-mail
7. Clique em "Salvar Programação"

---

## Segurança e Auditoria

### Registro de Atividades (Logs)

1. Acesse "Segurança" > "Logs de Atividade"
2. Use os filtros para visualizar logs específicos:
   - Tipo de atividade
   - Usuário
   - Data e hora
   - Endereço IP

### Configuração de Políticas de Senha

1. Acesse "Segurança" > "Políticas"
2. Configure os requisitos de senha:
   - Comprimento mínimo
   - Complexidade exigida
   - Frequência de alteração
   - Histórico de senhas

### Gerenciamento de Sessões

1. Acesse "Segurança" > "Sessões Ativas"
2. Visualize todas as sessões ativas no sistema
3. Encerre sessões suspeitas ou inativas
4. Configure o tempo limite de inatividade

### Backup e Recuperação

1. Acesse "Sistema" > "Backup"
2. Configure a programação de backups:
   - Frequência
   - Tipo (completo, incremental)
   - Local de armazenamento
3. Para restaurar, selecione "Restaurar Backup"
4. Escolha o ponto de restauração
5. Confirme a operação de restauração

---

## Notificações do Sistema

### Configuração de Alertas

1. Acesse "Configurações" > "Alertas"
2. Configure alertas para eventos como:
   - Falhas de sistema
   - Tentativas de login inválidas
   - Atividades suspeitas
   - Desempenho baixo

### Canais de Notificação

1. Acesse "Configurações" > "Canais de Notificação"
2. Configure os canais disponíveis:
   - E-mail
   - SMS
   - Webhooks
   - Integrações com serviços de chat

### Templates de Notificação

1. Acesse "Configurações" > "Templates de Notificação"
2. Selecione o tipo de notificação
3. Edite o conteúdo do template
4. Use as variáveis disponíveis para personalização
5. Teste o template antes de salvar

---

## Manutenção

### Monitoramento de Desempenho

1. Acesse "Sistema" > "Desempenho"
2. Visualize métricas como:
   - Uso de CPU e memória
   - Tempo de resposta
   - Número de usuários ativos
   - Taxas de erro

### Agendamento de Manutenção

1. Acesse "Sistema" > "Manutenção Programada"
2. Clique em "Agendar Nova Manutenção"
3. Selecione o tipo de manutenção
4. Defina data e hora
5. Configure notificações para usuários
6. Especifique a duração estimada

### Atualizações do Sistema

1. Acesse "Sistema" > "Atualizações"
2. Verifique atualizações disponíveis
3. Revise as notas da versão
4. Faça backup do sistema antes de atualizar
5. Clique em "Instalar Atualizações"
6. Monitore o progresso da atualização

---

## Resolução de Problemas

### Ferramentas de Diagnóstico

1. Acesse "Sistema" > "Diagnóstico"
2. Execute verificações como:
   - Teste de conectividade
   - Verificação de integridade do banco de dados
   - Validação de configurações
   - Verificação de permissões

### Logs de Erro

1. Acesse "Sistema" > "Logs de Erro"
2. Filtre por severidade, componente ou data
3. Expanda entradas de log para ver detalhes completos
4. Exporte logs para análise externa se necessário

### Procedimentos de Recuperação

Para falhas comuns, siga estes procedimentos:

1. **Falha de Conexão com Banco de Dados**:

   - Verifique os serviços de banco de dados
   - Teste a conectividade de rede
   - Verifique credenciais de acesso

2. **Lentidão do Sistema**:

   - Verifique número de usuários ativos
   - Monitore uso de recursos
   - Verifique processos em segundo plano

3. **Falhas no OCR**:
   - Reinicie o serviço de OCR
   - Verifique disponibilidade de recursos
   - Teste com documentos de amostra

---

## Integração com Sistemas Externos

### Configuração de APIs

1. Acesse "Integrações" > "APIs"
2. Selecione "Nova Integração" ou edite uma existente
3. Configure os parâmetros de conexão:
   - URL do endpoint
   - Método de autenticação
   - Credenciais
   - Parâmetros de requisição

### Monitoramento de Integrações

1. Acesse "Integrações" > "Status"
2. Visualize o status de todas as integrações
3. Verifique taxa de sucesso e tempo de resposta
4. Visualize logs de transações recentes

### Webhooks

1. Acesse "Integrações" > "Webhooks"
2. Configure novos webhooks para eventos específicos
3. Defina o URL de destino, formato e dados
4. Configure regras de retry e timeout
5. Teste o webhook antes de ativá-lo

---

## Apêndice

### Lista de Códigos de Erro

| Código | Descrição                 | Ação Recomendada                               |
| ------ | ------------------------- | ---------------------------------------------- |
| E001   | Falha de autenticação     | Verifique credenciais ou reinicie conta        |
| E002   | Timeout de banco de dados | Verifique conexão e carga do servidor          |
| E003   | Falha no OCR              | Verifique qualidade do documento e serviço OCR |
| E004   | Erro de integração        | Verifique conectividade com serviço externo    |
| E005   | Permissão negada          | Verifique nível de acesso do usuário           |

### Contatos de Suporte

- **Suporte Nível 1**: suporte.n1@celebracapital.com.br | (11) 4002-8922
- **Suporte Nível 2**: suporte.n2@celebracapital.com.br | (11) 4002-8923
- **Emergência 24/7**: emergencia@celebracapital.com.br | (11) 99999-9999

---

_Este manual é atualizado regularmente. Última atualização: Julho 2023._

Para sugestões ou dúvidas sobre este manual, entre em contato com sistemas@celebracapital.com.br.
