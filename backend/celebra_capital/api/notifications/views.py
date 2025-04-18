from rest_framework import generics, status, permissions, viewsets, mixins
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.utils import timezone

from .models import Notification, UserNotificationSettings
from .serializers import NotificationSerializer, UserNotificationSettingsSerializer
from .services import NotificationService


class NotificationListView(generics.ListAPIView):
    """
    Lista as notificações do usuário autenticado
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Obter parâmetros de filtro
        status_filter = self.request.query_params.get('status')
        limit = int(self.request.query_params.get('limit', 20))
        offset = int(self.request.query_params.get('offset', 0))
        
        # Obter notificações através do serviço
        notifications = NotificationService.get_user_notifications(
            user_id=self.request.user.id,
            status=status_filter,
            limit=limit,
            offset=offset
        )
        
        return notifications


class NotificationDetailView(generics.RetrieveUpdateAPIView):
    """
    Detalhe e atualização de uma notificação específica
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    """
    Marca uma notificação como lida
    """
    success = NotificationService.mark_notification_as_read(
        notification_id=notification_id,
        user_id=request.user.id
    )
    
    if success:
        return Response({"detail": "Notificação marcada como lida."}, status=status.HTTP_200_OK)
    else:
        return Response(
            {"detail": "Não foi possível marcar a notificação como lida."},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_read(request):
    """
    Marca todas as notificações do usuário como lidas
    """
    success = NotificationService.mark_all_as_read(user_id=request.user.id)
    
    if success:
        return Response({"detail": "Todas as notificações marcadas como lidas."}, status=status.HTTP_200_OK)
    else:
        return Response(
            {"detail": "Não foi possível marcar as notificações como lidas."},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unread_count(request):
    """
    Retorna o número de notificações não lidas
    """
    count = NotificationService.get_unread_count(user_id=request.user.id)
    return Response({"count": count}, status=status.HTTP_200_OK)


class UserNotificationSettingsView(generics.RetrieveUpdateAPIView):
    """
    Obtém e atualiza as configurações de notificação do usuário
    """
    serializer_class = UserNotificationSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        # Obter ou criar configurações para o usuário atual
        settings, created = UserNotificationSettings.objects.get_or_create(user=self.request.user)
        return settings


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_push_subscription(request):
    """
    Salva os dados de inscrição para notificações push
    """
    subscription_json = request.data.get('subscription')
    
    if not subscription_json:
        return Response(
            {"detail": "Dados de inscrição não fornecidos."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Obter ou criar configurações para o usuário
        settings, created = UserNotificationSettings.objects.get_or_create(user=request.user)
        
        # Salvar dados de inscrição
        settings.push_subscription_json = subscription_json
        settings.push_notifications = True
        settings.save()
        
        return Response({"detail": "Inscrição para notificações push salva com sucesso."}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {"detail": f"Erro ao salvar inscrição: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_test_notification(request):
    """
    Envia uma notificação de teste para o usuário
    """
    try:
        notification = NotificationService.create_notification(
            user_id=request.user.id,
            title="Notificação de teste",
            message="Esta é uma notificação de teste do sistema Celebra Capital.",
            notification_type='system'
        )
        
        if notification:
            return Response({"detail": "Notificação de teste enviada com sucesso."}, status=status.HTTP_200_OK)
        else:
            return Response(
                {"detail": "Não foi possível enviar a notificação de teste."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    except Exception as e:
        return Response(
            {"detail": f"Erro ao enviar notificação de teste: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class NotificationViewSet(viewsets.ModelViewSet):
    """
    API para gerenciar notificações.
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filtra as notificações para mostrar apenas as do usuário autenticado.
        """
        user = self.request.user
        return Notification.objects.filter(recipient=user).order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def unread(self):
        """
        Retorna apenas as notificações não lidas do usuário.
        """
        queryset = self.get_queryset().filter(read=False)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self):
        """
        Marca todas as notificações do usuário como lidas.
        """
        queryset = self.get_queryset().filter(read=False)
        count = queryset.count()
        queryset.update(read=True, read_at=timezone.now())
        return Response({'status': 'success', 'message': f'{count} notificações marcadas como lidas'})
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """
        Marca uma notificação específica como lida.
        """
        notification = self.get_object()
        notification.mark_as_read()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        """
        Sobrescreve o método create para adicionar o usuário autenticado como destinatário.
        
        Note: Geralmente, as notificações são criadas pelo sistema, não pelo usuário.
        Este método é principalmente para testes ou para admins.
        """
        if not request.user.is_staff:
            return Response(
                {"detail": "Você não tem permissão para criar notificações manualmente."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        return super().create(request, *args, **kwargs) 