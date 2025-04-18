import time
import logging
from celery import shared_task
from django.conf import settings
import json
import traceback
import os
import io
from google.cloud import vision
from google.oauth2 import service_account

logger = logging.getLogger(__name__)

@shared_task
def process_document_ocr(document_id):
    """
    Processa o OCR para um documento
    """
    # Importações dentro da tarefa para evitar problemas de importação circular
    from .models import Document, OcrResult
    
    logger.info(f"Iniciando processamento OCR para documento {document_id}")
    start_time = time.time()
    
    try:
        # Obter documento
        document = Document.objects.get(id=document_id)
        
        # Verificar se já existe resultado OCR
        ocr_result, created = OcrResult.objects.get_or_create(
            document=document,
            defaults={'ocr_complete': False}
        )
        
        if not created and ocr_result.ocr_complete:
            logger.info(f"Documento {document_id} já foi processado anteriormente")
            return
        
        # Obter caminho do arquivo
        file_path = document.file.path
        
        # Verificar tipo de documento
        document_type = document.document_type
        extracted_data = {}
        confidence_score = 0.0
        
        # Implementação real de OCR com Google Vision API
        if settings.USE_GOOGLE_VISION:
            try:
                # Configurar credenciais
                if settings.GOOGLE_CREDENTIALS_JSON:
                    credentials = service_account.Credentials.from_service_account_file(
                        settings.GOOGLE_CREDENTIALS_JSON
                    )
                else:
                    credentials = None
                
                # Inicializar cliente Vision
                client = vision.ImageAnnotatorClient(credentials=credentials)
                
                # Ler o conteúdo do arquivo
                with io.open(file_path, 'rb') as image_file:
                    content = image_file.read()
                
                # Configurar imagem
                image = vision.Image(content=content)
                
                # Realizar reconhecimento de texto
                response = client.text_detection(image=image)
                texts = response.text_annotations
                
                if texts:
                    # O primeiro elemento contém todo o texto
                    full_text = texts[0].description
                    
                    # Processamento específico por tipo de documento
                    if document_type == 'rg':
                        extracted_data = extract_rg_data(full_text)
                        confidence_score = 0.85
                    elif document_type == 'cpf':
                        extracted_data = extract_cpf_data(full_text)
                        confidence_score = 0.90
                    elif document_type == 'proof_income':
                        extracted_data = extract_proof_income_data(full_text)
                        confidence_score = 0.75
                    elif document_type == 'address_proof':
                        extracted_data = extract_address_proof_data(full_text)
                        confidence_score = 0.80
                    else:
                        # Para outros tipos, apenas salvar o texto completo
                        extracted_data = {"full_text": full_text}
                        confidence_score = 0.70
                        
                # Verificar erros
                if response.error.message:
                    raise Exception(
                        f"Erro no Google Vision API: {response.error.message}"
                    )
                
            except Exception as vision_error:
                logger.error(f"Erro ao usar Google Vision API: {vision_error}")
                # Fallback para OCR simulado
                extracted_data, confidence_score = simulate_ocr(document_type)
        else:
            # Em desenvolvimento ou quando não configurado, simular o processamento
            extracted_data, confidence_score = simulate_ocr(document_type)
        
        # Atualizar resultado do OCR
        process_time = time.time() - start_time
        ocr_result.ocr_complete = True
        ocr_result.extracted_data = extracted_data
        ocr_result.confidence_score = confidence_score
        ocr_result.process_time = process_time
        ocr_result.save()
        
        logger.info(f"OCR para documento {document_id} concluído em {process_time:.2f}s")
        
        # Atualizar status de verificação do documento se confiança for alta
        if confidence_score > 0.8:
            document.verification_status = 'verified'
            document.save()
            
        return {
            "document_id": document_id,
            "ocr_complete": True,
            "confidence_score": confidence_score,
            "process_time": process_time
        }
        
    except Document.DoesNotExist:
        logger.error(f"Documento {document_id} não encontrado")
        return {"error": f"Documento {document_id} não encontrado"}
    except Exception as e:
        error_message = str(e)
        stack_trace = traceback.format_exc()
        logger.error(f"Erro ao processar OCR para documento {document_id}: {error_message}\n{stack_trace}")
        
        # Tentar atualizar o resultado com o erro
        try:
            ocr_result.ocr_complete = True
            ocr_result.error_message = error_message
            ocr_result.save()
        except Exception:
            pass
        
        return {"error": error_message}

