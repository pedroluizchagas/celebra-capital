import os
from celery import Celery
from django.conf import settings
import structlog

# Configurar o logger estruturado
logger = structlog.get_logger(__name__)

# Definir as variáveis do Django para o Celery
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'celebra_capital.settings')

# Criar a instância do Celery
app = Celery('celebra_capital')

# Configuração usando objetos do tipo namespace
app.config_from_object('django.conf:settings', namespace='CELERY')

# Carregar configurações avançadas do arquivo celery_config.py
app.config_from_object('celebra_capital.celery_config')

# Configurações adicionais
app.conf.update(
    # Broker (Redis)
    broker_url=os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/0'),
    
    # Backend de resultados (também Redis)
    result_backend=os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0'),
    
    # Serializer - podemos usar 'json' para maior compatibilidade ou 'pickle' para tipos complexos
    accept_content=['json', 'pickle'],
    task_serializer='json',
    result_serializer='json',
    
    # Configuração de retentativas para tarefas OCR
    task_acks_late=True,  # Garantir que as tarefas sejam processadas antes de serem confirmadas
    task_reject_on_worker_lost=True,  # Recolocar tarefas na fila se um worker falhar
    
    # Configurações de tempo limite para evitar travamentos
    task_time_limit=600,  # 10 minutos no máximo para qualquer tarefa
    task_soft_time_limit=300,  # Aviso em 5 minutos
    
    # Configurações de rate limiting para não sobrecarregar serviços externos
    # Exemplo: 'celebra_capital.api.documents.tasks.process_document_ocr': {'rate_limit': '10/m'},
    task_routes={
        'celebra_capital.api.documents.tasks.process_document_ocr': {'queue': 'ocr'},
        'celebra_capital.api.documents.tasks.*': {'queue': 'documents'},
        'celebra_capital.api.signatures.tasks.*': {'queue': 'signatures'},
    },
    
    # Configurações de fila
    task_default_queue='default',
    task_queues={
        'default': {'exchange': 'default', 'routing_key': 'default'},
        'ocr': {'exchange': 'ocr', 'routing_key': 'ocr'},
        'documents': {'exchange': 'documents', 'routing_key': 'documents'},
        'signatures': {'exchange': 'signatures', 'routing_key': 'signatures'},
    },
    
    # Configuração de retries para tarefas
    task_default_retry_delay=30,  # 30 segundos entre tentativas
    task_max_retries=5,  # Máximo de 5 tentativas
    
    # Beats - para tarefas agendadas
    beat_scheduler='django_celery_beat.schedulers:DatabaseScheduler',
    
    # Flower - para monitoramento
    flower_port=5555,
)

# Carregar automaticamente as tarefas de todos os apps registrados
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)

@app.task(bind=True)
def debug_task(self):
    """Tarefa para debug do Celery"""
    logger.info("Celery is working!", task_id=self.request.id)

# Configuração de sinais
@app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    """Configurar tarefas periódicas"""
    # Exemplo: tarefa que roda a cada hora para limpar documentos temporários
    # sender.add_periodic_task(
    #     3600.0,
    #     'celebra_capital.api.documents.tasks.cleanup_temporary_files',
    #     name='cleanup_temporary_files_hourly',
    # )
    
    # Adicionar uma tarefa para monitorar OCR pendentes
    sender.add_periodic_task(
        300.0,  # A cada 5 minutos
        'celebra_capital.api.documents.tasks.monitor_pending_ocr_tasks',
        name='monitor_pending_ocr_tasks',
    )
    
    # Adicionar uma tarefa para limpar resultados de OCR antigos
    sender.add_periodic_task(
        86400.0,  # Uma vez por dia
        'celebra_capital.api.documents.tasks.cleanup_old_ocr_results',
        name='cleanup_old_ocr_results',
    )
    
    # Adicionar uma tarefa para verificar status de assinaturas
    sender.add_periodic_task(
        600.0,  # A cada 10 minutos
        'celebra_capital.api.signatures.tasks.check_signature_status',
        name='check_signature_status',
    )
    
    # Adicionar uma tarefa para enviar lembretes de assinaturas pendentes
    sender.add_periodic_task(
        43200.0,  # Duas vezes por dia (a cada 12 horas)
        'celebra_capital.api.signatures.tasks.generate_signature_reminders',
        name='generate_signature_reminders',
    ) 