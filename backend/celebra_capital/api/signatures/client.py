"""
Cliente da API D4Sign para integração de assinatura digital
"""
import os
import json
import requests
import base64
import logging
import structlog
from datetime import datetime
from requests_toolbelt.multipart.encoder import MultipartEncoder

logger = structlog.get_logger(__name__)

class D4SignClient:
    """Cliente para integração com a API D4Sign"""
    
    BASE_URL = "https://sandbox.d4sign.com.br/api/v1"  # Sandbox, substituir por produção quando necessário
    
    def __init__(self, api_key=None, cryptkey=None):
        """
        Inicializa o cliente D4Sign
        
        Args:
            api_key: Chave de API D4Sign (se não fornecida, usa variável de ambiente D4SIGN_API_KEY)
            cryptkey: Chave de criptografia D4Sign (se não fornecida, usa variável de ambiente D4SIGN_CRYPTKEY)
        """
        self.api_key = api_key or os.environ.get('D4SIGN_API_KEY')
        self.cryptkey = cryptkey or os.environ.get('D4SIGN_CRYPTKEY')
        
        if not self.api_key:
            raise ValueError("D4Sign API Key não configurada")
        
        if not self.cryptkey:
            raise ValueError("D4Sign Crypt Key não configurada")
    
    def _make_request(self, method, endpoint, params=None, data=None, files=None, json_data=None):
        """
        Método auxiliar para realizar requisições à API
        """
        url = f"{self.BASE_URL}/{endpoint}"
        
        # Parâmetros básicos da API
        if params is None:
            params = {}
        
        params['tokenAPI'] = self.api_key
        params['cryptKey'] = self.cryptkey
        
        try:
            response = requests.request(
                method=method,
                url=url,
                params=params,
                data=data,
                files=files,
                json=json_data
            )
            
            # Verificar se a requisição foi bem-sucedida
            response.raise_for_status()
            
            return response.json()
        
        except requests.exceptions.RequestException as e:
            logger.error(
                "Erro na requisição à API D4Sign",
                error=str(e),
                endpoint=endpoint,
                status_code=getattr(e.response, 'status_code', None),
                response=getattr(e.response, 'text', None)
            )
            raise
    
    def create_safe(self, name):
        """
        Cria um cofre para armazenar documentos
        """
        endpoint = "safes"
        data = {"name": name}
        
        return self._make_request("POST", endpoint, json_data=data)
    
    def list_safes(self):
        """
        Lista os cofres disponíveis
        """
        endpoint = "safes"
        return self._make_request("GET", endpoint)
    
    def upload_document(self, safe_id, file_path, document_name=None):
        """
        Faz upload de um documento para um cofre
        """
        endpoint = f"documents/{safe_id}/upload"
        
        # Se o nome do documento não for fornecido, usa o nome do arquivo
        if not document_name:
            document_name = os.path.basename(file_path)
        
        # Preparar o arquivo para upload
        with open(file_path, 'rb') as file:
            file_content = file.read()
            
            encoder = MultipartEncoder(
                fields={
                    'name': document_name,
                    'file': (document_name, file_content, 'application/pdf')
                }
            )
            
            headers = {
                'Content-Type': encoder.content_type
            }
            
            url = f"{self.BASE_URL}/{endpoint}"
            params = {
                'tokenAPI': self.api_key,
                'cryptKey': self.cryptkey
            }
            
            try:
                response = requests.post(
                    url=url,
                    params=params,
                    data=encoder,
                    headers=headers
                )
                
                response.raise_for_status()
                return response.json()
                
            except requests.exceptions.RequestException as e:
                logger.error(
                    "Erro no upload de documento D4Sign",
                    error=str(e),
                    endpoint=endpoint,
                    status_code=getattr(e.response, 'status_code', None),
                    response=getattr(e.response, 'text', None)
                )
                raise
    
    def upload_document_base64(self, safe_id, file_base64, document_name, mime_type='application/pdf'):
        """
        Faz upload de um documento em base64 para um cofre
        """
        endpoint = f"documents/{safe_id}/uploadbinary"
        
        json_data = {
            'name': document_name,
            'base64_binary_file': file_base64,
            'mime_type': mime_type
        }
        
        return self._make_request("POST", endpoint, json_data=json_data)
    
    def list_documents(self, safe_id):
        """
        Lista documentos em um cofre
        """
        endpoint = f"documents/{safe_id}"
        return self._make_request("GET", endpoint)
    
    def get_document(self, document_uuid):
        """
        Obtém informações de um documento
        """
        endpoint = f"documents/{document_uuid}"
        return self._make_request("GET", endpoint)
    
    def add_signer(self, document_uuid, email, name, documentation=None, action='sign', phone_number=None):
        """
        Adiciona um signatário a um documento
        """
        endpoint = f"documents/{document_uuid}/createlist"
        
        json_data = {
            'email': email,
            'act': action,  # 'sign', 'approve', etc.
            'foreign': '0',  # 0 para brasileiro, 1 para estrangeiro
            'name': name,
            'documentation': documentation,
            'phone_number': phone_number
        }
        
        # Filtrar campos None
        json_data = {k: v for k, v in json_data.items() if v is not None}
        
        return self._make_request("POST", endpoint, json_data=json_data)
    
    def send_document_to_sign(self, document_uuid, message=None, workflow=0, skip_email=False):
        """
        Envia um documento para assinatura
        
        Args:
            document_uuid: UUID do documento
            message: Mensagem a ser enviada aos signatários
            workflow: 0 para assinatura simultânea, 1 para sequencial
            skip_email: True para não enviar email
        """
        endpoint = f"documents/{document_uuid}/sendtosign"
        
        json_data = {
            'message': message or 'Por favor, assine o documento',
            'workflow': workflow,
            'skip_email': '1' if skip_email else '0'
        }
        
        return self._make_request("POST", endpoint, json_data=json_data)
    
    def cancel_document(self, document_uuid):
        """
        Cancela um documento
        """
        endpoint = f"documents/{document_uuid}/cancel"
        return self._make_request("POST", endpoint)
    
    def get_document_status(self, document_uuid):
        """
        Verifica o status de um documento
        """
        document_info = self.get_document(document_uuid)
        
        # Verificar se o documento foi processado corretamente
        if 'status' in document_info and document_info['status'] == '1':
            history = document_info.get('history', [])
            
            # Status 4 significa assinado por todos
            if document_info.get('statusId') == '4':
                return {
                    'status': 'completed',
                    'message': 'Documento assinado por todos',
                    'signers': history
                }
            
            # Status 3 significa processo de assinatura em andamento
            elif document_info.get('statusId') == '3':
                # Contar signatários que já assinaram
                signed_count = sum(1 for h in history if h.get('status') == '1')
                total_signers = len(history)
                
                return {
                    'status': 'in_progress',
                    'message': f'Assinado por {signed_count} de {total_signers} signatários',
                    'signed_count': signed_count,
                    'total_signers': total_signers,
                    'signers': history
                }
            
            # Outros status
            else:
                status_map = {
                    '1': 'processing',    # Processando
                    '2': 'waiting',       # Aguardando envio
                    '5': 'canceled',      # Cancelado
                    '6': 'expired'        # Expirado
                }
                
                status_key = document_info.get('statusId', '0')
                status_text = status_map.get(status_key, 'unknown')
                
                return {
                    'status': status_text,
                    'message': f'Status do documento: {status_text}',
                    'signers': history
                }
        
        return {
            'status': 'error',
            'message': 'Não foi possível obter o status do documento',
            'signers': []
        }
    
    def get_signed_file(self, document_uuid):
        """
        Obtém o arquivo assinado
        """
        endpoint = f"documents/{document_uuid}/download"
        
        # Esta chamada retorna o arquivo binário, não JSON
        url = f"{self.BASE_URL}/{endpoint}"
        params = {
            'tokenAPI': self.api_key,
            'cryptKey': self.cryptkey
        }
        
        try:
            response = requests.get(url=url, params=params)
            response.raise_for_status()
            
            return {
                'content': response.content,
                'filename': f"documento_assinado_{document_uuid}.pdf"
            }
            
        except requests.exceptions.RequestException as e:
            logger.error(
                "Erro ao obter arquivo assinado",
                error=str(e),
                endpoint=endpoint,
                status_code=getattr(e.response, 'status_code', None)
            )
            raise 