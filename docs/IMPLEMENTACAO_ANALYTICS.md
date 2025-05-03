# Implementação de Analytics

## Plataforma de Pré-Análise de Crédito - Celebra Capital

---

## Índice

1. [Introdução](#introdução)
2. [Objetivos de Medição](#objetivos-de-medição)
3. [Eventos Rastreados](#eventos-rastreados)
   - [Eventos de Usuário](#eventos-de-usuário)
   - [Eventos de Proposta](#eventos-de-proposta)
   - [Eventos de Documento](#eventos-de-documento)
   - [Eventos de Sistema](#eventos-de-sistema)
4. [Implementação Técnica](#implementação-técnica)
   - [Camada de Coleta de Dados](#camada-de-coleta-de-dados)
   - [Armazenamento de Dados](#armazenamento-de-dados)
   - [Processamento de Dados](#processamento-de-dados)
5. [Dashboards e Relatórios](#dashboards-e-relatórios)
   - [Dashboard Executivo](#dashboard-executivo)
   - [Dashboard Operacional](#dashboard-operacional)
   - [Dashboard de Marketing](#dashboard-de-marketing)
6. [KPIs Principais](#kpis-principais)
7. [Segmentação e Análise](#segmentação-e-análise)
8. [Privacidade e Conformidade](#privacidade-e-conformidade)
9. [Manutenção e Evolução](#manutenção-e-evolução)

---

## Introdução

Este documento descreve a implementação do sistema de analytics para a Plataforma de Pré-Análise de Crédito da Celebra Capital. A solução foi projetada para coletar, processar e visualizar dados relevantes sobre o uso da plataforma, comportamento dos usuários e performance dos processos de negócio.

O sistema de analytics permite à Celebra Capital tomar decisões baseadas em dados, identificar gargalos operacionais, otimizar a experiência do usuário e medir o impacto de mudanças na plataforma.

## Objetivos de Medição

O sistema de analytics foi implementado com os seguintes objetivos:

1. **Performance da Plataforma**: Monitorar tempo de resposta, disponibilidade e erros
2. **Comportamento do Usuário**: Entender como os usuários navegam e utilizam a plataforma
3. **Funil de Conversão**: Medir taxas de conversão em cada etapa do processo de proposta
4. **Qualidade do Processo**: Identificar gargalos e oportunidades de melhoria no fluxo de análise
5. **Eficácia do Produto**: Avaliar se a plataforma está atingindo os objetivos de negócio
6. **Segmentação de Clientes**: Entender diferentes perfis de usuários e comportamentos

## Eventos Rastreados

### Eventos de Usuário

| Categoria    | Evento               | Propriedades                                                     |
| ------------ | -------------------- | ---------------------------------------------------------------- |
| Acesso       | login_sucesso        | {id_usuario, timestamp, dispositivo, navegador, ip}              |
| Acesso       | login_falha          | {email_tentativa, razao_falha, timestamp, ip}                    |
| Acesso       | logout               | {id_usuario, duracao_sessao, timestamp}                          |
| Cadastro     | cadastro_iniciado    | {origem, timestamp}                                              |
| Cadastro     | cadastro_concluido   | {id_usuario, timestamp, campos_preenchidos, tempo_preenchimento} |
| Navegação    | pagina_visualizada   | {id_usuario, pagina, timestamp, tempo_permanencia, origem}       |
| Navegação    | busca_realizada      | {id_usuario, termo_busca, resultados, timestamp}                 |
| Interação    | botao_clicado        | {id_usuario, botao_id, pagina, timestamp}                        |
| Interação    | filtro_aplicado      | {id_usuario, filtros, timestamp}                                 |
| Configuração | perfil_atualizado    | {id_usuario, campos_atualizados, timestamp}                      |
| Configuração | notificacao_alterada | {id_usuario, canal, estado, timestamp}                           |

### Eventos de Proposta

| Categoria | Evento               | Propriedades                                                                         |
| --------- | -------------------- | ------------------------------------------------------------------------------------ |
| Proposta  | proposta_iniciada    | {id_usuario, tipo_proposta, origem, timestamp}                                       |
| Proposta  | etapa_concluida      | {id_usuario, id_proposta, etapa, tempo_preenchimento, timestamp}                     |
| Proposta  | proposta_salva       | {id_usuario, id_proposta, etapa_atual, timestamp, completa}                          |
| Proposta  | proposta_enviada     | {id_usuario, id_proposta, valor_solicitado, prazo, timestamp}                        |
| Proposta  | proposta_visualizada | {id_usuario, id_proposta, timestamp}                                                 |
| Proposta  | proposta_abandonada  | {id_usuario, id_proposta, etapa, timestamp, tempo_inativo}                           |
| Análise   | status_alterado      | {id_proposta, status_anterior, status_novo, responsavel, timestamp, tempo_no_status} |
| Análise   | proposta_aprovada    | {id_proposta, valor_aprovado, valor_solicitado, taxa, prazo, timestamp}              |
| Análise   | proposta_rejeitada   | {id_proposta, motivo, timestamp, detalhes}                                           |

### Eventos de Documento

| Categoria  | Evento                | Propriedades                                                                     |
| ---------- | --------------------- | -------------------------------------------------------------------------------- |
| Documento  | upload_iniciado       | {id_usuario, id_proposta, tipo_documento, tamanho, formato, timestamp}           |
| Documento  | upload_concluido      | {id_usuario, id_proposta, id_documento, tipo_documento, timestamp, tempo_upload} |
| Documento  | upload_falha          | {id_usuario, id_proposta, tipo_documento, erro, timestamp}                       |
| Documento  | documento_visualizado | {id_usuario, id_documento, timestamp, duracao_visualizacao}                      |
| Documento  | documento_rejeitado   | {id_proposta, id_documento, motivo, timestamp}                                   |
| Documento  | ocr_realizado         | {id_documento, tempo_processamento, campos_extraidos, confianca, timestamp}      |
| Assinatura | assinatura_iniciada   | {id_proposta, id_documento, signatarios, timestamp}                              |
| Assinatura | assinatura_concluida  | {id_proposta, id_documento, id_usuario, metodo, timestamp, duracao}              |

### Eventos de Sistema

| Categoria   | Evento                    | Propriedades                                                              |
| ----------- | ------------------------- | ------------------------------------------------------------------------- |
| Performance | api_request               | {endpoint, metodo, status_code, tempo_resposta, timestamp}                |
| Performance | erro_sistema              | {tipo, detalhes, stack_trace, componente, timestamp}                      |
| Performance | ocr_processamento         | {id_documento, tipo_documento, tempo_processamento, resultado, timestamp} |
| Integração  | webhook_enviado           | {evento, destino, status, timestamp, payload_size}                        |
| Integração  | api_externa_chamada       | {servico, endpoint, status, tempo_resposta, timestamp}                    |
| Segurança   | tentativa_acesso_invalido | {ip, rota, metodo, timestamp, headers}                                    |

## Implementação Técnica

### Camada de Coleta de Dados

A coleta de dados é implementada através de múltiplas camadas:

1. **Frontend**:

   - Implementação do Google Analytics 4 para eventos básicos de interação
   - Biblioteca personalizada de tracking para eventos específicos de negócio
   - Uso de data attributes (data-tracking-\*) para facilitar rastreamento de elementos DOM

2. **Backend**:

   - Middleware de logging para requisições HTTP
   - Decorators/Interceptors em serviços críticos
   - Hooks em modelos de dados para eventos de CRUD

3. **Instrumentação de Código**:
   - OpenTelemetry para rastreamento de performance
   - Logs estruturados em JSON
   - Contexto propagado entre serviços

**Exemplo de implementação frontend:**

```javascript
// analytics.js
class CelebraAnalytics {
  trackEvent(category, action, props = {}) {
    // Adiciona propriedades padrão
    const enrichedProps = {
      ...props,
      timestamp: new Date().toISOString(),
      session_id: this.getSessionId(),
      user_id: this.getUserId(),
    }

    // Envia para Google Analytics
    window.gtag('event', action, {
      event_category: category,
      ...enrichedProps,
    })

    // Envia para nossa API
    fetch('/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        action,
        properties: enrichedProps,
      }),
    }).catch((err) => console.error('Erro ao enviar evento:', err))
  }

  // Outros métodos auxiliares
  getSessionId() {
    /* ... */
  }
  getUserId() {
    /* ... */
  }
}

// Exporta instância única
export const analytics = new CelebraAnalytics()
```

**Exemplo de implementação backend:**

```python
# middleware.py
class AnalyticsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()
        response = self.get_response(request)
        duration = time.time() - start_time

        # Registra evento de requisição
        self.track_request(request, response, duration)

        return response

    def track_request(self, request, response, duration):
        # Ignora requisições para assets estáticos
        if request.path.startswith('/static/'):
            return

        event_data = {
            'path': request.path,
            'method': request.method,
            'status_code': response.status_code,
            'user_id': request.user.id if request.user.is_authenticated else None,
            'duration_ms': int(duration * 1000),
            'ip': self.get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', '')
        }

        # Envia para serviço de analytics
        analytics_service.track('api_request', event_data)
```

### Armazenamento de Dados

Os dados de analytics são armazenados em múltiplas camadas:

1. **Armazenamento de Curto Prazo**:

   - Elasticsearch para logs e eventos recentes (30 dias)
   - Redis para métricas em tempo real e contadores

2. **Armazenamento de Longo Prazo**:

   - Data Warehouse baseado em PostgreSQL
   - Particionamento de tabelas por data
   - Políticas de retenção e agregação

3. **Esquema de Dados**:
   - Modelo de estrela com tabelas de fatos e dimensões
   - Desnormalização estratégica para performance de consulta
   - Índices otimizados para consultas frequentes

**Exemplo de esquema para eventos:**

```sql
CREATE TABLE fact_events (
    event_id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    event_category VARCHAR(50) NOT NULL,
    event_timestamp TIMESTAMP NOT NULL,
    session_id VARCHAR(36),
    user_id INTEGER REFERENCES dim_users(user_id),
    proposal_id INTEGER REFERENCES dim_proposals(proposal_id),
    document_id INTEGER REFERENCES dim_documents(document_id),
    properties JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (event_timestamp);

-- Partição mensal
CREATE TABLE fact_events_202307 PARTITION OF fact_events
    FOR VALUES FROM ('2023-07-01') TO ('2023-08-01');
```

### Processamento de Dados

O processamento dos dados de analytics ocorre em pipeline:

1. **Ingestão em Tempo Real**:

   - Kafka para mensageria de eventos
   - Validação e enriquecimento inicial

2. **Processamento em Lote**:

   - Jobs diários para agregações
   - Cálculo de métricas derivadas
   - Detecção de anomalias

3. **Processamento de Stream**:
   - Alertas em tempo real
   - Dashboards atualizados continuamente
   - Detecção de fraudes

**Exemplo de pipeline de processamento:**

```python
# Pipeline de processamento de eventos
def process_event_stream():
    consumer = KafkaConsumer('analytics_events')

    for message in consumer:
        event = json.loads(message.value)

        # 1. Valida e normaliza
        validated_event = validate_and_normalize(event)
        if not validated_event:
            continue

        # 2. Enriquece com dados contextuais
        enriched_event = enrich_event(validated_event)

        # 3. Armazena evento raw
        store_raw_event(enriched_event)

        # 4. Processa em tempo real se necessário
        if requires_realtime_processing(enriched_event):
            process_realtime(enriched_event)

        # 5. Atualiza contadores e métricas
        update_metrics(enriched_event)
```

## Dashboards e Relatórios

### Dashboard Executivo

O Dashboard Executivo fornece uma visão de alto nível dos KPIs principais da plataforma:

- **Métricas Principais**:

  - Volume total de propostas
  - Taxa de aprovação
  - Valor médio aprovado
  - Tempo médio de análise
  - Satisfação do usuário (NPS)

- **Visualizações**:
  - Gráficos de tendência (últimos 12 meses)
  - Comparação com metas estabelecidas
  - Alertas para desvios significativos

### Dashboard Operacional

O Dashboard Operacional é focado no monitoramento diário das operações:

- **Métricas de Processo**:

  - Propostas por status
  - Tempo em cada etapa
  - Backlog por analista
  - Taxa de retrabalho (documentos rejeitados)

- **Visualizações**:
  - Funil de conversão
  - Mapa de calor de gargalos
  - Filas de trabalho por equipe

### Dashboard de Marketing

O Dashboard de Marketing foca em aquisição e comportamento de usuários:

- **Métricas de Aquisição**:

  - Novos usuários por canal
  - Custo de aquisição por canal
  - Taxa de conversão por origem

- **Métricas de Comportamento**:
  - Fluxos de navegação comuns
  - Taxas de abandono
  - Tempo até primeira proposta

## KPIs Principais

Os KPIs principais monitorados pela plataforma são:

1. **Taxa de Conversão do Funil**

   - Definição: % de usuários que avançam entre etapas chave
   - Fórmula: (Usuários na etapa N+1 / Usuários na etapa N) \* 100
   - Meta: Incremento de 5% trimestral

2. **Tempo Médio de Análise**

   - Definição: Tempo entre submissão e decisão final
   - Fórmula: Soma(tempo_decisao - tempo_submissao) / Total de propostas
   - Meta: Redução de 15% anual

3. **Taxa de Aprovação**

   - Definição: % de propostas aprovadas
   - Fórmula: (Propostas aprovadas / Total de propostas) \* 100
   - Meta: Aumento de 2% trimestral sem aumento na inadimplência

4. **Precisão do OCR**

   - Definição: % de campos extraídos corretamente
   - Fórmula: Campos corretos / Total de campos
   - Meta: >95%

5. **Satisfação do Usuário**
   - Definição: NPS (Net Promoter Score)
   - Fórmula: % Promotores - % Detratores
   - Meta: >40

## Segmentação e Análise

Os dados são segmentados para análises específicas:

1. **Segmentação de Usuários**:

   - Por tipo (PF vs PJ)
   - Por perfil de risco
   - Por frequência de uso
   - Por valor médio de proposta

2. **Segmentação de Propostas**:

   - Por finalidade
   - Por valor solicitado
   - Por região geográfica
   - Por canal de origem

3. **Análises Avançadas**:
   - Correlação entre perfil do usuário e taxa de aprovação
   - Fatores que mais impactam no tempo de análise
   - Previsão de volume de propostas por período

## Privacidade e Conformidade

A implementação de analytics segue os princípios de privacidade by design:

1. **Anonimização de Dados**:

   - IPs são mascarados
   - Identificadores pessoais são hash-eados em certos contextos
   - Dados sensíveis são omitidos dos logs

2. **Conformidade Legal**:

   - LGPD (Lei Geral de Proteção de Dados)
   - Política de retenção de dados clara
   - Procedimentos para exclusão de dados a pedido do usuário

3. **Segurança**:
   - Criptografia de dados em trânsito e repouso
   - Acesso granular e auditado aos dados
   - Sanitização de dados em logs e relatórios

**Exemplo de política de retenção:**

| Tipo de Dado        | Período de Retenção | Método de Armazenamento | Justificativa            |
| ------------------- | ------------------- | ----------------------- | ------------------------ |
| Logs brutos         | 30 dias             | Completos               | Troubleshooting          |
| Eventos de usuário  | 1 ano               | Identificáveis          | Análise de comportamento |
| Dados agregados     | 5 anos              | Anonimizados            | Análise histórica        |
| Métricas de negócio | Indefinido          | Totalmente anonimizados | Benchmarking             |

## Manutenção e Evolução

O sistema de analytics é mantido e evoluído continuamente:

1. **Governança de Dados**:

   - Comitê de analytics trimestral
   - Revisão de métricas e KPIs
   - Definição de novas necessidades de rastreamento

2. **Processo de Atualização**:

   - Ciclo de release próprio (mensal)
   - Testes A/B para novos eventos
   - Documentação atualizada de eventos e propriedades

3. **Capacitação de Equipes**:
   - Treinamento para interpretação de dados
   - Acesso self-service para stakeholders
   - Enablement para tomada de decisão baseada em dados

## Como Usar o Sistema de Analytics

### No Frontend

Para rastrear eventos no frontend, utilize o hook `useAnalytics`:

```tsx
import { useAnalytics } from '../../hooks/useAnalytics'

function MeuComponente() {
  const { trackEvent, trackInteraction } = useAnalytics()

  const handleSubmit = (data) => {
    // Rastreia evento de envio de proposta
    trackEvent('proposta', 'proposta_enviada', {
      valor_solicitado: data.valor,
      tipo_proposta: data.tipo,
    })

    // Continua o fluxo normal
    submitProposal(data)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* ... campos do formulário ... */}
      <button
        onClick={() => trackInteraction('enviar_proposta', 'botao')}
        type="submit"
      >
        Enviar Proposta
      </button>
    </form>
  )
}
```

### No Backend

Para rastrear eventos no backend, utilize a função `track_event`:

```python
from celebra_capital.analytics import track_event

# Em uma view ou serviço
def aprovar_proposta(proposta_id):
    proposta = Proposta.objects.get(id=proposta_id)
    proposta.status = 'aprovada'
    proposta.save()

    # Registra evento de aprovação
    track_event(
        category='proposta',
        action='proposta_aprovada',
        properties={
            'id_proposta': proposta.id,
            'valor_aprovado': proposta.valor_aprovado,
            'valor_solicitado': proposta.valor_solicitado,
        },
        user_id=request.user.id
    )

    return proposta
```

Ou utilize o método auxiliar do modelo `AnalyticsEvent`:

```python
from celebra_capital.analytics.models import AnalyticsEvent

# Em uma view
def visualizar_documento(request, documento_id):
    documento = Documento.objects.get(id=documento_id)

    # Registra visualização via método do modelo
    AnalyticsEvent.create_from_request(
        request=request,
        category='documento',
        action='documento_visualizado',
        properties={
            'id_documento': documento.id,
            'tipo_documento': documento.tipo
        }
    )

    # Retorna a resposta normal
    return render(request, 'documento_detalhe.html', {'documento': documento})
```

### Eventos Automáticos

Alguns eventos são rastreados automaticamente:

1. **Visualizações de Página**  
   O componente `<AnalyticsPageTracker />` rastreia todas as mudanças de rota

2. **Requisições API**  
   O middleware `AnalyticsMiddleware` rastreia todas as requisições HTTP

3. **Erros**  
   Os interceptors de erro rastreiam problemas em formulários e API

### Convenções de Nomenclatura

Para manter consistência nos dados, siga estas convenções:

1. **Categorias** (sempre no singular):

   - `usuario` - ações relacionadas a usuários
   - `proposta` - ações relacionadas a propostas
   - `documento` - ações relacionadas a documentos
   - `navegacao` - ações de navegação no site
   - `interacao` - interações com elementos de UI
   - `sistema` - eventos de sistema (erros, performance)
   - `api` - chamadas de API

2. **Ações**:
   - Use o formato `substantivo_verbo` (ex: `proposta_iniciada`)
   - Mantenha consistência entre frontend e backend
   - Use nomes descritivos e específicos

### Acessando os Dados

Os dados de analytics podem ser acessados de várias formas:

1. **Dashboard do Google Analytics**  
   Acesse em [analytics.google.com](https://analytics.google.com)

2. **API de Analytics da Plataforma**  
   Endpoints disponíveis:

   - `GET /api/analytics/events_summary` - resumo de eventos
   - `GET /api/analytics/dashboard` - dados para dashboard

3. **Relatórios Automáticos**  
   Enviados semanalmente por email para stakeholders

---

_Este documento é atualizado regularmente. Última atualização: Julho 2023._

Para sugestões ou dúvidas sobre a implementação de analytics, entre em contato com analytics@celebracapital.com.br.
