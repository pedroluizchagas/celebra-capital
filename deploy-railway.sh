#!/bin/bash

# Script para realizar o deploy da aplicação no Railway

echo "Iniciando deploy no Railway..."

# Verificando se o CLI do Railway está instalado
if ! command -v railway &> /dev/null
then
    echo "O CLI do Railway não está instalado. Instalando..."
    npm i -g @railway/cli
fi

# Verificando login no Railway
echo "Verificando login no Railway..."
railway whoami || railway login

# Criando arquivo .env para produção
echo "Criando arquivo .env para produção..."
cp .env.example .env
echo "Substitua as variáveis de ambiente no arquivo .env com valores reais"
echo "Pressione qualquer tecla para continuar quando terminar de editar..."
read -n 1 -s

# Iniciando deploy dos serviços
echo "Iniciando deploy dos serviços..."

# Deploy do banco de dados
echo "Configurando banco de dados PostgreSQL..."
railway add --plugin postgresql

# Deploy do Redis
echo "Configurando Redis..."
railway add --plugin redis

# Upload das variáveis de ambiente
echo "Fazendo upload das variáveis de ambiente..."
railway env from .env

# Deploy do backend
echo "Realizando deploy do backend..."
cd backend
railway up
cd ..

# Deploy do frontend
echo "Realizando deploy do frontend..."
cd frontend
railway up
cd ..

echo "Deploy concluído com sucesso!"
echo "Acesse o painel do Railway para verificar o status dos serviços." 