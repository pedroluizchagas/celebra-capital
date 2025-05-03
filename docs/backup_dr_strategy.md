# Estratégia de Backup & Disaster Recovery - Celebra Capital

Este documento descreve a estratégia de backup e recuperação de desastres (DR) implementada para a plataforma Celebra Capital, garantindo a segurança dos dados e a continuidade dos negócios em caso de falhas.

## Visão Geral

Nossa estratégia de backup e DR inclui:

1. **Backups automáticos diários** da base de dados PostgreSQL
2. **Armazenamento redundante** de backups em serviço de armazenamento S3-compatible
3. **Política de retenção** de 30 dias para backups históricos
4. **Processo documentado de recuperação** para restauração rápida em caso de falhas
5. **Monitoramento e notificação** para verificar a integridade dos backups

## Arquitetura da Solução

![Arquitetura de Backup](https://mermaid.ink/img/pako:eNqFkUFrwzAMhf-KMA4t9JJTDxsmtDvssrFDL7KsJKbxHNtZmrXkv0-Jl25jG_NFet97SHogL0YjJTSGDDxbRNp69LpNb-6uabYKuVNevCtDq7y1I9hXlxVSkUH8C_NvpA2S1Xe2nLkcDrYmDyRPfMHa-7bSllcxp7oojlXBbJwlP4MHvSGFaJ1ULo5aIOgaP_a6z0A3TgkXZvIZKFZT4wJWnSR7jtP_UGWQ5AXEX5GXx9Nnxr9v98PozdFxTwbnHTEe7m8Pd1-7G1w0Wnc0yFEYVJPRsw-dWV-LrFyXZV6S3GZlMSmKJOUi3aQ8XadpmpPbvCrLokzJj6pFmWSxKC8bP8VzQr7hzFotcJO8ApvlBfSVL-4)

## Componentes Implementados

### 1. Scripts Automatizados

- **pg_backup.py**: Script Python para criar dumps do PostgreSQL e enviar para S3
- **pg_restore.py**: Script para restaurar a base de dados a partir de um backup
- **Integração Celery**: Task agendada para executar backups diários automaticamente

### 2. Armazenamento Redundante

- Utilização de storage S3-compatible para armazenamento durável
- Organização hierárquica por data: `/database_backups/YYYY/MM/DD/`
- Compressão GZIP para reduzir uso de armazenamento
- Class de storage "Infrequent Access" para economia de custos

### 3. Política de Retenção

- Backups diários mantidos por 30 dias
- Limpeza automática de backups expirados
- Logs detalhados de todas as operações de backup e limpeza

## Procedimentos de Recuperação

### Recuperação de Desastres (DR)

Em caso de falha crítica, siga os passos abaixo:

1. **Listar backups disponíveis**:

   ```bash
   python scripts/backup/pg_restore.py --list
   ```

2. **Restaurar o backup mais recente**:

   ```bash
   python scripts/backup/pg_restore.py --latest
   ```

3. **Restaurar um backup específico**:

   ```bash
   python scripts/backup/pg_restore.py --key database_backups/2023/05/15/celebra_capital_20230515_031012.sql.gz
   ```

4. **Verificar integridade após recuperação**:
   ```bash
   python manage.py check --database default
   ```

### Recuperação Parcial

Para recuperação de dados específicos sem restaurar toda a base:

1. Baixar o backup para ambiente de desenvolvimento
2. Restaurar em uma base temporária
3. Extrair dados específicos via SQL
4. Importar dados na base de produção

## Testes e Validação

A estratégia de backup deve ser testada regularmente:

- **Testes Mensais**: Simulação de recuperação de desastres
- **Verificação Semanal**: Validação da integridade dos backups
- **Auditoria Trimestral**: Revisão da política e procedimentos

## Monitoramento e Alertas

- Logs detalhados das operações de backup são mantidos
- Alertas via Sentry em caso de falhas nos backups
- Relatório semanal de status de backups

## Requisitos de Infraestrutura

- PostgreSQL 12+
- Python 3.8+
- Dependências: boto3, psycopg2
- Bucket S3 ou compatível configurado
- Credenciais IAM com permissões adequadas

## Variáveis de Ambiente

| Variável                | Descrição            | Padrão       |
| ----------------------- | -------------------- | ------------ |
| `BACKUP_S3_BUCKET`      | Nome do bucket S3    | -            |
| `AWS_ACCESS_KEY_ID`     | Chave de acesso AWS  | -            |
| `AWS_SECRET_ACCESS_KEY` | Chave secreta AWS    | -            |
| `AWS_S3_REGION_NAME`    | Região AWS           | us-east-1    |
| `BACKUP_RETENTION_DAYS` | Dias de retenção     | 30           |
| `BACKUP_DIR`            | Diretório temporário | /tmp/backups |

## Próximos Passos

- [ ] Implementar backup incrementais para reduzir tráfego de rede
- [ ] Adicionar criptografia AES-256 para backups
- [ ] Implementar verificação automática de integridade
- [ ] Configurar réplica de banco de dados em standby

---

**Mantenedor**: Equipe de Infraestrutura da Celebra Capital  
**Última Atualização**: Abril 2025
