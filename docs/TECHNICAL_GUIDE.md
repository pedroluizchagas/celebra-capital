# Guia Técnico da Plataforma Celebra Capital

Este guia documenta os aspectos técnicos da Plataforma de Pré-Análise de Crédito da Celebra Capital, focando nos recursos de acessibilidade, segurança, monitoramento e otimização implementados.

## Índice

1. [Acessibilidade](#acessibilidade)
2. [SEO e PWA](#seo-e-pwa)
3. [Segurança](#segurança)
4. [Monitoramento de Performance](#monitoramento-de-performance)
5. [Rate Limiting e Proteção contra Abusos](#rate-limiting-e-proteção-contra-abusos)

---

## Acessibilidade

### Padrão WCAG AA

A plataforma segue as diretrizes WCAG 2.1 nível AA. Isso significa que:

- O contraste de cores atende aos requisitos mínimos (4.5:1 para texto normal, 3:1 para texto grande)
- Todos os elementos interativos são acessíveis por teclado
- A navegação é consistente e previsível
- Os formulários possuem labels e feedback de erro adequados
- O site é compatível com leitores de tela (NVDA, VoiceOver, JAWS)

### Testes Automatizados

Implementamos testes automatizados de acessibilidade usando:

```bash
# Executar testes de acessibilidade nos componentes
npm run test:a11y

# Executar auditoria completa do site
node scripts/a11y-audit.js
```

### Atributos ARIA

Componentes complexos utilizam atributos ARIA apropriados para melhorar a acessibilidade:

```jsx
// Exemplo de componente com ARIA
<div
  role="dialog"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Título do Modal</h2>
  <p id="modal-description">Descrição do modal</p>
  <button aria-label="Fechar" onClick={closeModal}>
    X
  </button>
</div>
```

### Fluxo de Foco

O fluxo de foco é gerenciado em componentes modais e drawers para evitar que usuários de teclado percam o contexto:

```jsx
// Uso da trap de foco
import { useFocusTrap } from '../hooks/useFocusTrap'

function Modal() {
  const ref = useFocusTrap()

  return <div ref={ref}>{/* Conteúdo do modal */}</div>
}
```

---

## SEO e PWA

### Configuração SEO

As páginas são otimizadas para mecanismos de busca com:

- Meta tags dinâmicas baseadas no conteúdo
- Dados estruturados (Schema.org)
- Sitemap XML automático
- URLs amigáveis para SEO

```jsx
// Exemplo de componente SEO
<SEOProvider
  title="Pré-Análise de Crédito"
  description="Análise rápida e segura para servidores públicos"
  canonicalUrl="https://www.celebracapital.com.br/pre-analise"
/>
```

### Progressive Web App (PWA)

A aplicação funciona como um PWA com:

- Manifest.json completo
- Service Worker para caching e funcionamento offline
- Ícones em vários tamanhos para diferentes dispositivos
- Estratégias de cache otimizadas para performance

Para testar o PWA:

```bash
# Verificar configuração do PWA
node scripts/check-pwa.js

# Executar auditoria de SEO
node scripts/seo-audit.js
```

### Web Vitals

Otimizamos os Core Web Vitals:

- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

---

## Segurança

### OWASP Top 10

Implementamos proteções contra as principais vulnerabilidades:

1. **Quebra de Controle de Acesso**

   - Verificação de permissões por endpoint
   - Middleware de autenticação consistente

2. **Falhas Criptográficas**

   - HTTPS em todas as conexões
   - Senhas com bcrypt (fator de trabalho 12)
   - JWTs com vida útil curta e rotação segura

3. **Injeção**

   - Consultas parametrizadas usando Django ORM
   - Sanitização de entrada em campos de formulário
   - Validação com schema (Zod no frontend)

4. **Outras Proteções**
   - Headers de segurança (CSP, X-Content-Type-Options, etc.)
   - Proteção CSRF
   - Políticas de cookies seguros (SameSite, Secure, HttpOnly)

### Auditoria de Segurança

A auditoria de segurança pode ser executada com:

```bash
# Análise de dependências vulneráveis
npm audit
pip-audit

# Verificação de headers de segurança
curl -I https://www.celebracapital.com.br
```

---

## Monitoramento de Performance

### Coleta de Métricas

O sistema coleta métricas de desempenho usando:

- Prometheus para métricas em tempo real
- InfluxDB para armazenamento de séries temporais
- Grafana para visualização

### Configuração

Para iniciar o monitoramento:

```bash
# Iniciar monitoramento de backend
python scripts/monitor-backend.py

# Configuração de alertas (requer Grafana)
python scripts/setup-alerts.py
```

### Métricas Coletadas

O sistema monitora:

- Tempo de resposta de endpoints críticos
- Uso de CPU, memória e disco
- Tempo de execução de queries do banco de dados
- Número de requisições por segundo
- Taxa de erros

### Dashboard Grafana

Um dashboard Grafana está disponível em `http://monitoring.celebracapital.com.br` (acesso restrito):

- Visão geral do sistema
- Performance de APIs
- Uso de recursos do servidor
- Métricas de negócio

---

## Rate Limiting e Proteção contra Abusos

### Configuração

O middleware de rate limiting protege a API contra abusos:

```python
# Limites configurados em settings.py
RATE_LIMITS = {
    'DEFAULT': {
        'rate': 100,  # requisições
        'interval': 60,  # segundos
        'block_time': 60,  # tempo de bloqueio
    },
    'LOGIN': {
        'rate': 10,
        'interval': 60,
        'block_time': 300,
    },
    # ...outras configurações
}
```

### Funcionamento

- Limites baseados em IP e ID de usuário
- Headers de rate limit informando limites e uso
- Bloqueio temporário após exceder limites
- Whitelist para IPs confiáveis

### Testes

Para testar o rate limiting:

```bash
# Teste de limite de login (deve falhar após 10 tentativas)
for i in {1..15}; do
  curl -X POST -H "Content-Type: application/json" \
    -d '{"username":"test", "password":"wrong"}' \
    https://api.celebracapital.com.br/api/v1/auth/login
done
```

---

## Ambiente de Desenvolvimento

### Configuração Local

```bash
# Clonar o repositório
git clone https://github.com/celebra-capital/plataforma-credito.git

# Instalar dependências
npm install
pip install -r requirements.txt

# Configurar ambiente
cp .env.example .env
# Editar .env com suas configurações

# Iniciar servidor de desenvolvimento
npm run dev
python manage.py runserver
```

### Scripts Úteis

```bash
# Executar testes
npm test
pytest

# Verificar cobertura de testes
npm run coverage
pytest --cov

# Linting
npm run lint
flake8

# Build para produção
npm run build
```

---

## Recursos Adicionais

- [Documentação da API](./API_DOCS.md)
- [Guia de Contribuição](./CONTRIBUTING.md)
- [Padrões de Código](./CODE_STANDARDS.md)

---

_Este documento é atualizado regularmente com novas implementações e melhorias._
**Última atualização:** Julho 2023

## Visão Geral da Arquitetura

A plataforma de pré-análise de crédito da Celebra Capital é construída com uma arquitetura moderna de microserviços, utilizando as seguintes tecnologias principais:

### Frontend

- React 18+ com TypeScript
- Vite como bundler
- Tailwind CSS para estilização
- Zustand para gerenciamento de estado
- React Hook Form + Zod para validação de formulários

### Backend

- Django REST Framework
- Celery + Redis para processamento assíncrono
- PostgreSQL como banco de dados principal
- JWT para autenticação

### Infraestrutura

- Docker para containerização
- Railway para hospedagem
- GitHub Actions para CI/CD
- Sentry para monitoramento de erros
- Prometheus/Grafana para métricas de performance

## Design System

Nosso Design System foi implementado usando Storybook e segue os princípios de Atomic Design. Os componentes são organizados em:

- **Tokens**: Variáveis fundamentais (cores, tipografia, espaçamento)
- **Átomos**: Componentes básicos (botões, inputs, ícones)
- **Moléculas**: Grupos de átomos (formulários, cards)
- **Organismos**: Seções completas da interface
- **Templates**: Layouts de página
- **Páginas**: Implementações específicas

Para utilizar componentes do Design System, importe-os de `@/components/ui`.

## Fluxo de Processamento OCR

O processamento de documentos via OCR utiliza uma arquitetura de filas:

1. Frontend faz upload do documento
2. API recebe o documento e envia para fila Celery
3. Worker Celery processa o documento (Tesseract/AWS Textract)
4. Resultados são armazenados no banco de dados
5. Webhook notifica o frontend via WebSocket

## Sistema de Analytics

O sistema de analytics foi implementado para rastrear eventos importantes e métricas de negócio:

### Camadas de Implementação

- Coleta de dados (frontend + backend)
- Processamento e enriquecimento de eventos
- Armazenamento em Data Warehouse
- Visualização em dashboards

### Eventos Principais Rastreados

- Eventos de usuário (login, navegação, interações)
- Eventos de proposta (criação, etapas, aprovação/rejeição)
- Eventos de documento (upload, processamento OCR)
- Eventos de sistema (performance, erros)

### Integração e Uso

Para registrar eventos no frontend:

```typescript
import { useAnalytics } from '@/hooks/useAnalytics'

// No componente
const { trackEvent } = useAnalytics()

// Uso
trackEvent('proposta', 'proposta_iniciada', {
  tipo_proposta: 'empresarial',
  valor_solicitado: 50000,
})
```

No backend:

```python
from celebra.analytics import track_event

# Registrar evento
track_event(
    category='proposta',
    action='status_alterado',
    properties={
        'id_proposta': proposal.id,
        'status_anterior': previous_status,
        'status_novo': new_status,
        'responsavel': user.id
    }
)
```

## Medidas de Segurança

A plataforma implementa diversas medidas de segurança:

- Autenticação JWT com refresh tokens
- Rate limiting/throttling para proteção contra abusos
- Sanitização de dados de entrada
- Criptografia de dados sensíveis no banco
- HTTPS em todas as comunicações
- Auditoria de ações administrativas

## Estratégia de Backup e Disaster Recovery

Nossa estratégia de backup e DR inclui:

- Snapshots diários do PostgreSQL
- Backups incrementais para armazenamento S3-compatível
- Retenção de 7 dias para backups diários
- Retenção de 1 mês para backups semanais
- Retenção de 1 ano para backups mensais
- Testes de restauração automatizados mensais

## Fluxo de Desenvolvimento

### Ambientes

- **Desenvolvimento**: Para trabalho local dos desenvolvedores
- **Staging**: Para testes integrados pré-produção
- **Produção**: Ambiente de usuários finais

### Branches e Deployment

- `main` → Produção
- `develop` → Staging
- Feature branches → PRs para `develop`

### Pipeline CI/CD

1. Lint e formatação de código
2. Testes unitários e de integração
3. Build e testes e2e
4. Deploy para o ambiente apropriado

## Troubleshooting

### Logs e Monitoramento

- Logs centralizados disponíveis no Railway
- Dashboard Grafana para métricas de performance
- Alertas Sentry para erros críticos

### Comandos Úteis

```bash
# Reiniciar worker Celery
railway run celery -A celebra worker -l info --pool=solo

# Verificar status dos serviços
railway status

# Executar migrations
railway run python manage.py migrate
```

## Documentação Adicional

Para informações mais detalhadas, consulte:

- [Arquitetura Detalhada](./ARQUITETURA.md)
- [Guia de Integração](./GUIA_INTEGRAÇÃO.md)
- [Manual de Administrador](./MANUAL_ADMINISTRADOR.md)
- [Manual de Usuário](./MANUAL_USUARIO.md)
- [Implementação de Analytics](./IMPLEMENTACAO_ANALYTICS.md)
