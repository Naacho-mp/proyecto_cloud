# Configuración Frontend - ECS + ALB

## Resumen de cambios

El frontend ahora:
1. ✅ Nginx solo sirve archivos estáticos (sin proxies internos)
2. ✅ React consume directamente el ALB en producción
3. ✅ Es compatible con desarrollo local y producción AWS ECS
4. ✅ No intenta resolver hostnames que no existen (td-backend)

## Arquitectura

### En Desarrollo Local (Docker Compose)
```
React (localhost:5173 o localhost)
    ↓ (fetch directo)
    ├─ http://localhost:8000/api → FastAPI
    └─ http://localhost:8080/java → Java
```

### En Producción (AWS ECS)
```
React (Frontend ECS Service)
    ↓ (fetch directo al ALB)
ALB (balanceador-carga-1567813537.us-east-1.elb.amazonaws.com)
    ↓ (routing por path)
    ├─ /api/* → Backend FastAPI Service
    └─ /java/* → Java Service
```

## Archivos modificados

### 1. nginx.conf
- ✅ Eliminados todos los proxy_pass internos
- ✅ Solo sirve archivos estáticos React
- ✅ Mantiene health check en /health

### 2. src/servicios/api.js
- ✅ Detecta ambiente (desarrollo vs producción)
- ✅ En desarrollo: `http://localhost:8000/api` y `http://localhost:8080/java`
- ✅ En producción: `http://balanceador-carga-1567813537.us-east-1.elb.amazonaws.com/api` y `/java`

### 3. vite.config.js
- ✅ Expone variables de entorno VITE_API_URL y VITE_WEBPAY_URL

### 4. .env.local, .env.development, .env.production
- ✅ Configuración por ambiente
- ✅ NO incluye en git (está en .gitignore)

### 5. docker-compose.yml
- ✅ Inyecta variables de entorno al frontend
- ✅ Frontend sin proxies internos

## Instrucciones de Deploy

### Desarrollo Local
```bash
cd proyecto_cloud
docker compose up -d
# Frontend: http://localhost
# Llamadas a API: http://localhost:8000/api y http://localhost:8080/java
```

### Producción AWS ECS
1. El ALB DNS es: `balanceador-carga-1567813537.us-east-1.elb.amazonaws.com`
2. El frontend se construirá con variables de producción
3. Las llamadas a API irán directamente al ALB
4. El ALB hace el routing interno a Backend y Java

## Verificación

Antes de hacer push, verifica:

```bash
# 1. En local, verifica que no hay errores de proxy
docker compose up -d
docker compose logs td-frontend | grep -i error

# 2. Verifica que los health checks funcionan
curl http://localhost/health
curl http://localhost:8000/api/health
curl http://localhost:8080/java/health

# 3. En el navegador, verifica que no hay errores CORS
# Abre http://localhost en el navegador
# F12 → Console → No debe haber errores rojos
```

## Variables de Entorno

### Producción (AWS)
```
VITE_API_URL=http://balanceador-carga-1567813537.us-east-1.elb.amazonaws.com/api
VITE_WEBPAY_URL=http://balanceador-carga-1567813537.us-east-1.elb.amazonaws.com/java
```

### Desarrollo
```
VITE_API_URL=http://localhost:8000/api
VITE_WEBPAY_URL=http://localhost:8080/java
```

## Solución de problemas

### "host not found in upstream"
✅ SOLUCIONADO - No hay proxies internos en Nginx

### CORS errors
- Frontend llama directamente al ALB
- ALB debe tener CORS habilitado en Backend

### Frontend no carga
- Verificar que Nginx está sirviendo archivos estáticos correctamente
- Ver logs: `docker compose logs td-frontend`

### APIs no responden
- Verificar que el ALB está recibiendo requests
- Verificar que Backend y Java están healthy
- Ver CloudWatch logs en AWS


