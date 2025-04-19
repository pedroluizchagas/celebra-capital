#!/bin/sh

# Substitui as variáveis de ambiente nos arquivos JavaScript
for file in /usr/share/nginx/html/assets/*.js; do
  envsubst '${BACKEND_URL}' < $file > $file.tmp
  mv $file.tmp $file
done

# Inicia o Nginx
nginx -g 'daemon off;' 