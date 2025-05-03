#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de Restauração PostgreSQL do S3 - Celebra Capital
--------------------------------------------------------
Este script recupera um backup do banco de dados do bucket S3
e restaura para o PostgreSQL. Utilizado em situações de recuperação 
de desastres (DR).
"""

import os
import sys
import boto3
import logging
import subprocess
import argparse
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
        logging.FileHandler("restore.log")
    ]
)
logger = logging.getLogger('pg_restore')

# Diretório para armazenar backups temporários
RESTORE_DIR = os.environ.get('RESTORE_DIR', '/tmp/restores')
os.makedirs(RESTORE_DIR, exist_ok=True)

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


def list_available_backups():
    """Lista os backups disponíveis no S3 para restauração"""
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
        
        logger.info(f"Listando backups disponíveis em s3://{S3_BUCKET}/database_backups/")
        paginator = s3_client.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket=S3_BUCKET, Prefix='database_backups/')
        
        backups = []
        for page in pages:
            if 'Contents' not in page:
                continue
            
            for obj in page['Contents']:
                if obj['Key'].endswith('.sql.gz'):
                    backups.append({
                        'key': obj['Key'],
                        'date': obj['LastModified'],
                        'size': obj['Size']
                    })
        
        # Ordenar por data, mais recente primeiro
        backups.sort(key=lambda x: x['date'], reverse=True)
        
        if not backups:
            logger.warning("Nenhum backup encontrado no bucket S3")
            return []
            
        logger.info(f"Encontrados {len(backups)} backups disponíveis")
        return backups
    except Exception as e:
        logger.error(f"Erro ao listar backups: {str(e)}")
        raise


def download_from_s3(s3_key):
    """Faz download do arquivo de backup do S3"""
    if not all([AWS_ACCESS_KEY, AWS_SECRET_KEY, S3_BUCKET]):
        logger.error("Credenciais AWS ou nome do bucket não configurados")
        raise ValueError("Configurações S3 incompletas")
        
    try:
        logger.info(f"Iniciando download de s3://{S3_BUCKET}/{s3_key}")
        s3_client = boto3.client(
            's3',
            aws_access_key_id=AWS_ACCESS_KEY,
            aws_secret_access_key=AWS_SECRET_KEY,
            region_name=S3_REGION
        )
        
        file_name = os.path.basename(s3_key)
        local_file = os.path.join(RESTORE_DIR, file_name)
        
        s3_client.download_file(S3_BUCKET, s3_key, local_file)
        logger.info(f"Download concluído: {local_file}")
        
        # Se arquivo estiver comprimido, descompactar
        if local_file.endswith('.gz'):
            uncompressed_file = local_file[:-3]  # Remover .gz
            with gzip.open(local_file, 'rb') as f_in:
                with open(uncompressed_file, 'wb') as f_out:
                    shutil.copyfileobj(f_in, f_out)
            
            os.remove(local_file)  # Remover arquivo comprimido
            logger.info(f"Arquivo descompactado: {uncompressed_file}")
            return uncompressed_file
        
        return local_file
    except ClientError as e:
        logger.error(f"Erro ao fazer download do S3: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Erro inesperado: {str(e)}")
        raise


def restore_database(backup_file):
    """Restaura o banco de dados a partir do arquivo de backup"""
    try:
        logger.info(f"Preparando para restaurar o banco de dados {PG_DATABASE}")
        
        # Comando para verificar se o banco existe
        env = os.environ.copy()
        env['PGPASSWORD'] = PG_PASSWORD
        
        # Checar se o banco existe
        check_cmd = [
            'psql',
            '-h', PG_HOST,
            '-p', PG_PORT,
            '-U', PG_USER,
            '-lqt'
        ]
        
        result = subprocess.run(check_cmd, env=env, capture_output=True, text=True)
        if result.returncode != 0:
            logger.error(f"Erro ao verificar bancos de dados: {result.stderr}")
            raise Exception(f"Falha na verificação: {result.stderr}")
        
        db_exists = PG_DATABASE in result.stdout
        
        # Se banco existir, dropar
        if db_exists:
            logger.warning(f"Banco de dados {PG_DATABASE} já existe, será removido")
            drop_cmd = [
                'dropdb',
                '-h', PG_HOST,
                '-p', PG_PORT,
                '-U', PG_USER,
                PG_DATABASE
            ]
            
            drop_result = subprocess.run(drop_cmd, env=env, capture_output=True, text=True)
            if drop_result.returncode != 0:
                logger.error(f"Erro ao remover banco existente: {drop_result.stderr}")
                raise Exception(f"Falha ao remover banco: {drop_result.stderr}")
        
        # Criar banco vazio
        create_cmd = [
            'createdb',
            '-h', PG_HOST,
            '-p', PG_PORT,
            '-U', PG_USER,
            PG_DATABASE
        ]
        
        create_result = subprocess.run(create_cmd, env=env, capture_output=True, text=True)
        if create_result.returncode != 0:
            logger.error(f"Erro ao criar banco: {create_result.stderr}")
            raise Exception(f"Falha ao criar banco: {create_result.stderr}")
        
        # Restaurar do backup
        logger.info(f"Restaurando banco a partir de {backup_file}")
        restore_cmd = [
            'pg_restore',
            '-h', PG_HOST,
            '-p', PG_PORT,
            '-U', PG_USER,
            '-d', PG_DATABASE,
            '--no-owner',
            '--role=' + PG_USER,
            backup_file
        ]
        
        restore_result = subprocess.run(restore_cmd, env=env, capture_output=True, text=True)
        if restore_result.returncode != 0:
            # pg_restore geralmente retorna avisos, não necessariamente erros fatais
            logger.warning(f"Avisos durante restauração: {restore_result.stderr}")
        
        logger.info(f"Restauração do banco {PG_DATABASE} concluída")
        return True
    except Exception as e:
        logger.error(f"Erro ao restaurar banco de dados: {str(e)}")
        raise


def cleanup_local_files(file_path):
    """Remove arquivos temporários de restauração"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"Arquivo temporário removido: {file_path}")
    except Exception as e:
        logger.error(f"Erro ao remover arquivo temporário: {str(e)}")


