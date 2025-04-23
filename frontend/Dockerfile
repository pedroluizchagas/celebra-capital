# Estágio de build
FROM node:18-alpine AS build

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm install

# Copiar código fonte
COPY . .

# Construir aplicação
RUN npm run build

# Estágio de produção com Nginx
FROM nginx:alpine

# Instalar curl para o healthcheck
RUN apk add --no-cache curl

# Definir variável de ambiente para o backend
ENV BACKEND_URL="https://celebra-capital-backend-production.up.railway.app/api/"

# Copiar arquivos compilados do estágio de build
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuração do Nginx
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Substituir variáveis no arquivo de configuração
RUN sed -i "s|\${BACKEND_URL}|$BACKEND_URL|g" /etc/nginx/conf.d/default.conf

# Criar pasta para health check
RUN mkdir -p /usr/share/nginx/html/health && \
    echo "OK" > /usr/share/nginx/html/health/index.html

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health/ || exit 1

EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"] 