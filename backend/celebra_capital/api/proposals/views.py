from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Proposal, ProposalAnswer, Signature
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.http import HttpResponse
from django.db.models import Sum, Avg, Count, F, Q
from django.db.models.functions import TruncDay, TruncWeek, TruncMonth, TruncQuarter, TruncYear
import csv
import io
import xlsxwriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from reportlab.lib import colors
import datetime
import json
from ..notifications.services import NotificationService

# Implementações de views serão adicionadas posteriormente

class ProposalListCreateView(APIView):
    def get(self, request):
        # Implementação futura
        return Response({"detail": "Endpoint em desenvolvimento"}, status=status.HTTP_501_NOT_IMPLEMENTED)
    
    def post(self, request):
        # Implementação futura
        return Response({"detail": "Endpoint em desenvolvimento"}, status=status.HTTP_501_NOT_IMPLEMENTED)

class ProposalDetailView(APIView):
    def get(self, request, pk):
        # Implementação futura
        return Response({"detail": "Endpoint em desenvolvimento"}, status=status.HTTP_501_NOT_IMPLEMENTED)
    
    def put(self, request, pk):
        # Implementação futura
        return Response({"detail": "Endpoint em desenvolvimento"}, status=status.HTTP_501_NOT_IMPLEMENTED)

class ProposalAnswersView(APIView):
    def post(self, request, proposal_id):
        # Implementação futura
        return Response({"detail": "Endpoint em desenvolvimento"}, status=status.HTTP_501_NOT_IMPLEMENTED)

class SimulateProposalView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        # Implementação futura
        return Response({"detail": "Endpoint em desenvolvimento"}, status=status.HTTP_501_NOT_IMPLEMENTED)

class SignatureView(APIView):
    def get(self, request, proposal_id):
        # Implementação futura
        return Response({"detail": "Endpoint em desenvolvimento"}, status=status.HTTP_501_NOT_IMPLEMENTED)
    
    def post(self, request, proposal_id):
        # Implementação futura
        return Response({"detail": "Endpoint em desenvolvimento"}, status=status.HTTP_501_NOT_IMPLEMENTED)

