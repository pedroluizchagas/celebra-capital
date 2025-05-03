"""
Cliente para integração com a API Clicksign
"""
import os
import requests
import json
import structlog

logger = structlog.get_logger(__name__)

class ClicksignClient:
    """Cliente para integração com a API Clicksign"""
    
    def __init__(self):
        """Inicializa o cliente com as credenciais da API"""
        self.BASE_URL = os.environ.get('CLICKSIGN_BASE_URL', 'https://app.clicksign.com/api/v1')
        self.api_key = os.environ.get('CLICKSIGN_API_KEY')
        
        if not self.api_key:
            raise ValueError("API key do Clicksign não configurada no ambiente")
    
    def _make_request(self, method, endpoint, params=None, data=None, files=None, json_data=None):
        """
        Método auxiliar para realizar requisições à API
        
        Args:
            method: Método HTTP (GET, POST, etc.)
            endpoint: Endpoint da API
            params: Parâmetros da query string
            data: Dados do formulário
            files: Arquivos para upload
            json_data: Dados JSON
            
        Returns:
            dict: Resposta da API
        """
        url = f"{self.BASE_URL}/{endpoint}"
        
        # Adicionar a access_token como parâmetro em todas as requisições
        if params is None:
            params = {}
        
        params['access_token'] = self.api_key
        
        try:
            response = requests.request(
                method=method,
                url=url,
                params=params,
                data=data,
                files=files,
                json=json_data,
                headers={'Accept': 'application/json'}
            )
            
            # Verificar se a requisição foi bem-sucedida
            response.raise_for_status()
            
            return response.json()
        
        except requests.exceptions.RequestException as e:
            logger.error(
                "Erro na requisição à API Clicksign",
                error=str(e),
                endpoint=endpoint,
                status_code=getattr(e.response, 'status_code', None),
                response=getattr(e.response, 'text', None)
            )
            raise
    
    def upload_document(self, file_path, document_name, deadline=None):
        """
        Faz upload de um documento para o Clicksign
        
        Args:
            file_path: Caminho do arquivo local
            document_name: Nome do documento
            deadline: Data limite para assinatura (formato ISO)
            
        Returns:
            dict: Informações do documento enviado
        """
        endpoint = "documents"
        
        with open(file_path, 'rb') as f:
            files = {'document[archive]': (document_name, f)}
            data = {'document[path]': document_name}
            
            if deadline:
                data['document[deadline]'] = deadline
                
            return self._make_request("POST", endpoint, data=data, files=files)
    
    def upload_document_base64(self, file_base64, document_name, mime_type='application/pdf', deadline=None):
        """
        Faz upload de um documento em base64 para o Clicksign
        
        Args:
            file_base64: Arquivo em base64
            document_name: Nome do documento
            mime_type: Tipo MIME do arquivo
            deadline: Data limite para assinatura (formato ISO)
            
        Returns:
            dict: Informações do documento enviado
        """
        endpoint = "documents"
        
        json_data = {
            'document': {
                'path': document_name,
                'content_base64': file_base64,
                'mime_type': mime_type
            }
        }
        
        if deadline:
            json_data['document']['deadline'] = deadline
        
        return self._make_request("POST", endpoint, json_data=json_data)
    
    def list_documents(self):
        """
        Lista documentos no Clicksign
        
        Returns:
            dict: Lista de documentos
        """
        endpoint = "documents"
        return self._make_request("GET", endpoint)
    
    def get_document(self, document_key):
        """
        Obtém informações de um documento
        
        Args:
            document_key: Chave do documento
            
        Returns:
            dict: Informações do documento
        """
        endpoint = f"documents/{document_key}"
        return self._make_request("GET", endpoint)
    
    def create_signer(self, email, name, documentation=None, phone_number=None, birthday=None, has_documentation=True):
        """
        Cria ou obtém um signatário
        
        Args:
            email: Email do signatário
            name: Nome do signatário
            documentation: CPF ou CNPJ do signatário
            phone_number: Número de telefone do signatário
            birthday: Data de nascimento (formato ISO)
            has_documentation: Se o signatário possui CPF/CNPJ
            
        Returns:
            dict: Informações do signatário
        """
        endpoint = "signers"
        
        json_data = {
            'signer': {
                'email': email,
                'name': name,
                'documentation': documentation,
                'has_documentation': has_documentation
            }
        }
        
        if phone_number:
            json_data['signer']['phone_number'] = phone_number
            
        if birthday:
            json_data['signer']['birthday'] = birthday
        
        return self._make_request("POST", endpoint, json_data=json_data)
    
    def add_signer_to_document(self, document_key, signer_key, sign_as='sign', message=None):
        """
        Adiciona um signatário a um documento
        
        Args:
            document_key: Chave do documento
            signer_key: Chave do signatário
            sign_as: Papel do signatário (sign, witness, approver, etc.)
            message: Mensagem personalizada para o signatário
            
        Returns:
            dict: Informações da solicitação de assinatura
        """
        endpoint = "lists"
        
        json_data = {
            'list': {
                'document_key': document_key,
                'signer_key': signer_key,
                'sign_as': sign_as
            }
        }
        
        if message:
            json_data['list']['message'] = message
        
        return self._make_request("POST", endpoint, json_data=json_data)
    
    def send_document_to_sign(self, document_key, message=None):
        """
        Envia um documento para assinatura
        
        Args:
            document_key: Chave do documento
            message: Mensagem a ser enviada aos signatários
            
        Returns:
            dict: Informações do envio
        """
        endpoint = f"documents/{document_key}/finish"
        
        json_data = {}
        if message:
            json_data['message'] = message
        
        return self._make_request("POST", endpoint, json_data=json_data)
    
    def get_document_status(self, document_key):
        """
        Verifica o status de um documento
        
        Args:
            document_key: Chave do documento
            
        Returns:
            dict: Status do documento e metadados
        """
        document_info = self.get_document(document_key)
        
        # Mapear status do Clicksign para formato compatível com a aplicação
        status_map = {
            'draft': 'pending',
            'processing': 'pending',
            'waiting': 'pending',
            'canceled': 'failed',
            'running': 'pending',
            'completed': 'completed',
        }
        
        status = document_info.get('document', {}).get('status', 'unknown')
        mapped_status = status_map.get(status, 'pending')
        
        return {
            'status': mapped_status,
            'message': self._get_status_message(status),
            'clicksign_status': status,
            'metadata': document_info
        }
    
    def _get_status_message(self, status):
        """
        Retorna mensagem amigável para o status
        
        Args:
            status: Status do documento no Clicksign
            
        Returns:
            str: Mensagem traduzida
        """
        status_messages = {
            'draft': 'Documento em rascunho',
            'processing': 'Documento sendo processado',
            'waiting': 'Aguardando assinaturas',
            'canceled': 'Documento cancelado',
            'running': 'Processo de assinatura em andamento',
            'completed': 'Documento completamente assinado',
            'unknown': 'Status desconhecido',
        }
        
        return status_messages.get(status, 'Status desconhecido')
    
    def download_document(self, document_key):
        """
        Faz download de um documento
        
        Args:
            document_key: Chave do documento
            
        Returns:
            bytes: Conteúdo do documento
        """
        endpoint = f"documents/{document_key}/download"
        
        url = f"{self.BASE_URL}/{endpoint}"
        params = {'access_token': self.api_key}
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            return response.content
        except requests.exceptions.RequestException as e:
            logger.error(
                "Erro ao fazer download do documento",
                error=str(e),
                document_key=document_key
            )
            raise 