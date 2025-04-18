from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import SystemSetting, EducationalContent, Notification

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
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        # Implementação básica de health check
        return Response({"status": "ok", "version": "0.1.0"}, status=status.HTTP_200_OK) 