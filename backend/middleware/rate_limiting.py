"""
Middleware de Rate Limiting para o Celebra Capital

Este middleware implementa mecanismos de throttling e rate limiting para
proteger a API contra abusos, ataques de força bruta e assegurar
disponibilidade em casos de sobrecarga.
"""

import time
import json
import logging
import redis
from django.http import JsonResponse
from django.conf import settings
from django.core.cache import cache
from ipware import get_client_ip
import hashlib

logger = logging.getLogger(__name__)

# Configurações de rate limiting (valores padrão, podem ser sobrescritos em settings.py)
DEFAULT_RATE_LIMITS = {
    # Limite geral por IP (requisições por minuto)
    'DEFAULT': {
        'rate': 100,  # requisições 
        'interval': 60,  # segundos
        'block_time': 60,  # tempo de bloqueio em segundos
    },
    # Limites para endpoints específicos
    'LOGIN': {
        'rate': 10,  # tentativas de login
        'interval': 60,  # por minuto
        'block_time': 300,  # bloqueio por 5 minutos após exceder
    },
    'OCR': {
        'rate': 20,  # processos de OCR
        'interval': 600,  # por 10 minutos
        'block_time': 600,  # bloqueio por 10 minutos após exceder
    },
    'ASSINATURA': {
        'rate': 30,  # assinaturas digitais
        'interval': 600,  # por 10 minutos
        'block_time': 600,  # bloqueio por 10 minutos após exceder
    },
    'UPLOAD': {
        'rate': 50,  # uploads de arquivos
        'interval': 600,  # por 10 minutos
        'block_time': 300,  # bloqueio por 5 minutos após exceder
    }
}

# Caminhos que são limitados por regras específicas
ENDPOINT_PATTERNS = {
    r'^/api/v1/auth/login/?$': 'LOGIN',
    r'^/api/v1/ocr/?': 'OCR',
    r'^/api/v1/assinatura/?': 'ASSINATURA',
    r'^/api/v1/uploads/?': 'UPLOAD',
}

# Lista de IPs com privilégios especiais
WHITELISTED_IPS = getattr(settings, 'RATE_LIMIT_WHITELIST', [
    '127.0.0.1',
    '::1',
])

class RedisCacheBackend:
    """Backend de cache usando Redis para rate limiting"""
    
    def __init__(self):
        self.redis_instance = None
        try:
            redis_url = getattr(settings, 'REDIS_URL', 'redis://localhost:6379/0')
            self.redis_instance = redis.from_url(redis_url)
            logger.info(f"Conectado ao Redis: {redis_url}")
        except Exception as e:
            logger.warning(f"Erro ao conectar ao Redis: {e}. Usando cache local.")
    
    def get(self, key):
        """Obtém valor do cache"""
        if self.redis_instance:
            value = self.redis_instance.get(key)
            return int(value) if value else None
        return cache.get(key)
    
    def set(self, key, value, timeout=None):
        """Define valor no cache com timeout opcional"""
        if self.redis_instance:
            if timeout:
                self.redis_instance.setex(key, timeout, value)
            else:
                self.redis_instance.set(key, value)
        else:
            cache.set(key, value, timeout=timeout)
    
    def incr(self, key, amount=1):
        """Incrementa valor no cache"""
        if self.redis_instance:
            try:
                return self.redis_instance.incr(key, amount)
            except redis.exceptions.ResponseError:
                # Se a chave não existir ou não for número
                self.redis_instance.set(key, amount)
                return amount
        else:
            value = cache.get(key, 0)
            new_value = value + amount
            cache.set(key, new_value)
            return new_value
    
    def expire(self, key, timeout):
        """Define tempo de expiração para chave"""
        if self.redis_instance:
            self.redis_instance.expire(key, timeout)
        # Django cache não suporta mudar TTL de chave existente

    def exists(self, key):
        """Verifica se chave existe"""
        if self.redis_instance:
            return self.redis_instance.exists(key)
        return cache.get(key) is not None