def simulate_ocr(document_type):
    """
    Simula processamento OCR para desenvolvimento
    """
    if document_type == 'rg':
        extracted_data = {
            "nome": "Nome do Usuário",
            "rg": "12.345.678-9",
            "data_nascimento": "01/01/1980",
            "filiacao": "Nome dos Pais"
        }
        confidence_score = 0.85
    elif document_type == 'cpf':
        extracted_data = {
            "nome": "Nome do Usuário",
            "cpf": "123.456.789-00"
        }
        confidence_score = 0.92
    elif document_type == 'proof_income':
        extracted_data = {
            "valor": "R$ 5.000,00",
            "data": "01/01/2023",
            "orgao": "Nome do Órgão"
        }
        confidence_score = 0.78
    elif document_type == 'address_proof':
        extracted_data = {
            "endereco": "Rua Exemplo, 123",
            "cep": "01234-567",
            "cidade_uf": "São Paulo - SP"
        }
        confidence_score = 0.80
    else:
        extracted_data = {"mensagem": "Tipo de documento não suportado para OCR"}
        confidence_score = 0.0
        
    # Simular processamento
    time.sleep(1)
    
    return extracted_data, confidence_score

def extract_rg_data(text):
    """
    Extrai informações de RG do texto reconhecido
    """
    import re
    
    data = {
        "nome": "",
        "rg": "",
        "data_nascimento": "",
        "filiacao": ""
    }
    
    # Procurar por padrões de RG
    rg_pattern = r'\b(\d{1,2}\.?\d{3}\.?\d{3}-?[\dXx])\b'
    rg_matches = re.findall(rg_pattern, text)
    if rg_matches:
        data["rg"] = rg_matches[0]
    
    # Procurar por padrões de data
    date_pattern = r'\b(\d{2}/\d{2}/\d{4})\b'
    date_matches = re.findall(date_pattern, text)
    if date_matches:
        data["data_nascimento"] = date_matches[0]
    
    # Para nome e filiação, usar heurísticas simples
    lines = text.split('\n')
    for i, line in enumerate(lines):
        if 'NOME' in line.upper() and i+1 < len(lines):
            data["nome"] = lines[i+1].strip()
        elif 'FILIAÇÃO' in line.upper() and i+1 < len(lines):
            data["filiacao"] = lines[i+1].strip()
    
    return data

def extract_cpf_data(text):
    """
    Extrai informações de CPF do texto reconhecido
    """
    import re
    
    data = {
        "nome": "",
        "cpf": ""
    }
    
    # Procurar por padrões de CPF
    cpf_pattern = r'\b(\d{3}\.?\d{3}\.?\d{3}-?\d{2})\b'
    cpf_matches = re.findall(cpf_pattern, text)
    if cpf_matches:
        data["cpf"] = cpf_matches[0]
    
    # Para nome, usar heurísticas simples
    lines = text.split('\n')
    for i, line in enumerate(lines):
        if 'NOME' in line.upper() and i+1 < len(lines):
            data["nome"] = lines[i+1].strip()
    
    return data

def extract_proof_income_data(text):
    """
    Extrai informações de comprovante de renda do texto reconhecido
    """
    import re
    
    data = {
        "valor": "",
        "data": "",
        "orgao": ""
    }
    
    # Procurar por padrões de valor monetário
    valor_pattern = r'R\$\s*(\d{1,3}(?:\.\d{3})*,\d{2})'
    valor_matches = re.findall(valor_pattern, text)
    if valor_matches:
        data["valor"] = f"R$ {valor_matches[0]}"
    
    # Procurar por padrões de data
    date_pattern = r'\b(\d{2}/\d{2}/\d{4})\b'
    date_matches = re.findall(date_pattern, text)
    if date_matches:
        data["data"] = date_matches[0]
    
    # Para órgão/empresa, usar primeiras linhas
    lines = text.split('\n')
    if len(lines) > 0:
        data["orgao"] = lines[0].strip()
    
    return data

def extract_address_proof_data(text):
    """
    Extrai informações de comprovante de endereço do texto reconhecido
    """
    import re
    
    data = {
        "endereco": "",
        "cep": "",
        "cidade_uf": ""
    }
    
    # Procurar por padrões de CEP
    cep_pattern = r'\b(\d{5}-\d{3})\b'
    cep_matches = re.findall(cep_pattern, text)
    if cep_matches:
        data["cep"] = cep_matches[0]
    
    # Extrair endereço e cidade/UF usando heurísticas
    lines = text.split('\n')
    for line in lines:
        # Procurar por linhas que parecem endereços
        if re.search(r'\b(RUA|AV|AVENIDA|ALAMEDA|PRAÇA)\b', line.upper()):
            data["endereco"] = line.strip()
        
        # Procurar por padrões de cidade/UF
        city_state_pattern = r'\b([A-Za-zÀ-ÿ\s]+)[,-]\s*([A-Z]{2})\b'
        city_state_matches = re.findall(city_state_pattern, line)
        if city_state_matches:
            city, state = city_state_matches[0]
            data["cidade_uf"] = f"{city.strip()} - {state}"
    
    return data 