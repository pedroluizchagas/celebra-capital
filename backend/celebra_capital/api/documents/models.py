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
    
    def __str__(self):
        return f"OCR - {self.document.file_name}"
    
    class Meta:
        verbose_name = "Resultado OCR"
        verbose_name_plural = "Resultados OCR" 