# Documentação Técnica: Assinatura Digital

## Visão Geral

A funcionalidade de assinatura digital implementa a integração com a plataforma **D4Sign** para permitir que os usuários assinem documentos de forma eletrônica. Esta documentação descreve os componentes, fluxos e APIs envolvidos no processo.

## Componentes Frontend

### 1. SignaturePanel

Componente responsável por exibir o status atual da assinatura e permitir o download do documento assinado.

**Funcionalidades:**

- Consulta periódica do status da assinatura (a cada 30 segundos se pendente)
- Exibição visual do status (pendente, completa, com erro)
- Botão para download do documento assinado quando disponível
- Feedback acessível e informativo sobre o processo

**Localização:** `frontend/src/components/SignaturePanel.tsx`

### 2. SignDocumentButton

Componente de botão que inicia o processo de assinatura.

**Funcionalidades:**

- Solicita o início do processo de assinatura
- Exibe feedback visual durante o processamento
- Notifica o usuário sobre o sucesso ou falha da operação
- Suporta um callback para notificar o componente pai quando a assinatura é iniciada

**Localização:** `frontend/src/components/SignDocumentButton.tsx`

### 3. SignatureDemo

Página de demonstração que utiliza os componentes acima para mostrar o fluxo completo de assinatura.

**Funcionalidades:**

- Exibe detalhes da proposta
- Permite iniciar o processo de assinatura
- Mostra o painel de status da assinatura após iniciado o processo

**Localização:** `frontend/src/pages/SignatureDemo.tsx`

## Integração com Backend

### Endpoints da API

| Endpoint                              | Método | Descrição                                         |
| ------------------------------------- | ------ | ------------------------------------------------- |
| `/signatures/{proposal_id}/`          | GET    | Obter o status da assinatura                      |
| `/signatures/{proposal_id}/`          | POST   | Enviar assinatura (caso implementado no frontend) |
| `/signatures/{proposal_id}/status/`   | GET    | Endpoint específico para verificar status         |
| `/signatures/{proposal_id}/request/`  | POST   | Solicitar nova assinatura                         |
| `/signatures/{proposal_id}/download/` | GET    | Baixar documento assinado                         |

### Serviço de Proposta (Frontend)

O arquivo `proposalService.ts` inclui os seguintes métodos para trabalhar com assinaturas:

```typescript
// Enviar solicitação de assinatura
submitSignature: async (proposalId: number): Promise<void>

// Verificar status da assinatura
getSignatureStatus: async (proposalId: number): Promise<SignatureStatus>

// Obter URL para download do documento assinado
getSignedDocumentUrl: (proposalId: number): string
```

## Implementação Backend

### Tecnologias Utilizadas

- **D4Sign API**: Plataforma de assinatura digital certificada
- **Celery**: Para processamento assíncrono e verificação periódica de status
- **Redis**: Para fila de tarefas do Celery

### Fluxo de Assinatura

1. O usuário solicita a assinatura de um documento
2. O backend gera o PDF do contrato
3. O contrato é enviado para a D4Sign
4. A D4Sign retorna um link de assinatura e um identificador
5. O frontend exibe o status da assinatura
6. A assinatura é realizada pelo usuário através da D4Sign
7. Celery verifica periodicamente o status da assinatura
8. Quando a assinatura é concluída, o status é atualizado no banco de dados

## Monitoramento e Tarefas Assíncronas

### Tarefas Celery

- `check_signature_status`: Verifica o status de assinaturas pendentes
- `generate_signature_reminders`: Gera lembretes para assinaturas não concluídas

### Periodicidade

- Verificação de status: A cada 10 minutos
- Geração de lembretes: Duas vezes por dia

## Segurança

- Todas as requisições exigem autenticação
- Verificação de permissão para acessar propostas
- Validação de IP do usuário para auditoria
- Registros de log detalhados de todas as operações

## Testes

Os componentes de assinatura possuem testes automatizados implementados em:

- `frontend/src/components/SignaturePanel.test.tsx`
- `frontend/src/components/SignDocumentButton.test.tsx`

## Troubleshooting

### Problemas Comuns

1. **Status não atualiza**: Verifique se as tarefas Celery estão em execução
2. **Erro ao baixar documento**: Certifique-se de que a assinatura foi realmente concluída
3. **Link de assinatura não funciona**: Verifique a configuração da D4Sign no ambiente

### Logs

Os logs estão estruturados com `structlog` e podem ser consultados para depuração. Eventos importantes:

- `signature_request_created`: Quando uma solicitação é criada
- `signature_completed`: Quando uma assinatura é concluída
- `signature_failed`: Quando ocorre um erro no processo

## Referências

- [Documentação da API D4Sign](https://docapi.d4sign.com.br/)
- [Documentação do Django REST Framework](https://www.django-rest-framework.org/)
- [Documentação do Celery](https://docs.celeryq.dev/)
