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
    provider = models.CharField(max_length=50, default='d4sign', help_text='Provedor de assinatura: clicksign ou d4sign')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Assinatura - Proposta {self.proposal.id}"
    
    class Meta:
        verbose_name = "Assinatura"
        verbose_name_plural = "Assinaturas" 

class ProposalComment(models.Model):
    """
    Modelo para armazenar comentários em propostas.
    """
    proposal = models.ForeignKey(Proposal, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='proposal_comments')
    text = models.TextField(verbose_name="Comentário")
    is_internal = models.BooleanField(default=True, help_text="Determina se o comentário é interno (visível apenas para administradores)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Comentário {self.id} - Proposta {self.proposal.id}"
    
    class Meta:
        verbose_name = "Comentário de Proposta"
        verbose_name_plural = "Comentários de Propostas"
        ordering = ['-created_at']

class ProposalStatusChange(models.Model):
    """
    Modelo para rastrear histórico de mudanças de status da proposta.
    """
    proposal = models.ForeignKey(Proposal, on_delete=models.CASCADE, related_name='status_changes')
    previous_status = models.CharField(max_length=20, choices=Proposal.STATUS_CHOICES)
    new_status = models.CharField(max_length=20, choices=Proposal.STATUS_CHOICES)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='status_changes')
    reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Mudança de Status da Proposta {self.proposal.id}: {self.previous_status} → {self.new_status}"
    
    class Meta:
        verbose_name = "Mudança de Status da Proposta"
        verbose_name_plural = "Mudanças de Status de Propostas"
        ordering = ['-created_at'] 