INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'celebra_capital.api.core',
    'celebra_capital.api.users',
    'celebra_capital.api.proposals',
    'celebra_capital.api.documents',
    'celebra_capital.api.notifications',
]

# Site URL para links nos emails
SITE_URL = os.environ.get('SITE_URL', 'http://localhost:5173')

# Configurações de email
EMAIL_BACKEND = os.environ.get(
    'EMAIL_BACKEND',
    'django.core.mail.backends.console.EmailBackend'  # Para desenvolvimento
)
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'noreply@celebracapital.com.br')
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.example.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')

# Configurações para Web Push (para desenvolvimento, usar valores fixos)
# Em produção, gerar as chaves usando a biblioteca pywebpush
VAPID_PUBLIC_KEY = os.environ.get('VAPID_PUBLIC_KEY', 'BOwlX3a4Kiuger4gq3nsPSqaM9qpoQIlPrdD2I361z5A0kLuQC4mTx8aJkgwWK8tIZxZ9LMtWA3YU7-sUYP2X1o')
VAPID_PRIVATE_KEY = os.environ.get('VAPID_PRIVATE_KEY', 'aDbmUVPUvUbWJEbIHPgHtGCFfVHpnP-JwsZQzXjrTCE')
VAPID_ADMIN_EMAIL = os.environ.get('VAPID_ADMIN_EMAIL', 'admin@celebracapital.com.br') 