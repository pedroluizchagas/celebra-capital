from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils.translation import gettext_lazy as _

User = get_user_model()

class Notification(models.Model):
    """
    Modelo para armazenar notificações de sistema para os usuários.
    """
    NOTIFICATION_TYPES = [
        ('info', _('Informação')),
        ('success', _('Sucesso')),
        ('warning', _('Aviso')),
        ('error', _('Erro')),
        ('analysis', _('Análise')),
        ('approval', _('Aprovação')),
        ('rejection', _('Rejeição')),
    ]

    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name=_('Destinatário')
    )
    title = models.CharField(_('Título'), max_length=255, blank=True)
    content = models.TextField(_('Conteúdo'))
    created_at = models.DateTimeField(_('Criado em'), auto_now_add=True)
    read = models.BooleanField(_('Lida'), default=False)
    read_at = models.DateTimeField(_('Lida em'), null=True, blank=True)
    notification_type = models.CharField(
        _('Tipo de notificação'),
        max_length=20,
        choices=NOTIFICATION_TYPES,
        default='info'
    )
    
    # Relação genérica para qualquer modelo do sistema
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    object_id = models.PositiveIntegerField(null=True, blank=True)
    related_object = GenericForeignKey('content_type', 'object_id')
    
    # Campo para armazenar dados adicionais em formato JSON
    extra_data = models.JSONField(_('Dados adicionais'), blank=True, null=True)
    
    def mark_as_read(self):
        """Marca a notificação como lida."""
        from django.utils import timezone
        self.read = True
        self.read_at = timezone.now()
        self.save()
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Notificação')
        verbose_name_plural = _('Notificações')
        
    def __str__(self):
        return f"Notificação para {self.recipient}: {self.content[:50]}"


class UserNotificationSettings(models.Model):
    """
    Configurações de notificação do usuário
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_settings',
        verbose_name='Usuário'
    )
    
    # Preferências de recebimento de notificações
    email_notifications = models.BooleanField('Notificações por Email', default=True)
    push_notifications = models.BooleanField('Notificações Push', default=True)
    
    # Tipos específicos de notificações que o usuário quer receber
    proposal_status_updates = models.BooleanField('Atualizações de Status da Proposta', default=True)
    document_requests = models.BooleanField('Solicitações de Documentos', default=True)
    proposal_approvals = models.BooleanField('Aprovações de Proposta', default=True)
    proposal_rejections = models.BooleanField('Rejeições de Proposta', default=True)
    system_notifications = models.BooleanField('Notificações do Sistema', default=True)
    reminders = models.BooleanField('Lembretes', default=True)
    
    # Configuração do Web Push
    push_subscription_json = models.TextField('Dados de Inscrição Push', blank=True, null=True)
    
    class Meta:
        verbose_name = 'Configuração de Notificação'
        verbose_name_plural = 'Configurações de Notificação'
    
    def __str__(self):
        return f"Configurações de Notificação - {self.user.email}" 