from django.db import models

class SystemSetting(models.Model):
    """
    Configurações gerais do sistema
    """
    key = models.CharField(max_length=50, unique=True)
    value = models.TextField(blank=True, null=True)
    description = models.CharField(max_length=255, blank=True, null=True)
    is_public = models.BooleanField(default=False, help_text="Se verdadeiro, pode ser acessado pela API pública")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.key
    
    class Meta:
        verbose_name = "Configuração do Sistema"
        verbose_name_plural = "Configurações do Sistema"

class EducationalContent(models.Model):
    """
    Conteúdo educativo para seção de educação financeira
    """
    STATUS_CHOICES = (
        ('draft', 'Rascunho'),
        ('published', 'Publicado'),
        ('archived', 'Arquivado'),
    )
    
    title = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    content = models.TextField()
    summary = models.CharField(max_length=255)
    image_url = models.URLField(blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    order = models.PositiveIntegerField(default=0, help_text="Ordem de exibição")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        verbose_name = "Conteúdo Educativo"
        verbose_name_plural = "Conteúdos Educativos"
        ordering = ['order', 'title']
        
class Notification(models.Model):
    """
    Notificações para os usuários
    """
    TYPE_CHOICES = (
        ('system', 'Sistema'),
        ('proposal', 'Proposta'),
        ('document', 'Documento'),
        ('educational', 'Educacional'),
    )
    
    user_id = models.IntegerField()
    title = models.CharField(max_length=100)
    message = models.TextField()
    notification_type = models.CharField(max_length=15, choices=TYPE_CHOICES)
    is_read = models.BooleanField(default=False)
    action_url = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} - {self.user_id}"
    
    class Meta:
        verbose_name = "Notificação"
        verbose_name_plural = "Notificações"
        ordering = ['-created_at'] 