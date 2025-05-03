from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import SystemSetting, EducationalContent, Notification
from config.logging_config import get_structured_logger

# Inicializa o logger estruturado
logger = get_structured_logger(__name__)

# Implementações de views serão adicionadas posteriormente

class PublicSettingsView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        # Implementação futura
        return Response({"detail": "Endpoint em desenvolvimento"}, status=status.HTTP_501_NOT_IMPLEMENTED)

class EducationalContentListView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        # Implementação futura
        return Response({"detail": "Endpoint em desenvolvimento"}, status=status.HTTP_501_NOT_IMPLEMENTED)

class EducationalContentDetailView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, slug):
        # Implementação futura
        return Response({"detail": "Endpoint em desenvolvimento"}, status=status.HTTP_501_NOT_IMPLEMENTED)

class NotificationListView(APIView):
    def get(self, request):
        # Implementação futura
        return Response({"detail": "Endpoint em desenvolvimento"}, status=status.HTTP_501_NOT_IMPLEMENTED)

class MarkNotificationReadView(APIView):
    def post(self, request, pk):
        # Implementação futura
        return Response({"detail": "Endpoint em desenvolvimento"}, status=status.HTTP_501_NOT_IMPLEMENTED)

class HealthCheckView(APIView):
    """
    Endpoint para verificar a saúde da API
    """
    permission_classes = []
    
    def get(self, request):
        """
        Retorna status 200 se a API estiver funcionando
        """
        logger.info(
            "Health check realizado", 
            user_agent=request.META.get('HTTP_USER_AGENT'),
            ip=request.META.get('REMOTE_ADDR')
        )
        
        return Response(
            {"status": "ok", "message": "API funcionando normalmente"},
            status=status.HTTP_200_OK
        ) 