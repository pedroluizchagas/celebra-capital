from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('check-cpf/<str:cpf>/', views.CheckCPFView.as_view(), name='check-cpf'),
    path('update-profile/', views.UpdateProfileView.as_view(), name='update-profile'),
    path('reset-password/', views.PasswordResetRequestView.as_view(), name='reset-password'),
    path('reset-password-confirm/', views.PasswordResetConfirmView.as_view(), name='reset-password-confirm'),
] 