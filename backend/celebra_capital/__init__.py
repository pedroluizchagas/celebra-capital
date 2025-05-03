# Importa o aplicativo Celery quando o Django é inicializado
from .celery import app as celery_app

__all__ = ('celery_app',) 