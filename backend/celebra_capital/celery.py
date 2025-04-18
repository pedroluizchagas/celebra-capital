import os
from celery import Celery

# Define o módulo de configuração padrão do Django para o 'celery'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'celebra_capital.settings')

app = Celery('celebra_capital')

# Usando configuração baseada em string para fazer com que o celery 
# receba a configuração do projeto Django.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Carrega automaticamente tarefas de todos os apps registrados do Django
app.autodiscover_tasks()

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}') 