def parse_arguments():
    """Processa argumentos da linha de comando"""
    parser = argparse.ArgumentParser(description='Restaura banco de dados PostgreSQL de um backup S3')
    
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--list', action='store_true', help='Lista backups disponíveis para restauração')
    group.add_argument('--latest', action='store_true', help='Restaura o backup mais recente')
    group.add_argument('--key', type=str, help='Chave S3 específica para restaurar')
    
    return parser.parse_args()


def main():
    """Função principal de execução da restauração"""
    try:
        args = parse_arguments()
        logger.info("=== Iniciando processo de Restauração S3 → PostgreSQL ===")
        
        if args.list:
            # Apenas listar backups disponíveis
            backups = list_available_backups()
            print("\nBackups Disponíveis:")
            print("=====================")
            for i, backup in enumerate(backups[:20]):  # Limitar a 20 backups
                date_str = backup['date'].strftime('%d/%m/%Y %H:%M:%S')
                size_mb = backup['size'] / (1024 * 1024)
                print(f"{i+1}. {backup['key']} - {date_str} - {size_mb:.2f} MB")
            return 0
            
        # Identificar o backup a ser restaurado
        if args.latest:
            backups = list_available_backups()
            if not backups:
                logger.error("Nenhum backup disponível para restauração")
                return 1
                
            s3_key = backups[0]['key']  # Usar o backup mais recente
            logger.info(f"Selecionado backup mais recente: {s3_key}")
        else:
            s3_key = args.key
            logger.info(f"Usando backup específico: {s3_key}")
        
        # Realizar o download
        backup_file = download_from_s3(s3_key)
        
        # Restaurar o banco de dados
        restore_database(backup_file)
        
        # Limpar arquivos temporários
        cleanup_local_files(backup_file)
        
        logger.info("=== Restauração concluída com sucesso! ===")
        return 0
    except Exception as e:
        logger.error(f"Falha no processo de restauração: {str(e)}")
        return 1


if __name__ == "__main__":
    sys.exit(main()) 