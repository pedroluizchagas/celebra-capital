#!/bin/bash
# Script para configurar os scripts de backup PostgreSQL → S3
# Celebra Capital - Abril 2025

set -e  # Parar execução em caso de erro

echo "=== Configurando scripts de backup e recuperação ==="

# Diretório atual do script
SCRIPT_DIR=$(dirname "$(readlink -f "$0")")
cd "$SCRIPT_DIR"

# Tornar os scripts executáveis
echo "Configurando permissões..."
chmod +x pg_backup.py pg_restore.py

# Instalar dependências necessárias
echo "Verificando dependências..."
pip install boto3 psycopg2-binary python-dateutil python-magic

# Criar diretórios de trabalho
echo "Criando diretórios para backups..."
mkdir -p /tmp/backups /tmp/restores

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "Criando arquivo .env de exemplo..."
    cat > .env << EOF
# Configurações PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=celebra_capital

# Configurações AWS/S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
BACKUP_S3_BUCKET=your-bucket-name
AWS_S3_REGION_NAME=us-east-1

# Configurações de Backup
BACKUP_RETENTION_DAYS=30
BACKUP_DIR=/tmp/backups
RESTORE_DIR=/tmp/restores
EOF
    echo "Por favor, edite o arquivo .env com suas configurações."
fi

# Verificar se PostgreSQL está instalado
if ! command -v pg_dump &> /dev/null; then
    echo "AVISO: pg_dump não encontrado. Por favor, instale o cliente PostgreSQL."
    echo "  Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo "  CentOS/RHEL: sudo yum install postgresql"
    echo "  macOS: brew install postgresql"
fi

echo "=== Configuração concluída ==="
echo ""
echo "Para testar o backup, execute:"
echo "  ./pg_backup.py"
echo ""
echo "Para testar a recuperação, execute:"
echo "  ./pg_restore.py --list"
echo ""
echo "Para configurar o backup automático, edite o arquivo celery_config.py no projeto Django."
echo "" 