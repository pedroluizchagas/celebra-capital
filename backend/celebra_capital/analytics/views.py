"""
Views API para o sistema de analytics.
"""

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from django.utils import timezone
from django.db.models import Count, Avg, Sum, F, Window
from django.db.models.functions import TruncDate

from .models import AnalyticsEvent, AnalyticsAggregate
from .serializers import AnalyticsEventSerializer, AnalyticsAggregateSerializer
from .services import track_event


class AnalyticsViewSet(viewsets.ViewSet):
    """
    API para registro e consulta de eventos de analytics.
    """
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def events(self, request):
        """
        Registra um novo evento de analytics.
        
        Request:
        {
            "category": "proposta",
            "action": "proposta_iniciada",
            "properties": {
                "tipo_proposta": "empresarial",
                "valor_solicitado": 50000
            }
        }
        """
        category = request.data.get('category')
        action = request.data.get('action')
        properties = request.data.get('properties', {})
        
        if not category or not action:
            return Response(
                {'error': 'Category and action are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Registra o evento usando o serviço de analytics
        event_data = track_event(
            category=category,
            action=action,
            properties=properties,
            user_id=request.user.id
        )
        
        return Response(event_data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """
        Retorna dados agregados para o dashboard de analytics.
        
        Parâmetros:
        - start_date: Data inicial (YYYY-MM-DD)
        - end_date: Data final (YYYY-MM-DD)
        - group_by: Agrupamento (day, week, month)
        """
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date', timezone.now().date().isoformat())
        group_by = request.query_params.get('group_by', 'day')
        
        # Valida datas
        if not start_date:
            return Response(
                {'error': 'Start date is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Busca agregações já calculadas
        aggregates = AnalyticsAggregate.objects.filter(
            date__gte=start_date,
            date__lte=end_date,
            period=group_by
        ).order_by('date', 'metric_name')
        
        # Serializa os dados
        serializer = AnalyticsAggregateSerializer(aggregates, many=True)
        
        # Estrutura response em formato adequado para dashboards
        metrics_by_date = {}
        for agg in serializer.data:
            date = agg['date']
            metric = agg['metric_name']
            
            if date not in metrics_by_date:
                metrics_by_date[date] = {}
                
            metrics_by_date[date][metric] = {
                'value': agg['value'],
                'count': agg['count'],
                'dimensions': agg['dimensions']
            }
        
        return Response({
            'data': metrics_by_date,
            'start_date': start_date,
            'end_date': end_date,
            'group_by': group_by
        })
    
    @action(detail=False, methods=['get'])
    def events_summary(self, request):
        """
        Retorna resumo de eventos por categoria e ação.
        
        Parâmetros:
        - start_date: Data inicial (YYYY-MM-DD)
        - end_date: Data final (YYYY-MM-DD)
        """
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date', timezone.now().date().isoformat())
        
        # Valida datas
        if not start_date:
            return Response(
                {'error': 'Start date is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Query para agrupar eventos
        events_summary = AnalyticsEvent.objects.filter(
            timestamp__date__gte=start_date,
            timestamp__date__lte=end_date
        ).values('category', 'action').annotate(
            count=Count('event_id')
        ).order_by('-count')
        
        return Response({
            'data': events_summary,
            'start_date': start_date,
            'end_date': end_date,
            'total_events': sum(item['count'] for item in events_summary)
        }) 