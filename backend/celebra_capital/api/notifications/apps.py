from django.apps import AppConfig


class NotificationsConfig(AppConfig):
    name = 'celebra_capital.api.notifications'
    verbose_name = 'Sistema de Notificações'

    def ready(self):
        import celebra_capital.api.notifications.signals 