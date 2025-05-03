#!/usr/bin/env python
"""
Script para testar o fluxo de assinatura digital

Este script testa o fluxo de assinatura digital usando o serviço D4Sign.
Ele é útil para verificar a configuração da integração sem precisar usar a interface web.

Exemplo de uso:
    python test_signature_flow.py --proposal-id 123
"""
import os
import sys
import argparse
import time
import requests
import django
from pathlib import Path

# Configurar Django
sys.path.append(str(Path(__file__).parent.parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'celebra_capital.settings')
django.setup()

# Importar depois de configurar o Django
from celebra_capital.api.signatures.service import SignatureService
from celebra_capital.api.proposals.models import Proposal, Signature

def test_signature_flow(proposal_id, wait_time=5):
    """
    Testa o fluxo completo de assinatura digital
    
    Args:
        proposal_id (int): ID da proposta para testar a assinatura
        wait_time (int): Tempo de espera entre verificações de status
    """
    print(f"\n🔍 Testando fluxo de assinatura para a proposta {proposal_id}")
    print("-" * 50)
    
    try:
        # Verificar se a proposta existe
        proposal = Proposal.objects.get(id=proposal_id)
        print(f"✅ Proposta encontrada: {proposal.proposal_number}")
        
        # Inicializar serviço
        service = SignatureService()
        print("✅ Serviço de assinatura inicializado")
        
        # Criar solicitação de assinatura
        print("\n📝 Criando solicitação de assinatura...")
        signature_request = service.create_signature_request(proposal_id)
        print(f"✅ Solicitação criada com sucesso")
        print(f"   Status: {signature_request['status']}")
        print(f"   ID da assinatura: {signature_request['signature_id']}")
        if signature_request.get('signature_url'):
            print(f"   URL para assinatura: {signature_request['signature_url']}")
        
        # Verificar status inicial
        print("\n🔄 Verificando status inicial...")
        status = service.get_signature_status(proposal_id)
        print(f"✅ Status inicial: {status['status']}")
        
        # Loop de verificação de status (simulando o comportamento do Celery)
        if status['status'] not in ['completed', 'error']:
            print(f"\n⏱️  Aguardando assinatura (verificando a cada {wait_time} segundos)...")
            print("   Pressione Ctrl+C para interromper")
            
            try:
                while True:
                    time.sleep(wait_time)
                    status = service.get_signature_status(proposal_id)
                    print(f"   {time.strftime('%H:%M:%S')} - Status: {status['status']}")
                    
                    if status['status'] in ['completed', 'error']:
                        break
            except KeyboardInterrupt:
                print("\n✋ Teste interrompido pelo usuário")
        
        # Verificar se a assinatura foi concluída
        signature = Signature.objects.get(proposal=proposal)
        if signature.is_signed:
            print("\n✅ Assinatura concluída com sucesso!")
            print(f"   Data/hora: {signature.signature_date}")
            
            # Tentar baixar o documento
            print("\n📄 Tentando baixar o documento assinado...")
            try:
                document = service.download_signed_document(proposal_id)
                print(f"✅ Documento baixado com sucesso: {document['filename']}")
                
                # Salvar arquivo localmente para inspeção
                output_file = f"signed_doc_{proposal_id}.pdf"
                with open(output_file, 'wb') as f:
                    f.write(document['content'])
                print(f"✅ Documento salvo como: {output_file}")
            except Exception as e:
                print(f"❌ Erro ao baixar documento: {str(e)}")
        else:
            print("\n⏳ Assinatura ainda não concluída")
        
    except Proposal.DoesNotExist:
        print(f"❌ Proposta {proposal_id} não encontrada")
    except Signature.DoesNotExist:
        print(f"❌ Assinatura não encontrada para a proposta {proposal_id}")
    except Exception as e:
        print(f"❌ Erro durante o teste: {str(e)}")

def main():
    parser = argparse.ArgumentParser(description='Testar fluxo de assinatura digital')
    parser.add_argument('--proposal-id', type=int, required=True, help='ID da proposta para testar')
    parser.add_argument('--wait-time', type=int, default=5, help='Tempo de espera entre verificações (segundos)')
    
    args = parser.parse_args()
    test_signature_flow(args.proposal_id, args.wait_time)

if __name__ == "__main__":
    main() 