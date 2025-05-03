# Guia de Integração para Desenvolvedores

## Introdução

Este guia contém informações necessárias para desenvolvedores que desejam integrar seus sistemas com a plataforma de pré-análise de crédito da Celebra Capital. Ele abrange autenticação, endpoints disponíveis, exemplos de requisições e respostas, e práticas recomendadas.

## Visão Geral da API

A API da Celebra Capital segue os princípios RESTful e utiliza JSON como formato principal para troca de dados. Todas as requisições devem ser feitas via HTTPS para garantir a segurança das informações transmitidas.

### Ambientes Disponíveis

| Ambiente    | URL Base                                       | Descrição                             |
| ----------- | ---------------------------------------------- | ------------------------------------- |
| Produção    | `https://api.celebracapital.com.br/v1`         | Ambiente de produção                  |
| Homologação | `https://api-hml.celebracapital.com.br/v1`     | Ambiente para testes de integração    |
| Sandbox     | `https://api-sandbox.celebracapital.com.br/v1` | Ambiente para desenvolvimento inicial |

## Autenticação e Autorização

### Obtenção de Credenciais

Para utilizar a API, você precisa solicitar credenciais enviando um e-mail para parcerias@celebracapital.com.br com as seguintes informações:

1. Nome da empresa
2. CNPJ
3. Nome do responsável técnico
4. E-mail do responsável técnico
5. Telefone para contato
6. Breve descrição do caso de uso da integração

### Autenticação via OAuth 2.0

A API utiliza o protocolo OAuth 2.0 para autenticação. Siga os passos abaixo para obter um token de acesso:

1. Faça uma requisição POST para o endpoint de autenticação:

```
POST /oauth/token
Host: auth.celebracapital.com.br
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&client_id=SEU_CLIENT_ID&client_secret=SEU_CLIENT_SECRET
```

