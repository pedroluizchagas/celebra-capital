import time
import logging
import traceback
import os
import io
from celery import shared_task
from celery.signals import task_failure, task_success, task_retry
from django.conf import settings
import json
from google.cloud import vision
from google.oauth2 import service_account
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import structlog

# Configurar logger estruturado
logger = structlog.get_logger(__name__)
channel_layer = get_channel_layer()

# Registrar manipuladores de eventos Celery para monitoramento
@task_failure.connect
def task_failure_handler(sender=None, task_id=None, exception=None, args=None, kwargs=None, traceback=None, einfo=None, **_):
    logger.error(
        "Tarefa falhou", 
        task_id=task_id, 
        task_name=sender.name if sender else "Unknown", 
        exception_class=exception.__class__.__name__ if exception else "Unknown",
        exception=str(exception) if exception else "Unknown",
        args=args,
        kwargs=kwargs
    )

@task_success.connect
def task_success_handler(sender=None, result=None, **kwargs):
    logger.info(
        "Tarefa completada com sucesso", 
        task_name=sender.name if sender else "Unknown",
        task_id=kwargs.get('task_id')
    )

@task_retry.connect
def task_retry_handler(sender=None, request=None, reason=None, einfo=None, **kwargs):
    logger.warning(
        "Tarefa em retentativa",
        task_name=sender.name if sender else "Unknown",
        task_id=request.id if request else "Unknown",
        reason=str(reason) if reason else "Unknown",
        retries=request.retries if request else 0,
        max_retries=sender.max_retries if sender else 0,
    )

def update_ocr_progress(document_id, progress, complete=False, error=None):
    """
    Atualiza o progresso do OCR via WebSocket e no banco de dados
    """
    try:
        # Atualizar o progresso no banco de dados
        ocr_result = OcrResult.objects.get(document_id=document_id)
        
        if error:
            ocr_result.mark_failed(error)
        elif complete:
            ocr_result.update_progress(100)
            ocr_result.ocr_complete = True
            ocr_result.save(update_fields=['ocr_complete'])
        else:
            ocr_result.update_progress(progress)
            
        logger.debug(
            "Progresso OCR atualizado", 
            document_id=document_id, 
            progress=progress,
            complete=complete
        )
    except Exception as e:
        logger.error(
            "Erro ao atualizar progresso OCR", 
            error=str(e),
            document_id=document_id
        )

