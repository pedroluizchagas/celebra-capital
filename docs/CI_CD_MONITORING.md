# CI/CD e Monitoramento

Este documento descreve a configuração de CI/CD e monitoramento para o projeto Celebra Capital.

## Pipeline de CI/CD

O pipeline de CI/CD está configurado usando GitHub Actions e Railway. O arquivo de configuração está localizado em `.github/workflows/ci.yml`.

### Fluxo do Pipeline

1. **Testes do Frontend**:

   - Checkout do código
   - Configuração do Node.js 18
   - Instalação de dependências
   - Linting
   - Verificação de tipos TypeScript
   - Execução de testes com cobertura
   - Upload da cobertura para o Codecov
   - Build da aplicação

2. **Testes do Backend**:

   - Checkout do código
   - Configuração do Python 3.10
   - Instalação de dependências
   - Linting com flake8
   - Execução de testes com pytest
   - Upload da cobertura para o Codecov

3. **Deploy para Desenvolvimento** (quando houver push para a branch `develop`):

   - Checkout do código
   - Deploy para Railway usando o serviço configurado para desenvolvimento

4. **Deploy para Staging** (quando houver push para a branch `staging`):

   - Checkout do código
   - Deploy para Railway usando o serviço configurado para staging

5. **Deploy para Produção** (quando houver push para a branch `main`):
   - Checkout do código
   - Deploy para Railway usando o serviço configurado para produção

### Secrets Necessários no GitHub

Para que o pipeline funcione corretamente, é necessário configurar os seguintes secrets no GitHub:

- `RAILWAY_TOKEN`: Token de API do Railway
- `RAILWAY_SERVICE_DEV`: ID do serviço de desenvolvimento no Railway
- `RAILWAY_SERVICE_STAGING`: ID do serviço de staging no Railway
- `RAILWAY_SERVICE_PROD`: ID do serviço de produção no Railway
- `CODECOV_TOKEN`: Token para envio de relatórios de cobertura ao Codecov

### Checklist Pré-Deploy

Antes de fazer deploy para os ambientes de staging e produção, certifique-se de:

1. ⚠️ **Configurar o DSN do Sentry** nos arquivos de ambiente:

   - Para staging: substituir os placeholders em `.env.staging`
   - Para produção: substituir os placeholders em `.env.production`

2. Atualizar a versão da aplicação em cada arquivo `.env` quando necessário
3. Verificar se todos os testes estão passando no pipeline CI

4. Garantir que as variáveis de ambiente sensíveis estão configuradas corretamente no Railway

## Monitoramento

### Sentry

O Sentry é utilizado para monitoramento de erros e performance tanto no frontend quanto no backend.

#### Frontend

A configuração do Sentry no frontend está localizada em `frontend/src/services/sentryService.ts`. Para utilizá-lo:

1. Instale os pacotes necessários (já incluídos no `package.json`):

   ```bash
   npm install @sentry/react @sentry/tracing
   ```

2. O serviço Sentry já está integrado no ponto de entrada da aplicação (`main.tsx`):

   ```tsx
   import sentryService from './services/sentryService'

   // Inicializar Sentry no ambiente correto
   const NODE_ENV = import.meta.env?.MODE || 'development'
   sentryService.initSentry(NODE_ENV)
   ```

3. **IMPORTANTE**: Antes de fazer deploy para staging ou produção, você deve configurar o DSN real do Sentry:

   - Crie um projeto no [dashboard do Sentry](https://sentry.io)
   - Obtenha o DSN (formato: `https://XXXX@XXXX.ingest.sentry.io/XXXX`)
   - Substitua os placeholders nos arquivos `.env.staging` e `.env.production`

   O Sentry está configurado para **não enviar eventos em ambiente de desenvolvimento**.

#### Backend

A configuração do Sentry no backend está localizada em `backend/config/sentry.py`. Para utilizá-lo:

1. Instale o pacote necessário:

   ```bash
   pip install sentry-sdk
   ```

2. Importe e inicialize o Sentry nas configurações do Django:

   ```python
   if os.environ.get('ENABLE_SENTRY', 'False').lower() == 'true':
       from config.sentry import configure_sentry
       configure_sentry()
   ```

3. **IMPORTANTE**: Assim como no frontend, é necessário configurar o DSN real do Sentry nos arquivos de ambiente do backend antes de fazer deploy.

### Logs Estruturados

Os logs estruturados em formato JSON estão configurados no backend para facilitar a análise e monitoramento em ferramentas como Datadog, ELK, ou similares.

A configuração está localizada em `backend/config/logging_config.py`. Para utilizá-la:

1. Instale os pacotes necessários:

   ```bash
   pip install python-json-logger structlog
   ```

2. A configuração já está integrada automaticamente no arquivo base de configurações do Django:

   ```python
   # Em backend/celebra_capital/settings/base.py
   from config.logging_config import configure_logging
   configure_logging()
   ```

3. Também adicionamos um middleware de logging de requisições e respostas para facilitar o rastreamento de problemas:

   ```python
   # Em MIDDLEWARE:
   'celebra_capital.api.middleware.RequestLoggingMiddleware'
   ```

#### Como usar os logs estruturados no código

Para usar os logs estruturados em seu código:

```python
from config.logging_config import get_structured_logger

# Criar um logger para o módulo atual
logger = get_structured_logger(__name__)

# Registrar eventos com contexto adicional
logger.info("Evento importante", user_id=123, action="login")
logger.warning("Aviso", duration_ms=354, resource="database")
logger.error("Erro crítico", error_code=500, exception="ValueError", details={"query": "SELECT *"})
```

#### Vantagens dos logs estruturados

Os logs estruturados melhoram significativamente a capacidade de depuração e monitoramento:

1. **Pesquisáveis**: Facilmente filtrados e pesquisados em ferramentas como Kibana ou Grafana
2. **Contextuais**: Cada log inclui metadados como timestamps, níveis, componentes e contexto personalizado
3. **Correlacionáveis**: Request IDs permitem rastrear todo o ciclo de uma requisição
4. **Analisáveis**: Formato JSON permite análise estatística e visualização

#### Integração com monitoramento

Os logs estão integrados com o Sentry para envio automático de erros críticos:

1. Erros de nível ERROR são enviados automaticamente ao Sentry
2. Logs de desempenho lento são destacados para fácil identificação
3. Request IDs são compartilhados entre logs e Sentry para correlação

## Métricas e Dashboards

Em futuras iterações, planejamos adicionar:

1. Dashboards no Railway para monitoramento de recursos
2. Integração com Google Analytics para métricas de usuário
3. Dashboards personalizados no Datadog ou Grafana para métricas de negócio

## Manutenção e Troubleshooting

### Falhas no Pipeline de CI/CD

Se houver falhas no pipeline de CI/CD:

1. Verifique os logs do GitHub Actions para identificar o problema
2. Certifique-se de que todos os testes estão passando localmente
3. Verifique se os secrets necessários estão configurados corretamente
4. Para problemas com o Railway, verifique o status do serviço e logs de deploy

### Monitoramento de Erros

1. Acesse o dashboard do Sentry para visualizar erros em tempo real
2. Configure alertas no Sentry para ser notificado de novos problemas
3. Use as ferramentas de busca e análise do Sentry para identificar padrões de erro

## Próximos Passos

- Implementar relatórios automáticos de performance
- Configurar alertas baseados em thresholds de performance
- Implementar monitoramento de endpoints críticos com health checks
