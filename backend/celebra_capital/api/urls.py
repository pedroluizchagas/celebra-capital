from django.urls import path, include

urlpatterns = [
    path('users/', include('celebra_capital.api.users.urls', namespace='users')),
    path('proposals/', include('celebra_capital.api.proposals.urls', namespace='proposals')),
    path('documents/', include('celebra_capital.api.documents.urls', namespace='documents')),
    path('notifications/', include('celebra_capital.api.notifications.urls', namespace='notifications')),
    path('core/', include('celebra_capital.api.core.urls')),
    path('health/', include('celebra_capital.api.health.urls')),
] 