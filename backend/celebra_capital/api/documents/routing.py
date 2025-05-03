from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/ocr/(?P<document_id>\w+)/$', consumers.OcrConsumer.as_asgi()),
] 