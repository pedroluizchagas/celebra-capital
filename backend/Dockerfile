FROM python:3.11.7-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependências do Python
COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

# Copiar código fonte
COPY . .

# Criar diretórios de mídia e logs
RUN mkdir -p /app/media /app/logs /app/staticfiles

# Expor porta
EXPOSE 8000

# Comando para iniciar o servidor
CMD ["gunicorn", "celebra_capital.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120"] 
