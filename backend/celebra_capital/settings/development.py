"""
Configurações específicas para ambiente de desenvolvimento
"""

import os
import dj_database_url
from dotenv import load_dotenv
from .base import *

# Carrega variáveis de ambiente do arquivo .env.development
load_dotenv(os.path.join(BASE_DIR, '.env.development'))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-5u4%z5a#@zro40l=&fo!&xsm_yrqb-nxvbcnb6-vfuf8_7k%3h')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.config(default=DATABASE_URL, conn_max_age=600)
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('DB_NAME', 'celebra_capital'),
            'USER': os.environ.get('DB_USER', 'postgres'),
            'PASSWORD': os.environ.get('DB_PASSWORD', 'postgres'),
            'HOST': os.environ.get('DB_HOST', 'localhost'),
            'PORT': os.environ.get('DB_PORT', '5432'),
        }
    }

# CORS settings
CORS_ALLOW_ALL_ORIGINS = True

# Email settings
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Desabilitar Sentry em desenvolvimento
ENABLE_SENTRY = os.environ.get('ENABLE_SENTRY', 'False').lower() == 'true'
if ENABLE_SENTRY:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration
    from config.sentry import configure_sentry
    configure_sentry()

# Configuração do JWT para development
SIMPLE_JWT['SIGNING_KEY'] = SECRET_KEY

# Redis/Celery configuration
REDIS_HOST = os.environ.get('REDIS_HOST', 'localhost')
REDIS_PORT = os.environ.get('REDIS_PORT', '6379')
CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', f'redis://{REDIS_HOST}:{REDIS_PORT}/0')
CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND', f'redis://{REDIS_HOST}:{REDIS_PORT}/0')

# Logging
LOGGING_LEVEL = os.environ.get('DJANGO_LOG_LEVEL', 'DEBUG')

# Configuração de logs para desenvolvimento
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': LOGGING_LEVEL,
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': LOGGING_LEVEL,
            'propagate': True,
        },
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'INFO',  # Não mostrar logs de SQL por padrão
            'propagate': False,
        },
        'celebra_capital': {
            'handlers': ['console'],
            'level': LOGGING_LEVEL,
            'propagate': True,
        },
    },
} 