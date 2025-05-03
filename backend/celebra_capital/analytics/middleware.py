"""
Middleware para rastreamento automático de requisições para analytics.
"""

import time
import logging
from typing import Callable, Any

from django.http import HttpRequest, HttpResponse

from .services import track_api_request

logger = logging.getLogger('celebra.analytics.middleware')


class AnalyticsMiddleware:
    """
    Middleware para rastrear automaticamente todas as requisições à API,
    calculando tempo de resposta e registrando eventos de analytics.
    """
    
    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]):
        """
        Inicializa o middleware.
        
        Args:
            get_response: Função para processar a requisição
        """
        self.get_response = get_response
    
    def __call__(self, request: HttpRequest) -> HttpResponse:
        """
        Processa a requisição e rastreia métricas.
        
        Args:
            request: Objeto de requisição HTTP
            
        Returns:
            Resposta HTTP processada
        """
        # Marca o início da requisição
        start_time = time.time()
        
        # Processa a requisição
        response = self.get_response(request)
        
        # Calcula o tempo de execução
        execution_time = time.time() - start_time
        
        # Registra o evento de analytics
        try:
            track_api_request(request, response, execution_time)
        except Exception as e:
            # Não deve impedir a resposta mesmo se analytics falhar
            logger.error(
                f"Erro ao rastrear requisição: {str(e)}",
                exc_info=True,
                extra={
                    'path': request.path,
                    'method': request.method
                }
            )
        
        return response 