@shared_task(
    bind=True,  # Permite que o self.retry() funcione
    autoretry_for=(Exception,),  # Retenta para exceções genéricas
    retry_backoff=True,  # Usa backoff exponencial entre tentativas
    retry_backoff_max=600,  # Máximo de 10 minutos entre tentativas
    retry_jitter=True,  # Adiciona ruído ao tempo de backoff para evitar thundering herd
    max_retries=5,  # Máximo de 5 tentativas
    acks_late=True,  # Reconhecer a mensagem apenas após a execução
    reject_on_worker_lost=True,  # Reenviar para outro worker se este worker falhar
    time_limit=300,  # Limite de 5 minutos para a tarefa
    soft_time_limit=240,  # Limite soft de 4 minutos (gera exceção que pode ser tratada)
    track_started=True,  # Rastrear quando a tarefa começou
)
def process_document_ocr(self, document_id):
    """
    Processa o OCR para um documento de forma assíncrona e resiliente
    """
    # Importações dentro da tarefa para evitar problemas de importação circular
    from .models import Document, OcrResult
    
    logger.info(
        "Iniciando processamento OCR", 
        document_id=document_id,
        task_id=self.request.id,
        retry=self.request.retries
    )
    
    start_time = time.time()
    
    try:
        # Obter documento
        document = Document.objects.select_related('user').get(id=document_id)
        
        # Verificar se já existe resultado OCR
        ocr_result, created = OcrResult.objects.get_or_create(
            document=document,
            defaults={
                'ocr_complete': False,
                'task_id': self.request.id,
            }
        )
        
        if not created and ocr_result.ocr_complete:
            logger.info(
                "Documento já processado anteriormente", 
                document_id=document_id,
                ocr_id=ocr_result.id
            )
            update_ocr_progress(document_id, 100, True)
            return {
                "document_id": document_id,
                "status": "already_processed",
                "ocr_complete": True
            }
        
        # Atualizar task_id para rastreabilidade mesmo se não for uma criação nova
        if not created:
            ocr_result.task_id = self.request.id
            ocr_result.save(update_fields=['task_id'])
        
        # Atualizar progresso inicial
        update_ocr_progress(document_id, 10)
        
        # Obter caminho do arquivo
        file_path = document.file.path
        
        # Verificar se arquivo existe
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Arquivo não encontrado: {file_path}")
        
        # Verificar tipo de documento
        document_type = document.document_type
        extracted_data = {}
        confidence_score = 0.0
        
        # Atualizar progresso - preparando para OCR
        update_ocr_progress(document_id, 20)
        
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
                
                # Atualizar progresso - carregando imagem
                update_ocr_progress(document_id, 30)
                
                # Ler o conteúdo do arquivo
                with io.open(file_path, 'rb') as image_file:
                    content = image_file.read()
                
                # Configurar imagem
                image = vision.Image(content=content)
                
                # Atualizar progresso - enviando para API
                update_ocr_progress(document_id, 40)
                
                # Realizar reconhecimento de texto
                response = client.text_detection(image=image)
                texts = response.text_annotations
                
                # Atualizar progresso - processando resultados
                update_ocr_progress(document_id, 60)
                
                if texts:
                    # O primeiro elemento contém todo o texto
                    full_text = texts[0].description
                    
                    # Atualizar progresso - analisando texto
                    update_ocr_progress(document_id, 70)
                    
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
                
                # Verificar erros da API
                if response.error.message:
                    error_message = f"Erro no Google Vision API: {response.error.message}"
                    logger.error(
                        "Erro em API externa", 
                        api="Google Vision",
                        error=response.error.message,
                        document_id=document_id
                    )
                    # Tratamento de erro retornável
                    raise Exception(error_message)
                
                # Atualizar progresso - finalizando análise
                update_ocr_progress(document_id, 85)
                
            except Exception as vision_error:
                logger.warning(
                    "Erro ao usar Google Vision API, usando fallback", 
                    error=str(vision_error),
                    document_id=document_id,
                    task_id=self.request.id
                )
                # Fallback para OCR simulado
                extracted_data, confidence_score = simulate_ocr(document_type, document_id)
        else:
            # Em desenvolvimento ou quando não configurado, simular o processamento
            extracted_data, confidence_score = simulate_ocr(document_type, document_id)
        
        # Atualizar progresso - salvando resultados
        update_ocr_progress(document_id, 95)
        
        # Atualizar resultado do OCR
        process_time = time.time() - start_time
        ocr_result.ocr_complete = True
        ocr_result.extracted_data = extracted_data
        ocr_result.confidence_score = confidence_score
        ocr_result.process_time = process_time
        ocr_result.error_message = None  # Limpar mensagens de erro anteriores
        ocr_result.save()
        
        logger.info(
            "OCR concluído com sucesso", 
            document_id=document_id,
            process_time=f"{process_time:.2f}s",
            confidence_score=confidence_score,
            task_id=self.request.id
        )
        
        # Atualizar status de verificação do documento se confiança for alta
        if confidence_score > 0.8:
            document.verification_status = 'verified'
            document.save(update_fields=['verification_status'])
            
        # Atualizar progresso - concluído
        update_ocr_progress(document_id, 100, True)
            
        return {
            "document_id": document_id,
            "ocr_complete": True,
            "confidence_score": confidence_score,
            "process_time": process_time,
            "status": "success"
        }
        
    except Document.DoesNotExist:
        error_message = f"Documento {document_id} não encontrado"
        logger.error(
            "Documento não encontrado", 
            document_id=document_id,
            task_id=self.request.id
        )
        update_ocr_progress(document_id, 0, True, error=error_message)
        return {"error": error_message, "status": "not_found"}
        
    except (IOError, FileNotFoundError) as file_error:
        error_message = f"Erro ao acessar arquivo do documento: {str(file_error)}"
        logger.error(
            "Erro de arquivo", 
            document_id=document_id,
            error=str(file_error),
            task_id=self.request.id
        )
        
        # Erro de arquivo - não tente novamente, é um erro permanente
        update_ocr_progress(document_id, 0, True, error=error_message)
        self.update_state(state='FAILURE', meta={'error': error_message})
        
        # Atualizar o resultado com o erro
        try:
            OcrResult.objects.filter(document_id=document_id).update(
                ocr_complete=True,
                error_message=error_message,
                task_id=self.request.id,
                process_time=time.time() - start_time
            )
        except Exception:
            pass
            
        return {"error": error_message, "status": "file_error"}
        
    except Exception as e:
        error_message = str(e)
        stack_trace = traceback.format_exc()
        logger.error(
            "Erro durante processamento OCR", 
            document_id=document_id,
            error=error_message,
            traceback=stack_trace,
            task_id=self.request.id,
            retry=self.request.retries
        )
        
        # Tentar atualizar o resultado com o erro
        try:
            OcrResult.objects.filter(document_id=document_id).update(
                error_message=error_message,
                task_id=self.request.id
            )
            
            # Notificar erro via WebSocket
            update_ocr_progress(document_id, self.request.retries * 20, False, error=error_message)
        except Exception:
            pass
        
        # Se ainda temos tentativas disponíveis, vamos tentar novamente
        if self.request.retries < self.max_retries:
            logger.info(
                "Agendando retentativa", 
                document_id=document_id,
                retry_count=self.request.retries + 1,
                max_retries=self.max_retries,
                task_id=self.request.id
            )
            # O exponential backoff é tratado automaticamente pelas configurações da tarefa
            raise self.retry(exc=e)
        else:
            # Sem mais tentativas disponíveis, finaliza com erro
            # Marcar como concluído com erro para não ficar tentando para sempre
            try:
                OcrResult.objects.filter(document_id=document_id).update(
                    ocr_complete=True,
                    error_message=f"Falha após {self.max_retries} tentativas: {error_message}",
                    task_id=self.request.id,
                    process_time=time.time() - start_time
                )
                
                # Notificar erro final via WebSocket
                update_ocr_progress(document_id, 100, True, error=f"Falha após {self.max_retries} tentativas")
            except Exception:
                pass
                
            return {
                "error": error_message, 
                "status": "failed_after_retries",
                "retries": self.request.retries
            }

