"""
Tasks Celery para processamento assíncrono de analytics.
"""

from celery import shared_task
import logging
from typing import Dict, Any

from .models import AnalyticsEvent

logger = logging.getLogger('celebra.analytics.tasks')


@shared_task(
    name='analytics.store_event',
    bind=True,
    max_retries=3,
    default_retry_delay=60,
    acks_late=True
)
def store_analytics_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Armazena evento de analytics no banco de dados.
    
    Args:
        event_data: Dados do evento a serem armazenados
        
    Returns:
        Dict com ID do evento e status do armazenamento
    """
    try:
        category = event_data.get('category')
        action = event_data.get('action')
        user_id = event_data.get('user_id')
        properties = event_data.get('properties', {})
        timestamp = event_data.get('timestamp')
        
        # Criar registro no banco
        event = AnalyticsEvent.objects.create(
            category=category,
            action=action,
            user_id=user_id,
            properties=properties,
            timestamp=timestamp,
            event_id=event_data.get('event_id')
        )
        
        logger.info(
            f"Evento de analytics armazenado: {event.event_id}",
            extra={
                'event_id': event.event_id,
                'category': category,
                'action': action
            }
        )
        
        return {
            'event_id': event.event_id,
            'status': 'stored'
        }
    
    except Exception as e:
        # Registro de erro e retry
        logger.error(
            f"Erro ao armazenar evento de analytics: {str(e)}",
            exc_info=True,
            extra={'event_data': event_data}
        )
        
        # Tentar novamente em caso de falha
        self.retry(exc=e)
        
        return {
            'event_id': event_data.get('event_id'),
            'status': 'error',
            'error': str(e)
        }


@shared_task(name='analytics.process_daily_aggregates')
def process_daily_aggregates() -> Dict[str, Any]:
    """
    Processa agregações diárias dos eventos de analytics.
    Executado diariamente para calcular métricas agregadas.
    
    Returns:
        Dict com informações sobre o processamento
    """
    # Implementação das agregações aqui
    # Esta função seria chamada por um scheduler Celery
    
    return {
        'status': 'processed',
        'metrics': []
    } 