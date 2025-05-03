"""
Views para API de assinaturas digitais
"""
import logging
import structlog
from django.http import HttpResponse, JsonResponse
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.conf import settings
from celebra_capital.api.proposals.models import Proposal, Signature
from .service import SignatureService
from .tasks import check_signature_status

logger = structlog.get_logger(__name__)

class SignatureRequestView(APIView):
    """
    Endpoint para criar e gerenciar solicitações de assinatura
    """
    permission_classes = [IsAuthenticated]
    
    @method_decorator(cache_page(30))  # Cache por 30 segundos
    def get(self, request, proposal_id):
        """
        Obtém o status da assinatura para uma proposta
        
        O resultado é cacheado por 30 segundos para reduzir chamadas à API externa
        em casos de múltiplas verificações de status em curto período.
        """
        try:
            # Verificar se o usuário tem acesso à proposta
            proposal = get_object_or_404(Proposal, id=proposal_id)
            
            if proposal.user.id != request.user.id and not request.user.is_staff:
                return Response(
                    {"error": "Você não tem permissão para acessar esta proposta"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Obter status da assinatura
            service = SignatureService()
            signature_status = service.get_signature_status(proposal_id)
            
            # Adicionar metadata do cache para debug
            if settings.DEBUG:
                signature_status['_cache_info'] = 'Resultado pode estar em cache (TTL: 30s)'
            
            # Se o usuário é o proprietário, adicionar a URL de assinatura
            if proposal.user.id == request.user.id and 'signature_url' in signature_status:
                signature_status['url_to_sign'] = signature_status['signature_url']
            
            return Response(signature_status)
            
        except Exception as e:
            logger.error(
                "Erro ao obter status de assinatura",
                error=str(e),
                proposal_id=proposal_id,
                user_id=request.user.id
            )
            return Response(
                {"error": f"Erro ao obter status de assinatura: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request, proposal_id):
        """
        Cria uma solicitação de assinatura ou assina um documento
        """
        try:
            # Verificar se o usuário tem acesso à proposta
            proposal = get_object_or_404(Proposal, id=proposal_id)
            
            if proposal.user.id != request.user.id and not request.user.is_staff:
                return Response(
                    {"error": "Você não tem permissão para acessar esta proposta"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Verificar se o cliente está enviando uma assinatura ou solicitando uma URL
            signature_data = request.data.get('signature_data')
            
            service = SignatureService()
            
            if signature_data:
                # Cliente está enviando assinatura
                result = service.save_signature(proposal_id, signature_data)
                
                # Atualizar status da proposta
                if proposal.status in ['pending', 'documents_uploaded']:
                    proposal.status = 'signed'
                    proposal.save(update_fields=['status'])
                
                # Agendar verificação assíncrona para confirmar status
                try:
                    signature = Signature.objects.get(proposal_id=proposal_id)
                    check_signature_status.apply_async(
                        args=[signature.id],
                        countdown=30  # Verificar após 30 segundos
                    )
                except Signature.DoesNotExist:
                    pass
                
                return Response(result)
                
            else:
                # Cliente está solicitando uma URL para assinar
                result = service.create_signature_request(proposal_id)
                
                return Response(result)
                
        except Exception as e:
            logger.error(
                "Erro ao processar solicitação de assinatura",
                error=str(e),
                proposal_id=proposal_id,
                user_id=request.user.id
            )
            return Response(
                {"error": f"Erro ao processar solicitação de assinatura: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SignedDocumentView(APIView):
    """
    Endpoint para baixar documentos assinados
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, proposal_id):
        """
        Baixa o documento assinado para uma proposta
        """
        try:
            # Verificar se o usuário tem acesso à proposta
            proposal = get_object_or_404(Proposal, id=proposal_id)
            
            if proposal.user.id != request.user.id and not request.user.is_staff:
                return Response(
                    {"error": "Você não tem permissão para acessar esta proposta"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Verificar se a proposta foi assinada
            try:
                signature = Signature.objects.get(proposal_id=proposal_id)
                
                if not signature.is_signed:
                    return Response(
                        {"error": "O documento ainda não foi assinado"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
            except Signature.DoesNotExist:
                return Response(
                    {"error": "Nenhuma assinatura encontrada para esta proposta"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Baixar documento assinado
            service = SignatureService()
            document = service.download_signed_document(proposal_id)
            
            # Retornar o documento
            response = HttpResponse(document['content'], content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{document["filename"]}"'
            
            return response
            
        except ValueError as ve:
            logger.warning(
                "Erro ao baixar documento assinado",
                error=str(ve),
                proposal_id=proposal_id,
                user_id=request.user.id
            )
            return Response(
                {"error": str(ve)},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except Exception as e:
            logger.error(
                "Erro ao baixar documento assinado",
                error=str(e),
                proposal_id=proposal_id,
                user_id=request.user.id
            )
            return Response(
                {"error": f"Erro ao baixar documento assinado: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 