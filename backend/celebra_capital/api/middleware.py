"""
Middlewares customizados para logging de requisições
"""
import time
import uuid
import json
from django.utils.deprecation import MiddlewareMixin
from config.logging_config import get_structured_logger

# Inicializa o logger estruturado
logger = get_structured_logger("api.request")

class RequestLoggingMiddleware(MiddlewareMixin):
    """
    Middleware para registrar logs estruturados de requisições e respostas
    """
    
    def process_request(self, request):
        """
        Processa a requisição para adicionar um ID único e registrar dados
        """
        # Gera um ID único para rastrear a requisição
        request.request_id = str(uuid.uuid4())
        request.start_time = time.time()
        
        # Evita logar informações sensíveis
        path = request.path
        if '/auth' in path or '/login' in path or '/password' in path:
            # Não registrar corpo de requisições de autenticação
            body = "***DADOS SENSÍVEIS OMITIDOS***"
        else:
            try:
                # Tenta obter o corpo da requisição para logar
                body = json.loads(request.body) if request.body else {}
                # Oculta campos sensíveis específicos
                if isinstance(body, dict):
                    for field in ['password', 'token', 'refresh', 'authorization', 'senha', 'cpf']:
                        if field in body:
                            body[field] = '***OMITIDO***'
            except Exception:
                body = '<CORPO NÃO PODE SER PARSEADO>'
        
        # Registra a requisição
        logger.info(
            "Requisição recebida",
            request_id=request.request_id,
            method=request.method,
            path=request.path,
            query_params=dict(request.GET),
            ip=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT'),
            body=body
        )
    
    def process_response(self, request, response):
        """
        Processa a resposta para registrar logs da resposta
        """
        if hasattr(request, 'request_id') and hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            
            # Determina o tipo de resposta e o conteúdo a ser registrado
            if 200 <= response.status_code < 400:
                log_method = logger.info
            elif 400 <= response.status_code < 500:
                log_method = logger.warning
            else:
                log_method = logger.error
            
            # Registra a resposta
            log_method(
                "Resposta enviada",
                request_id=request.request_id,
                method=request.method,
                path=request.path,
                status_code=response.status_code,
                duration_ms=round(duration * 1000, 2),
                content_type=response.get('Content-Type', None)
            )
            
        return response 