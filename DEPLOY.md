# 🚀 Deploy da Plataforma Celebra Capital

Este documento contém instruções detalhadas para realizar o deploy da Plataforma de Pré-Análise de Crédito da Celebra Capital no Railway.

## 📋 Pré-requisitos

- Uma conta no [Railway](https://railway.app/)
- Node.js e NPM instalados localmente
- CLI do Railway instalado: `npm i -g @railway/cli`
- Git

## 🔄 Processo de Deploy

### 1. Configuração inicial do Railway

1. Crie uma conta no Railway (ou faça login se já tiver)
2. Crie um novo projeto no Railway
3. Instale o CLI do Railway: `npm i -g @railway/cli`
4. Faça login no CLI: `railway login`

### 2. Configuração das variáveis de ambiente

1. Copie o arquivo `.env.example` para `.env` e preencha com os valores corretos:

```bash
cp .env.example .env
```

2. Preencha todas as variáveis de ambiente necessárias, especialmente:
   - `SECRET_KEY` - Chave secreta do Django
   - `ALLOWED_HOSTS` - Domínios permitidos
   - `DATABASE_URL` - URL do banco de dados PostgreSQL (será preenchido automaticamente pelo Railway)
   - Configurações de email (EMAIL_HOST, EMAIL_PORT, etc.)
   - Configurações do S3 (se estiver usando)
   - Chaves VAPID para notificações push

### 3. Deploy automatizado

Execute o script de deploy:

```bash
chmod +x deploy-railway.sh
./deploy-railway.sh
```

Este script irá:

1. Verificar se o CLI do Railway está instalado
2. Fazer login no Railway (se necessário)
3. Configurar os serviços necessários (PostgreSQL, Redis)
4. Fazer upload das variáveis de ambiente
5. Realizar o deploy do backend e frontend

### 4. Deploy manual (alternativa)

Se preferir fazer o deploy manualmente:

#### Backend:

```bash
cd backend
railway link  # Conectar ao projeto Railway
railway up    # Fazer upload e deploy
```

#### Frontend:

```bash
cd frontend
railway link  # Conectar ao projeto Railway
railway up    # Fazer upload e deploy
```

## 📊 Monitoramento e Logging

### Configuração de Monitoramento

O Railway fornece monitoramento básico para todos os serviços. Para monitoramento avançado, recomendamos:

1. **Sentry**: Para rastreamento de erros e performance

   - Adicione `sentry-sdk` ao `requirements.txt`
   - Configure o Sentry no arquivo `settings.py`

2. **Prometheus + Grafana**: Para métricas detalhadas
   - Configure o Prometheus no Railway
   - Conecte ao Grafana para visualizações

### Visualização de Logs

Para visualizar logs:

```bash
# Logs do backend
railway logs -s backend

# Logs do frontend
railway logs -s frontend
```

## 🔒 SSL e Domínio Personalizado

1. No painel do Railway, vá para "Settings" do seu projeto
2. Em "Domains", adicione seu domínio personalizado
3. Configure os registros DNS de acordo com as instruções

## 🛠️ Troubleshooting

### Problemas comuns:

1. **Erro na conexão com o banco de dados**:

   - Verifique se o serviço PostgreSQL está rodando
   - Verifique a variável `DATABASE_URL`

2. **Erro 503 Service Unavailable**:

   - Verifique os logs para identificar o problema: `railway logs`
   - Verifique se o healthcheck está passando

3. **Problemas com arquivos estáticos**:
   - Verifique se o comando `collectstatic` está sendo executado
   - Verifique as configurações de STATIC_URL e STATIC_ROOT

## 📝 Checklist Final

- [ ] Todas as variáveis de ambiente estão configuradas
- [ ] O deploy do backend foi bem-sucedido
- [ ] O deploy do frontend foi bem-sucedido
- [ ] O banco de dados está conectado corretamente
- [ ] Os healthchecks estão passando
- [ ] Os arquivos estáticos estão sendo servidos corretamente
- [ ] As notificações push estão funcionando
- [ ] O domínio personalizado está configurado (se aplicável)
- [ ] Os logs estão sendo gerados corretamente

## 🆘 Suporte

Se encontrar problemas durante o deploy, consulte:

- [Documentação do Railway](https://docs.railway.app/)
- [Fórum da Railway](https://discuss.railway.app/)
