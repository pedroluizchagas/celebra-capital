from django.db.models.signals import post_save
from django.dispatch import receiver

# Este arquivo será responsável por conter todos os sinais do sistema
# Aqui podemos definir receivers para eventos como:
# - Criação de uma nova análise de crédito
# - Aprovação ou reprovação de uma análise
# - Mudança de status de um processo
# - etc

# Exemplo de implementação:
# @receiver(post_save, sender=SomeModel)
# def create_notification_on_event(sender, instance, created, **kwargs):
#     if created:
#         Notification.objects.create(
#             recipient=instance.owner,
#             content=f"Novo item criado: {instance.name}",
#             notification_type="create",
#             related_object_id=instance.id,
#             related_content_type=ContentType.objects.get_for_model(instance)
#         ) 