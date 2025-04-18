from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.contrib.auth import get_user_model
import json
import logging

from .models import Notification, UserNotificationSettings
from ..proposals.models import Proposal

User = get_user_model()
logger = logging.getLogger(__name__)

class NotificationService:
    """
    Serviço para gerenciar notificações
    """
    
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