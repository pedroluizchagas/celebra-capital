"""
Serializadores para a API de analytics.
"""

from rest_framework import serializers
from .models import AnalyticsEvent, AnalyticsAggregate


class AnalyticsEventSerializer(serializers.ModelSerializer):
    """
    Serializador para eventos de analytics.
    """
    class Meta:
        model = AnalyticsEvent
        fields = [
            'event_id', 'category', 'action', 'properties',
            'timestamp', 'created_at', 'user'
        ]
        read_only_fields = ['event_id', 'created_at']


class AnalyticsAggregateSerializer(serializers.ModelSerializer):
    """
    Serializador para agregações de métricas de analytics.
    """
    class Meta:
        model = AnalyticsAggregate
        fields = [
            'id', 'metric_name', 'dimensions', 'value',
            'count', 'date', 'period', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AnalyticsEventCreateSerializer(serializers.Serializer):
    """
    Serializador para criação de eventos via API.
    """
    category = serializers.CharField(max_length=64, required=True)
    action = serializers.CharField(max_length=64, required=True)
    properties = serializers.JSONField(required=False, default=dict)
    
    def validate(self, data):
        """
        Valida os dados do evento.
        """
        # Valida categoria
        valid_categories = [
            'usuario', 'proposta', 'documento', 'navegacao',
            'interacao', 'sistema', 'api', 'performance'
        ]
        
        if data['category'] not in valid_categories:
            raise serializers.ValidationError({
                'category': f"Categoria inválida. Valores válidos: {', '.join(valid_categories)}"
            })
        
        return data 