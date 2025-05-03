from django.db import models
from django.contrib.auth.models import User
from celebra_capital.api.proposals.models import Proposal

class Document(models.Model):
    """
    Modelo para armazenar documentos enviados pelos usuários
    """
    DOCUMENT_TYPES = (
        ('rg', 'RG'),
        ('cpf', 'CPF'),
        ('proof_income', 'Comprovante de Renda'),
        ('address_proof', 'Comprovante de Residência'),
        ('selfie', 'Selfie'),
        ('work_card', 'Carteira de Trabalho'),
        ('contract', 'Contrato'),
        ('term', 'Termo'),
        ('fgts', 'Extrato FGTS'),
        ('other', 'Outro'),
    )
    
    VERIFICATION_STATUS = (
        ('pending', 'Pendente'),
        ('verified', 'Verificado'),
        ('rejected', 'Rejeitado'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    proposal = models.ForeignKey(Proposal, on_delete=models.CASCADE, related_name='documents', null=True, blank=True)
    document_type = models.CharField(max_length=15, choices=DOCUMENT_TYPES)
    file = models.FileField(upload_to='documents/%Y/%m/%d/')
    file_name = models.CharField(max_length=255)
    mime_type = models.CharField(max_length=100, blank=True, null=True)
    file_size = models.PositiveIntegerField(help_text="Tamanho em bytes")
    verification_status = models.CharField(max_length=10, choices=VERIFICATION_STATUS, default='pending')
    verification_notes = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.get_document_type_display()} - {self.user.username}"
    
    class Meta:
        verbose_name = "Documento"
        verbose_name_plural = "Documentos"
        
class OcrResult(models.Model):
    """
    Modelo para armazenar resultados de OCR de documentos
    """
    document = models.OneToOneField(Document, on_delete=models.CASCADE, related_name='ocr_result')
    ocr_complete = models.BooleanField(default=False)
    extracted_data = models.JSONField(blank=True, null=True)
    confidence_score = models.FloatField(blank=True, null=True)
    process_time = models.FloatField(blank=True, null=True, help_text="Tempo de processamento em segundos")
    error_message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Campos para rastreamento de tarefas Celery
    task_id = models.CharField(max_length=255, blank=True, null=True, help_text="ID da tarefa Celery associada")
    task_status = models.CharField(max_length=50, blank=True, null=True, 
                                  help_text="Status da tarefa (PENDING, STARTED, SUCCESS, FAILURE, RETRY)")
    
    # Campos adicionais para rastreamento de progresso
    current_progress = models.IntegerField(default=0, help_text="Progresso atual de 0-100")
    retry_count = models.IntegerField(default=0, help_text="Número de tentativas de processamento")
    last_error_timestamp = models.DateTimeField(null=True, blank=True, help_text="Última vez que ocorreu erro")
    
    def __str__(self):
        return f"OCR - {self.document.file_name}"
    
    class Meta:
        verbose_name = "Resultado OCR"
        verbose_name_plural = "Resultados OCR"
        indexes = [
            models.Index(fields=['task_id']),
            models.Index(fields=['ocr_complete']),
        ]
        
    def update_progress(self, progress):
        """
        Atualiza o progresso do processamento OCR
        """
        self.current_progress = progress
        self.save(update_fields=['current_progress', 'updated_at'])
        
        # Notificar cliente via WebSocket
        try:
            from asgiref.sync import async_to_sync
            from channels.layers import get_channel_layer
            
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'ocr_{self.document.id}',
                {
                    'type': 'ocr_status',
                    'complete': self.ocr_complete,
                    'progress': progress,
                    'task_status': self.task_status
                }
            )
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Erro ao enviar atualização de progresso via WebSocket: {str(e)}")
    
    def mark_complete(self, confidence_score=None, process_time=None, extracted_data=None):
        """
        Marca o processamento OCR como concluído
        """
        self.ocr_complete = True
        self.current_progress = 100
        self.task_status = 'SUCCESS'
        
        if confidence_score is not None:
            self.confidence_score = confidence_score
            
        if process_time is not None:
            self.process_time = process_time
            
        if extracted_data is not None:
            self.extracted_data = extracted_data
            
        self.save()
        
        # Notificar cliente via WebSocket
        try:
            from asgiref.sync import async_to_sync
            from channels.layers import get_channel_layer
            
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'ocr_{self.document.id}',
                {
                    'type': 'ocr_status',
                    'complete': True,
                    'progress': 100,
                    'task_status': 'SUCCESS',
                    'message': 'Processamento OCR concluído'
                }
            )
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Erro ao enviar status de conclusão via WebSocket: {str(e)}")
    
    def mark_failed(self, error_message):
        """
        Marca o processamento OCR como falho
        """
        from django.utils import timezone
        
        self.error_message = error_message
        self.task_status = 'FAILURE'
        self.last_error_timestamp = timezone.now()
        self.save()
        
        # Notificar cliente via WebSocket
        try:
            from asgiref.sync import async_to_sync
            from channels.layers import get_channel_layer
            
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'ocr_{self.document.id}',
                {
                    'type': 'ocr_status',
                    'complete': False,
                    'progress': self.current_progress,
                    'task_status': 'FAILURE',
                    'message': f'Falha no processamento: {error_message}'
                }
            )
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Erro ao enviar status de falha via WebSocket: {str(e)}")
    
    def increment_retry(self):
        """
        Incrementa o contador de tentativas
        """
        self.retry_count += 1
        self.task_status = 'RETRY'
        self.save(update_fields=['retry_count', 'task_status', 'updated_at'])
        return self.retry_count

class OcrResultCache(models.Model):
    """
    Cache de resultados OCR para documentos similares
    Útil para reutilizar resultados de documentos parecidos e acelerar o processamento
    """
    document_type = models.CharField(max_length=50)
    document_hash = models.CharField(max_length=64, unique=True, help_text="Hash do conteúdo do documento")
    extracted_data = models.JSONField()
    confidence_score = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(auto_now=True)
    use_count = models.IntegerField(default=1, help_text="Número de vezes que este cache foi usado")
    
    class Meta:
        verbose_name = "Cache de OCR"
        verbose_name_plural = "Caches de OCR"
        indexes = [
            models.Index(fields=['document_type', 'document_hash']),
        ]
    
    def __str__(self):
        return f"Cache OCR - {self.document_type} ({self.use_count} usos)"
    
    def register_use(self):
        """
        Registra um uso deste cache
        """
        self.use_count += 1
        self.save(update_fields=['use_count', 'last_used_at']) 