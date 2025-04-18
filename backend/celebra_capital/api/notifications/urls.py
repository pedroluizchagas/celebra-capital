from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import NotificationViewSet

app_name = 'notifications'

router = DefaultRouter()
router.register(r'viewset', NotificationViewSet, basename='viewset')

urlpatterns = [
    # Listagem e gerenciamento de notificações
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('<int:pk>/', views.NotificationDetailView.as_view(), name='notification-detail'),
    path('<int:notification_id>/read/', views.mark_notification_read, name='mark-notification-read'),
    path('read-all/', views.mark_all_read, name='mark-all-read'),
    path('unread-count/', views.get_unread_count, name='unread-count'),
    
    # Configurações de notificação
    path('settings/', views.UserNotificationSettingsView.as_view(), name='notification-settings'),
    path('settings/push-subscription/', views.save_push_subscription, name='save-push-subscription'),
    
    # Teste
    path('send-test/', views.send_test_notification, name='send-test-notification'),
    
    # Novas rotas para o ViewSet
    path('', include(router.urls)),
] 