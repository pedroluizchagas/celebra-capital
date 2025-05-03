#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de Backup PostgreSQL para S3 - Celebra Capital
-----------------------------------------------------
Este script realiza o backup completo do banco de dados PostgreSQL
e envia para um bucket S3 para recuperação em caso de desastres.
"""

import os
import sys
import boto3
import logging
import subprocess
from datetime import datetime
from botocore.exceptions import ClientError
import gzip
import shutil

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("backup.log")
    ]
)
logger = logging.getLogger('pg_backup')

# Diretório para armazenar backups temporários
BACKUP_DIR = os.environ.get('BACKUP_DIR', '/tmp/backups')
os.makedirs(BACKUP_DIR, exist_ok=True)

# Configurações do PostgreSQL
PG_HOST = os.environ.get('DB_HOST', 'localhost')
PG_PORT = os.environ.get('DB_PORT', '5432')
PG_USER = os.environ.get('DB_USER', 'postgres')
PG_PASSWORD = os.environ.get('DB_PASSWORD', 'postgres')
PG_DATABASE = os.environ.get('DB_NAME', 'celebra_capital')

# Configurações da AWS/S3
AWS_ACCESS_KEY = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_SECRET_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
S3_BUCKET = os.environ.get('BACKUP_S3_BUCKET')
S3_REGION = os.environ.get('AWS_S3_REGION_NAME', 'us-east-1')

# Período de retenção (dias)
RETENTION_DAYS = int(os.environ.get('BACKUP_RETENTION_DAYS', '30'))


def create_pg_dump():
    """Cria um dump do banco de dados PostgreSQL"""
    try:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{PG_DATABASE}_{timestamp}.sql"
        filepath = os.path.join(BACKUP_DIR, filename)
        
        # Comando pg_dump com senha via variável de ambiente
        env = os.environ.copy()
        env['PGPASSWORD'] = PG_PASSWORD
        
        cmd = [
            'pg_dump',
            '-h', PG_HOST,
            '-p', PG_PORT,
            '-U', PG_USER,
            '-d', PG_DATABASE,
            '-F', 'c',  # Formato personalizado (comprimido)
            '-f', filepath
        ]
        
        logger.info(f"Iniciando backup do banco {PG_DATABASE}...")
        result = subprocess.run(cmd, env=env, capture_output=True, text=True)
        
        if result.returncode != 0:
            logger.error(f"Erro ao criar backup: {result.stderr}")
            raise Exception(f"Falha no pg_dump: {result.stderr}")
            
        logger.info(f"Backup criado com sucesso: {filepath}")
        
        # Comprimir o arquivo para reduzir o tamanho
        compressed_file = f"{filepath}.gz"
        with open(filepath, 'rb') as f_in:
            with gzip.open(compressed_file, 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)
        
        # Remover arquivo original após compressão
        os.remove(filepath)
        logger.info(f"Backup comprimido: {compressed_file}")
        
        return compressed_file
    except Exception as e:
        logger.error(f"Erro ao criar dump do PostgreSQL: {str(e)}")
        raise


def upload_to_s3(file_path):
    """Envia o arquivo de backup para o bucket S3"""
    if not all([AWS_ACCESS_KEY, AWS_SECRET_KEY, S3_BUCKET]):
        logger.error("Credenciais AWS ou nome do bucket não configurados")
        raise ValueError("Configurações S3 incompletas")
    
    try:
        logger.info(f"Conectando ao S3 na região {S3_REGION}...")
        s3_client = boto3.client(
            's3',
            aws_access_key_id=AWS_ACCESS_KEY,
            aws_secret_access_key=AWS_SECRET_KEY,
            region_name=S3_REGION
        )
        
        file_name = os.path.basename(file_path)
        backup_path = f"database_backups/{datetime.now().strftime('%Y/%m/%d')}/{file_name}"
        
        logger.info(f"Enviando {file_name} para s3://{S3_BUCKET}/{backup_path}")
        s3_client.upload_file(
            file_path, 
            S3_BUCKET, 
            backup_path,
            ExtraArgs={
                'StorageClass': 'STANDARD_IA',  # Infrequent Access para economia
                'ContentType': 'application/gzip'
            }
        )
        
        logger.info(f"Backup enviado com sucesso para S3: {backup_path}")
        return f"s3://{S3_BUCKET}/{backup_path}"
    except ClientError as e:
        logger.error(f"Erro ao enviar para S3: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Erro inesperado: {str(e)}")
        raise


def cleanup_old_backups():
    """Remove backups antigos do S3 conforme política de retenção"""
    if not all([AWS_ACCESS_KEY, AWS_SECRET_KEY, S3_BUCKET]):
        logger.warning("Credenciais AWS incompletas, ignorando limpeza")
        return
    
    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=AWS_ACCESS_KEY,
            aws_secret_access_key=AWS_SECRET_KEY,
            region_name=S3_REGION
        )
        
        # Calcular data limite para retenção
        cutoff_date = datetime.now().timestamp() - (RETENTION_DAYS * 24 * 60 * 60)
        
        # Listar objetos no bucket
        paginator = s3_client.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket=S3_BUCKET, Prefix='database_backups/')
        
        delete_count = 0
        for page in pages:
            if 'Contents' not in page:
                continue
            
            for obj in page['Contents']:
                if obj['LastModified'].timestamp() < cutoff_date:
                    s3_client.delete_object(Bucket=S3_BUCKET, Key=obj['Key'])
                    delete_count += 1
                    logger.info(f"Removido backup antigo: {obj['Key']}")
        
        logger.info(f"Limpeza de backups concluída. {delete_count} arquivos removidos.")
    except Exception as e:
        logger.error(f"Erro ao limpar backups antigos: {str(e)}")


def cleanup_local_files(file_path):
    """Remove arquivos temporários de backup local"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"Arquivo local removido: {file_path}")
    except Exception as e:
        logger.error(f"Erro ao remover arquivo local: {str(e)}")


def main():
    """Função principal de execução do backup"""
    try:
        logger.info("=== Iniciando processo de backup PostgreSQL → S3 ===")
        
        # 1. Criar dump do PostgreSQL
        backup_file = create_pg_dump()
        
        # 2. Enviar para S3
        s3_path = upload_to_s3(backup_file)
        
        # 3. Limpar arquivos temporários
        cleanup_local_files(backup_file)
        
        # 4. Remover backups antigos conforme política de retenção
        cleanup_old_backups()
        
        logger.info(f"=== Backup concluído com sucesso! Arquivo: {s3_path} ===")
        return 0
    except Exception as e:
        logger.error(f"Falha no processo de backup: {str(e)}")
        return 1


if __name__ == "__main__":
    sys.exit(main()) 