class PotentialProposalsView(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def get(self, request):
        # Implementação futura
        return Response({"detail": "Endpoint em desenvolvimento"}, status=status.HTTP_501_NOT_IMPLEMENTED)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def reports_stats(request):
    """
    Endpoint para obter estatísticas para relatórios
    """
    # Obter parâmetros de filtro
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    status = request.query_params.get('status')
    credit_type = request.query_params.get('credit_type')
    min_value = request.query_params.get('min_value')
    max_value = request.query_params.get('max_value')
    
    # Construir queryset base
    queryset = Proposal.objects.all()
    
    # Aplicar filtros
    if start_date:
        queryset = queryset.filter(created_at__gte=start_date)
    if end_date:
        queryset = queryset.filter(created_at__lte=end_date)
    if status:
        queryset = queryset.filter(status=status)
    if credit_type:
        queryset = queryset.filter(credit_type=credit_type)
    if min_value:
        queryset = queryset.filter(credit_value__gte=float(min_value))
    if max_value:
        queryset = queryset.filter(credit_value__lte=float(max_value))
    
    # Calcular estatísticas
    total_proposals = queryset.count()
    total_value = queryset.aggregate(total=Sum('credit_value')).get('total', 0) or 0
    average_values = {}
    
    # Valor médio por tipo de crédito
    credit_types = queryset.values('credit_type').annotate(
        avg_value=Avg('credit_value')
    )
    for item in credit_types:
        credit_type = item['credit_type']
        average_values[credit_type] = item['avg_value']
    
    # Calcular taxa de conversão (aprovadas / total)
    approved_count = queryset.filter(status='approved').count()
    conversion_rate = approved_count / total_proposals if total_proposals > 0 else 0
    
    # Calcular taxa de conclusão de documentos
    docs_complete_count = queryset.filter(documents_complete=True).count()
    document_completion_rate = docs_complete_count / total_proposals if total_proposals > 0 else 0
    
    # Preparar resposta
    response_data = {
        'total_proposals': total_proposals,
        'total_value': total_value,
        'average_values': average_values,
        'conversion_rate': conversion_rate,
        'document_completion_rate': document_completion_rate,
    }
    
    return Response(response_data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def reports_chart(request):
    """
    Endpoint para obter dados de gráficos para relatórios
    """
    # Obter parâmetros
    chart_type = request.query_params.get('chart_type', 'status')
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    group_by = request.query_params.get('group_by', 'month')
    
    # Construir queryset base
    queryset = Proposal.objects.all()
    
    # Aplicar filtros de data
    if start_date:
        queryset = queryset.filter(created_at__gte=start_date)
    if end_date:
        queryset = queryset.filter(created_at__lte=end_date)
    
    # Preparar dados com base no tipo de gráfico solicitado
    if chart_type == 'status':
        # Distribuição por status
        data = queryset.values('status').annotate(count=Count('id'))
        distribution = {item['status']: item['count'] for item in data}
        
        response_data = {
            'distribution': distribution
        }
    
    elif chart_type == 'credit_type':
        # Distribuição por tipo de crédito
        data = queryset.values('credit_type').annotate(count=Count('id'))
        distribution = {item['credit_type']: item['count'] for item in data}
        
        response_data = {
            'distribution': distribution
        }
    
    elif chart_type == 'monthly':
        # Tendência ao longo do tempo
        # Determinar a função de truncamento com base no grupo
        trunc_func = {
            'day': TruncDay,
            'week': TruncWeek,
            'month': TruncMonth,
            'quarter': TruncQuarter,
            'year': TruncYear,
        }.get(group_by, TruncMonth)
        
        data = queryset.annotate(
            period=trunc_func('created_at')
        ).values('period').annotate(
            count=Count('id')
        ).order_by('period')
        
        # Formatar períodos para exibição
        trend = {}
        date_format = {
            'day': '%d/%m/%Y',
            'week': 'Semana %W/%Y',
            'month': '%b/%Y',
            'quarter': 'T%q/%Y',
            'year': '%Y',
        }.get(group_by, '%b/%Y')
        
        for item in data:
            period_str = item['period'].strftime(date_format)
            if group_by == 'week':
                # Ajuste especial para semanas
                week_num = int(item['period'].strftime('%W'))
                year = item['period'].year
                period_str = f'Semana {week_num}/{year}'
            elif group_by == 'quarter':
                # Ajuste especial para trimestres
                quarter = (item['period'].month - 1) // 3 + 1
                year = item['period'].year
                period_str = f'T{quarter}/{year}'
                
            trend[period_str] = item['count']
        
        response_data = {
            'trend': trend
        }
    
    elif chart_type == 'conversion':
        # Taxa de conversão ao longo do tempo
        trunc_func = {
            'day': TruncDay,
            'week': TruncWeek,
            'month': TruncMonth,
            'quarter': TruncQuarter,
            'year': TruncYear,
        }.get(group_by, TruncMonth)
        
        # Total de propostas por período
        total_by_period = queryset.annotate(
            period=trunc_func('created_at')
        ).values('period').annotate(
            total=Count('id')
        ).order_by('period')
        
        # Propostas aprovadas por período
        approved_by_period = queryset.filter(
            status='approved'
        ).annotate(
            period=trunc_func('created_at')
        ).values('period').annotate(
            approved=Count('id')
        )
        
        # Mapear períodos para totalização
        date_format = {
            'day': '%d/%m/%Y',
            'week': 'Semana %W/%Y',
            'month': '%b/%Y',
            'quarter': 'T%q/%Y',
            'year': '%Y',
        }.get(group_by, '%b/%Y')
        
        conversion_trend = {}
        approved_map = {item['period']: item['approved'] for item in approved_by_period}
        
        for item in total_by_period:
            period = item['period']
            period_str = period.strftime(date_format)
            
            # Ajustes especiais de formato
            if group_by == 'week':
                week_num = int(period.strftime('%W'))
                year = period.year
                period_str = f'Semana {week_num}/{year}'
            elif group_by == 'quarter':
                quarter = (period.month - 1) // 3 + 1
                year = period.year
                period_str = f'T{quarter}/{year}'
                
            total = item['total']
            approved = approved_map.get(period, 0)
            rate = approved / total if total > 0 else 0
            
            conversion_trend[period_str] = rate
        
        response_data = {
            'conversion_trend': conversion_trend
        }
        
    else:
        return Response(
            {'error': f'Tipo de gráfico não suportado: {chart_type}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    return Response(response_data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def export_report(request):
    """
    Endpoint para exportar relatórios em diferentes formatos
    """
    # Obter parâmetros
    export_format = request.query_params.get('format', 'csv')
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    status = request.query_params.get('status')
    credit_type = request.query_params.get('credit_type')
    min_value = request.query_params.get('min_value')
    max_value = request.query_params.get('max_value')
    
    # Construir queryset base
    queryset = Proposal.objects.all()
    
    # Aplicar filtros
    if start_date:
        queryset = queryset.filter(created_at__gte=start_date)
    if end_date:
        queryset = queryset.filter(created_at__lte=end_date)
    if status:
        queryset = queryset.filter(status=status)
    if credit_type:
        queryset = queryset.filter(credit_type=credit_type)
    if min_value:
        queryset = queryset.filter(credit_value__gte=float(min_value))
    if max_value:
        queryset = queryset.filter(credit_value__lte=float(max_value))
    
    # Ordenar as propostas
    proposals = queryset.order_by('-created_at')
    
    # Configurar cabeçalhos comuns para todos os formatos
    headers = [
        'ID', 'Cliente', 'Tipo de Crédito', 'Valor', 'Status', 
        'Data de Criação', 'Documentação Completa', 'Assinatura Completa'
    ]
    
    # Hoje para o nome do arquivo
    today = datetime.datetime.now().strftime('%Y-%m-%d')
    
    if export_format == 'csv':
        # Criar arquivo CSV em memória
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="relatorio_celebra_{today}.csv"'
        
        writer = csv.writer(response)
        writer.writerow(headers)
        
        for proposal in proposals:
            writer.writerow([
                proposal.proposal_number,
                f"{proposal.user.first_name} {proposal.user.last_name}",
                proposal.credit_type,
                proposal.credit_value,
                proposal.status,
                proposal.created_at.strftime('%d/%m/%Y %H:%M'),
                'Sim' if proposal.documents_complete else 'Não',
                'Sim' if proposal.signature_complete else 'Não',
            ])
        
        return response
    
    elif export_format == 'excel':
        # Criar arquivo Excel em memória
        output = io.BytesIO()
        workbook = xlsxwriter.Workbook(output)
        worksheet = workbook.add_worksheet('Relatório')
        
        # Estilos
        header_format = workbook.add_format({
            'bold': True, 
            'bg_color': '#4B5563', 
            'font_color': 'white',
            'border': 1
        })
        
        row_format = workbook.add_format({
            'border': 1,
        })
        
        # Escrever cabeçalhos
        for col_num, header in enumerate(headers):
            worksheet.write(0, col_num, header, header_format)
        
        # Preencher dados
        for row_num, proposal in enumerate(proposals, 1):
            row_data = [
                proposal.proposal_number,
                f"{proposal.user.first_name} {proposal.user.last_name}",
                proposal.credit_type,
                proposal.credit_value,
                proposal.status,
                proposal.created_at.strftime('%d/%m/%Y %H:%M'),
                'Sim' if proposal.documents_complete else 'Não',
                'Sim' if proposal.signature_complete else 'Não',
            ]
            
            for col_num, cell_data in enumerate(row_data):
                worksheet.write(row_num, col_num, cell_data, row_format)
        
        # Autofit colunas
        for i, _ in enumerate(headers):
            worksheet.set_column(i, i, 15)
        
        workbook.close()
        
        # Preparar resposta
        output.seek(0)
        response = HttpResponse(
            output.read(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="relatorio_celebra_{today}.xlsx"'
        
        return response
    
    elif export_format == 'pdf':
        # Criar arquivo PDF em memória
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="relatorio_celebra_{today}.pdf"'
        
        # Configurar documento
        doc = SimpleDocTemplate(response, pagesize=letter)
        elements = []
        
        # Dados para a tabela
        data = [headers]
        
        for proposal in proposals:
            data.append([
                proposal.proposal_number,
                f"{proposal.user.first_name} {proposal.user.last_name}",
                proposal.credit_type,
                str(proposal.credit_value),
                proposal.status,
                proposal.created_at.strftime('%d/%m/%Y %H:%M'),
                'Sim' if proposal.documents_complete else 'Não',
                'Sim' if proposal.signature_complete else 'Não',
            ])
        
        # Criar tabela
        table = Table(data)
        
        # Estilo da tabela
        style = TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ])
        
        table.setStyle(style)
        elements.append(table)
        
        # Construir documento
        doc.build(elements)
        
        return response
    
    else:
        return Response(
            {'error': f'Formato de exportação não suportado: {export_format}'},
            status=status.HTTP_400_BAD_REQUEST
        )

class ProposalApproveView(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request, pk):
        try:
            proposal = Proposal.objects.get(id=pk)
            old_status = proposal.status
            
            # Atualizar status
            proposal.status = 'approved'
            proposal.save(update_fields=['status', 'updated_at'])
            
            # Enviar notificação de mudança de status
            NotificationService.notify_proposal_status_change(
                proposal_id=proposal.id,
                old_status=old_status,
                new_status='approved'
            )
            
            return Response({"detail": "Proposta aprovada com sucesso."}, status=status.HTTP_200_OK)
        except Proposal.DoesNotExist:
            return Response(
                {"detail": "Proposta não encontrada."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": f"Erro ao aprovar proposta: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProposalRejectView(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request, pk):
        try:
            proposal = Proposal.objects.get(id=pk)
            old_status = proposal.status
            reason = request.data.get('reason')
            comments = request.data.get('comments')
            
            if not reason:
                return Response(
                    {"detail": "É necessário informar o motivo da rejeição."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Atualizar status e comentários
            proposal.status = 'rejected'
            proposal.rejection_reason = reason
            if comments:
                proposal.comments = comments
            proposal.save(update_fields=['status', 'rejection_reason', 'comments', 'updated_at'])
            
            # Enviar notificação de mudança de status
            NotificationService.notify_proposal_status_change(
                proposal_id=proposal.id,
                old_status=old_status,
                new_status='rejected'
            )
            
            return Response({"detail": "Proposta rejeitada com sucesso."}, status=status.HTTP_200_OK)
        except Proposal.DoesNotExist:
            return Response(
                {"detail": "Proposta não encontrada."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": f"Erro ao rejeitar proposta: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RequestDocumentsView(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request, pk):
        try:
            proposal = Proposal.objects.get(id=pk)
            document_types = request.data.get('document_types', [])
            message = request.data.get('message')
            
            if not document_types:
                return Response(
                    {"detail": "É necessário informar quais documentos estão sendo solicitados."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Atualizar status da proposta para "aguardando documentos"
            old_status = proposal.status
            proposal.status = 'pending_documents'
            proposal.save(update_fields=['status', 'updated_at'])
            
            # Registrar documentos solicitados
            # Código para registrar documentos solicitados...
            
            # Enviar notificação de solicitação de documentos
            NotificationService.notify_document_request(
                proposal_id=proposal.id,
                document_types=document_types,
                message=message
            )
            
            # Enviar notificação de mudança de status
            if old_status != 'pending_documents':
                NotificationService.notify_proposal_status_change(
                    proposal_id=proposal.id,
                    old_status=old_status,
                    new_status='pending_documents'
                )
            
            return Response({"detail": "Documentos solicitados com sucesso."}, status=status.HTTP_200_OK)
        except Proposal.DoesNotExist:
            return Response(
                {"detail": "Proposta não encontrada."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": f"Erro ao solicitar documentos: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 