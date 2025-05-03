"""
Configuração de logs estruturados em formato JSON.

Para usar, adicione ao settings.py:

from config.logging_config import configure_logging
configure_logging()
"""

import os
import logging
import logging.config
import structlog


def configure_logging():
    """Configura o sistema de logs estruturados em formato JSON."""
    
    # Determina o nível de log com base no ambiente
    log_level = os.environ.get('DJANGO_LOG_LEVEL', 'INFO')
    
    # Se estiver em desenvolvimento, use um formato mais legível
    is_dev = os.environ.get('ENVIRONMENT', '').lower() == 'development'
    
    # Armazena logs de erros em arquivos
    log_dir = os.environ.get('LOG_DIR', os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs'))
    os.makedirs(log_dir, exist_ok=True)
    
    # Processadores do structlog para desenvolvimento (formatação colorida e legível)
    dev_processors = [
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="%Y-%m-%d %H:%M:%S"),
        structlog.dev.ConsoleRenderer(colors=True),
    ]
    
    # Processadores do structlog para produção (formatação JSON)
    prod_processors = [
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer(),
    ]
    
    # Configuração de logs
    logging_config = {
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            'json': {
                '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
                'format': '%(asctime)s %(levelname)s %(name)s %(message)s %(pathname)s %(lineno)s %(funcName)s %(process)d %(thread)d %(traceback)s',
                'rename_fields': {
                    'levelname': 'severity',
                    'asctime': 'timestamp'
                }
            },
            'verbose': {
                'format': '%(levelname)s %(asctime)s %(module)s %(process)d %(thread)d %(message)s'
            },
            'simple': {
                'format': '%(levelname)s %(message)s'
            },
            'structlog': {
                '()': structlog.stdlib.ProcessorFormatter,
                'processor': structlog.dev.ConsoleRenderer(colors=True) if is_dev else structlog.processors.JSONRenderer(),
                'foreign_pre_chain': dev_processors if is_dev else prod_processors,
            },
        },
        'handlers': {
            'console': {
                'level': log_level,
                'class': 'logging.StreamHandler',
                'formatter': 'verbose' if is_dev else 'json',
            },
            'file': {
                'level': 'ERROR',
                'class': 'logging.FileHandler',
                'filename': os.path.join(log_dir, 'celebra_capital_error.log'),
                'formatter': 'json',
            },
            'structlog_console': {
                'level': log_level,
                'class': 'logging.StreamHandler',
                'formatter': 'structlog',
            },
        },
        'loggers': {
            'django': {
                'handlers': ['console', 'file'],
                'level': log_level,
                'propagate': False,
            },
            'django.server': {
                'handlers': ['console'],
                'level': log_level,
                'propagate': False,
            },
            'django.request': {
                'handlers': ['console', 'file'],
                'level': 'ERROR',
                'propagate': False,
            },
            'django.db.backends': {
                'handlers': ['console'],
                'level': 'WARNING' if is_dev else 'ERROR',
                'propagate': False,
            },
            'celebra_capital': {
                'handlers': ['structlog_console', 'file'],
                'level': log_level,
                'propagate': False,
            },
            '': {
                'handlers': ['console', 'file'],
                'level': log_level,
            },
        },
    }
    
    # Aplicar configuração de logging
    logging.config.dictConfig(logging_config)
    
    # Configurar structlog
    structlog.configure(
        processors=dev_processors if is_dev else prod_processors,
        context_class=structlog.threadlocal.wrap_dict(dict),
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )
    
    # Criar um logger de exemplo
    logger = structlog.get_logger("celebra_capital")
    logger.info("Logging configurado com sucesso", 
                environment=os.environ.get('ENVIRONMENT', 'development'),
                format="json" if not is_dev else "console")
    
    return logging_config


def get_structured_logger(name):
    """
    Retorna um logger estruturado configurado
    
    Uso:
    ```python
    from config.logging_config import get_structured_logger
    
    logger = get_structured_logger(__name__)
    logger.info("Mensagem informativa", user_id=123, action="login")
    logger.error("Erro ao processar", error_code=500, exception_type="ValueError")
    ```
    """
    return structlog.get_logger(name) 