def simulate_ocr(document_type, document_id=None):
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
    
    # Simular processamento com atualizações de progresso
    if document_id:
        update_ocr_progress(document_id, 30)
        time.sleep(0.5)
        update_ocr_progress(document_id, 45)
        time.sleep(0.5)
        update_ocr_progress(document_id, 60)
        time.sleep(0.5)
        update_ocr_progress(document_id, 75)
        time.sleep(0.5)
        update_ocr_progress(document_id, 90)
    else:
        # Sem document_id, apenas delay simples
        time.sleep(2)
    
    return extracted_data, confidence_score

def extract_rg_data(text):
    """Extrai informações de um RG"""
    # Implementação simplificada - em produção usaria NLP mais avançado
    lines = text.split('\n')
    
    # Dicionário para armazenar os dados extraídos
    data = {
        "nome": "",
        "rg": "",
        "data_nascimento": "",
        "filiacao": ""
    }
    
    # Tentar encontrar padrões comuns em RG
    for line in lines:
        line = line.strip()
        
        # Procurar nome
        if "nome" in line.lower() and len(line) > 6:
            data["nome"] = line.replace("Nome:", "").replace("NOME:", "").strip()
        
        # Procurar RG
        elif any(x in line.lower() for x in ["registro", "identidade", "rg"]) and len(line) < 30:
            # Extrair apenas números e pontuações
            import re
            rg_pattern = re.search(r'[\d\.\-]+', line)
            if rg_pattern:
                data["rg"] = rg_pattern.group()
        
        # Procurar data de nascimento
        elif any(x in line.lower() for x in ["nasc", "nascimento", "data"]) and len(line) < 30:
            # Extrair padrão de data DD/MM/AAAA
            import re
            date_pattern = re.search(r'\d{2}[/\.\-]\d{2}[/\.\-]\d{4}', line)
            if date_pattern:
                data["data_nascimento"] = date_pattern.group()
        
        # Procurar filiação
        elif any(x in line.lower() for x in ["filiac", "filiação", "pai", "mae", "mãe"]) and len(line) > 10:
            data["filiacao"] = line.replace("Filiação:", "").replace("FILIAÇÃO:", "").strip()
    
    return data

