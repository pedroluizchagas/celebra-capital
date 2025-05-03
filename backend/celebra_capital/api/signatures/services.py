import os
import logging
import requests
import json
from datetime import datetime
from django.conf import settings
from django.utils import timezone
from rest_framework import status

logger = logging.getLogger(__name__)

class ClickSignService:
    """
    Serviço para integração com a plataforma ClickSign de assinatura digital
    """
    
    def __init__(self):
        self.api_key = settings.CLICKSIGN_API_KEY
        self.base_url = settings.CLICKSIGN_BASE_URL
        self.headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    
    def _make_request(self, method, endpoint, data=None, files=None):
        """
        Método interno para realizar requisições à API da ClickSign
        """
        url = f"{self.base_url}{endpoint}"
        params = {'access_token': self.api_key}
        
        try:
            if method == 'GET':
                response = requests.get(url, params=params, headers=self.headers)
            elif method == 'POST':
                if files:
                    # Para upload de arquivos, não enviar headers JSON
                    response = requests.post(url, params=params, data=data, files=files)
                else:
                    response = requests.post(url, params=params, headers=self.headers, json=data)
            elif method == 'PUT':
                response = requests.put(url, params=params, headers=self.headers, json=data)
            elif method == 'DELETE':
                response = requests.delete(url, params=params, headers=self.headers)
            else:
                raise ValueError(f"Método HTTP não suportado: {method}")
            
            # Verificar se a resposta foi bem-sucedida
            response.raise_for_status()
            
            if response.content:
                return response.json()
            return None
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro na requisição à API da ClickSign: {str(e)}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Detalhes do erro: {e.response.text}")
            raise
    
    def upload_document(self, file_path, document_name, deadline=None):
        """
        Realiza o upload de um documento para a ClickSign
        
        Args:
            file_path: Caminho do arquivo a ser enviado
            document_name: Nome do documento
            deadline: Data limite para assinatura no formato YYYY-MM-DD (opcional)
        
        Returns:
            Dicionário com os dados do documento criado
        """
        try:
            with open(file_path, 'rb') as file:
                files = {'document[archive][original]': file}
                data = {'document[path]': document_name}
                
                if deadline:
                    data['document[deadline]'] = deadline
                
                response = self._make_request('POST', '/documents', data=data, files=files)
                
                if 'document' in response:
                    return response['document']
                return None
        
        except Exception as e:
            logger.error(f"Erro ao fazer upload do documento para ClickSign: {str(e)}")
            raise
    
    def add_signer(self, document_key, email, name, has_documentation=True, 
                   authentication_type='email', delivery_method='email'):
        """
        Adiciona um signatário ao documento
        
        Args:
            document_key: Chave do documento na ClickSign
            email: Email do signatário
            name: Nome completo do signatário
            has_documentation: Se o signatário possui documentação (CPF)
            authentication_type: Tipo de autenticação (email, sms, whatsapp)
            delivery_method: Método de entrega (email, sms, whatsapp)
        
        Returns:
            Dicionário com dados do signatário adicionado
        """
        try:
            data = {
                'signer': {
                    'email': email,
                    'phone_number': '',  # Opcional
                    'documentation': '',  # Preencher com CPF se necessário
                    'name': name,
                    'has_documentation': has_documentation,
                    'birthday': '',  # Opcional
                    'sign_as': 'party',  # Papel do signatário (party, witness, intervening)
                    'auths': [authentication_type],
                    'delivery': delivery_method
                }
            }
            
            response = self._make_request('POST', f'/documents/{document_key}/signers', data=data)
            
            if 'signer' in response:
                return response['signer']
            return None
        
        except Exception as e:
            logger.error(f"Erro ao adicionar signatário ao documento {document_key}: {str(e)}")
            raise
    
    def create_signature_list(self, document_key, signers_keys):
        """
        Cria uma lista de assinatura sequencial para o documento
        
        Args:
            document_key: Chave do documento
            signers_keys: Lista ordenada de chaves dos signatários
        
        Returns:
            True se sucesso, False caso contrário
        """
        try:
            data = {
                'list': {
                    'document_key': document_key,
                    'sequence_enabled': True,  # Define assinatura sequencial
                    'signers': signers_keys
                }
            }
            
            response = self._make_request('POST', '/lists', data=data)
            
            return 'list' in response
        
        except Exception as e:
            logger.error(f"Erro ao criar lista de assinatura para o documento {document_key}: {str(e)}")
            raise
    
    def request_signature(self, document_key, signer_key, message=None):
        """
        Solicita assinatura de um signatário específico
        
        Args:
            document_key: Chave do documento
            signer_key: Chave do signatário
            message: Mensagem personalizada (opcional)
        
        Returns:
            Resposta da API com dados da solicitação
        """
        try:
            data = {
                'request_signature': {
                    'message': message or 'Por favor, assine o documento.'
                }
            }
            
            response = self._make_request(
                'POST',
                f'/documents/{document_key}/signers/{signer_key}/request_signature',
                data=data
            )
            
            return response
        
        except Exception as e:
            logger.error(f"Erro ao solicitar assinatura para documento {document_key}: {str(e)}")
            raise
    
    def get_document_status(self, document_key):
        """
        Verifica o status atual de um documento
        
        Args:
            document_key: Chave do documento
        
        Returns:
            Dicionário com informações do documento
        """
        try:
            response = self._make_request('GET', f'/documents/{document_key}')
            
            if 'document' in response:
                return response['document']
            return None
        
        except Exception as e:
            logger.error(f"Erro ao obter status do documento {document_key}: {str(e)}")
            raise
    
    def download_signed_document(self, document_key):
        """
        Obtém a URL para download do documento assinado
        
        Args:
            document_key: Chave do documento
            
        Returns:
            URL para download do documento assinado
        """
        try:
            document_info = self.get_document_status(document_key)
            
            if document_info and document_info.get('status') == 'signed':
                # Obter URL de download
                download_link = document_info.get('download', {}).get('signed_file_url')
                return download_link
            
            return None
        
        except Exception as e:
            logger.error(f"Erro ao obter documento assinado {document_key}: {str(e)}")
            raise
    
    def cancel_document(self, document_key, reason=None):
        """
        Cancela um documento
        
        Args:
            document_key: Chave do documento
            reason: Motivo do cancelamento (opcional)
            
        Returns:
            True se sucesso, False caso contrário
        """
        try:
            data = {
                'document': {
                    'status': 'canceled'
                }
            }
            
            if reason:
                data['document']['comment'] = reason
            
            response = self._make_request('PATCH', f'/documents/{document_key}', data=data)
            
            if 'document' in response and response['document']['status'] == 'canceled':
                return True
            return False
        
        except Exception as e:
            logger.error(f"Erro ao cancelar documento {document_key}: {str(e)}")
            raise 