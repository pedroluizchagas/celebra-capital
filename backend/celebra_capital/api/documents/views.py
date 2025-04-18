from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Document, OcrResult
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from celebra_capital.api.proposals.models import Proposal
from .serializers import DocumentSerializer, OcrResultSerializer
from .tasks import process_document_ocr

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
            
            # Iniciar processamento OCR em background
            if document_type in ['rg', 'cpf', 'proof_income']:
                process_document_ocr.delay(document.id)
            
            # Retornar resposta
            serializer = DocumentSerializer(document)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
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
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def delete(self, request, pk):
        try:
            document = get_object_or_404(Document, id=pk, user=request.user)
            document.is_deleted = True
            document.save()
            
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except Exception as e:
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
                serializer = OcrResultSerializer(ocr_result)
                return Response(serializer.data)
            except OcrResult.DoesNotExist:
                return Response(
                    {"error": "Resultado de OCR não encontrado", "status": "processing"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
        except Exception as e:
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
                        "progress": 100
                    })
                else:
                    # Calcular progresso simulado com base no tempo decorrido
                    # Em uma implementação real, você pode usar valores reais do serviço de OCR
                    import time
                    from django.utils import timezone
                    
                    time_since_created = (timezone.now() - ocr_result.created_at).total_seconds()
                    # Suponha que o OCR leva normalmente 10 segundos
                    progress = min(int(time_since_created / 10 * 100), 95)
                    
                    return Response({
                        "complete": False,
                        "progress": progress
                    })
                    
            except OcrResult.DoesNotExist:
                # Se o resultado ainda não existe, inicie o processamento
                process_document_ocr.delay(document_id)
                
                return Response({
                    "complete": False,
                    "progress": 5,
                    "message": "Processamento OCR iniciado"
                })
            
        except Exception as e:
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
                        "validation_errors": ["Tipo de documento não corresponde ao esperado"],
                        "confidence_score": 0.0,
                        "extracted_data": {}
                    }
                )
            
            # Verificar se já existe resultado de OCR
            try:
                ocr_result = OcrResult.objects.get(document=document)
                
                if not ocr_result.ocr_complete:
                    return Response(
                        {
                            "is_valid": False,
                            "validation_errors": ["OCR ainda está em processamento"],
                            "confidence_score": 0.0,
                            "extracted_data": {}
                        }
                    )
                
                # Validar o documento com base nos dados do OCR
                extracted_data = ocr_result.extracted_data
                validation_errors = []
                
                # Realizar validações específicas para cada tipo de documento
                if document_type == 'rg':
                    if not extracted_data.get('rg'):
                        validation_errors.append("Número de RG não detectado")
                    if not extracted_data.get('nome'):
                        validation_errors.append("Nome não detectado")
                
                elif document_type == 'cpf':
                    if not extracted_data.get('cpf'):
                        validation_errors.append("Número de CPF não detectado")
                    # Validar formato do CPF
                    cpf = extracted_data.get('cpf', '')
                    if not any(c.isdigit() for c in cpf) or len(cpf.replace('.', '').replace('-', '')) != 11:
                        validation_errors.append("Formato de CPF inválido")
                
                elif document_type == 'proof_income':
                    if not extracted_data.get('valor'):
                        validation_errors.append("Valor não detectado")
                    if not extracted_data.get('data'):
                        validation_errors.append("Data não detectada")
                
                elif document_type == 'address_proof':
                    if not extracted_data.get('endereco'):
                        validation_errors.append("Endereço não detectado")
                    if not extracted_data.get('cep'):
                        validation_errors.append("CEP não detectado")
                
                # Retornar resultado da validação
                return Response({
                    "is_valid": len(validation_errors) == 0,
                    "validation_errors": validation_errors,
                    "confidence_score": ocr_result.confidence_score,
                    "extracted_data": extracted_data
                })
                
            except OcrResult.DoesNotExist:
                # Se não houver resultado de OCR, iniciar o processamento
                process_document_ocr.delay(document_id)
                
                return Response(
                    {
                        "is_valid": False,
                        "validation_errors": ["OCR não realizado ainda. Processamento iniciado."],
                        "confidence_score": 0.0,
                        "extracted_data": {}
                    }
                )
            
        except Exception as e:
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
            proposal = get_object_or_404(Proposal, id=proposal_id, user=request.user)
            
            # Definir documentos necessários com base no tipo de proposta
            required_docs = [
                {"id": "rg", "name": "RG", "description": "Documento de identidade", "required": True},
                {"id": "cpf", "name": "CPF", "description": "Cadastro de Pessoa Física", "required": True},
                {"id": "proof_income", "name": "Comprovante de Renda", "description": "Contracheque ou holerite recente", "required": True},
                {"id": "address_proof", "name": "Comprovante de Residência", "description": "Conta de água, luz ou telefone", "required": True},
                {"id": "selfie", "name": "Selfie", "description": "Foto sua segurando o RG", "required": True},
            ]
            
            # Adicionar documento específico para FGTS, se for o caso
            if proposal.credit_type == 'fgts':
                required_docs.append({
                    "id": "fgts", 
                    "name": "Extrato FGTS", 
                    "description": "Extrato do FGTS dos últimos 3 meses", 
                    "required": True
                })
            
            # Verificar quais documentos já foram enviados
            uploaded_docs = Document.objects.filter(
                user=request.user,
                proposal=proposal,
                is_deleted=False
            ).values_list('document_type', flat=True)
            
            # Marcar documentos como enviados
            for doc in required_docs:
                doc["uploaded"] = doc["id"] in uploaded_docs
            
            return Response(required_docs)
            
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 