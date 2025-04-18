from django.urls import path
from . import views

app_name = 'core'

urlpatterns = [
    path('settings/', views.PublicSettingsView.as_view(), name='public-settings'),
    path('educational/', views.EducationalContentListView.as_view(), name='educational-list'),
    path('educational/<slug:slug>/', views.EducationalContentDetailView.as_view(), name='educational-detail'),
    path('notifications/', views.NotificationListView.as_view(), name='notification-list'),
    path('notifications/mark-read/<int:pk>/', views.MarkNotificationReadView.as_view(), name='mark-notification-read'),
    path('health/', views.HealthCheckView.as_view(), name='health-check'),
] 