from django.db import models
from django.contrib.auth.models import User
from ..proposals.models import Proposal

class SignatureDocument(models.Model):
    """
    Modelo para rastrear documentos enviados para assinatura
    """
    STATUS_CHOICES = (
        ('draft', 'Rascunho'),
        ('processing', 'Processando'),
        ('pending', 'Pendente de Assinatura'),
        ('partial', 'Parcialmente Assinado'),
        ('completed', 'Totalmente Assinado'),
        ('canceled', 'Cancelado'),
        ('expired', 'Expirado'),
    )
    
    proposal = models.ForeignKey(Proposal, on_delete=models.CASCADE, related_name='signature_documents')
    document_key = models.CharField(max_length=100, unique=True, help_text="Chave do documento na plataforma de assinatura")
    document_name = models.CharField(max_length=255)
    document_type = models.CharField(max_length=50, default='contract', help_text="Tipo de documento (ex: contrato, termo, etc)")
    file_path = models.CharField(max_length=255, null=True, blank=True, help_text="Caminho do arquivo original")
    signed_file_url = models.URLField(max_length=512, null=True, blank=True, help_text="URL para download do documento assinado")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Documento {self.document_type} - Proposta {self.proposal.id}"
    
    class Meta:
        verbose_name = "Documento de Assinatura"
        verbose_name_plural = "Documentos de Assinatura"
        ordering = ['-created_at']

class Signer(models.Model):
    """
    Modelo para rastrear signatários de documentos
    """
    ROLE_CHOICES = (
        ('client', 'Cliente'),
        ('company', 'Empresa'),
        ('witness', 'Testemunha'),
        ('cosigner', 'Co-signatário'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pendente'),
        ('signed', 'Assinado'),
        ('rejected', 'Rejeitado'),
        ('expired', 'Expirado'),
    )
    
    document = models.ForeignKey(SignatureDocument, on_delete=models.CASCADE, related_name='signers')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    cpf = models.CharField(max_length=14, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    signer_key = models.CharField(max_length=100, unique=True, help_text="Chave do signatário na plataforma de assinatura")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    sign_url = models.URLField(max_length=512, null=True, blank=True, help_text="URL para assinatura")
    requested_at = models.DateTimeField(null=True, blank=True)
    signed_at = models.DateTimeField(null=True, blank=True)
    sign_ip = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.email}) - {self.role}"
    
    class Meta:
        verbose_name = "Signatário"
        verbose_name_plural = "Signatários"
        ordering = ['document', 'created_at']

class SignatureEvent(models.Model):
    """
    Modelo para registrar eventos relacionados a assinaturas
    """
    EVENT_TYPES = (
        ('created', 'Documento Criado'),
        ('uploaded', 'Documento Enviado'),
        ('signer_added', 'Signatário Adicionado'),
        ('requested', 'Assinatura Solicitada'),
        ('opened', 'Documento Aberto'),
        ('signed', 'Documento Assinado'),
        ('rejected', 'Assinatura Rejeitada'),
        ('canceled', 'Documento Cancelado'),
        ('expired', 'Documento Expirado'),
        ('completed', 'Processo Concluído'),
    )
    
    document = models.ForeignKey(SignatureDocument, on_delete=models.CASCADE, related_name='events')
    signer = models.ForeignKey(Signer, on_delete=models.SET_NULL, null=True, blank=True, related_name='events')
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    event_data = models.JSONField(null=True, blank=True, help_text="Dados adicionais do evento")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.get_event_type_display()} - {self.document.document_name}"
    
    class Meta:
        verbose_name = "Evento de Assinatura"
        verbose_name_plural = "Eventos de Assinatura"
        ordering = ['-created_at'] 