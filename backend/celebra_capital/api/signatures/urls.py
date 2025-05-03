"""
URLs para API de assinaturas digitais
"""
from django.urls import path
from .views import SignatureRequestView, SignedDocumentView

app_name = 'signatures'

urlpatterns = [
    # Solicitação e status de assinaturas
    path('<int:proposal_id>/', SignatureRequestView.as_view(), name='signature-request'),
    
    # Status da assinatura (endpoint específico)
    path('<int:proposal_id>/status/', SignatureRequestView.as_view(), name='signature-status'),
    
    # Solicitar assinatura (endpoint específico para solicitação)
    path('<int:proposal_id>/request/', SignatureRequestView.as_view(), name='signature-request-only'),
    
    # Download de documento assinado
    path('<int:proposal_id>/download/', SignedDocumentView.as_view(), name='download-signed-document'),
] 