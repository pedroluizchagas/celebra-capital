from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Proposal, ProposalAnswer, Signature, ProposalComment, ProposalStatusChange
from .serializers import (
    ProposalListSerializer, ProposalDetailSerializer, ProposalCreateSerializer, 
    ProposalUpdateSerializer, ProposalCommentSerializer, ProposalStatusChangeSerializer
)
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
from django.shortcuts import get_object_or_404
from ..notifications.services import NotificationService

# Implementações de views serão adicionadas posteriormente

class ProposalListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.is_staff:
            # Administradores veem todas as propostas
            proposals = Proposal.objects.all()
        else:
            # Usuários comuns veem apenas suas próprias propostas
            proposals = Proposal.objects.filter(user=request.user)
        
        # Aplicar filtros se fornecidos
        status_filter = request.query_params.get('status')
        if status_filter:
            proposals = proposals.filter(status=status_filter)
            
        credit_type_filter = request.query_params.get('credit_type')
        if credit_type_filter:
            proposals = proposals.filter(credit_type=credit_type_filter)
        
        # Ordenar por data de criação (mais recente primeiro)
        proposals = proposals.order_by('-created_at')
        
        serializer = ProposalListSerializer(proposals, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        # Adicionar o user_id ao request se não for fornecido
        if 'user_id' not in request.data:
            request.data['user_id'] = request.user.id
            
        serializer = ProposalCreateSerializer(data=request.data)
        if serializer.is_valid():
            proposal = serializer.save()
            
            # Retornar a proposta criada
            return Response(ProposalDetailSerializer(proposal).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProposalDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        try:
            proposal = self._get_proposal(pk, request.user)
            serializer = ProposalDetailSerializer(proposal)
            return Response(serializer.data)
        except Proposal.DoesNotExist:
            return Response(
                {"detail": "Proposta não encontrada ou você não tem permissão para visualizá-la."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def put(self, request, pk):
        try:
            proposal = self._get_proposal(pk, request.user)
            
            # Apenas administradores podem atualizar propostas
            if not request.user.is_staff:
                return Response(
                    {"detail": "Você não tem permissão para atualizar esta proposta."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Armazenar o status anterior para rastrear alterações
            previous_status = proposal.status
            
            serializer = ProposalUpdateSerializer(proposal, data=request.data, partial=True)
            if serializer.is_valid():
                updated_proposal = serializer.save()
                
                # Se houve mudança de status, criar um registro
                if 'status' in request.data and previous_status != updated_proposal.status:
                    # Criar registro de mudança de status
                    status_change = ProposalStatusChange.objects.create(
                        proposal=proposal,
                        previous_status=previous_status,
                        new_status=updated_proposal.status,
                        changed_by=request.user,
                        reason=request.data.get('reason', '')
                    )
                    
                    # Enviar notificação para o cliente
                    notification_service = NotificationService()
                    notification_service.send_status_change_notification(
                        proposal.user,
                        proposal,
                        previous_status,
                        updated_proposal.status
                    )
                
                return Response(ProposalDetailSerializer(updated_proposal).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Proposal.DoesNotExist:
            return Response(
                {"detail": "Proposta não encontrada ou você não tem permissão para atualizá-la."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def _get_proposal(self, pk, user):
        if user.is_staff:
            # Administradores podem ver qualquer proposta
            return Proposal.objects.get(pk=pk)
        else:
            # Usuários comuns só podem ver suas próprias propostas
            return Proposal.objects.get(pk=pk, user=user)

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

class ProposalCommentView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, proposal_id):
        try:
            # Verificar se o usuário tem acesso à proposta
            proposal = self._get_proposal(proposal_id, request.user)
            
            # Filtrar comentários com base nas permissões
            if request.user.is_staff:
                # Administradores veem todos os comentários
                comments = ProposalComment.objects.filter(proposal=proposal)
            else:
                # Usuários comuns veem apenas comentários não internos
                comments = ProposalComment.objects.filter(proposal=proposal, is_internal=False)
            
            serializer = ProposalCommentSerializer(comments, many=True)
            return Response(serializer.data)
        except Proposal.DoesNotExist:
            return Response(
                {"detail": "Proposta não encontrada ou você não tem permissão para visualizá-la."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def post(self, request, proposal_id):
        try:
            # Verificar se o usuário tem acesso à proposta
            proposal = self._get_proposal(proposal_id, request.user)
            
            # Preparar dados para o serializer
            comment_data = {
                'proposal': proposal.id,
                'author_id': request.user.id,
                'text': request.data.get('text', ''),
                'is_internal': request.data.get('is_internal', False)
            }
            
            # Apenas administradores podem criar comentários internos
            if comment_data['is_internal'] and not request.user.is_staff:
                return Response(
                    {"detail": "Você não tem permissão para criar comentários internos."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = ProposalCommentSerializer(data=comment_data)
            if serializer.is_valid():
                comment = serializer.save()
                
                # Se o comentário não for interno, enviar notificação para o cliente
                if not comment.is_internal and request.user.is_staff:
                    notification_service = NotificationService()
                    notification_service.send_comment_notification(
                        proposal.user,
                        proposal,
                        comment.text
                    )
                
                return Response(ProposalCommentSerializer(comment).data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Proposal.DoesNotExist:
            return Response(
                {"detail": "Proposta não encontrada ou você não tem permissão para comentar nela."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def _get_proposal(self, proposal_id, user):
        if user.is_staff:
            # Administradores podem acessar qualquer proposta
            return Proposal.objects.get(pk=proposal_id)
        else:
            # Usuários comuns só podem acessar suas próprias propostas
            return Proposal.objects.get(pk=proposal_id, user=user)

class ProposalApproveView(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request, pk):
        proposal = get_object_or_404(Proposal, pk=pk)
        
        # Verificar estado atual da proposta
        if proposal.status == 'approved':
            return Response({
                "detail": "Esta proposta já foi aprovada."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Armazenar o status anterior
        previous_status = proposal.status
        
        # Atualizar os campos da proposta conforme os dados recebidos
        if 'interest_rate' in request.data:
            proposal.interest_rate = request.data['interest_rate']
        
        if 'amount_approved' in request.data:
            proposal.amount_approved = request.data['amount_approved']
        
        if 'installment_value' in request.data:
            proposal.installment_value = request.data['installment_value']
        
        if 'notes' in request.data:
            proposal.notes = request.data['notes']
        
        # Atualizar status para aprovado
        proposal.status = 'approved'
        proposal.save()
        
        # Criar registro de mudança de status
        status_change = ProposalStatusChange.objects.create(
            proposal=proposal,
            previous_status=previous_status,
            new_status='approved',
            changed_by=request.user,
            reason=request.data.get('reason', 'Proposta aprovada')
        )
        
        # Adicionar comentário (se fornecido)
        if 'comment' in request.data and request.data['comment'].strip():
            comment = ProposalComment.objects.create(
                proposal=proposal,
                author=request.user,
                text=request.data['comment'],
                is_internal=request.data.get('is_internal', False)
            )
            
            # Se o comentário não for interno, enviar notificação para o cliente
            if not comment.is_internal:
                notification_service = NotificationService()
                notification_service.send_comment_notification(
                    proposal.user,
                    proposal,
                    comment.text
                )
        
        # Enviar notificação para o cliente
        notification_service = NotificationService()
        notification_service.send_approval_notification(
            proposal.user,
            proposal,
            request.data.get('comment', None)
        )
        
        # Retornar a proposta completa
        serializer = ProposalDetailSerializer(proposal)
        return Response(serializer.data)

class ProposalRejectView(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request, pk):
        proposal = get_object_or_404(Proposal, pk=pk)
        
        # Verificar estado atual da proposta
        if proposal.status == 'rejected':
            return Response({
                "detail": "Esta proposta já foi rejeitada."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar se o motivo da rejeição foi fornecido
        if 'reason' not in request.data or not request.data['reason'].strip():
            return Response({
                "detail": "O motivo da rejeição é obrigatório."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Armazenar o status anterior
        previous_status = proposal.status
        
        # Atualizar status para rejeitado e adicionar notas
        proposal.status = 'rejected'
        if 'notes' in request.data:
            proposal.notes = request.data['notes']
        proposal.save()
        
        # Criar registro de mudança de status
        status_change = ProposalStatusChange.objects.create(
            proposal=proposal,
            previous_status=previous_status,
            new_status='rejected',
            changed_by=request.user,
            reason=request.data.get('reason', '')
        )
        
        # Adicionar comentário
        comment = ProposalComment.objects.create(
            proposal=proposal,
            author=request.user,
            text=request.data.get('comment', request.data['reason']),
            is_internal=request.data.get('is_internal', False)
        )
        
        # Enviar notificação para o cliente
        notification_service = NotificationService()
        notification_service.send_rejection_notification(
            proposal.user,
            proposal,
            request.data.get('reason', '')
        )
        
        # Retornar a proposta completa
        serializer = ProposalDetailSerializer(proposal)
        return Response(serializer.data)

class RequestDocumentsView(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request, pk):
        proposal = get_object_or_404(Proposal, pk=pk)
        
        # Verificar se os documentos solicitados foram especificados
        if 'documents' not in request.data or not request.data['documents']:
            return Response({
                "detail": "Os documentos solicitados devem ser especificados."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Armazenar o status anterior
        previous_status = proposal.status
        
        # Atualizar status para aguardando documentos
        proposal.status = 'waiting_docs'
        proposal.save()
        
        # Criar registro de mudança de status
        status_change = ProposalStatusChange.objects.create(
            proposal=proposal,
            previous_status=previous_status,
            new_status='waiting_docs',
            changed_by=request.user,
            reason='Documentos adicionais solicitados'
        )
        
        # Adicionar comentário com a solicitação de documentos
        document_message = request.data.get('message', 'Por favor, envie os documentos solicitados:')
        document_list = ', '.join(request.data['documents'])
        comment_text = f"{document_message} {document_list}"
        
        comment = ProposalComment.objects.create(
            proposal=proposal,
            author=request.user,
            text=comment_text,
            is_internal=False  # Comentário visível para o cliente
        )
        
        # Enviar notificação para o cliente
        notification_service = NotificationService()
        notification_service.send_document_request_notification(
            proposal.user,
            proposal,
            comment_text
        )
        
        # Retornar a proposta completa
        serializer = ProposalDetailSerializer(proposal)
        return Response(serializer.data) 