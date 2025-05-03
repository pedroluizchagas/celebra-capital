"""
Modelos de dados para o sistema de analytics.
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

import uuid
import json

User = get_user_model()


class AnalyticsEvent(models.Model):
    """
    Modelo para armazenar eventos de analytics.
    """
    event_id = models.CharField(max_length=128, primary_key=True)
    category = models.CharField(max_length=64, db_index=True)
    action = models.CharField(max_length=64, db_index=True)
    user = models.ForeignKey(
        User, 
        null=True, 
        blank=True, 
        on_delete=models.SET_NULL,
        related_name='analytics_events'
    )
    properties = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Evento de Analytics'
        verbose_name_plural = 'Eventos de Analytics'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['category', 'action']),
            models.Index(fields=['timestamp'])
        ]
    
    def __str__(self):
        return f"{self.category}:{self.action} ({self.timestamp.strftime('%Y-%m-%d %H:%M:%S')})"
    
    @classmethod
    def create_from_request(cls, request, category, action, properties=None):
        """
        Cria um evento a partir de uma requisição HTTP.
        Útil para tracking manual em views.
        """
        from .services import track_event
        
        properties = properties or {}
        user_id = request.user.id if request.user.is_authenticated else None
        
        # Adiciona informações da requisição
        request_props = {
            'path': request.path,
            'method': request.method,
            'user_agent': request.META.get('HTTP_USER_AGENT'),
            'referer': request.META.get('HTTP_REFERER'),
        }
        properties.update(request_props)
        
        # Registra o evento utilizando o serviço principal
        return track_event(
            category=category,
            action=action,
            properties=properties,
            user_id=user_id
        )


class AnalyticsAggregate(models.Model):
    """
    Modelo para armazenar agregações de métricas de analytics.
    Usado para performance em dashboards e relatórios.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    metric_name = models.CharField(max_length=128, db_index=True)
    dimensions = models.JSONField(default=dict, blank=True)
    value = models.FloatField()
    count = models.IntegerField(default=1)
    date = models.DateField(db_index=True)
    period = models.CharField(
        max_length=10,
        choices=[
            ('daily', 'Diário'),
            ('weekly', 'Semanal'),
            ('monthly', 'Mensal')
        ],
        default='daily'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Agregação de Analytics'
        verbose_name_plural = 'Agregações de Analytics'
        ordering = ['-date', 'metric_name']
        unique_together = ['metric_name', 'date', 'period', 'dimensions']
        indexes = [
            models.Index(fields=['metric_name', 'date', 'period']),
        ]
    
    def __str__(self):
        dimensions_str = json.dumps(self.dimensions)
        return f"{self.metric_name} ({self.date}) [{dimensions_str}]: {self.value}" 