from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.db import connection
import redis
import os


class HealthCheckView(APIView):
    """
    Endpoint para verificação de saúde do sistema.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        health_status = {
            "status": "ok",
            "database": self._check_database(),
            "redis": self._check_redis()
        }
        
        if not all(health_status.values()):
            return Response(health_status, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
        return Response(health_status, status=status.HTTP_200_OK)
    
    def _check_database(self):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
            return "ok"
        except Exception:
            return "error"
    
    def _check_redis(self):
        try:
            redis_host = os.environ.get('REDIS_HOST', 'localhost')
            redis_port = os.environ.get('REDIS_PORT', '6379')
            
            r = redis.Redis(host=redis_host, port=redis_port, socket_timeout=5)
            r.ping()
            return "ok"
        except Exception:
            return "error" 