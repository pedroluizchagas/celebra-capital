"""
Configuração do Sentry para monitoramento de erros no backend.

Para usar esta configuração, é necessário instalar o pacote sentry-sdk:
pip install sentry-sdk

Adicionar a configuração em settings/__init__.py:

if os.environ.get('ENABLE_SENTRY', 'False').lower() == 'true':
    from config.sentry import configure_sentry
    configure_sentry()
"""

import os
import logging

logger = logging.getLogger(__name__)


def configure_sentry():
    """
    Configura o Sentry para monitoramento de erros no backend Django.
    """
    try:
        import sentry_sdk
        from sentry_sdk.integrations.django import DjangoIntegration
        from sentry_sdk.integrations.logging import LoggingIntegration
        from sentry_sdk.integrations.celery import CeleryIntegration
        
        sentry_dsn = os.environ.get('SENTRY_DSN')
        
        if not sentry_dsn:
            logger.warning('SENTRY_DSN não configurado. O monitoramento de erros está desativado.')
            return
            
        environment = os.environ.get('ENVIRONMENT', 'development')
        
        # Configurar Sentry com integração Django e Celery
        sentry_sdk.init(
            dsn=sentry_dsn,
            integrations=[
                DjangoIntegration(),
                CeleryIntegration(),
                LoggingIntegration(
                    level=logging.INFO,        # Capturar logs INFO como breadcrumbs
                    event_level=logging.ERROR  # Enviar erros como eventos
                )
            ],
            # Configurar o ambiente (development, staging, production)
            environment=environment,
            # Capturar 10% das transações para monitoramento de performance em produção, 100% em outros ambientes
            traces_sample_rate=0.1 if environment == 'production' else 1.0,
            # Não enviar informações de PII (Personally Identifiable Information)
            send_default_pii=False
        )
        
        logger.info(f'Sentry configurado com sucesso no ambiente {environment}')
        
    except ImportError:
        logger.warning('Pacote sentry-sdk não encontrado. Execute pip install sentry-sdk para habilitar o monitoramento de erros.')
    except Exception as e:
        logger.error(f'Erro ao configurar Sentry: {e}') 