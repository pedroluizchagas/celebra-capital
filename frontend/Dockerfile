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

# Configuração final com Nginx para servir a aplicação
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 