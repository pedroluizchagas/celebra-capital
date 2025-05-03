from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.contrib.auth import get_user_model
import json
import logging
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import Notification, UserNotificationSettings
from ..proposals.models import Proposal

User = get_user_model()
logger = logging.getLogger(__name__)

class NotificationService:
    """
    Serviço para gerenciar notificações
    """
    
    def __init__(self):
        self.channel_layer = get_channel_layer()
    
    @staticmethod
    def create_notification(
        user_id, 
        title, 
        message, 
        notification_type='system', 
        proposal_id=None, 
        metadata=None
    ):
        """
        Cria uma nova notificação e envia por email/push conforme configurações do usuário
        """
        try:
            user = User.objects.get(id=user_id)
            
            # Criar notificação
            notification = Notification.objects.create(
                user=user,
                title=title,
                message=message,
                notification_type=notification_type,
                proposal_id=proposal_id,
                metadata=metadata or {}
            )
            
            # Verificar configurações do usuário
            try:
                settings = UserNotificationSettings.objects.get(user=user)
            except UserNotificationSettings.DoesNotExist:
                # Criar configurações padrão se não existirem
                settings = UserNotificationSettings.objects.create(user=user)
            
            # Determinar se deve enviar email/push com base no tipo e configurações
            should_send_email = settings.email_notifications
            should_send_push = settings.push_notifications
            
            # Verificar configurações específicas por tipo
            if notification_type == 'proposal_status' and not settings.proposal_status_updates:
                should_send_email = should_send_push = False
            elif notification_type == 'document_request' and not settings.document_requests:
                should_send_email = should_send_push = False
            elif notification_type == 'proposal_approved' and not settings.proposal_approvals:
                should_send_email = should_send_push = False
            elif notification_type == 'proposal_rejected' and not settings.proposal_rejections:
                should_send_email = should_send_push = False
            elif notification_type == 'system' and not settings.system_notifications:
                should_send_email = should_send_push = False
            elif notification_type == 'reminder' and not settings.reminders:
                should_send_email = should_send_push = False
            
            # Enviar email se configurado
            if should_send_email:
                NotificationService.send_email_notification(notification)
            
            # Enviar push se configurado
            if should_send_push and settings.push_subscription_json:
                NotificationService.send_push_notification(notification, settings.push_subscription_json)
            
            return notification
            
        except User.DoesNotExist:
            logger.error(f"Usuário com ID {user_id} não encontrado ao criar notificação")
            return None
        except Exception as e:
            logger.exception(f"Erro ao criar notificação: {str(e)}")
            return None
    
    @staticmethod
    def send_email_notification(notification):
        """
        Envia um email de notificação para o usuário
        """
        try:
            user = notification.user
            proposal = notification.proposal
            
            # Definir contexto para o template
            context = {
                'user': user,
                'notification': notification,
                'proposal': proposal,
                'site_url': settings.SITE_URL,
            }
            
            # Selecionar template com base no tipo de notificação
            template_name = f"notifications/email/{notification.notification_type}.html"
            
            # Fallback para template padrão se o específico não existir
            try:
                html_content = render_to_string(template_name, context)
            except:
                # Template padrão genérico
                html_content = render_to_string("notifications/email/default.html", context)
            
            # Versão em texto simples
            text_content = strip_tags(html_content)
            
            # Criar email
            email = EmailMultiAlternatives(
                subject=notification.title,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email]
            )
            
            # Anexar versão HTML
            email.attach_alternative(html_content, "text/html")
            
            # Enviar email
            email.send()
            
            # Atualizar notificação
            notification.is_email_sent = True
            notification.save(update_fields=['is_email_sent', 'updated_at'])
            
            return True
        except Exception as e:
            logger.exception(f"Erro ao enviar email de notificação: {str(e)}")
            return False
    
    @staticmethod
    def send_push_notification(notification, subscription_json):
        """
        Envia uma notificação push para o navegador do usuário
        """
        try:
            # Em produção, usaríamos uma biblioteca como pywebpush
            # Para simplificar, vamos apenas simular o envio
            
            # Parse dos dados de inscrição
            subscription_data = json.loads(subscription_json)
            
            # Dados da notificação
            payload = {
                'title': notification.title,
                'body': notification.message,
                'icon': f"{settings.SITE_URL}/static/img/logo-icon.png",
                'badge': f"{settings.SITE_URL}/static/img/badge-icon.png",
                'data': {
                    'url': f"{settings.SITE_URL}/notifications/{notification.id}",
                    'notification_id': notification.id,
                    'notification_type': notification.notification_type,
                }
            }
            
            # Aqui entraria a lógica de envio utilizando a Web Push API
            # from pywebpush import webpush
            # webpush(subscription_data, json.dumps(payload), vapid_private_key, vapid_claims)
            
            # Por enquanto, apenas logamos que o envio seria feito
            logger.info(f"Enviando notificação push para usuário {notification.user.id}: {notification.title}")
            
            # Atualizar notificação
            notification.is_push_sent = True
            notification.save(update_fields=['is_push_sent', 'updated_at'])
            
            return True
        except Exception as e:
            logger.exception(f"Erro ao enviar notificação push: {str(e)}")
            return False
    
    @staticmethod
    def get_user_notifications(user_id, status=None, limit=20, offset=0):
        """
        Obtém notificações do usuário, opcionalmente filtradas por status
        """
        try:
            query = Notification.objects.filter(user_id=user_id)
            
            if status:
                query = query.filter(status=status)
            
            # Ordenar por data de criação (mais recentes primeiro)
            query = query.order_by('-created_at')
            
            # Aplicar paginação
            notifications = query[offset:offset+limit]
            
            return list(notifications)
        except Exception as e:
            logger.exception(f"Erro ao buscar notificações do usuário {user_id}: {str(e)}")
            return []
    
    @staticmethod
    def mark_notification_as_read(notification_id, user_id):
        """
        Marca uma notificação como lida
        """
        try:
            notification = Notification.objects.get(id=notification_id, user_id=user_id)
            notification.mark_as_read()
            return True
        except Notification.DoesNotExist:
            logger.warning(f"Tentativa de marcar notificação inexistente: {notification_id}, usuário: {user_id}")
            return False
        except Exception as e:
            logger.exception(f"Erro ao marcar notificação como lida: {str(e)}")
            return False
    
    @staticmethod
    def mark_all_as_read(user_id):
        """
        Marca todas as notificações do usuário como lidas
        """
        try:
            Notification.objects.filter(user_id=user_id, status='unread').update(
                status='read'
            )
            return True
        except Exception as e:
            logger.exception(f"Erro ao marcar todas notificações como lidas: {str(e)}")
            return False
    
    @staticmethod
    def get_unread_count(user_id):
        """
        Retorna o número de notificações não lidas do usuário
        """
        try:
            return Notification.objects.filter(user_id=user_id, status='unread').count()
        except Exception as e:
            logger.exception(f"Erro ao contar notificações não lidas: {str(e)}")
            return 0
    
    @staticmethod
    def notify_proposal_status_change(proposal_id, old_status, new_status):
        """
        Envia notificação quando o status de uma proposta é alterado
        """
        try:
            proposal = Proposal.objects.get(id=proposal_id)
            user_id = proposal.user.id
            
            # Personalizar mensagem com base nos status
            title = "Status da sua proposta foi atualizado"
            message = f"Sua proposta {proposal.proposal_number} foi atualizada de '{old_status}' para '{new_status}'."
            
            # Notificações específicas
            if new_status == 'approved':
                title = "Sua proposta foi aprovada!"
                message = f"Temos o prazer de informar que sua proposta {proposal.proposal_number} foi aprovada. Entraremos em contato para os próximos passos."
                notification_type = 'proposal_approved'
            elif new_status == 'rejected':
                title = "Sua proposta não foi aprovada"
                message = f"Lamentamos informar que sua proposta {proposal.proposal_number} não foi aprovada neste momento."
                notification_type = 'proposal_rejected'
            else:
                notification_type = 'proposal_status'
            
            # Criar notificação
            return NotificationService.create_notification(
                user_id=user_id,
                title=title,
                message=message,
                notification_type=notification_type,
                proposal_id=proposal_id,
                metadata={
                    'old_status': old_status,
                    'new_status': new_status
                }
            )
        except Proposal.DoesNotExist:
            logger.error(f"Proposta com ID {proposal_id} não encontrada ao notificar mudança de status")
            return None
        except Exception as e:
            logger.exception(f"Erro ao enviar notificação de mudança de status: {str(e)}")
            return None
    
    @staticmethod
    def notify_document_request(proposal_id, document_types, message=None):
        """
        Envia notificação quando documentos adicionais são solicitados
        """
        try:
            proposal = Proposal.objects.get(id=proposal_id)
            user_id = proposal.user.id
            
            # Lista de documentos para exibição
            doc_list = ", ".join(document_types)
            
            title = "Documentos adicionais solicitados"
            notification_message = message or f"Precisamos que você envie os seguintes documentos para sua proposta {proposal.proposal_number}: {doc_list}"
            
            # Criar notificação
            return NotificationService.create_notification(
                user_id=user_id,
                title=title,
                message=notification_message,
                notification_type='document_request',
                proposal_id=proposal_id,
                metadata={
                    'document_types': document_types
                }
            )
        except Proposal.DoesNotExist:
            logger.error(f"Proposta com ID {proposal_id} não encontrada ao notificar solicitação de documentos")
            return None
        except Exception as e:
            logger.exception(f"Erro ao enviar notificação de solicitação de documentos: {str(e)}")
            return None

    def _send_realtime_notification(self, notification):
        """
        Envia uma notificação em tempo real via WebSocket
        """
        try:
            if not self.channel_layer:
                logger.warning("Channel layer não está disponível para envio de notificação em tempo real")
                return False
                
            # Preparar dados da notificação para envio
            notification_data = {
                'id': notification.id,
                'title': notification.title,
                'content': notification.content,
                'notification_type': notification.notification_type,
                'created_at': notification.created_at.isoformat(),
                'is_read': notification.is_read
            }
            
            # Se houver objeto relacionado, adicionar informações relevantes
            if notification.content_type and notification.object_id:
                notification_data['related_object'] = {
                    'type': notification.content_type.model,
                    'id': notification.object_id
                }
                
                # Adicionar URL se for uma proposta
                if notification.content_type.model == 'proposal':
                    notification_data['url'] = f"/propostas/{notification.object_id}"
            
            # Enviar para o grupo de WebSocket do usuário
            async_to_sync(self.channel_layer.group_send)(
                f'notifications_{notification.recipient.id}',
                {
                    'type': 'notification_message',
                    'notification': notification_data
                }
            )
            
            return True
        except Exception as e:
            logger.exception(f"Erro ao enviar notificação em tempo real: {str(e)}")
            return False
    
    def create_notification(
        self, 
        recipient, 
        title, 
        content, 
        notification_type='info', 
        related_object=None, 
        extra_data=None
    ):
        """
        Cria uma nova notificação
        """
        try:
            # Criar a notificação
            notification = Notification(
                recipient=recipient,
                title=title,
                content=content,
                notification_type=notification_type,
                extra_data=extra_data or {}
            )
            
            # Adicionar objeto relacionado, se fornecido
            if related_object:
                content_type = ContentType.objects.get_for_model(related_object)
                notification.content_type = content_type
                notification.object_id = related_object.id
            
            notification.save()
            
            # Enviar por email/push se configurado pelo usuário
            self._send_notification_by_preferences(notification, recipient)
            
            # Enviar em tempo real via WebSocket
            self._send_realtime_notification(notification)
            
            return notification
        except Exception as e:
            logger.exception(f"Erro ao criar notificação: {str(e)}")
            return None
    
    def _send_notification_by_preferences(self, notification, user):
        """
        Envia notificações baseadas nas preferências do usuário
        """
        try:
            # Buscar ou criar configurações de notificação do usuário
            notification_settings, created = UserNotificationSettings.objects.get_or_create(
                user=user
            )
            
            # Verificar se o usuário quer receber este tipo de notificação
            should_send = True
            
            # Realizar verificações específicas com base no tipo
            if notification.notification_type == 'approval' and not notification_settings.proposal_approvals:
                should_send = False
            elif notification.notification_type == 'rejection' and not notification_settings.proposal_rejections:
                should_send = False
            elif notification.notification_type == 'analysis' and not notification_settings.proposal_status_updates:
                should_send = False
            elif notification.notification_type == 'warning' and not notification_settings.document_requests:
                should_send = False
                
            if not should_send:
                return
                
            # Enviar por email se configurado
            if notification_settings.email_notifications:
                self._send_email_notification(notification)
                
            # Enviar push se configurado
            if notification_settings.push_notifications and notification_settings.push_subscription_json:
                self._send_push_notification(notification, notification_settings.push_subscription_json)
                
        except Exception as e:
            logger.exception(f"Erro ao processar preferências de notificação: {str(e)}")
    
    def _send_email_notification(self, notification):
        """
        Envia um email de notificação para o usuário
        """
        try:
            # Implementação do envio de email aqui...
            pass
        except Exception as e:
            logger.exception(f"Erro ao enviar email de notificação: {str(e)}")
    
    def _send_push_notification(self, notification, subscription_json):
        """
        Envia uma notificação push para o navegador do usuário
        """
        try:
            # Implementação do envio de push aqui...
            pass
        except Exception as e:
            logger.exception(f"Erro ao enviar notificação push: {str(e)}")
    
    # --- Métodos específicos para diferentes tipos de notificações ---
    
    def send_status_change_notification(self, user, proposal, previous_status, new_status):
        """
        Envia notificação de mudança de status da proposta
        """
        # Mapear status para nomes amigáveis
        status_names = {
            'pending': 'Pendente de Análise',
            'analyzing': 'Em Análise',
            'approved': 'Aprovada',
            'waiting_docs': 'Aguardando Documentos',
            'waiting_signature': 'Aguardando Assinatura',
            'completed': 'Concluída',
            'rejected': 'Rejeitada',
        }
        
        previous_status_name = status_names.get(previous_status, previous_status)
        new_status_name = status_names.get(new_status, new_status)
        
        title = f"Atualização na sua proposta #{proposal.id}"
        content = f"O status da sua proposta foi alterado de '{previous_status_name}' para '{new_status_name}'."
        
        # Determinar o tipo de notificação baseado no novo status
        notification_type = 'info'
        if new_status == 'approved':
            notification_type = 'success'
        elif new_status == 'rejected':
            notification_type = 'error'
        elif new_status == 'waiting_docs':
            notification_type = 'warning'
        elif new_status == 'analyzing':
            notification_type = 'analysis'
        
        extra_data = {
            'proposal_id': proposal.id,
            'previous_status': previous_status,
            'new_status': new_status,
        }
        
        self.create_notification(
            recipient=user,
            title=title,
            content=content,
            notification_type=notification_type,
            related_object=proposal,
            extra_data=extra_data
        )
    
    def send_approval_notification(self, user, proposal, comment=None):
        """
        Envia notificação de aprovação de proposta
        """
        title = "Sua proposta foi aprovada!"
        content = f"Parabéns! Sua proposta #{proposal.id} foi aprovada."
        
        if comment:
            content += f" Mensagem do analista: '{comment}'"
        
        extra_data = {
            'proposal_id': proposal.id,
            'amount_approved': str(proposal.amount_approved) if proposal.amount_approved else None,
            'interest_rate': str(proposal.interest_rate) if proposal.interest_rate else None,
            'installment_value': str(proposal.installment_value) if proposal.installment_value else None,
        }
        
        self.create_notification(
            recipient=user,
            title=title,
            content=content,
            notification_type='success',
            related_object=proposal,
            extra_data=extra_data
        )
    
    def send_rejection_notification(self, user, proposal, reason):
        """
        Envia notificação de rejeição de proposta
        """
        title = "Sua proposta não foi aprovada"
        content = f"Infelizmente, sua proposta #{proposal.id} não foi aprovada. Motivo: {reason}"
        
        extra_data = {
            'proposal_id': proposal.id,
            'rejection_reason': reason
        }
        
        self.create_notification(
            recipient=user,
            title=title,
            content=content,
            notification_type='error',
            related_object=proposal,
            extra_data=extra_data
        )
    
    def send_comment_notification(self, user, proposal, comment_text):
        """
        Envia notificação de novo comentário em proposta
        """
        title = f"Novo comentário na sua proposta #{proposal.id}"
        content = f"Um analista deixou um comentário na sua proposta: '{comment_text}'"
        
        extra_data = {
            'proposal_id': proposal.id,
            'comment': comment_text
        }
        
        self.create_notification(
            recipient=user,
            title=title,
            content=content,
            notification_type='info',
            related_object=proposal,
            extra_data=extra_data
        )
    
    def send_document_request_notification(self, user, proposal, message):
        """
        Envia notificação de solicitação de documentos
        """
        title = f"Documentos adicionais solicitados para a proposta #{proposal.id}"
        content = message
        
        extra_data = {
            'proposal_id': proposal.id,
            'message': message
        }
        
        self.create_notification(
            recipient=user,
            title=title,
            content=content,
            notification_type='warning',
            related_object=proposal,
            extra_data=extra_data
        ) 