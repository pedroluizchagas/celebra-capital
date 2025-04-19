# Estágio de build
FROM node:18-alpine AS build

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci

# Copiar código fonte
COPY . .

# Construir aplicação
RUN npm run build

# Estágio de produção com Nginx
FROM nginx:alpine

# Instalar gettext (para envsubst)
RUN apk add --no-cache gettext

# Copiar arquivos compilados do estágio de build
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copiar script de entrypoint
COPY entrypoint.sh /
RUN chmod +x /entrypoint.sh

EXPOSE 80

CMD ["/entrypoint.sh"] 