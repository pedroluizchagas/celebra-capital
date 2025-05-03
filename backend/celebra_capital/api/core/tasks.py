import os
import logging
import subprocess
from celery import shared_task
from django.conf import settings
from datetime import datetime

logger = logging.getLogger('backup')

@shared_task(name='run_database_backup')
def run_database_backup():
    """
    Task Celery para executar o script de backup do banco de dados
    e enviar para o S3. Normalmente agendada para execução diária.
    """
    try:
        backup_script = os.path.join(settings.BASE_DIR, '..', '..', 'scripts', 'backup', 'pg_backup.py')
        
        if not os.path.exists(backup_script):
            logger.error(f"Script de backup não encontrado: {backup_script}")
            return False
        
        logger.info(f"Iniciando execução automática de backup: {backup_script}")
        
        # Prepare environment variables
        env = os.environ.copy()
        
        # Execute script with python
        result = subprocess.run(
            ['python', backup_script],
            env=env,
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            logger.error(f"Erro ao executar backup automático: {result.stderr}")
            return False
            
        logger.info(f"Backup automático executado com sucesso às {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        return True
    except Exception as e:
        logger.error(f"Exceção ao executar backup automático: {str(e)}")
        return False 