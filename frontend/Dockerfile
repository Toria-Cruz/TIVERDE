# Use imagem do Nginx
FROM nginx:alpine

# Remove configuração default do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia o conteúdo da pasta frontend (Dockerfile já está dentro de frontend)
# Copia todo o conteúdo da pasta frontend para o Nginx
COPY . /usr/share/nginx/html/


# Expõe a porta do Nginx
EXPOSE 80

# Nginx já roda automaticamente
CMD ["nginx", "-g", "daemon off;"]
