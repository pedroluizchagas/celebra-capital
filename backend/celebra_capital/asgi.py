"""
ASGI config for celebra_capital project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import celebra_capital.api.documents.routing
import celebra_capital.api.notifications.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'celebra_capital.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            celebra_capital.api.documents.routing.websocket_urlpatterns +
            celebra_capital.api.notifications.routing.websocket_urlpatterns
        )
    ),
}) 