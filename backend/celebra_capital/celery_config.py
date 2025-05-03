"""
Configurações avançadas do Celery para o processamento de OCR
"""
import os
from celery.schedules import crontab
from django.conf import settings

# Configurações de broker e backend
broker_url = os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/0')
result_backend = os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')

# Configurações de serialização
accept_content = ['json', 'pickle']
task_serializer = 'json'
result_serializer = 'json'

# Configurações de retentativas para tarefas OCR
task_acks_late = True  # Garantir que as tarefas sejam processadas antes de serem confirmadas
task_reject_on_worker_lost = True  # Recolocar tarefas na fila se um worker falhar

# Configurações de tempo limite para evitar travamentos
task_time_limit = 600  # 10 minutos no máximo para qualquer tarefa
task_soft_time_limit = 300  # Aviso em 5 minutos

# Configurações de rotas para direcionar tarefas para filas específicas
task_routes = {
    'process_document_ocr': {
        'queue': 'ocr',
        'exchange': 'ocr',
        'routing_key': 'ocr',
    },
    'update_document_status': {
        'queue': 'documents',
        'exchange': 'documents',
        'routing_key': 'documents',
    },
    'run_database_backup': {
        'queue': 'default',
        'exchange': 'default',
        'routing_key': 'default',
    },
}

# Configurações de fila e prioridades
task_default_queue = 'default'
task_queues = {
    'default': {
        'exchange': 'default',
        'routing_key': 'default',
        'queue_arguments': {'x-max-priority': 10}
    },
    'ocr': {
        'exchange': 'ocr',
        'routing_key': 'ocr',
        'queue_arguments': {'x-max-priority': 10}
    },
    'documents': {
        'exchange': 'documents',
        'routing_key': 'documents',
        'queue_arguments': {'x-max-priority': 10}
    },
}

# Configuração de retries para tarefas
task_default_retry_delay = 30  # 30 segundos entre tentativas
task_max_retries = 5  # Máximo de 5 tentativas

# Beats - para tarefas agendadas
beat_scheduler = 'django_celery_beat.schedulers:DatabaseScheduler'

# Flower - para monitoramento
flower_port = int(os.environ.get('FLOWER_PORT', '5555'))

# Configurações de worker
worker_prefetch_multiplier = 1  # Não pegar muitas tarefas de uma vez
worker_concurrency = int(os.environ.get('CELERY_CONCURRENCY', '2'))
worker_max_tasks_per_child = 200  # Reiniciar worker após 200 tarefas para evitar memory leaks

# Configurações de logging
worker_hijack_root_logger = False
worker_log_format = "[%(asctime)s: %(levelname)s/%(processName)s] [%(task_name)s(%(task_id)s)] %(message)s"

# Configurações de tarefas periódicas
beat_schedule = {
    'check-pending-documents': {
        'task': 'check_pending_documents',
        'schedule': crontab(minute='*/15'),  # A cada 15 minutos
    },
    'check-pending-signatures': {
        'task': 'check_pending_signatures',
        'schedule': crontab(minute='*/30'),  # A cada 30 minutos
    },
    'cleanup-temp-files': {
        'task': 'cleanup_temp_files',
        'schedule': crontab(hour=3, minute=0),  # Às 3h da manhã
    },
    'database-backup': {
        'task': 'run_database_backup',
        'schedule': crontab(hour=1, minute=30),  # Às 1h30 da manhã
        'options': {'queue': 'default'},
    },
}

# Configurações de task padrão
task_default_options = {
    'queue': 'default',
    'exchange': 'default',
    'routing_key': 'default',
    'expires': 3600,  # 1 hora
    'retry': True,
    'retry_policy': {
        'max_retries': 3,
        'interval_start': 0,
        'interval_step': 0.2,
        'interval_max': 0.5,
    },
}

# Se ambiente for de desenvolvimento, ajustar configurações
if os.environ.get('ENVIRONMENT', 'development') == 'development':
    # Reduzir intervalo de batidas para desenvolvimento
    beat_schedule['check-pending-documents']['schedule'] = crontab(minute='*/5')  # A cada 5 minutos
    beat_schedule['check-pending-signatures']['schedule'] = crontab(minute='*/10')  # A cada 10 minutos 