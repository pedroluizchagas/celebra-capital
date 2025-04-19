#!/bin/sh
set -e

echo "Iniciando o serviço frontend..."

# Criar endpoint de health check
mkdir -p /usr/share/nginx/html/health
echo "OK" > /usr/share/nginx/html/health/index.html

# Iniciar o Nginx
echo "Iniciando Nginx..."
exec nginx -g "daemon off;" 