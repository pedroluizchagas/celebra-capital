# Integração com Clicksign

Este documento descreve a integração da plataforma Celebra Capital com o serviço de assinatura digital Clicksign.

## Visão Geral

A plataforma Celebra Capital utiliza o Clicksign como provedor principal para assinatura digital de documentos. Esta integração permite que os usuários assinem contratos e documentos de forma segura e com validade jurídica.

## Arquitetura

A integração é composta por:

1. **Cliente da API Clicksign**: Um cliente para comunicação com a API REST do Clicksign
2. **Serviço de Assinatura**: Um serviço agnóstico de provedor que pode alternar entre Clicksign e D4Sign
3. **Componente Frontend**: Interface de usuário para interação com o processo de assinatura

## Configuração

Para configurar a integração com o Clicksign, as seguintes variáveis de ambiente devem ser definidas:

```env
# Provedor padrão
SIGNATURE_PROVIDER=clicksign

# Configurações do Clicksign
CLICKSIGN_API_KEY=sua_api_key
CLICKSIGN_BASE_URL=https://app.clicksign.com/api/v1
```

## Fluxo de Assinatura

O fluxo de assinatura segue os seguintes passos:

1. **Preparação do Documento**:

   - Um PDF do contrato é gerado a partir dos dados da proposta
   - O documento é enviado para o Clicksign

2. **Adição de Signatário**:

   - O usuário é registrado como signatário no Clicksign
   - Uma URL de assinatura é gerada

3. **Processo de Assinatura**:

   - O usuário é redirecionado para a interface do Clicksign
   - A assinatura é realizada diretamente na plataforma do Clicksign

4. **Verificação e Download**:
   - O sistema verifica periodicamente o status da assinatura
   - Após a conclusão, o documento assinado fica disponível para download

## Implementação Backend

O cliente da API do Clicksign (`ClicksignClient`) fornece métodos para:

- Upload de documentos
- Gerenciamento de signatários
- Verificação de status
- Download de documentos assinados

O serviço de assinatura (`SignatureService`) abstrai as operações e permite alternar entre Clicksign e D4Sign.

## Implementação Frontend

O componente `ClickSignComponent` oferece uma interface para o usuário:

- Solicitar a preparação do documento para assinatura
- Acompanhar o status da assinatura
- Acessar a interface do Clicksign
- Visualizar e baixar documentos assinados

## Modelo de Dados

```
Signature:
  - proposal (ForeignKey): Relação com o modelo Proposal
  - signature_id (CharField): ID do documento no Clicksign
  - signature_url (URLField): URL para assinatura no Clicksign
  - is_signed (BooleanField): Indica se o documento foi assinado
  - provider (CharField): Indica o provedor de assinatura em uso (clicksign/d4sign)
  - signature_date (DateTimeField): Data e hora da assinatura
  - ip_address (IPAddressField): Endereço IP do signatário
```

## Considerações de Segurança

- Todas as comunicações com a API do Clicksign são realizadas via HTTPS
- A chave de API do Clicksign é armazenada como variável de ambiente, não no código fonte
- Os documentos são acessíveis apenas aos usuários autorizados
- Os eventos de assinatura são registrados para fins de auditoria

## Troubleshooting

### Problemas comuns:

1. **Erro na API do Clicksign**:

   - Verificar se a chave de API está correta
   - Confirmar se o documento está em formato válido

2. **URL de assinatura não funcionando**:

   - A URL pode ter expirado (validade de 15 dias)
   - Verificar se o signatário está configurado corretamente

3. **Status não atualiza**:
   - Verificar a conectividade com a API do Clicksign
   - Confirmar que o webhook do Clicksign está configurado corretamente

## Melhorias Futuras

- Implementação de webhooks para notificações em tempo real
- Suporte a múltiplos signatários por documento
- Opções de autenticação avançada (SMS, certificado digital)
- Personalização da interface de assinatura
