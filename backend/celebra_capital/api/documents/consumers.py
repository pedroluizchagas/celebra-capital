import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .models import Document, OcrResult
from celery.result import AsyncResult
from django.utils import timezone

logger = logging.getLogger(__name__)

class OcrConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.document_id = self.scope['url_route']['kwargs']['document_id']
        self.room_group_name = f'ocr_{self.document_id}'
        
        # Verificar se o usuário está autenticado
        if self.scope["user"].is_anonymous:
            await self.close()
            return
        
        # Verificar se o usuário possui acesso ao documento
        has_access = await self.check_document_access()
        if not has_access:
            await self.close()
            return
        
        # Adicionar ao grupo de room
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Enviar status atual ao conectar
        status = await self.get_ocr_status()
        await self.send(text_data=json.dumps({
            'type': 'ocr_status',
            'complete': status['complete'],
            'progress': status['progress'],
            'task_status': status.get('task_status', ''),
            'message': status.get('message', '')
        }))

    async def disconnect(self, close_code):
        # Sair do grupo de room
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receber mensagem do WebSocket
    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            action = text_data_json.get('action')
            
            if action == 'get_status':
                status = await self.get_ocr_status()
                await self.send(text_data=json.dumps({
                    'type': 'ocr_status',
                    'complete': status['complete'],
                    'progress': status['progress'],
                    'task_status': status.get('task_status', ''),
                    'message': status.get('message', '')
                }))
                
            elif action == 'retry_ocr':
                # Permite que o cliente solicite reprocessamento do OCR
                result = await self.retry_ocr_processing()
                await self.send(text_data=json.dumps({
                    'type': 'action_result',
                    'action': 'retry_ocr',
                    'success': result['success'],
                    'message': result['message']
                }))
        except Exception as e:
            logger.error(f"Erro ao processar mensagem do WebSocket: {str(e)}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f"Erro ao processar solicitação: {str(e)}"
            }))

    # Métodos para enviar atualizações para o grupo
    async def ocr_status(self, event):
        # Enviar atualização para o WebSocket
        await self.send(text_data=json.dumps({
            'type': 'ocr_status',
            'complete': event['complete'],
            'progress': event['progress'],
            'task_status': event.get('task_status', ''),
            'message': event.get('message', '')
        }))

    # Métodos de acesso ao banco de dados
    @database_sync_to_async
    def check_document_access(self):
        try:
            user_id = self.scope["user"].id
            document = get_object_or_404(Document, id=self.document_id)
            return document.user.id == user_id
        except Exception as e:
            logger.error(f"Erro ao verificar acesso ao documento: {str(e)}")
            return False
    
    @database_sync_to_async
    def get_ocr_status(self):
        try:
            document = Document.objects.get(id=self.document_id)
            
            try:
                ocr_result = OcrResult.objects.get(document=document)
                
                if ocr_result.ocr_complete:
                    return {
                        'complete': True,
                        'progress': 100,
                        'task_status': 'SUCCESS',
                        'message': 'Processamento OCR concluído'
                    }
                
                # Verificar status da tarefa Celery se tiver task_id
                if ocr_result.task_id:
                    task_result = AsyncResult(ocr_result.task_id)
                    task_status = task_result.state
                    
                    # Mapear estado da tarefa para progresso
                    progress_mapping = {
                        'PENDING': 10,
                        'STARTED': 30,
                        'RETRY': 40,
                        'SUCCESS': 100,
                        'FAILURE': 0,
                        'REVOKED': 0
                    }
                    
                    # Usar o progresso armazenado no banco ou o mapeado pelo status
                    progress = ocr_result.current_progress or progress_mapping.get(task_status, 50)
                    
                    # Se a tarefa falhou, informar isso no status
                    if task_status == 'FAILURE':
                        return {
                            'complete': False,
                            'progress': 0,
                            'task_status': 'FAILURE',
                            'message': 'Falha no processamento OCR',
                            'retry_count': ocr_result.retry_count
                        }
                        
                    return {
                        'complete': task_status == 'SUCCESS',
                        'progress': progress,
                        'task_status': task_status,
                        'retry_count': ocr_result.retry_count
                    }
                else:
                    # Calcular progresso com base no tempo decorrido
                    time_since_created = (timezone.now() - ocr_result.created_at).total_seconds()
                    # Limite o progresso a 90% para tarefas sem task_id
                    progress = min(int(time_since_created / 20 * 100), 90)
                    
                    return {
                        'complete': False,
                        'progress': progress,
                        'message': 'Processamento em andamento'
                    }
                    
            except OcrResult.DoesNotExist:
                # Não existe resultado de OCR para este documento
                from .tasks import process_document_ocr
                
                # Iniciar processamento automaticamente
                task = process_document_ocr.apply_async(
                    args=[document.id],
                    queue='ocr'
                )
                
                # Criar registro para acompanhamento
                OcrResult.objects.create(
                    document=document,
                    ocr_complete=False,
                    task_id=task.id,
                    task_status='PENDING',
                    current_progress=0
                )
                
                logger.info(
                    "Processamento OCR iniciado através do WebSocket",
                    document_id=document.id,
                    task_id=task.id
                )
                
                return {
                    'complete': False,
                    'progress': 5,
                    'task_status': 'PENDING',
                    'message': 'Processamento OCR iniciado'
                }
                
        except Exception as e:
            logger.error(f"Erro ao obter status OCR: {str(e)}")
            return {
                'complete': False,
                'progress': 0,
                'error': str(e),
                'message': f'Erro: {str(e)}'
            }
            
    @database_sync_to_async
    def retry_ocr_processing(self):
        """Permite reprocessar um documento com OCR"""
        try:
            document = Document.objects.get(id=self.document_id)
            
            # Verificar se existe resultado anterior
            try:
                ocr_result = OcrResult.objects.get(document=document)
                
                # Verificar se o número de tentativas não excede o limite
                if ocr_result.retry_count >= 5:
                    return {
                        'success': False,
                        'message': 'Número máximo de tentativas excedido'
                    }
                
                # Preparar para novo processamento
                from .tasks import process_document_ocr
                
                task = process_document_ocr.apply_async(
                    args=[document.id],
                    queue='ocr',
                    priority=1  # Alta prioridade por ser solicitação explícita
                )
                
                # Atualizar resultado OCR
                ocr_result.task_id = task.id
                ocr_result.task_status = 'PENDING'
                ocr_result.ocr_complete = False
                ocr_result.retry_count += 1
                ocr_result.current_progress = 0
                ocr_result.save()
                
                logger.info(
                    "Processamento OCR reiniciado manualmente",
                    document_id=document.id,
                    task_id=task.id,
                    retry_count=ocr_result.retry_count
                )
                
                return {
                    'success': True,
                    'message': f'Processamento OCR reiniciado (tentativa {ocr_result.retry_count})'
                }
                
            except OcrResult.DoesNotExist:
                # Não existe resultado, iniciar processamento
                from .tasks import process_document_ocr
                
                task = process_document_ocr.apply_async(
                    args=[document.id],
                    queue='ocr'
                )
                
                # Criar registro para acompanhamento
                OcrResult.objects.create(
                    document=document,
                    ocr_complete=False,
                    task_id=task.id,
                    task_status='PENDING',
                    current_progress=0
                )
                
                logger.info(
                    "Primeiro processamento OCR iniciado manualmente",
                    document_id=document.id,
                    task_id=task.id
                )
                
                return {
                    'success': True,
                    'message': 'Processamento OCR iniciado'
                }
                
        except Exception as e:
            logger.error(f"Erro ao reiniciar processamento OCR: {str(e)}")
            return {
                'success': False,
                'message': f'Erro: {str(e)}'
            } 