class RateLimitingMiddleware:
    """Middleware para implementar rate limiting para a API"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.cache = RedisCacheBackend()
        self.limits = getattr(settings, 'RATE_LIMITS', DEFAULT_RATE_LIMITS)
        logger.info("Middleware de Rate Limiting inicializado")
    
    def __call__(self, request):
        """Executa o middleware em cada requisição"""
        if not self._should_throttle(request):
            return self.get_response(request)
        
        client_ip, routable = get_client_ip(request)
        
        # Se o IP for indefinido ou não roteável
        if not client_ip or client_ip in WHITELISTED_IPS:
            return self.get_response(request)
        
        # Identificador de usuário, use JWT token ou session
        user_id = self._get_user_identifier(request)
        
        # Verifica se o IP ou usuário está bloqueado
        if self._is_blocked(client_ip, user_id, request.path):
            return self._build_error_response(
                request, 
                "Limite de requisições excedido. Tente novamente mais tarde.", 
                429
            )
        
        # Obtém a regra aplicável para o path
        rule_name = self._get_rule_for_path(request.path)
        rule = self.limits.get(rule_name, self.limits['DEFAULT'])
        
        # Verifica e atualiza o contador
        exceeded, current_count = self._check_rate_limit(client_ip, user_id, request.path, rule)
        
        if exceeded:
            # Bloqueia por um período se excedeu o limite
            self._block_requester(client_ip, user_id, request.path, rule['block_time'])
            
            # Log detalhado do evento
            logger.warning(f"Rate limit excedido: IP={client_ip}, User={user_id}, Path={request.path}, Count={current_count}")
            
            return self._build_error_response(
                request,
                "Limite de requisições excedido. Tente novamente mais tarde.",
                429
            )
        
        # Log detalhado se alto número de requisições
        if current_count > (rule['rate'] * 0.7):  # 70% do limite
            logger.info(f"Taxa de requisições alta: IP={client_ip}, User={user_id}, Path={request.path}, Count={current_count}")
        
        # Adiciona headers de rate limiting
        response = self.get_response(request)
        self._add_rate_limit_headers(response, rule, current_count)
        
        return response
    
    def _should_throttle(self, request):
        """Determina se a requisição deve ser throttled"""
        # Não throttle requisições de static e admin
        if request.path.startswith('/static/') or request.path.startswith('/admin/'):
            return False
        
        # Só throttle requisições para API
        if not request.path.startswith('/api/'):
            return False
        
        # Não throttle health checks
        if request.path.startswith('/api/v1/saude') or request.path == '/api/health/':
            return False
        
        return True
    
    def _get_user_identifier(self, request):
        """Obtém identificador único do usuário"""
        # Se autenticado, usa o ID do usuário
        if hasattr(request, 'user') and request.user.is_authenticated:
            return f"user:{request.user.id}"
        
        # Se não autenticado, tenta extrair do token JWT
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            jwt_token = auth_header[7:]
            # Não decodificamos o token, apenas geramos um hash
            return f"token:{hashlib.md5(jwt_token.encode()).hexdigest()}"
        
        # Usa o IP com um prefixo
        client_ip, _ = get_client_ip(request)
        return f"ip:{client_ip}"
    
    def _get_rule_for_path(self, path):
        """Determina qual regra aplicar baseado no path"""
        import re
        
        for pattern, rule_name in ENDPOINT_PATTERNS.items():
            if re.match(pattern, path):
                return rule_name
        
        return 'DEFAULT'
    
    def _get_cache_key(self, client_ip, user_id, path, rule_name):
        """Gera chave única para o cache"""
        # Para endpoints específicos, usa a regra
        if rule_name != 'DEFAULT':
            return f"rate_limit:{rule_name}:{user_id or client_ip}"
        
        # Para a regra padrão, separa por path para distribuir melhor
        path_hash = hashlib.md5(path.encode()).hexdigest()[:8]
        return f"rate_limit:default:{user_id or client_ip}:{path_hash}"
    
    def _get_block_key(self, client_ip, user_id, path):
        """Gera chave para bloqueio"""
        rule_name = self._get_rule_for_path(path)
        return f"rate_limit_block:{rule_name}:{user_id or client_ip}"
    
    def _is_blocked(self, client_ip, user_id, path):
        """Verifica se o requester está bloqueado"""
        block_key = self._get_block_key(client_ip, user_id, path)
        return self.cache.exists(block_key)
    
    def _block_requester(self, client_ip, user_id, path, block_time):
        """Bloqueia o requester por um período"""
        block_key = self._get_block_key(client_ip, user_id, path)
        self.cache.set(block_key, 1, timeout=block_time)
    
    def _check_rate_limit(self, client_ip, user_id, path, rule):
        """Verifica e incrementa o contador de rate limit"""
        rule_name = self._get_rule_for_path(path)
        cache_key = self._get_cache_key(client_ip, user_id, path, rule_name)
        
        # Incrementa o contador
        current_count = self.cache.incr(cache_key)
        
        # Se for a primeira requisição, define o tempo de expiração
        if current_count == 1:
            self.cache.expire(cache_key, rule['interval'])
        
        # Verifica se excedeu o limite
        return current_count > rule['rate'], current_count
    
    def _add_rate_limit_headers(self, response, rule, current_count):
        """Adiciona headers HTTP relacionados ao rate limiting"""
        response['X-RateLimit-Limit'] = str(rule['rate'])
        response['X-RateLimit-Remaining'] = str(max(0, rule['rate'] - current_count))
        response['X-RateLimit-Reset'] = str(int(time.time()) + rule['interval'])
        
        return response
    
    def _build_error_response(self, request, message, status):
        """Constrói resposta de erro para rate limiting"""
        data = {
            'error': 'rate_limit_exceeded',
            'message': message,
            'status': status
        }
        
        response = JsonResponse(data, status=status)
        response['Retry-After'] = '60'  # Sugere tentar novamente após 60 segundos
        
        return response

def get_rate_limit_middleware():
    """Função de fábrica para instanciar o middleware (compatibilidade com settings)"""
    return RateLimitingMiddleware 