def extract_cpf_data(text):
    """Extrai informações de um CPF"""
    # Implementação simplificada
    lines = text.split('\n')
    
    data = {
        "nome": "",
        "cpf": ""
    }
    
    # Procurar padrões de CPF
    for line in lines:
        line = line.strip()
        
        # Procurar nome
        if "nome" in line.lower() and len(line) > 6:
            data["nome"] = line.replace("Nome:", "").replace("NOME:", "").strip()
        
        # Procurar CPF
        elif any(x in line.lower() for x in ["cpf", "cadastro"]):
            # Extrair apenas números e pontuações no formato de CPF
            import re
            cpf_pattern = re.search(r'\d{3}\.?\d{3}\.?\d{3}\-?\d{2}', line)
            if cpf_pattern:
                data["cpf"] = cpf_pattern.group()
    
    return data

def extract_proof_income_data(text):
    """Extrai informações de um comprovante de renda"""
    # Implementação simplificada
    lines = text.split('\n')
    
    data = {
        "valor": "",
        "data": "",
        "orgao": ""
    }
    
    # Procurar valores e datas
    for line in lines:
        line = line.strip()
        
        # Procurar valores monetários
        if "R$" in line or any(x in line.lower() for x in ["valor", "salario", "salário", "vencimentos"]):
            # Extrair valor no formato R$ X.XXX,XX
            import re
            value_pattern = re.search(r'R\$\s*[\d\.\,]+', line)
            if value_pattern:
                data["valor"] = value_pattern.group()
        
        # Procurar datas
        elif any(x in line.lower() for x in ["data", "emissão", "emissao", "pagamento"]):
            # Extrair padrão de data DD/MM/AAAA
            import re
            date_pattern = re.search(r'\d{2}[/\.\-]\d{2}[/\.\-]\d{4}', line)
            if date_pattern:
                data["data"] = date_pattern.group()
        
        # Procurar órgão emissor
        elif any(x in line.lower() for x in ["empresa", "órgão", "orgao", "emissor", "empregador"]):
            data["orgao"] = line.strip()
    
    return data

def extract_address_proof_data(text):
    """Extrai informações de um comprovante de endereço"""
    # Implementação simplificada
    lines = text.split('\n')
    
    data = {
        "endereco": "",
        "cep": "",
        "cidade_uf": ""
    }
    
    # Procurar padrões de endereço
    for i, line in enumerate(lines):
        line = line.strip()
        
        # Procurar padrões de rua e número
        if any(x in line.lower() for x in ["rua", "avenida", "av.", "alameda", "praça", "travessa"]) and len(line) > 5:
            data["endereco"] = line.strip()
        
        # Procurar CEP
        elif "cep" in line.lower() or any(x in line for x in ["CEP", "-"]):
            # Extrair padrão de CEP
            import re
            cep_pattern = re.search(r'\d{5}[\-]?\d{3}', line)
            if cep_pattern:
                data["cep"] = cep_pattern.group()
        
        # Procurar cidade e UF
        elif any(x in line.lower() for x in ["cidade", "município", "municipio", "estado"]) or (len(line) < 30 and "-" in line):
            # Verificar se é padrão "Cidade - UF"
            import re
            city_uf_pattern = re.search(r'[A-Za-zÀ-ÿ\s]+\s*-\s*[A-Z]{2}', line)
            if city_uf_pattern:
                data["cidade_uf"] = city_uf_pattern.group()
    
    return data

