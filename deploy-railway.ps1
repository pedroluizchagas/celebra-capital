# Script para realizar o deploy da aplicação no Railway (PowerShell)

Write-Host "Iniciando deploy no Railway..." -ForegroundColor Green

# Verificando se o CLI do Railway está instalado
if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "O CLI do Railway não está instalado. Instalando..." -ForegroundColor Yellow
    npm i -g @railway/cli
}

# Verificando login no Railway
Write-Host "Verificando login no Railway..." -ForegroundColor Cyan
railway whoami
if ($LASTEXITCODE -ne 0) {
    railway login
}

# Criando arquivo .env para produção se não existir
if (-not (Test-Path .env)) {
    Write-Host "Criando arquivo .env para produção..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "Substitua as variáveis de ambiente no arquivo .env com valores reais" -ForegroundColor Yellow
    Write-Host "Pressione qualquer tecla para continuar quando terminar de editar..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Iniciando deploy dos serviços
Write-Host "Iniciando deploy dos serviços..." -ForegroundColor Green

# Inicializar projeto Railway se necessário
Write-Host "Inicializando projeto Railway..." -ForegroundColor Cyan
railway init
if ($LASTEXITCODE -ne 0) {
    Write-Host "Projeto já inicializado, continuando..." -ForegroundColor Yellow
}

# Upload das variáveis de ambiente
Write-Host "Fazendo upload das variáveis de ambiente..." -ForegroundColor Cyan
railway env from .env

# Deploy do backend
Write-Host "Realizando deploy do backend..." -ForegroundColor Cyan
Set-Location -Path backend
railway up --detach
Write-Host "Backend publicado, verificando status..." -ForegroundColor Green
railway status
Set-Location -Path ..

# Deploy do frontend
Write-Host "Realizando deploy do frontend..." -ForegroundColor Cyan
Set-Location -Path frontend
railway up --detach
Write-Host "Frontend publicado, verificando status..." -ForegroundColor Green
railway status
Set-Location -Path ..

Write-Host "Deploy concluído com sucesso!" -ForegroundColor Green
Write-Host "Acesse o painel do Railway para verificar o status dos serviços e obter as URLs públicas." -ForegroundColor Green 