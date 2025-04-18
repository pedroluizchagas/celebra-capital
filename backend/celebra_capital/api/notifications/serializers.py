from rest_framework import serializers
from .models import Notification, UserNotificationSettings


class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo de Notificação.
    """
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    recipient_email = serializers.EmailField(source='recipient.email', read_only=True)
    recipient_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'recipient', 'title', 'content', 'created_at', 
            'read', 'read_at', 'notification_type', 'notification_type_display',
            'recipient_email', 'recipient_name', 'extra_data'
        ]
        read_only_fields = ['created_at', 'read_at']
    
    def get_recipient_name(self, obj):
        if hasattr(obj.recipient, 'get_full_name'):
            return obj.recipient.get_full_name()
        return obj.recipient.username


class UserNotificationSettingsSerializer(serializers.ModelSerializer):
    """
    Serializador para o modelo de Configurações de Notificação do Usuário
    """
    class Meta:
        model = UserNotificationSettings
        fields = [
            'id', 'user', 'email_notifications', 'push_notifications',
            'proposal_status_updates', 'document_requests', 
            'proposal_approvals', 'proposal_rejections',
            'system_notifications', 'reminders',
            'push_subscription_json'
        ]
        read_only_fields = ['id', 'user']
        
    def update(self, instance, validated_data):
        """
        Atualização personalizada para lidar com o campo push_subscription_json
        """
        # Se o usuário desativa as notificações push, não apagamos a inscrição
        # apenas desabilitamos o envio
        if 'push_notifications' in validated_data and not validated_data['push_notifications']:
            validated_data.pop('push_subscription_json', None)
        
        return super().update(instance, validated_data) 