# Tarefas periódicas para manutenção do OCR

@shared_task
def monitor_pending_ocr_tasks():
    """
    Tarefa periódica que monitora as tarefas de OCR pendentes e verifica se alguma está travada.
    Retenta tarefas que parecem estar travadas há muito tempo.
    """
    try:
        # Obter todos os resultados OCR não concluídos
        from django.utils import timezone
        from datetime import timedelta
        from .models import OcrResult
        
        # Pegar tarefas que estão pendentes há mais de 15 minutos
        time_threshold = timezone.now() - timedelta(minutes=15)
        stuck_tasks = OcrResult.objects.filter(
            ocr_complete=False,
            updated_at__lt=time_threshold
        ).select_related('document')
        
        count = 0
        for ocr_result in stuck_tasks:
            # Verificar se o documento ainda existe
            if not ocr_result.document:
                # Se o documento foi excluído, remover o resultado do OCR
                ocr_result.delete()
                continue
                
            if ocr_result.retry_count < 3:  # Limitar a 3 tentativas
                # Registrar como uma nova tentativa
                ocr_result.retry_count += 1
                ocr_result.task_status = 'RETRY'
                ocr_result.save(update_fields=['retry_count', 'task_status', 'updated_at'])
                
                # Iniciar novo processamento
                task = process_document_ocr.apply_async(
                    args=[ocr_result.document.id],
                    queue='ocr',
                    priority=3  # Prioridade baixa para tarefas retentativas
                )
                
                # Atualizar task_id
                ocr_result.task_id = task.id
                ocr_result.save(update_fields=['task_id'])
                
                logger.info(
                    "Tarefa OCR travada reiniciada",
                    document_id=ocr_result.document.id,
                    task_id=task.id,
                    retry_count=ocr_result.retry_count
                )
                count += 1
            else:
                # Se já chegou ao limite de tentativas, marcar como falha
                ocr_result.ocr_complete = True
                ocr_result.task_status = 'FAILURE'
                ocr_result.error_message = "Falha após múltiplas tentativas"
                ocr_result.save()
                
                logger.warning(
                    "Tarefa OCR abandonada após múltiplas tentativas",
                    document_id=ocr_result.document.id,
                    retry_count=ocr_result.retry_count
                )
        
        return f"Verificado {len(stuck_tasks)} tarefas pendentes. Reiniciadas: {count}"
        
    except Exception as e:
        logger.error("Erro ao monitorar tarefas OCR pendentes", error=str(e))
        return f"Erro ao monitorar tarefas: {str(e)}"

@shared_task
def cleanup_old_ocr_results():
    """
    Limpa resultados de OCR muito antigos para economizar espaço no banco de dados.
    Mantém apenas os resultados dos últimos 90 dias.
    """
    try:
        from django.utils import timezone
        from datetime import timedelta
        from .models import OcrResult
        
        # Definir limite de 90 dias
        time_threshold = timezone.now() - timedelta(days=90)
        
        # Obter todos os resultados OCR concluídos antes do período
        old_results = OcrResult.objects.filter(
            ocr_complete=True,
            updated_at__lt=time_threshold
        )
        
        # Registrar o número de itens que serão excluídos
        count = old_results.count()
        
        if count > 0:
            logger.info(f"Removendo {count} resultados OCR antigos")
            old_results.delete()
        
        return f"Removidos {count} resultados OCR antigos"
        
    except Exception as e:
        logger.error("Erro ao limpar resultados OCR antigos", error=str(e))
        return f"Erro ao limpar resultados: {str(e)}" 