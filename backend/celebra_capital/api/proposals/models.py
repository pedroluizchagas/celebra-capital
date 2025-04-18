from django.db import models
from django.contrib.auth.models import User

class Proposal(models.Model):
    """
    Modelo para armazenar propostas de crédito
    """
    STATUS_CHOICES = (
        ('pending', 'Pendente de Análise'),
        ('analyzing', 'Em Análise'),
        ('approved', 'Aprovada'),
        ('waiting_docs', 'Aguardando Documentos'),
        ('waiting_signature', 'Aguardando Assinatura'),
        ('completed', 'Concluída'),
        ('rejected', 'Rejeitada'),
    )
    
    CREDIT_TYPE_CHOICES = (
        ('personal', 'Crédito Pessoal'),
        ('consigned', 'Consignado'),
        ('card', 'Cartão Consignado'),
        ('fgts', 'Antecipação FGTS'),
    )
    
    POTENTIAL_CHOICES = (
        ('high', 'Alto Potencial'),
        ('medium', 'Médio Potencial'),
        ('low', 'Baixo Potencial'),
        ('rejected', 'Não Qualificado'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='proposals')
    credit_type = models.CharField(max_length=20, choices=CREDIT_TYPE_CHOICES)
    amount_requested = models.DecimalField(max_digits=10, decimal_places=2)
    installments = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    potential_rating = models.CharField(max_length=10, choices=POTENTIAL_CHOICES, blank=True, null=True)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    amount_approved = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    installment_value = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Proposta {self.id} - {self.user.username} - {self.credit_type}"
    
    class Meta:
        verbose_name = "Proposta"
        verbose_name_plural = "Propostas"
        ordering = ['-created_at']
        
class ProposalAnswer(models.Model):
    """
    Modelo para armazenar respostas do formulário de qualificação de proposta
    """
    proposal = models.ForeignKey(Proposal, on_delete=models.CASCADE, related_name='answers')
    question_id = models.CharField(max_length=50)
    question_text = models.TextField()
    answer = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.question_id} - {self.proposal.id}"
    
    class Meta:
        verbose_name = "Resposta de Proposta"
        verbose_name_plural = "Respostas de Proposta"
        
class Signature(models.Model):
    """
    Modelo para armazenar informações de assinaturas eletrônicas
    """
    proposal = models.OneToOneField(Proposal, on_delete=models.CASCADE, related_name='signature')
    signature_id = models.CharField(max_length=100, blank=True, null=True)
    signature_url = models.URLField(blank=True, null=True)
    signature_date = models.DateTimeField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    is_signed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Assinatura - Proposta {self.proposal.id}"
    
    class Meta:
        verbose_name = "Assinatura"
        verbose_name_plural = "Assinaturas" 