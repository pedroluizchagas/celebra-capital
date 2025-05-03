from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Document, OcrResult
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.utils import timezone
from celebra_capital.api.proposals.models import Proposal
from .serializers import DocumentSerializer, OcrResultSerializer
from .tasks import process_document_ocr
from celery.result import AsyncResult
import structlog

# Configurar o logger estruturado
logger = structlog.get_logger(__name__)

# Implementações de views serão adicionadas posteriormente

class DocumentUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        try:
            # Obter usuário
            user = request.user
            
            # Verificar dados
            document_type = request.data.get('document_type')
            if not document_type:
                return Response(
                    {"error": "Tipo de documento é obrigatório"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verificar se o arquivo foi enviado
            if 'file' not in request.FILES:
                return Response(
                    {"error": "Nenhum arquivo enviado"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            file = request.FILES['file']
            
            # Verificar proposta (opcional)
            proposal_id = request.data.get('proposal_id')
            proposal = None
            if proposal_id:
                try:
                    proposal = Proposal.objects.get(id=proposal_id, user=user)
                except Proposal.DoesNotExist:
                    return Response(
                        {"error": "Proposta não encontrada"},
                        status=status.HTTP_404_NOT_FOUND
                    )
            
            # Criar documento
            document = Document.objects.create(
                user=user,
                proposal=proposal,
                document_type=document_type,
                file=file,
                file_name=file.name,
                mime_type=file.content_type,
                file_size=file.size
            )
            
            logger.info(
                "Documento criado com sucesso",
                document_id=document.id,
                document_type=document_type,
                user_id=user.id,
                file_size=file.size
            )
            
            # Iniciar processamento OCR em background para tipos específicos
            if document_type in ['rg', 'cpf', 'proof_income', 'address_proof']:
                # Enviar tarefa para a fila OCR
                task = process_document_ocr.apply_async(
                    args=[document.id],
                    queue='ocr',
                    priority=2  # Prioridade normal (valores mais baixos têm prioridade maior)
                )
                
                # Criar objeto OcrResult com o task_id para rastreamento
                OcrResult.objects.create(
                    document=document,
                    ocr_complete=False,
                    task_id=task.id,
                    task_status='PENDING',
                    current_progress=0
                )
                
                logger.info(
                    "Processamento OCR iniciado",
                    document_id=document.id,
                    task_id=task.id,
                    document_type=document_type
                )
            
            # Retornar resposta
            serializer = DocumentSerializer(document)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(
                "Erro ao fazer upload de documento",
                error=str(e),
                user_id=request.user.id if hasattr(request, 'user') else None
            )
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DocumentListView(APIView):
    def get(self, request):
        try:
            documents = Document.objects.filter(
                user=request.user,
                is_deleted=False
            ).order_by('-created_at')
            
            serializer = DocumentSerializer(documents, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(
                "Erro ao listar documentos",
                error=str(e),
                user_id=request.user.id
            )
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DocumentDetailView(APIView):
    def get(self, request, pk):
        try:
            document = get_object_or_404(Document, id=pk, user=request.user)
            serializer = DocumentSerializer(document)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(
                "Erro ao obter detalhes do documento",
                error=str(e),
                document_id=pk,
                user_id=request.user.id
            )
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def delete(self, request, pk):
        try:
            document = get_object_or_404(Document, id=pk, user=request.user)
            
            # Verificar se há uma tarefa OCR em andamento
            try:
                ocr_result = OcrResult.objects.get(document=document)
                if ocr_result.task_id and not ocr_result.ocr_complete:
                    # Revogar tarefa Celery se estiver em andamento
                    try:
                        AsyncResult(ocr_result.task_id).revoke(terminate=True)
                        logger.info(
                            "Tarefa OCR revogada",
                            document_id=document.id,
                            task_id=ocr_result.task_id
                        )
                    except Exception as e:
                        logger.warning(
                            "Erro ao revogar tarefa OCR",
                            error=str(e),
                            document_id=document.id,
                            task_id=ocr_result.task_id
                        )
            except OcrResult.DoesNotExist:
                pass
                
            document.is_deleted = True
            document.save()
            
            logger.info(
                "Documento marcado como excluído",
                document_id=document.id,
                user_id=request.user.id
            )
            
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except Exception as e:
            logger.error(
                "Erro ao excluir documento",
                error=str(e),
                document_id=pk,
                user_id=request.user.id
            )
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class OcrResultView(APIView):
    def get(self, request, document_id):
        try:
            document = get_object_or_404(Document, id=document_id, user=request.user)
            
            try:
                ocr_result = OcrResult.objects.get(document=document)
                
                # Verificar estado atual da tarefa Celery se não estiver completa
                if not ocr_result.ocr_complete and ocr_result.task_id:
                    task_result = AsyncResult(ocr_result.task_id)
                    
                    # Atualizar status da tarefa no banco de dados
                    if task_result.state != ocr_result.task_status:
                        ocr_result.update_task_status(task_result.state)
                        
                        # Se a tarefa foi concluída com sucesso, mas o status no banco ainda não foi atualizado
                        if task_result.state == 'SUCCESS' and not ocr_result.ocr_complete:
                            # Tarefa concluída, mas o callback não atualizou o status
                            # Isso pode acontecer se o worker for interrompido antes de salvar o resultado no banco
                            ocr_result.refresh_from_db()
                            if not ocr_result.ocr_complete:
                                logger.warning(
                                    "Tarefa OCR concluída, mas o status não foi atualizado",
                                    document_id=document_id,
                                    task_id=ocr_result.task_id
                                )
                                
                                # Programar nova tarefa para processar o documento
                                if ocr_result.retry_count < 3:  # Limite de retentativas
                                    ocr_result.increment_retry()
                                    task = process_document_ocr.apply_async(
                                        args=[document.id],
                                        queue='ocr',
                                        priority=3  # Prioridade menor para reprocessamento
                                    )
                                    ocr_result.task_id = task.id
                                    ocr_result.task_status = 'PENDING'
                                    ocr_result.save()
                
                serializer = OcrResultSerializer(ocr_result)
                return Response(serializer.data)
                
            except OcrResult.DoesNotExist:
                # Iniciar processamento OCR automaticamente se ainda não existir
                task = process_document_ocr.apply_async(
                    args=[document.id],
                    queue='ocr'
                )
                
                # Criar objeto para rastreamento
                ocr_result = OcrResult.objects.create(
                    document=document,
                    ocr_complete=False,
                    task_id=task.id,
                    task_status='PENDING',
                    current_progress=0
                )
                
                logger.info(
                    "Processamento OCR iniciado automaticamente",
                    document_id=document.id,
                    task_id=task.id
                )
                
                return Response({
                    "id": ocr_result.id,
                    "document": document.id,
                    "ocr_complete": False,
                    "task_id": task.id,
                    "task_status": "PENDING",
                    "current_progress": 0,
                    "message": "Processamento OCR iniciado"
                })
            
        except Exception as e:
            logger.error(
                "Erro ao obter resultado OCR",
                error=str(e),
                document_id=document_id,
                user_id=request.user.id
            )
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class OcrStatusView(APIView):
    def get(self, request, document_id):
        try:
            document = get_object_or_404(Document, id=document_id, user=request.user)
            
            try:
                ocr_result = OcrResult.objects.get(document=document)
                
                if ocr_result.ocr_complete:
                    return Response({
                        "complete": True,
                        "progress": 100,
                        "task_status": ocr_result.task_status or "SUCCESS"
                    })
                elif ocr_result.task_id:
                    # Verificar estado atual da tarefa
                    task_result = AsyncResult(ocr_result.task_id)
                    
                    # Atualizar status da tarefa no banco de dados
                    if task_result.state != ocr_result.task_status:
                        ocr_result.update_task_status(task_result.state)
                    
                    # Retornar progresso com base no estado da tarefa e progresso atual
                    progress = ocr_result.current_progress
                    
                    # Se a tarefa estiver em um estado terminal e não marcada como completa
                    if task_result.state in ['SUCCESS', 'FAILURE'] and not ocr_result.ocr_complete:
                        # Verificar se precisa reagendar a tarefa (caso de falha não detectada)
                        if task_result.state == 'FAILURE' and ocr_result.retry_count < 3:
                            ocr_result.increment_retry()
                            new_task = process_document_ocr.apply_async(
                                args=[document.id],
                                queue='ocr',
                                priority=3
                            )
                            ocr_result.task_id = new_task.id
                            ocr_result.task_status = 'PENDING'
                            ocr_result.save()
                            
                            logger.info(
                                "Tarefa OCR reagendada após falha",
                                document_id=document.id,
                                old_task_id=task_result.id,
                                new_task_id=new_task.id,
                                retry_count=ocr_result.retry_count
                            )
                            
                            return Response({
                                "complete": False,
                                "progress": 10,  # Reiniciar progresso
                                "task_status": "PENDING",
                                "retry_count": ocr_result.retry_count,
                                "message": "Processamento reiniciado após falha"
                            })
                    
                    return Response({
                        "complete": False,
                        "progress": progress,
                        "task_status": task_result.state,
                        "retry_count": ocr_result.retry_count
                    })
                else:
                    # Não há task_id, mas o registro existe - caso raro
                    current_time = timezone.now()
                    time_since_created = (current_time - ocr_result.created_at).total_seconds()
                    
                    # Se foi criado há mais de 1 minuto e ainda não tem task_id, iniciar nova tarefa
                    if time_since_created > 60:
                        task = process_document_ocr.apply_async(
                            args=[document.id],
                            queue='ocr'
                        )
                        
                        ocr_result.task_id = task.id
                        ocr_result.task_status = 'PENDING'
                        ocr_result.save()
                        
                        logger.info(
                            "Nova tarefa OCR iniciada para resultado sem task_id",
                            document_id=document.id,
                            task_id=task.id,
                            ocr_result_id=ocr_result.id
                        )
                    
                    progress = min(int(time_since_created / 20 * 100), 90)
                    
                    return Response({
                        "complete": False,
                        "progress": progress,
                        "message": "Processamento em andamento"
                    })
                    
            except OcrResult.DoesNotExist:
                # Se o resultado ainda não existe, inicie o processamento
                task = process_document_ocr.apply_async(
                    args=[document.id],
                    queue='ocr'
                )
                
                # Criar objeto para rastreamento
                OcrResult.objects.create(
                    document=document,
                    ocr_complete=False,
                    task_id=task.id,
                    task_status='PENDING',
                    current_progress=0
                )
                
                logger.info(
                    "Processamento OCR iniciado via endpoint de status",
                    document_id=document.id,
                    task_id=task.id
                )
                
                return Response({
                    "complete": False,
                    "progress": 5,
                    "task_status": "PENDING",
                    "message": "Processamento OCR iniciado"
                })
            
        except Exception as e:
            logger.error(
                "Erro ao verificar status OCR",
                error=str(e),
                document_id=document_id,
                user_id=request.user.id
            )
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DocumentValidationView(APIView):
    def post(self, request, document_id):
        try:
            document = get_object_or_404(Document, id=document_id, user=request.user)
            document_type = request.data.get('document_type')
            
            if not document_type:
                return Response(
                    {"error": "Tipo de documento é obrigatório"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verificar se o tipo do documento corresponde ao esperado
            if document.document_type != document_type:
                return Response(
                    {
                        "is_valid": False,
                        "validation_errors": ["Tipo de documento não corresponde ao esperado"]
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verificar se o OCR está completo
            try:
                ocr_result = OcrResult.objects.get(document=document)
                
                if not ocr_result.ocr_complete:
                    # Verificar status da tarefa
                    if ocr_result.task_id:
                        task_result = AsyncResult(ocr_result.task_id)
                        
                        # Se a tarefa já terminou, mas o status não foi atualizado
                        if task_result.state == 'SUCCESS':
                            ocr_result.refresh_from_db()
                            
                        # Se ainda não está completo após verificação
                        if not ocr_result.ocr_complete:
                            return Response(
                                {
                                    "is_valid": False,
                                    "validation_errors": ["Processamento OCR em andamento"],
                                    "task_status": task_result.state,
                                    "progress": ocr_result.current_progress
                                },
                                status=status.HTTP_202_ACCEPTED
                            )
                
                # Validar documento com base nos dados extraídos pelo OCR
                extracted_data = ocr_result.extracted_data or {}
                confidence_score = ocr_result.confidence_score or 0
                
                validation_errors = []
                
                # Validação específica por tipo de documento
                if document_type == 'rg':
                    if not extracted_data.get('nome'):
                        validation_errors.append("Nome não detectado no documento")
                    if not extracted_data.get('rg'):
                        validation_errors.append("Número do RG não detectado")
                    
                elif document_type == 'cpf':
                    if not extracted_data.get('cpf'):
                        validation_errors.append("Número do CPF não detectado")
                    
                elif document_type == 'proof_income':
                    if not extracted_data.get('valor'):
                        validation_errors.append("Valor não detectado no comprovante")
                    
                elif document_type == 'address_proof':
                    if not extracted_data.get('endereco'):
                        validation_errors.append("Endereço não detectado no documento")
                
                is_valid = len(validation_errors) == 0 and confidence_score >= 0.7
                
                # Atualizar o status de verificação do documento se for válido
                if is_valid:
                    document.verification_status = 'verified'
                    document.save(update_fields=['verification_status'])
                
                return Response({
                    "is_valid": is_valid,
                    "extracted_data": extracted_data,
                    "validation_errors": validation_errors if not is_valid else None,
                    "confidence_score": confidence_score
                })
                
            except OcrResult.DoesNotExist:
                # Iniciar processamento OCR
                task = process_document_ocr.apply_async(
                    args=[document.id],
                    queue='ocr',
                    priority=1  # Alta prioridade por ser solicitação explícita
                )
                
                # Criar objeto para rastreamento
                OcrResult.objects.create(
                    document=document,
                    ocr_complete=False,
                    task_id=task.id,
                    task_status='PENDING',
                    current_progress=0
                )
                
                logger.info(
                    "Processamento OCR iniciado via validação",
                    document_id=document.id,
                    task_id=task.id
                )
                
                return Response(
                    {
                        "is_valid": False,
                        "validation_errors": ["Processamento OCR iniciado"],
                        "task_id": task.id,
                        "progress": 0
                    },
                    status=status.HTTP_202_ACCEPTED
                )
            
        except Exception as e:
            logger.error(
                "Erro ao validar documento",
                error=str(e),
                document_id=document_id,
                user_id=request.user.id
            )
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SelfieUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        # Redirecionar para o upload de documento com tipo 'selfie'
        request.data['document_type'] = 'selfie'
        return DocumentUploadView().post(request)

class RequiredDocumentsView(APIView):
    def get(self, request, proposal_id):
        try:
            # Verificar se a proposta existe e pertence ao usuário
            proposal = get_object_or_404(Proposal, id=proposal_id, user=request.user)
            
            # Lista de documentos necessários (pode vir do modelo da proposta ou de configuração)
            required_documents = [
                {
                    'id': 'rg',
                    'name': 'RG',
                    'description': 'Documento de identidade',
                    'required': True
                },
                {
                    'id': 'cpf',
                    'name': 'CPF',
                    'description': 'Cadastro de Pessoa Física',
                    'required': True
                },
                {
                    'id': 'proof_income',
                    'name': 'Comprovante de Renda',
                    'description': 'Contracheque ou holerite recente',
                    'required': True
                },
                {
                    'id': 'address_proof',
                    'name': 'Comprovante de Residência',
                    'description': 'Conta de água, luz ou telefone',
                    'required': True
                },
                {
                    'id': 'selfie',
                    'name': 'Selfie',
                    'description': 'Foto sua segurando o RG',
                    'required': True
                }
            ]
            
            # Verificar quais documentos já foram enviados
            documents = Document.objects.filter(
                user=request.user,
                proposal=proposal,
                is_deleted=False
            )
            
            # Marcar documentos que já foram enviados
            doc_types_uploaded = {doc.document_type for doc in documents}
            for doc in required_documents:
                doc['uploaded'] = doc['id'] in doc_types_uploaded
            
            return Response(required_documents)
            
        except Exception as e:
            logger.error(
                "Erro ao listar documentos necessários",
                error=str(e),
                proposal_id=proposal_id,
                user_id=request.user.id
            )
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 