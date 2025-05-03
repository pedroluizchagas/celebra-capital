from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .models import UserProfile, AuditLog
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from rest_framework.exceptions import NotFound, ValidationError
import json

# Implementações de views serão adicionadas posteriormente

class UserRegistrationView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        # Implementação futura
        return Response({"detail": "Endpoint em desenvolvimento"}, status=status.HTTP_501_NOT_IMPLEMENTED)

class UserProfileView(APIView):
    def get(self, request):
        # Implementação futura
        return Response({"detail": "Endpoint em desenvolvimento"}, status=status.HTTP_501_NOT_IMPLEMENTED)

class PasswordResetRequestView(APIView):
    """
    View para solicitar redefinição de senha. Envia um e-mail com link
    para redefinição caso o usuário exista.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response(
                {"detail": "É necessário fornecer um e-mail."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Não informamos ao cliente que o e-mail não existe por segurança
            return Response(
                {"detail": "Se o e-mail existir em nossa base, enviaremos um link para redefinição de senha."},
                status=status.HTTP_200_OK
            )
        
        # Gerar token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Construir link de redefinição
        reset_url = f"{settings.FRONTEND_URL}/redefinir-senha/{uid}/{token}/"
        
        # Preparar e-mail
        subject = "Redefinição de senha - Celebra Capital"
        message = render_to_string('emails/reset_password.html', {
            'user': user,
            'reset_url': reset_url,
            'valid_hours': 24
        })
        
        # Enviar e-mail
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                html_message=message,
                fail_silently=False
            )
            
            # Registrar no log de auditoria
            AuditLog.objects.create(
                user=user,
                cpf=getattr(user.profile, 'cpf', None),
                action='password_reset_request',
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                details=json.dumps({"email": email})
            )
            
            return Response(
                {"detail": "Se o e-mail existir em nossa base, enviaremos um link para redefinição de senha."},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"detail": "Ocorreu um erro ao enviar o e-mail. Por favor, tente novamente mais tarde."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class PasswordResetConfirmView(APIView):
    """
    View para confirmar e processar a redefinição de senha.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        password = request.data.get('password')
        
        if not uid or not token or not password:
            return Response(
                {"detail": "Todos os campos são obrigatórios."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar tamanho mínimo da senha
        if len(password) < 8:
            return Response(
                {"detail": "A senha deve ter pelo menos 8 caracteres."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            # Decodificar o UID para obter o ID do usuário
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
            
            # Verificar se o token é válido
            if not default_token_generator.check_token(user, token):
                return Response(
                    {"detail": "O link de redefinição de senha é inválido ou expirou."},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # Definir nova senha
            user.set_password(password)
            user.save()
            
            # Registrar no log de auditoria
            AuditLog.objects.create(
                user=user,
                cpf=getattr(user.profile, 'cpf', None),
                action='password_reset_confirm',
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                details=json.dumps({"success": True})
            )
            
            return Response(
                {"detail": "Sua senha foi redefinida com sucesso."},
                status=status.HTTP_200_OK
            )
            
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {"detail": "O link de redefinição de senha é inválido ou expirou."},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class CheckCPFView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, cpf):
        # Implementação futura
        return Response({"detail": "Endpoint em desenvolvimento"}, status=status.HTTP_501_NOT_IMPLEMENTED)

class UpdateProfileView(APIView):
    def put(self, request):
        # Implementação futura
        return Response({"detail": "Endpoint em desenvolvimento"}, status=status.HTTP_501_NOT_IMPLEMENTED) 