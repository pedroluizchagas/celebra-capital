from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import connection
from django.db.utils import OperationalError
from django.utils import timezone


class HealthCheckView(APIView):
    """
    Endpoint para verificar o status da aplicação.
    Retorna 200 OK se a aplicação estiver funcionando corretamente.
    """
    permission_classes = []  # Não requer autenticação
    
    def get(self, request, format=None):
        # Verifica a conexão com o banco de dados
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                db_status = True
        except OperationalError:
            db_status = False
        
        # Prepara resposta
        health_status = {
            "status": "online",
            "database": "connected" if db_status else "disconnected",
            "timestamp": timezone.now().isoformat()
        }
        
        if db_status:
            return Response(health_status, status=status.HTTP_200_OK)
        else:
            return Response(health_status, status=status.HTTP_503_SERVICE_UNAVAILABLE) 