from rest_framework import serializers
from .models import Document, OcrResult

class OcrResultSerializer(serializers.ModelSerializer):
    """
    Serializador para o modelo OcrResult
    """
    class Meta:
        model = OcrResult
        fields = ['id', 'ocr_complete', 'extracted_data', 'confidence_score', 'error_message', 'created_at', 'updated_at']

class DocumentSerializer(serializers.ModelSerializer):
    """
    Serializador para o modelo Document
    """
    ocr_result = OcrResultSerializer(read_only=True)
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)
    verification_status_display = serializers.CharField(source='get_verification_status_display', read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = [
            'id', 'user', 'proposal', 'document_type', 'document_type_display',
            'file', 'file_url', 'file_name', 'mime_type', 'file_size',
            'verification_status', 'verification_status_display',
            'verification_notes', 'is_deleted', 'created_at', 'updated_at',
            'ocr_result'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at', 'verification_status', 'verification_notes']

    def get_file_url(self, obj):
        """
        Obter a URL do arquivo
        """
        if obj.file:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.file.url)
        return None 