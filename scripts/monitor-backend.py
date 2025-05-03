#!/usr/bin/env python3
"""
Script de Monitoramento de Performance do Backend
Celebra Capital - Plataforma de Pré-Análise de Crédito

Este script monitora métricas de performance do backend e registra em um banco de dados
de séries temporais (InfluxDB) para posterior análise com Grafana.
"""

import os
import time
import json
import logging
import signal
import sys
import requests
import psutil
import argparse
from datetime import datetime
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
from django.db import connection
from functools import wraps
import statistics
import django
import prometheus_client

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("backend_monitor.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Variáveis globais
INFLUXDB_URL = os.environ.get("INFLUXDB_URL", "http://localhost:8086")
INFLUXDB_TOKEN = os.environ.get("INFLUXDB_TOKEN", "")
INFLUXDB_ORG = os.environ.get("INFLUXDB_ORG", "celebra_capital")
INFLUXDB_BUCKET = os.environ.get("INFLUXDB_BUCKET", "metrics")
API_BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:8000")
CHECK_INTERVAL = int(os.environ.get("CHECK_INTERVAL", "60"))  # segundos
API_ENDPOINTS = [
    "/api/v1/saude",
    "/api/v1/propostas",
    "/api/v1/usuarios/me",
    "/api/v1/status-ocr",
]
DJANGO_SETTINGS_MODULE = os.environ.get("DJANGO_SETTINGS_MODULE", "celebra_capital.settings")
PROMETHEUS_PORT = int(os.environ.get("PROMETHEUS_PORT", "9090"))

# Endpoints críticos que devem ser monitorados com mais frequência
CRITICAL_ENDPOINTS = [
    "/api/v1/propostas/nova",
    "/api/v1/ocr",
    "/api/v1/assinatura",
]

# Métricas Prometheus
prom_http_requests = prometheus_client.Counter(
    'http_requests_total', 'Total de requisições HTTP', ['method', 'endpoint', 'status']
)
prom_http_request_duration = prometheus_client.Histogram(
    'http_request_duration_seconds', 'Duração das requisições HTTP',
    ['method', 'endpoint'], buckets=(0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10)
)
prom_db_queries = prometheus_client.Counter(
    'db_queries_total', 'Total de consultas ao banco de dados', ['query_type']
)
prom_db_query_duration = prometheus_client.Histogram(
    'db_query_duration_seconds', 'Duração das consultas ao banco de dados', 
    ['query_type'], buckets=(0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1)
)
prom_system_metrics = prometheus_client.Gauge(
    'system_resource_usage', 'Uso de recursos do sistema',
    ['resource_type']
)

class BackendMonitor:
    """Classe para monitoramento de métricas de performance do backend"""
    
    def __init__(self):
        self.influx_client = self._create_influx_client()
        self.write_api = self.influx_client.write_api(write_options=SYNCHRONOUS)
        self.setup_django()
        self.setup_prometheus()
        self.running = True
        self.api_token = None
        
    def _create_influx_client(self):
        """Cria cliente InfluxDB"""
        try:
            return InfluxDBClient(
                url=INFLUXDB_URL,
                token=INFLUXDB_TOKEN,
                org=INFLUXDB_ORG
            )
        except Exception as e:
            logger.error(f"Erro ao criar cliente InfluxDB: {e}")
            return None
    
    def setup_django(self):
        """Configura Django para acesso ao banco de dados"""
        try:
            os.environ.setdefault("DJANGO_SETTINGS_MODULE", DJANGO_SETTINGS_MODULE)
            django.setup()
            logger.info("Django configurado com sucesso")
        except Exception as e:
            logger.error(f"Erro ao configurar Django: {e}")
    
    def setup_prometheus(self):
        """Inicia servidor Prometheus para métricas"""
        try:
            prometheus_client.start_http_server(PROMETHEUS_PORT)
            logger.info(f"Servidor Prometheus iniciado na porta {PROMETHEUS_PORT}")
        except Exception as e:
            logger.error(f"Erro ao iniciar servidor Prometheus: {e}")
    
    def authenticate(self):
        """Obtém token de autenticação para API"""
        try:
            response = requests.post(
                f"{API_BASE_URL}/api/v1/auth/login",
                json={
                    "username": os.environ.get("API_USERNAME", "monitor"),
                    "password": os.environ.get("API_PASSWORD", "monitor_pwd")
                }
            )
            
            if response.status_code == 200:
                self.api_token = response.json().get("token")
                logger.info("Autenticação na API realizada com sucesso")
                return True
            else:
                logger.error(f"Erro na autenticação: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            logger.error(f"Erro ao autenticar: {e}")
            return False
    
    def get_headers(self):
        """Retorna cabeçalhos HTTP para requisições autenticadas"""
        if not self.api_token:
            self.authenticate()
            
        return {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json"
        }
    
    def check_api_endpoint(self, endpoint, method="GET", data=None):
        """Verifica tempo de resposta de um endpoint da API"""
        url = f"{API_BASE_URL}{endpoint}"
        start_time = time.time()
        
        try:
            if method == "GET":
                response = requests.get(url, headers=self.get_headers(), timeout=10)
            elif method == "POST":
                response = requests.post(url, headers=self.get_headers(), json=data, timeout=10)
            else:
                logger.error(f"Método não suportado: {method}")
                return None, None
            
            elapsed_time = time.time() - start_time
            
            # Registrar métricas Prometheus
            prom_http_requests.labels(method=method, endpoint=endpoint, status=response.status_code).inc()
            prom_http_request_duration.labels(method=method, endpoint=endpoint).observe(elapsed_time)
            
            return {
                "status_code": response.status_code,
                "elapsed_time": elapsed_time,
                "response_size": len(response.content),
                "timestamp": datetime.utcnow().isoformat()
            }, response
            
        except requests.RequestException as e:
            logger.error(f"Erro na requisição para {url}: {e}")
            prom_http_requests.labels(method=method, endpoint=endpoint, status="error").inc()
            return {
                "status_code": 0,
                "elapsed_time": time.time() - start_time,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }, None
    
    def check_db_performance(self):
        """Verifica tempo de execução de consultas típicas ao banco de dados"""
        if not hasattr(connection, 'cursor'):
            logger.error("Conexão com o banco de dados não disponível")
            return None
        
        queries = [
            ("select_count", "SELECT COUNT(*) FROM auth_user"),
            ("select_limit", "SELECT id FROM auth_user LIMIT 5"),
            ("complex_join", "SELECT p.id, u.email FROM proposta_proposta p JOIN auth_user u ON p.usuario_id = u.id LIMIT 10")
        ]
        
        results = {}
        
        for query_name, query in queries:
            try:
                with connection.cursor() as cursor:
                    start_time = time.time()
                    cursor.execute(query)
                    rows = cursor.fetchall()
                    elapsed_time = time.time() - start_time
                    
                    # Registrar métricas Prometheus
                    prom_db_queries.labels(query_type=query_name).inc()
                    prom_db_query_duration.labels(query_type=query_name).observe(elapsed_time)
                    
                    results[query_name] = {
                        "elapsed_time": elapsed_time,
                        "rows_returned": len(rows),
                        "timestamp": datetime.utcnow().isoformat()
                    }
            except Exception as e:
                logger.error(f"Erro ao executar consulta '{query_name}': {e}")
                results[query_name] = {
                    "error": str(e),
                    "timestamp": datetime.utcnow().isoformat()
                }
        
        return results
    
    def check_system_metrics(self):
        """Coleta métricas do sistema operacional"""
        metrics = {
            "cpu_percent": psutil.cpu_percent(interval=1),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_percent": psutil.disk_usage('/').percent,
            "open_file_descriptors": len(psutil.Process().open_files()) if hasattr(psutil.Process(), 'open_files') else 0,
            "connections": len(psutil.Process().connections()) if hasattr(psutil.Process(), 'connections') else 0,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Registrar métricas Prometheus
        for key, value in metrics.items():
            if key != "timestamp":
                prom_system_metrics.labels(resource_type=key).set(value)
        
        return metrics
    
    def write_to_influxdb(self, measurement, tags, fields):
        """Escreve métricas para o InfluxDB"""
        if not self.write_api:
            logger.error("Cliente InfluxDB não está disponível")
            return False
        
        try:
            point = Point(measurement)
            
            # Adicionar tags
            for tag_name, tag_value in tags.items():
                point = point.tag(tag_name, tag_value)
            
            # Adicionar campos
            for field_name, field_value in fields.items():
                if isinstance(field_value, bool):
                    point = point.field(field_name, field_value)
                elif isinstance(field_value, (int, float)):
                    point = point.field(field_name, field_value)
                elif isinstance(field_value, str):
                    point = point.field(field_name, field_value)
            
            self.write_api.write(bucket=INFLUXDB_BUCKET, record=point)
            return True
        except Exception as e:
            logger.error(f"Erro ao escrever no InfluxDB: {e}")
            return False
    
    def run_monitoring_cycle(self):
        """Executa um ciclo completo de monitoramento"""
        logger.info("Iniciando ciclo de monitoramento")
        
        # Verificar endpoints da API
        for endpoint in API_ENDPOINTS + CRITICAL_ENDPOINTS:
            result, response = self.check_api_endpoint(endpoint)
            if result:
                self.write_to_influxdb(
                    measurement="api_performance",
                    tags={"endpoint": endpoint, "method": "GET"},
                    fields={
                        "status_code": result.get("status_code", 0),
                        "elapsed_time": result.get("elapsed_time", 0),
                        "response_size": result.get("response_size", 0),
                    }
                )
        
        # Verificar performance do banco de dados
        db_results = self.check_db_performance()
        if db_results:
            for query_name, result in db_results.items():
                if "error" not in result:
                    self.write_to_influxdb(
                        measurement="db_performance",
                        tags={"query_type": query_name},
                        fields={
                            "elapsed_time": result.get("elapsed_time", 0),
                            "rows_returned": result.get("rows_returned", 0),
                        }
                    )
        
        # Verificar métricas do sistema
        system_metrics = self.check_system_metrics()
        if system_metrics:
            self.write_to_influxdb(
                measurement="system_metrics",
                tags={"host": os.environ.get("HOSTNAME", "localhost")},
                fields={
                    "cpu_percent": system_metrics.get("cpu_percent", 0),
                    "memory_percent": system_metrics.get("memory_percent", 0),
                    "disk_percent": system_metrics.get("disk_percent", 0),
                    "open_file_descriptors": system_metrics.get("open_file_descriptors", 0),
                    "connections": system_metrics.get("connections", 0),
                }
            )
        
        logger.info("Ciclo de monitoramento concluído")
    
    def stop(self):
        """Para o monitoramento"""
        self.running = False
        logger.info("Parando o monitoramento...")
    
    def start(self):
        """Inicia o monitoramento contínuo"""
        logger.info(f"Iniciando monitoramento (intervalo: {CHECK_INTERVAL}s)")
        
        if not self.authenticate():
            logger.error("Não foi possível autenticar. Encerrando.")
            return
        
        # Registrar handler de sinais para parada graciosa
        signal.signal(signal.SIGINT, lambda sig, frame: self.stop())
        signal.signal(signal.SIGTERM, lambda sig, frame: self.stop())
        
        try:
            while self.running:
                self.run_monitoring_cycle()
                time.sleep(CHECK_INTERVAL)
        except Exception as e:
            logger.error(f"Erro durante monitoramento: {e}")
        finally:
            if self.influx_client:
                self.influx_client.close()
            logger.info("Monitoramento encerrado")

def parse_args():
    """Processa argumentos de linha de comando"""
    parser = argparse.ArgumentParser(description="Monitor de Performance do Backend Celebra Capital")
    parser.add_argument("--interval", type=int, default=CHECK_INTERVAL,
                      help=f"Intervalo de verificação em segundos (padrão: {CHECK_INTERVAL})")
    parser.add_argument("--influxdb", default=INFLUXDB_URL,
                      help=f"URL do InfluxDB (padrão: {INFLUXDB_URL})")
    parser.add_argument("--prometheus-port", type=int, default=PROMETHEUS_PORT,
                      help=f"Porta para servidor Prometheus (padrão: {PROMETHEUS_PORT})")
    parser.add_argument("--api-url", default=API_BASE_URL,
                      help=f"URL base da API (padrão: {API_BASE_URL})")
    parser.add_argument("--once", action="store_true",
                      help="Executar apenas um ciclo de monitoramento e sair")
    return parser.parse_args()

if __name__ == "__main__":
    args = parse_args()
    
    # Atualizar configurações a partir dos argumentos
    CHECK_INTERVAL = args.interval
    INFLUXDB_URL = args.influxdb
    PROMETHEUS_PORT = args.prometheus_port
    API_BASE_URL = args.api_url
    
    monitor = BackendMonitor()
    
    if args.once:
        monitor.run_monitoring_cycle()
    else:
        monitor.start() 