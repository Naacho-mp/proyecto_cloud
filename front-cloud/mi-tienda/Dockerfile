# Etapa 1: Build (Se descarta al terminar)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Runtime (Lo que realmente sube a AWS)
FROM nginx:alpine
# Copiamos el build al directorio de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Configuración básica para evitar errores 404 en React Router
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
