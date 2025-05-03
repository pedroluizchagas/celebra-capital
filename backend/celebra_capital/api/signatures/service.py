"""
Serviço para gerenciar assinaturas digitais
"""
import os
import base64
import uuid
import tempfile
import structlog
from datetime import datetime
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from io import BytesIO
from django.conf import settings
from django.utils import timezone
from celebra_capital.api.proposals.models import Proposal, Signature
from celebra_capital.api.documents.models import Document
from .client import D4SignClient
from .clicksign_client import ClicksignClient

logger = structlog.get_logger(__name__)

class SignatureService:
    """Serviço para gerenciar assinaturas digitais"""
    
    def __init__(self, provider=None):
        """
        Inicializa o serviço de assinatura
        
        Args:
            provider: Provedor de assinatura ('clicksign' ou 'd4sign')
        """
        self.provider = provider or os.environ.get('SIGNATURE_PROVIDER', 'clicksign').lower()
        
        # Inicializar o cliente adequado baseado no provedor configurado
        if self.provider == 'clicksign':
            self.client = self._init_clicksign()
        else:
            self.client = self._init_d4sign()
            
        logger.info(f"Serviço de assinatura inicializado com provedor: {self.provider}")
    
    def _init_clicksign(self):
        """Inicializa o cliente Clicksign"""
        return ClicksignClient()
    
    def _init_d4sign(self):
        """Inicializa o cliente D4Sign"""
        client = D4SignClient()
        self.safe_id = os.environ.get('D4SIGN_SAFE_ID')
        
        if not self.safe_id:
            # Se o safe_id não estiver configurado, busca o primeiro ou cria um
            self._setup_safe(client)
            
        return client
    
    def _setup_safe(self, client):
        """Configura o cofre padrão do D4Sign se não existir"""
        try:
            safes = client.list_safes()
            
            if safes and 'safes' in safes and len(safes['safes']) > 0:
                self.safe_id = safes['safes'][0]['uuid_safe']
                logger.info("Cofre configurado automaticamente", safe_id=self.safe_id)
            else:
                # Criar um novo cofre
                result = client.create_safe("Celebra Capital - Documentos")
                if result and 'uuid' in result:
                    self.safe_id = result['uuid']
                    logger.info("Novo cofre criado", safe_id=self.safe_id)
                else:
                    raise ValueError("Falha ao criar cofre na D4Sign")
        
        except Exception as e:
            logger.error("Erro ao configurar cofre D4Sign", error=str(e))
            raise
    
    def _create_contract_pdf(self, proposal, signature_image_base64=None):
        """
        Cria um PDF de contrato para a proposta
        
        Args:
            proposal: Objeto da proposta
            signature_image_base64: Imagem da assinatura em base64 (opcional)
            
        Returns:
            bytes: Conteúdo do PDF
        """
        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter
        
        # Adicionar cabeçalho
        c.setFont("Helvetica-Bold", 14)
        c.drawString(30, height - 40, "CONTRATO DE EMPRÉSTIMO")
        c.setFont("Helvetica", 10)
        c.drawString(30, height - 60, "Celebra Capital")
        c.drawString(30, height - 80, f"Proposta #{proposal.id}")
        c.drawString(30, height - 100, f"Data: {datetime.now().strftime('%d/%m/%Y')}")
        
        # Adicionar informações do cliente
        c.setFont("Helvetica-Bold", 12)
        c.drawString(30, height - 140, "INFORMAÇÕES DO CLIENTE")
        c.setFont("Helvetica", 10)
        c.drawString(30, height - 160, f"Nome: {proposal.user.get_full_name() or proposal.user.username}")
        c.drawString(30, height - 180, f"Email: {proposal.user.email}")
        
        # Adicionar linha divisória
        c.line(30, height - 200, width - 30, height - 200)
        
        # Adicionar informações do empréstimo
        c.setFont("Helvetica-Bold", 12)
        c.drawString(30, height - 230, "DETALHES DO EMPRÉSTIMO")
        c.setFont("Helvetica", 10)
        c.drawString(30, height - 250, f"Valor: R$ {proposal.credit_value:.2f}")
        c.drawString(30, height - 270, f"Tipo: {proposal.credit_type}")
        
        # Adicionar termos e condições
        c.setFont("Helvetica-Bold", 12)
        c.drawString(30, height - 320, "TERMOS E CONDIÇÕES")
        c.setFont("Helvetica", 8)
        terms = [
            "1. Este contrato é regulado pelas leis da República Federativa do Brasil.",
            "2. O valor do empréstimo será disponibilizado após a aprovação de crédito e assinatura deste contrato.",
            "3. A Celebra Capital reserva-se o direito de alterar as condições do empréstimo conforme análise de crédito.",
            "4. O cliente declara estar ciente de todas as condições do empréstimo, incluindo taxas e prazos.",
            "5. Este contrato é válido a partir da data de assinatura."
        ]
        
        y_position = height - 340
        for term in terms:
            c.drawString(30, y_position, term)
            y_position -= 20
        
        # Adicionar campo para assinatura
        c.setFont("Helvetica-Bold", 12)
        c.drawString(30, 100, "ASSINATURA")
        c.line(30, 80, 300, 80)
        c.setFont("Helvetica", 8)
        c.drawString(30, 70, f"{proposal.user.get_full_name() or proposal.user.username}")
        c.drawString(30, 60, f"Data: {datetime.now().strftime('%d/%m/%Y')}")
        
        # Se houver imagem de assinatura, adicioná-la
        if signature_image_base64:
            try:
                signature_image = base64.b64decode(signature_image_base64)
                img_temp = BytesIO(signature_image)
                c.drawImage(img_temp, 30, 90, width=250, height=70)
            except Exception as e:
                logger.error("Erro ao adicionar imagem de assinatura", error=str(e))
        
        # Finalizar PDF
        c.save()
        
        # Obter o conteúdo do buffer
        pdf_content = buffer.getvalue()
        buffer.close()
        
        return pdf_content
    
    def create_signature_request(self, proposal_id, signature_image_base64=None):
        """
        Cria uma solicitação de assinatura digital para uma proposta
        
        Args:
            proposal_id: ID da proposta
            signature_image_base64: Imagem da assinatura em base64 (opcional)
            
        Returns:
            dict: Informações da assinatura criada
        """
        try:
            # Buscar proposta
            proposal = Proposal.objects.select_related('user').get(id=proposal_id)
            
            # Verificar se já existe assinatura
            signature, created = Signature.objects.get_or_create(
                proposal=proposal,
                defaults={
                    'signature_date': timezone.now() if signature_image_base64 else None,
                    'is_signed': False,
                    'provider': self.provider  # Armazenar o provedor utilizado
                }
            )
            
            # Se a assinatura já existir e estiver com ID do documento, retornar as informações existentes
            if not created and signature.signature_id:
                status = self.get_document_status(signature.signature_id)
                
                if status['status'] == 'completed':
                    signature.is_signed = True
                    signature.save(update_fields=['is_signed'])
                
                return {
                    'proposal_id': proposal_id,
                    'signature_id': signature.signature_id,
                    'signature_url': signature.signature_url,
                    'status': status['status'],
                    'message': status['message'],
                    'provider': signature.provider
                }
            
            # Criar PDF do contrato
            contract_pdf = self._create_contract_pdf(proposal, signature_image_base64)
            
            # Nome do documento
            document_name = f"Contrato_{proposal.id}_{uuid.uuid4().hex[:8]}.pdf"
            
            # Salvar arquivo temporário
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp:
                temp.write(contract_pdf)
                temp_path = temp.name
            
            try:
                # Processar o upload de acordo com o provedor
                if self.provider == 'clicksign':
                    return self._process_clicksign_signature(temp_path, document_name, proposal, signature, signature_image_base64)
                else:
                    return self._process_d4sign_signature(temp_path, document_name, proposal, signature, signature_image_base64)
            finally:
                # Limpar arquivo temporário
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
                
        except Exception as e:
            logger.error(
                "Erro ao criar solicitação de assinatura",
                error=str(e),
                proposal_id=proposal_id,
                provider=self.provider
            )
            raise
    
    def _process_clicksign_signature(self, file_path, document_name, proposal, signature, signature_image_base64=None):
        """
        Processa a assinatura usando o Clicksign
        
        Args:
            file_path: Caminho do arquivo PDF
            document_name: Nome do documento
            proposal: Objeto da proposta
            signature: Objeto de assinatura
            signature_image_base64: Imagem da assinatura em base64 (opcional)
            
        Returns:
            dict: Informações da assinatura
        """
        # Fazer upload do documento
        result = self.client.upload_document(
            file_path=file_path,
            document_name=document_name
        )
        
        if not result or 'document' not in result or 'key' not in result['document']:
            raise ValueError("Falha ao fazer upload do documento para Clicksign")
        
        document_key = result['document']['key']
        
        # Dados do usuário
        user = proposal.user
        email = user.email
        name = user.get_full_name() or user.username
        
        # Adicionar CPF se disponível no perfil
        documentation = None
        try:
            if hasattr(user, 'profile') and hasattr(user.profile, 'cpf'):
                documentation = user.profile.cpf
        except:
            pass
        
        # Criar ou obter signatário
        signer_result = self.client.create_signer(
            email=email,
            name=name,
            documentation=documentation
        )
        
        if not signer_result or 'signer' not in signer_result or 'key' not in signer_result['signer']:
            raise ValueError("Falha ao criar signatário no Clicksign")
        
        signer_key = signer_result['signer']['key']
        
        # Adicionar signatário ao documento
        list_result = self.client.add_signer_to_document(
            document_key=document_key,
            signer_key=signer_key,
            sign_as='sign',
            message=f"Por favor, assine seu contrato de empréstimo da Celebra Capital (Proposta #{proposal.id})"
        )
        
        # Enviar documento para assinatura
        self.client.send_document_to_sign(
            document_key=document_key,
            message=f"Por favor, assine seu contrato de empréstimo da Celebra Capital (Proposta #{proposal.id})"
        )
        
        # Obter URL de assinatura
        signature_url = None
        if 'list' in list_result and 'url' in list_result['list']:
            signature_url = list_result['list']['url']
        
        # Atualizar objeto de assinatura
        signature.signature_id = document_key
        signature.signature_url = signature_url
        signature.provider = 'clicksign'
        
        if signature_image_base64:
            signature.is_signed = True
            signature.signature_date = timezone.now()
        
        # Salvar endereço IP se disponível
        if hasattr(proposal, 'ip_address') and proposal.ip_address:
            signature.ip_address = proposal.ip_address
        
        signature.save()
        
        # Retornar informações da assinatura
        status = self.get_document_status(document_key)
        
        return {
            'proposal_id': proposal.id,
            'signature_id': document_key,
            'signature_url': signature_url,
            'status': status['status'],
            'message': status['message'],
            'provider': 'clicksign'
        }
    
    def _process_d4sign_signature(self, file_path, document_name, proposal, signature, signature_image_base64=None):
        """
        Processa a assinatura usando o D4Sign
        
        Args:
            file_path: Caminho do arquivo PDF
            document_name: Nome do documento
            proposal: Objeto da proposta
            signature: Objeto de assinatura
            signature_image_base64: Imagem da assinatura em base64 (opcional)
            
        Returns:
            dict: Informações da assinatura
        """
        # Fazer upload do documento para a D4Sign
        result = self.client.upload_document(self.safe_id, file_path, document_name)
        
        if not result or 'uuid' not in result:
            raise ValueError("Falha ao fazer upload do documento para D4Sign")
        
        document_uuid = result['uuid']
        
        # Adicionar signatário (o próprio usuário)
        user = proposal.user
        email = user.email
        name = user.get_full_name() or user.username
        
        # Adicionar CPF se disponível no perfil
        documentation = None
        try:
            if hasattr(user, 'profile') and hasattr(user.profile, 'cpf'):
                documentation = user.profile.cpf
        except:
            pass
        
        # Adicionar signatário
        self.client.add_signer(
            document_uuid=document_uuid,
            email=email,
            name=name,
            documentation=documentation
        )
        
        # Enviar documento para assinatura
        send_result = self.client.send_document_to_sign(
            document_uuid=document_uuid,
            message=f"Por favor, assine seu contrato de empréstimo da Celebra Capital (Proposta #{proposal.id})"
        )
        
        # Obter URL de assinatura
        signature_url = None
        if 'message' in send_result and isinstance(send_result['message'], str) and 'url' in send_result['message']:
            # A resposta pode conter uma URL no formato "URL de assinatura: https://..."
            url_part = send_result['message'].split('URL de assinatura:')
            if len(url_part) > 1:
                signature_url = url_part[1].strip()
        
        # Atualizar objeto de assinatura
        signature.signature_id = document_uuid
        signature.signature_url = signature_url
        signature.provider = 'd4sign'
        
        if signature_image_base64:
            signature.is_signed = True
            signature.signature_date = timezone.now()
        
        # Salvar endereço IP se disponível
        if hasattr(proposal, 'ip_address') and proposal.ip_address:
            signature.ip_address = proposal.ip_address
        
        signature.save()
        
        # Retornar informações da assinatura
        status = self.get_document_status(document_uuid)
        
        return {
            'proposal_id': proposal.id,
            'signature_id': document_uuid,
            'signature_url': signature_url,
            'status': status['status'],
            'message': status['message'],
            'provider': 'd4sign'
        }
    
    def save_signature(self, proposal_id, signature_image_base64):
        """
        Salva uma assinatura feita localmente
        
        Args:
            proposal_id: ID da proposta
            signature_image_base64: Imagem da assinatura em base64
            
        Returns:
            dict: Informações da assinatura salva
        """
        # Chamar create_signature_request com a imagem da assinatura
        return self.create_signature_request(proposal_id, signature_image_base64)
    
    def get_signature_status(self, proposal_id):
        """
        Verifica o status de uma assinatura
        
        Args:
            proposal_id: ID da proposta
            
        Returns:
            dict: Status da assinatura
        """
        try:
            # Buscar assinatura
            signature = Signature.objects.select_related('proposal').get(proposal_id=proposal_id)
            
            if not signature.signature_id:
                return {
                    'proposal_id': proposal_id,
                    'status': 'not_started',
                    'message': 'Processo de assinatura não iniciado',
                    'signature_url': None,
                    'provider': signature.provider
                }
            
            # Verificar status no provedor
            document_key = signature.signature_id
            
            # Usar o provedor salvo no registro
            current_provider = self.provider
            try:
                if signature.provider and signature.provider != self.provider:
                    self.provider = signature.provider
                    if self.provider == 'clicksign':
                        self.client = self._init_clicksign()
                    else:
                        self.client = self._init_d4sign()
                
                status = self.get_document_status(document_key)
            finally:
                # Restaurar o provedor original
                if current_provider != self.provider:
                    self.provider = current_provider
                    if self.provider == 'clicksign':
                        self.client = self._init_clicksign()
                    else:
                        self.client = self._init_d4sign()
            
            # Atualizar status local se necessário
            if status['status'] == 'completed' and not signature.is_signed:
                signature.is_signed = True
                signature.signature_date = timezone.now()
                signature.save(update_fields=['is_signed', 'signature_date'])
                
                # Atualizar status da proposta
                proposal = signature.proposal
                if proposal.status in ['pending', 'documents_uploaded']:
                    proposal.status = 'signed'
                    proposal.save(update_fields=['status'])
            
            result = {
                'proposal_id': proposal_id,
                'status': status['status'],
                'message': status['message'],
                'signature_url': signature.signature_url,
                'provider': signature.provider
            }
            
            # Adicionar URL do documento assinado se estiver concluído
            if status['status'] == 'completed':
                result['document_url'] = self.get_signed_document_url(proposal_id)
            
            return result
            
        except Signature.DoesNotExist:
            return {
                'proposal_id': proposal_id,
                'status': 'not_started',
                'message': 'Processo de assinatura não iniciado',
                'signature_url': None,
                'provider': self.provider
            }
        except Exception as e:
            logger.error(
                "Erro ao verificar status da assinatura",
                error=str(e),
                proposal_id=proposal_id
            )
            raise
    
    def get_document_status(self, document_key):
        """
        Obtém o status do documento no provedor
        
        Args:
            document_key: Chave do documento
            
        Returns:
            dict: Status do documento
        """
        try:
            if self.provider == 'clicksign':
                return self.client.get_document_status(document_key)
            else:
                # Para D4Sign
                status = self.client.get_document_status(document_key)
                
                # Compatibilizar formato da resposta com o esperado
                return {
                    'status': status.get('status', 'pending'),
                    'message': status.get('message', 'Status desconhecido')
                }
        except Exception as e:
            logger.error(
                "Erro ao verificar status do documento",
                error=str(e),
                document_key=document_key,
                provider=self.provider
            )
            return {
                'status': 'error',
                'message': f"Erro ao verificar status: {str(e)}"
            }
    
    def get_signed_document_url(self, proposal_id):
        """
        Obtém a URL para download do documento assinado
        
        Args:
            proposal_id: ID da proposta
            
        Returns:
            str: URL do documento assinado
        """
        try:
            signature = Signature.objects.get(proposal_id=proposal_id)
            
            if not signature.signature_id:
                return None
            
            if signature.provider == 'clicksign':
                # URL direta para download via API Clicksign
                base_url = os.environ.get('CLICKSIGN_BASE_URL', 'https://app.clicksign.com/api/v1')
                api_key = os.environ.get('CLICKSIGN_API_KEY')
                return f"{base_url}/documents/{signature.signature_id}/download?access_token={api_key}"
            else:
                # URL para download via API D4Sign
                return f"/api/v1/signatures/{proposal_id}/download/"
                
        except Signature.DoesNotExist:
            return None
        except Exception as e:
            logger.error(
                "Erro ao obter URL do documento assinado",
                error=str(e),
                proposal_id=proposal_id
            )
            return None 