2. Você receberá uma resposta com o token de acesso:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "scope": "read write"
}
```

3. Utilize o token em todas as requisições subsequentes no cabeçalho Authorization:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Renovação de Token

Os tokens de acesso expiram após o tempo definido no campo `expires_in` (em segundos). Para renovar o token, basta fazer uma nova requisição ao endpoint de autenticação.

## Endpoints Disponíveis

### Propostas

#### Listar Propostas

```
GET /propostas
```

Parâmetros de consulta:

- `status` (opcional): Filtra por status (em_analise, aprovada, rejeitada)
- `data_inicio` (opcional): Data inicial (formato YYYY-MM-DD)
- `data_fim` (opcional): Data final (formato YYYY-MM-DD)
- `pagina` (opcional): Número da página (padrão: 1)
- `limite` (opcional): Limite de itens por página (padrão: 20, máx: 100)

Exemplo de resposta:

```json
{
  "total": 125,
  "pagina": 1,
  "limite": 20,
  "propostas": [
    {
      "id": "f7c45e9a-1d98-4b3c-8a2d-3b5683cf8b21",
      "status": "em_analise",
      "cliente": {
        "nome": "João Silva",
        "documento": "123.456.789-00"
      },
      "valor_solicitado": 50000.0,
      "data_criacao": "2023-06-15T14:32:10Z"
    }
    // ... mais propostas
  ]
}
```

#### Obter Detalhes da Proposta

```
GET /propostas/{id_proposta}
```

Exemplo de resposta:

```json
{
  "id": "f7c45e9a-1d98-4b3c-8a2d-3b5683cf8b21",
  "status": "em_analise",
  "cliente": {
    "nome": "João Silva",
    "documento": "123.456.789-00",
    "email": "joao.silva@exemplo.com",
    "telefone": "(11) 98765-4321",
    "endereco": {
      "logradouro": "Rua das Flores",
      "numero": "123",
      "complemento": "Apto 45",
      "bairro": "Jardim Primavera",
      "cidade": "São Paulo",
      "estado": "SP",
      "cep": "01234-567"
    }
  },
  "proposta": {
    "valor_solicitado": 50000.0,
    "parcelas": 36,
    "taxa_juros": 1.25,
    "finalidade": "capital_de_giro",
    "garantias": ["imovel", "aval"]
  },
  "documentos": [
    {
      "id": "doc-001",
      "tipo": "contrato_social",
      "status": "verificado",
      "url_visualizacao": "https://docs.celebracapital.com.br/view/doc-001"
    }
    // ... mais documentos
  ],
  "historico": [
    {
      "data": "2023-06-15T14:32:10Z",
      "evento": "proposta_criada",
      "descricao": "Proposta criada pelo cliente"
    }
    // ... mais eventos
  ],
  "data_criacao": "2023-06-15T14:32:10Z",
  "data_atualizacao": "2023-06-16T10:15:22Z"
}
```

#### Criar Nova Proposta

```
POST /propostas
```

Exemplo de requisição:

```json
{
  "cliente": {
    "nome": "João Silva",
    "documento": "123.456.789-00",
    "email": "joao.silva@exemplo.com",
    "telefone": "(11) 98765-4321",
    "endereco": {
      "logradouro": "Rua das Flores",
      "numero": "123",
      "complemento": "Apto 45",
      "bairro": "Jardim Primavera",
      "cidade": "São Paulo",
      "estado": "SP",
      "cep": "01234-567"
    }
  },
  "proposta": {
    "valor_solicitado": 50000.0,
    "parcelas": 36,
    "finalidade": "capital_de_giro",
    "garantias": ["imovel", "aval"]
  }
}
```

Exemplo de resposta:

```json
{
  "id": "f7c45e9a-1d98-4b3c-8a2d-3b5683cf8b21",
  "status": "criada",
  "mensagem": "Proposta criada com sucesso",
  "proximos_passos": [
    {
      "passo": "enviar_documentos",
      "endpoint": "/propostas/f7c45e9a-1d98-4b3c-8a2d-3b5683cf8b21/documentos"
    }
  ]
}
```

#### Atualizar Proposta

```
PUT /propostas/{id_proposta}
```

Exemplo de requisição:

```json
{
  "proposta": {
    "valor_solicitado": 60000.0,
    "parcelas": 48
  }
}
```

Exemplo de resposta:

```json
{
  "id": "f7c45e9a-1d98-4b3c-8a2d-3b5683cf8b21",
  "mensagem": "Proposta atualizada com sucesso"
}
```

### Documentos

#### Listar Documentos de uma Proposta

```
GET /propostas/{id_proposta}/documentos
```

Exemplo de resposta:

```json
{
  "proposta_id": "f7c45e9a-1d98-4b3c-8a2d-3b5683cf8b21",
  "documentos": [
    {
      "id": "doc-001",
      "tipo": "contrato_social",
      "status": "verificado",
      "data_upload": "2023-06-15T15:10:30Z",
      "url_visualizacao": "https://docs.celebracapital.com.br/view/doc-001"
    }
    // ... mais documentos
  ],
  "documentos_pendentes": [
    {
      "tipo": "balanco_patrimonial",
      "obrigatorio": true,
      "descricao": "Balanço Patrimonial dos últimos 2 anos"
    }
  ]
}
```

#### Enviar Documento

```
POST /propostas/{id_proposta}/documentos
```

Esta requisição deve ser feita como `multipart/form-data`.

Parâmetros:

- `tipo` (obrigatório): Tipo do documento
- `arquivo` (obrigatório): Arquivo PDF ou imagem
- `descricao` (opcional): Descrição adicional

Exemplo de resposta:

```json
{
  "id": "doc-002",
  "proposta_id": "f7c45e9a-1d98-4b3c-8a2d-3b5683cf8b21",
  "tipo": "balanco_patrimonial",
  "status": "em_processamento",
  "mensagem": "Documento enviado com sucesso e está sendo processado"
}
```

#### Obter Status do Documento

```
GET /propostas/{id_proposta}/documentos/{id_documento}
```

Exemplo de resposta:

```json
{
  "id": "doc-002",
  "proposta_id": "f7c45e9a-1d98-4b3c-8a2d-3b5683cf8b21",
  "tipo": "balanco_patrimonial",
  "status": "verificado",
  "resultados_ocr": {
    "data_documento": "2022-12-31",
    "campos_extraidos": {
      "ativo_total": 1250000.5,
      "passivo_total": 850000.25,
      "patrimonio_liquido": 400000.25
    }
  },
  "data_upload": "2023-06-15T15:10:30Z",
  "data_verificacao": "2023-06-15T15:12:45Z"
}
```

### Assinatura Digital

#### Iniciar Processo de Assinatura

```
POST /propostas/{id_proposta}/assinatura
```

Exemplo de requisição:

```json
{
  "signatarios": [
    {
      "nome": "João Silva",
      "email": "joao.silva@exemplo.com",
      "documento": "123.456.789-00",
      "telefone": "(11) 98765-4321"
    },
    {
      "nome": "Maria Oliveira",
      "email": "maria.oliveira@exemplo.com",
      "documento": "987.654.321-00",
      "telefone": "(11) 91234-5678"
    }
  ],
  "notificacao": {
    "enviar_email": true,
    "enviar_sms": true,
    "mensagem_personalizada": "Por favor, assine o contrato para continuarmos com sua proposta de crédito."
  }
}
```

Exemplo de resposta:

```json
{
  "id": "sign-789",
  "proposta_id": "f7c45e9a-1d98-4b3c-8a2d-3b5683cf8b21",
  "status": "aguardando_assinaturas",
  "url_acompanhamento": "https://assinatura.celebracapital.com.br/acompanhar/sign-789",
  "signatarios": [
    {
      "nome": "João Silva",
      "email": "joao.silva@exemplo.com",
      "status": "pendente",
      "url_assinatura": "https://assinatura.celebracapital.com.br/assinar/sign-789/token-joao"
    },
    {
      "nome": "Maria Oliveira",
      "email": "maria.oliveira@exemplo.com",
      "status": "pendente",
      "url_assinatura": "https://assinatura.celebracapital.com.br/assinar/sign-789/token-maria"
    }
  ]
}
```

#### Verificar Status da Assinatura

```
GET /propostas/{id_proposta}/assinatura/{id_assinatura}
```

Exemplo de resposta:

```json
{
  "id": "sign-789",
  "proposta_id": "f7c45e9a-1d98-4b3c-8a2d-3b5683cf8b21",
  "status": "parcialmente_assinado",
  "signatarios": [
    {
      "nome": "João Silva",
      "email": "joao.silva@exemplo.com",
      "status": "assinado",
      "data_assinatura": "2023-06-16T14:25:10Z",
      "ip_assinatura": "187.98.45.123"
    },
    {
      "nome": "Maria Oliveira",
      "email": "maria.oliveira@exemplo.com",
      "status": "pendente"
    }
  ],
  "documento": {
    "id": "doc-010",
    "tipo": "contrato_assinado",
    "url_visualizacao": "https://docs.celebracapital.com.br/view/doc-010"
  }
}
```

### Webhooks

#### Registrar Webhook

```
POST /webhooks
```

Exemplo de requisição:

```json
{
  "url": "https://meusite.com.br/celebra-callback",
  "eventos": [
    "proposta.criada",
    "proposta.atualizada",
    "proposta.aprovada",
    "proposta.rejeitada",
    "documento.processado",
    "assinatura.concluida"
  ],
  "secret": "umTokenSecretoParaVerificarAuthenticidade"
}
```

Exemplo de resposta:

```json
{
  "id": "wh-123",
  "url": "https://meusite.com.br/celebra-callback",
  "eventos": [
    "proposta.criada",
    "proposta.atualizada",
    "proposta.aprovada",
    "proposta.rejeitada",
    "documento.processado",
    "assinatura.concluida"
  ],
  "status": "ativo"
}
```

#### Estrutura de Eventos

Quando um evento ocorre, enviamos uma requisição POST para a URL cadastrada com o seguinte formato:

```json
{
  "id": "evt-456",
  "tipo": "proposta.aprovada",
  "data_evento": "2023-06-17T10:45:30Z",
  "dados": {
    "proposta_id": "f7c45e9a-1d98-4b3c-8a2d-3b5683cf8b21",
    "status": "aprovada",
    "detalhes": {
      "valor_aprovado": 50000.0,
      "parcelas": 36,
      "taxa_juros": 1.25
    }
  }
}
```

A requisição incluirá um cabeçalho `X-Celebra-Signature` contendo uma assinatura HMAC-SHA256 do corpo da requisição, utilizando o secret fornecido no momento do registro do webhook. Use essa assinatura para verificar a autenticidade da requisição.

## Códigos de Erro

| Código | Descrição                | Solução                                               |
| ------ | ------------------------ | ----------------------------------------------------- |
| 400    | Requisição inválida      | Verifique os parâmetros enviados                      |
| 401    | Não autorizado           | Verifique as credenciais de autenticação              |
| 403    | Acesso proibido          | Verifique as permissões da sua aplicação              |
| 404    | Recurso não encontrado   | Verifique o ID ou endpoint utilizado                  |
| 422    | Erro de validação        | Verifique os dados enviados conforme mensagem de erro |
| 429    | Muitas requisições       | Respeite os limites de taxa da API                    |
| 500    | Erro interno do servidor | Entre em contato com o suporte                        |

## Limites de Taxa (Rate Limits)

Para garantir a estabilidade e disponibilidade da API, aplicamos limites de requisições:

- **Plano Básico**: 60 requisições por minuto
- **Plano Profissional**: 300 requisições por minuto
- **Plano Enterprise**: 1.000 requisições por minuto

As respostas incluem os seguintes cabeçalhos para monitoramento:

- `X-RateLimit-Limit`: Número máximo de requisições permitidas
- `X-RateLimit-Remaining`: Número de requisições restantes no período atual
- `X-RateLimit-Reset`: Timestamp Unix indicando quando o limite será resetado

Quando o limite é excedido, a API retorna o código 429 (Too Many Requests).

## Práticas Recomendadas

### Tratamento de Erros

- Sempre verifique o código de status HTTP da resposta
- Implemente retry com backoff exponencial para falhas temporárias (503, 504)
- Armazene logs detalhados das requisições para facilitar depuração

### Segurança

- Nunca compartilhe suas credenciais de API
- Utilize HTTPS para todas as comunicações
- Implemente verificação da assinatura em webhooks
- Armazene tokens de forma segura, nunca em código-fonte ou repositórios

### Performance

- Implemente cache para respostas frequentes
- Utilize os filtros disponíveis nas listagens para reduzir o volume de dados
- Verifique regularmente o status do webhook para garantir que está recebendo atualizações

## Suporte e Contato

Para dúvidas, sugestões ou problemas técnicos, entre em contato:

- **Email**: api-suporte@celebracapital.com.br
- **Portal do Desenvolvedor**: https://developers.celebracapital.com.br
- **Status da API**: https://status.celebracapital.com.br

## Mudanças na API

Todas as mudanças são documentadas em nosso [Changelog](https://developers.celebracapital.com.br/changelog).

Para ser notificado sobre mudanças importantes, inscreva-se em nossa [lista de e-mails para desenvolvedores](https://developers.celebracapital.com.br/newsletter).

---

_Esta documentação é atualizada regularmente. Última atualização: Julho 2023._
