from django.urls import path
from .views import (
    DocumentUploadView, 
    DocumentListView, 
    DocumentDetailView, 
    OcrResultView,
    OcrStatusView,
    DocumentValidationView,
    SelfieUploadView,
    RequiredDocumentsView
)

app_name = 'documents'

urlpatterns = [
    # Listar e criar documentos
    path('', DocumentListView.as_view(), name='document-list'),
    
    # Upload de documentos
    path('upload/', DocumentUploadView.as_view(), name='document-upload'),
    
    # Upload de selfie
    path('selfie/', SelfieUploadView.as_view(), name='selfie-upload'),
    
    # Documentos necessários para proposta
    path('required/<int:proposal_id>/', RequiredDocumentsView.as_view(), name='required-documents'),
    
    # Detalhes, atualização e exclusão de documento
    path('<int:pk>/', DocumentDetailView.as_view(), name='document-detail'),
    
    # Resultados de OCR
    path('<int:document_id>/ocr/', OcrResultView.as_view(), name='ocr-result'),
    
    # Status de OCR
    path('<int:document_id>/ocr/status/', OcrStatusView.as_view(), name='ocr-status'),
    
    # Validação de documento
    path('<int:document_id>/validate/', DocumentValidationView.as_view(), name='document-validate'),
] 