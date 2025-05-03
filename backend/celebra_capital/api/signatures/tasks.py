"""
Tarefas Celery para monitoramento de assinaturas
"""
import logging
import structlog
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from celebra_capital.api.proposals.models import Signature, Proposal
from .service import SignatureService

logger = structlog.get_logger(__name__)

@shared_task
def check_signature_status(signature_id=None):
    """
    Verifica o status de uma assinatura digital específica
    
    Args:
        signature_id: ID do registro de assinatura (se None, verifica todas pendentes)
    """
    try:
        service = SignatureService()
        signatures_updated = 0
        
        if signature_id:
            # Verificar uma assinatura específica
            try:
                signature = Signature.objects.select_related('proposal').get(id=signature_id)
                if signature.signature_id and not signature.is_signed:
                    status = service.get_signature_status(signature.proposal.id)
                    
                    if status['status'] == 'completed' and not signature.is_signed:
                        signature.is_signed = True
                        signature.signature_date = timezone.now()
                        signature.save(update_fields=['is_signed', 'signature_date'])
                        
                        # Atualizar status da proposta
                        proposal = signature.proposal
                        if proposal.status in ['pending', 'documents_uploaded']:
                            proposal.status = 'signed'
                            proposal.save(update_fields=['status'])
                        
                        signatures_updated += 1
                        
                        logger.info(
                            "Assinatura concluída",
                            signature_id=signature_id,
                            proposal_id=signature.proposal.id
                        )
            
            except Signature.DoesNotExist:
                logger.warning(f"Assinatura ID {signature_id} não encontrada")
                return f"Assinatura ID {signature_id} não encontrada"
        
        else:
            # Verificar todas as assinaturas pendentes enviadas há mais de 5 minutos
            time_threshold = timezone.now() - timedelta(minutes=5)
            
            # Buscar assinaturas que têm ID da D4Sign, não estão marcadas como assinadas, 
            # e foram atualizadas há pelo menos 5 minutos
            pending_signatures = Signature.objects.filter(
                signature_id__isnull=False,
                is_signed=False,
                updated_at__lt=time_threshold
            ).select_related('proposal')[:50]  # Limitar a 50 por vez para não sobrecarregar
            
            for signature in pending_signatures:
                try:
                    status = service.get_signature_status(signature.proposal.id)
                    
                    if status['status'] == 'completed' and not signature.is_signed:
                        signature.is_signed = True
                        signature.signature_date = timezone.now()
                        signature.save(update_fields=['is_signed', 'signature_date'])
                        
                        # Atualizar status da proposta
                        proposal = signature.proposal
                        if proposal.status in ['pending', 'documents_uploaded']:
                            proposal.status = 'signed'
                            proposal.save(update_fields=['status'])
                        
                        signatures_updated += 1
                        
                        logger.info(
                            "Assinatura concluída",
                            signature_id=signature.id,
                            proposal_id=signature.proposal.id
                        )
                
                except Exception as signature_error:
                    logger.error(
                        "Erro ao verificar assinatura",
                        error=str(signature_error),
                        signature_id=signature.id,
                        proposal_id=signature.proposal.id
                    )
        
        return f"Verificadas {len(pending_signatures) if not signature_id else 1} assinaturas. Atualizadas: {signatures_updated}"
    
    except Exception as e:
        logger.error("Erro ao monitorar assinaturas", error=str(e))
        return f"Erro ao monitorar assinaturas: {str(e)}"

@shared_task
def generate_signature_reminders():
    """
    Gera lembretes para assinaturas pendentes há mais de 24h
    """
    try:
        # Verificar assinaturas enviadas há mais de 24h e não concluídas
        time_threshold = timezone.now() - timedelta(hours=24)
        
        pending_signatures = Signature.objects.filter(
            signature_id__isnull=False,
            is_signed=False,
            created_at__lt=time_threshold
        ).select_related('proposal__user')
        
        reminders_sent = 0
        
        for signature in pending_signatures:
            try:
                # Aqui você pode integrar com seu sistema de notificações
                # Exemplo: enviar email ou notificação push
                
                # Apenas registrar para este exemplo
                logger.info(
                    "Lembrete de assinatura gerado",
                    signature_id=signature.id,
                    proposal_id=signature.proposal.id,
                    user_id=signature.proposal.user.id,
                    user_email=signature.proposal.user.email
                )
                
                reminders_sent += 1
                
            except Exception as reminder_error:
                logger.error(
                    "Erro ao gerar lembrete de assinatura",
                    error=str(reminder_error),
                    signature_id=signature.id,
                    proposal_id=signature.proposal.id
                )
        
        return f"Lembretes gerados: {reminders_sent} de {pending_signatures.count()} assinaturas pendentes"
    
    except Exception as e:
        logger.error("Erro ao gerar lembretes de assinatura", error=str(e))
        return f"Erro ao gerar lembretes: {str(e)}" 