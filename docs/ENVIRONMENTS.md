# Configuração de Ambientes

Este documento descreve a configuração de diferentes ambientes (desenvolvimento, staging e produção) para o projeto Celebra Capital.

## Visão Geral

O projeto suporta três ambientes distintos:

- **Development**: Para desenvolvimento local e testes iniciais
- **Staging**: Para testes de integração e validação antes de produção
- **Production**: Ambiente de produção para usuários finais

## Configuração de Variáveis de Ambiente

### Frontend (React)

Crie os seguintes arquivos na pasta `frontend/`:

#### .env.development

```
# API URL
VITE_API_URL=http://localhost:8000/api

# Sentry (monitoramento de erros)
VITE_SENTRY_DSN=

# Versão da aplicação (para rastreamento de releases no Sentry)
VITE_APP_VERSION=0.1.0-dev

# Ambiente
VITE_APP_ENVIRONMENT=development
```

#### .env.staging

```
# API URL
VITE_API_URL=https://staging-api.celebracapital.com.br/api

# Sentry (monitoramento de erros)
VITE_SENTRY_DSN=https://XXXXX@XXXXX.ingest.sentry.io/XXXXX

# Versão da aplicação
VITE_APP_VERSION=0.1.0

# Ambiente
VITE_APP_ENVIRONMENT=staging
```

#### .env.production

```
# API URL
VITE_API_URL=https://api.celebracapital.com.br/api

# Sentry (monitoramento de erros)
VITE_SENTRY_DSN=https://XXXXX@XXXXX.ingest.sentry.io/XXXXX

# Versão da aplicação
VITE_APP_VERSION=0.1.0

# Ambiente
VITE_APP_ENVIRONMENT=production
```

### Backend (Django)

Crie os seguintes arquivos na pasta `backend/`:

#### .env.development

```
# Debug e ambiente
DEBUG=True
ENVIRONMENT=development
SECRET_KEY=sua-chave-secreta-para-dev

# Hosts e CORS
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Banco de dados
DATABASE_URL=postgres://postgres:postgres@db:5432/celebra_capital_dev

# Sentry
ENABLE_SENTRY=False
SENTRY_DSN=

# Logging
DJANGO_LOG_LEVEL=DEBUG

# E-mail
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# Celery/Redis
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0
```

#### .env.staging

```
# Debug e ambiente
DEBUG=False
ENVIRONMENT=staging
SECRET_KEY=sua-chave-secreta-para-staging

# Hosts e CORS
ALLOWED_HOSTS=staging-api.celebracapital.com.br,staging.celebracapital.com.br
CORS_ALLOWED_ORIGINS=https://staging.celebracapital.com.br

# Banco de dados
DATABASE_URL=postgres://user:password@hostname:5432/celebra_capital_staging

# Sentry
ENABLE_SENTRY=True
SENTRY_DSN=https://XXXXX@XXXXX.ingest.sentry.io/XXXXX

# Logging
DJANGO_LOG_LEVEL=INFO

# E-mail
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_HOST_USER=postmaster@mg.celebracapital.com.br
EMAIL_HOST_PASSWORD=your-mailgun-password
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=noreply@celebracapital.com.br

# Celery/Redis
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0
```

#### .env.production

```
# Debug e ambiente
DEBUG=False
ENVIRONMENT=production
SECRET_KEY=sua-chave-secreta-para-prod

# Hosts e CORS
ALLOWED_HOSTS=api.celebracapital.com.br,celebracapital.com.br
CORS_ALLOWED_ORIGINS=https://celebracapital.com.br

# Banco de dados
DATABASE_URL=postgres://user:password@hostname:5432/celebra_capital_prod

# Sentry
ENABLE_SENTRY=True
SENTRY_DSN=https://XXXXX@XXXXX.ingest.sentry.io/XXXXX

# Logging
DJANGO_LOG_LEVEL=WARNING

# E-mail
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_HOST_USER=postmaster@mg.celebracapital.com.br
EMAIL_HOST_PASSWORD=your-mailgun-password
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=noreply@celebracapital.com.br

# Celery/Redis
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0
```

## GitHub Actions e CI/CD

O pipeline de CI/CD no GitHub Actions está configurado para detectar a branch e definir o ambiente apropriado:

- Pushes para a branch `develop` acionam um deploy para o ambiente de desenvolvimento
- Pushes para a branch `staging` acionam um deploy para o ambiente de staging
- Pushes para a branch `main` acionam um deploy para o ambiente de produção

## Secrets do Railway

Para que os deploys funcionem corretamente, você precisa definir os seguintes secrets no GitHub:

- `RAILWAY_TOKEN`: Token de API do Railway
- `RAILWAY_SERVICE_DEV`: ID do serviço de desenvolvimento no Railway
- `RAILWAY_SERVICE_STAGING`: ID do serviço de staging no Railway
- `RAILWAY_SERVICE_PROD`: ID do serviço de produção no Railway

## Desenvolvimento Local

Para executar o projeto localmente com configurações de desenvolvimento:

### Frontend

```bash
cd frontend
npm run dev
```

### Backend

```bash
cd backend
python manage.py runserver
```

## Importante

**Não adicione arquivos .env ao controle de versão!** Eles contêm informações sensíveis. Certifique-se de que `.env*` está no `.gitignore`.
