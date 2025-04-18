from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    """
    Modelo para armazenar informações adicionais dos usuários
    """
    USER_TYPE_CHOICES = (
        ('public_server', 'Servidor Público'),
        ('retiree', 'Aposentado/Pensionista'),
        ('police_military', 'Policial/Bombeiro/Militar'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    cpf = models.CharField(max_length=14, unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
    monthly_income = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    org_name = models.CharField(max_length=100, blank=True, null=True, help_text="Nome do órgão ou instituição")
    registration_number = models.CharField(max_length=30, blank=True, null=True, help_text="Matrícula funcional")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.cpf}"
    
    class Meta:
        verbose_name = "Perfil de Usuário"
        verbose_name_plural = "Perfis de Usuários"
        
class AuditLog(models.Model):
    """
    Modelo para registrar ações no sistema para compliance e segurança
    """
    ACTION_TYPES = (
        ('login', 'Login'),
        ('register', 'Cadastro'),
        ('update', 'Atualização de dados'),
        ('doc_upload', 'Upload de documento'),
        ('signature', 'Assinatura'),
        ('simulation', 'Simulação'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    cpf = models.CharField(max_length=14, blank=True, null=True)
    action = models.CharField(max_length=20, choices=ACTION_TYPES)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True, null=True)
    details = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.action} - {self.cpf or self.user} - {self.created_at}"
    
    class Meta:
        verbose_name = "Log de Auditoria"
        verbose_name_plural = "Logs de Auditoria" 