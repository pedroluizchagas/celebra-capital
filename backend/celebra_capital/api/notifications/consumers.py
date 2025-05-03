import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.room_group_name = f'notifications_{self.user_id}'

        # Verificar se o usuário existe
        user_exists = await self.get_user(self.user_id)
        if not user_exists:
            await self.close()
            return

        # Adicionar ao grupo de notificações
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        
        # Enviar mensagem de conexão bem-sucedida
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Conexão estabelecida para notificações em tempo real'
        }))

    async def disconnect(self, close_code):
        # Remover do grupo de notificações
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receber mensagem do WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type', '')
        
        # Processar mensagem recebida (ex: confirmar visualização)
        if message_type == 'mark_read':
            notification_id = text_data_json.get('notification_id')
            success = await self.mark_notification_read(notification_id)
            
            await self.send(text_data=json.dumps({
                'type': 'notification_marked_read',
                'notification_id': notification_id,
                'success': success
            }))

    # Manipular evento de notificação
    async def notification_message(self, event):
        # Enviar mensagem para o WebSocket
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'notification': event['notification']
        }))

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.filter(id=user_id).exists()
        except:
            return False

    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        from .models import Notification
        try:
            notification = Notification.objects.get(id=notification_id, recipient_id=self.user_id)
            notification.is_read = True
            notification.save()
            return True
        except:
            return False 