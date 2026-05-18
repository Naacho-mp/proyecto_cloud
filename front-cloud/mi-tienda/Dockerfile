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

# Copiamos configuración nginx completa
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
