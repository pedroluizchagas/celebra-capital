"""
Serviços de analytics para a plataforma Celebra Capital.
"""

import json
import logging
import time
from datetime import datetime
from typing import Any, Dict, Optional, Union

from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

# Configuração de logger dedicado para analytics
analytics_logger = logging.getLogger('celebra.analytics')


def track_event(
    category: str,
    action: str,
    properties: Optional[Dict[str, Any]] = None,
    user_id: Optional[Union[int, str]] = None,
) -> Dict[str, Any]:
    """
    Registra um evento de analytics.

    Args:
        category: Categoria do evento (ex: proposta, documento, usuario)
        action: Ação específica (ex: proposta_iniciada, documento_enviado)
        properties: Propriedades adicionais do evento
        user_id: ID do usuário associado ao evento (opcional)

    Returns:
        Dict com os dados do evento registrado
    """
    properties = properties or {}
    
    # Timestamp para o evento
    timestamp = timezone.now().isoformat()
    
    # Preparar dados do evento
    event_data = {
        'event_id': f"{int(time.time() * 1000)}-{hash(str(category) + str(action))}",
        'category': category,
        'action': action,
        'timestamp': timestamp,
        'environment': settings.ENVIRONMENT,
        'user_id': user_id,
        'properties': properties
    }
    
    # Log estruturado em JSON
    analytics_logger.info(
        f"ANALYTICS_EVENT:{category}:{action}",
        extra={
            'event_data': json.dumps(event_data)
        }
    )
    
    # Armazenamento assíncrono em banco de dados
    # É implementado via celery task para não impactar performance
    from .tasks import store_analytics_event
    store_analytics_event.delay(event_data)
    
    return event_data


def track_api_request(
    request,
    response,
    execution_time: float,
) -> Dict[str, Any]:
    """
    Registra métricas de requisição de API.
    Chamado pelo middleware de analytics.

    Args:
        request: Objeto de requisição Django
        response: Objeto de resposta Django
        execution_time: Tempo de execução em segundos

    Returns:
        Dict com os dados do evento registrado
    """
    # Ignora requisições para assets estáticos ou endpoints de health check
    if (
        request.path.startswith('/static/') or
        request.path.startswith('/media/') or
        request.path == '/api/health/' or 
        request.path == '/health/'
    ):
        return None
    
    # Extrai user_id se autenticado
    user_id = None
    if hasattr(request, 'user') and request.user.is_authenticated:
        user_id = request.user.id
    
    # Propriedades da requisição
    properties = {
        'path': request.path,
        'method': request.method,
        'status_code': response.status_code,
        'execution_time_ms': int(execution_time * 1000),
        'content_type': response.get('Content-Type', ''),
        'content_length': len(response.content) if hasattr(response, 'content') else 0,
        'user_agent': request.META.get('HTTP_USER_AGENT', ''),
        'referer': request.META.get('HTTP_REFERER', ''),
        'ip': _get_client_ip(request),
    }
    
    # Registra o evento
    return track_event(
        category='api',
        action='request',
        properties=properties,
        user_id=user_id
    )


def _get_client_ip(request) -> str:
    """
    Extrai o IP real do cliente, considerando proxies.
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR', '')
    return ip 