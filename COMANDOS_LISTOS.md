# 🖥️ COMANDOS LISTOS PARA USAR

Aquí están todos los comandos que necesitas ejecutar, listos para copiar y pegar.

---

## 🚀 PASO 1: Recompilar Backend Java

```bash
cd /Users/andresbluna/development/proyecto_cloud/apijava
./mvnw clean package -DskipTests
```

**Esperado**: Construcción exitosa, JAR generado en `target/api-0.0.1-SNAPSHOT.jar`

---

## 🐳 PASO 2: Reconstruir Docker Images

```bash
cd /Users/andresbluna/development/proyecto_cloud
docker-compose build --no-cache
```

**Esperado**: Todas las imágenes se reconstruyen sin errores

---

## ▶️ PASO 3: Iniciar Servicios

```bash
cd /Users/andresbluna/development/proyecto_cloud
docker-compose down
docker-compose up
```

**Esperado**: Los 3 servicios inician correctamente

```
servicio_fastapi    | INFO:     Uvicorn running on http://0.0.0.0:8000
servicio_webpay_java | ... Webpay Plus Transaction bean creado
tienda_frontend     | [notice] signal process started
```

---

## 🏥 PASO 4: Validar Health Checks

En otra terminal, ejecuta:

```bash
# FastAPI
curl http://localhost:8000/api/health

# Java
curl http://localhost:8080/java/health

# Frontend
curl http://localhost/health
```

**Esperado**: Todas las solicitudes retornan 200 OK

---

## 🧪 PASO 5: Testing Completo

### 5.1 Abrir la aplicación

```bash
# En el navegador:
open http://localhost
```

### 5.2 Testing paso a paso (manual en UI)

```
1. Hacer login (o crear cuenta)
2. Agregar 2-3 productos al carrito
3. Abrir carrito lateral
4. Click "Ir a Pagar"
5. VERIFICAR: Se redirige a Transbank (NO se queda pegado)
6. En Transbank: Complete datos de tarjeta de prueba
   - Tarjeta: 4111111111111111
   - Vencimiento: 12/25
   - CVV: 123
   - RUT: 11111111-1
7. Autorizar pago
8. Retorna a tu app
9. Verificar: Se muestra "¡Pago Exitoso!"
```

---

## 🔍 DEBUGGING: Si algo falla

### Ver logs en tiempo real

```bash
# Terminal 1: Logs Java
docker logs -f servicio_webpay_java

# Terminal 2: Logs Nginx/Frontend
docker logs -f tienda_frontend

# Terminal 3: Logs FastAPI
docker logs -f servicio_fastapi
```

### Buscar errores específicos

```bash
# Errores de Transbank
docker logs servicio_webpay_java | grep -i "error\|exception"

# Logs de creación de transacción
docker logs servicio_webpay_java | grep -i "crear\|create"

# Logs de confirmación
docker logs servicio_webpay_java | grep -i "confirm\|commit"
```

### Conectarse a contenedor

```bash
# Terminal interactiva en Java
docker exec -it servicio_webpay_java bash

# Dentro del contenedor, ver propiedades
cat /app/application.properties | grep remoteip

# Debería ver:
# server.tomcat.remoteip.remote-ip-header=X-Forwarded-For
# server.tomcat.remoteip.protocol-header=X-Forwarded-Proto
# server.tomcat.remoteip.protocol-header-https-value=https
```

### Simular solicitud manualmente

```bash
# Test crear transacción
curl -X POST http://localhost:8080/java/create \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-Proto: https" \
  -H "X-Forwarded-Host: localhost" \
  -d '{
    "amount": 50000,
    "buyOrder": "TEST-123",
    "sessionId": "test-user-123",
    "returnUrl": "https://localhost/webpay-retorno"
  }' | jq .

# Esperado:
# {
#   "success": true,
#   "data": {
#     "url": "https://webpay3gint.transbank.cl/webpayplus/initTransaction",
#     "token": "...",
#     "buyOrder": "TEST-123"
#   }
# }
```

---

## 🧹 LIMPIEZA: Si necesitas empezar de nuevo

```bash
# Detener y eliminar contenedores
docker-compose down

# Eliminar imágenes
docker-compose down --rmi all

# Limpiar volúmenes (CUIDADO: Elimina datos)
docker-compose down -v

# Nuclear: Limpiar todo en Docker
docker system prune -a -f

# Reconstruir desde cero
docker-compose build --no-cache
docker-compose up
```

---

## 📊 VERIFICACIÓN: Todos los cambios aplicados

```bash
cd /Users/andresbluna/development/proyecto_cloud

# 1. CarritoLateral.jsx tiene form.submit()
echo "1. Verificar CarritoLateral.jsx:"
grep -c "form.submit()" front-cloud/mi-tienda/src/componentes/CarritoLateral.jsx
# Esperado: 1

# 2. application.properties tiene X-Forwarded
echo "2. Verificar application.properties:"
grep -c "server.tomcat.remoteip" apijava/src/main/resources/application.properties
# Esperado: 3

# 3. nginx.conf tiene proxy headers
echo "3. Verificar nginx.conf:"
grep -c "X-Forwarded-Proto" front-cloud/mi-tienda/nginx.conf
# Esperado: 2

# 4. WebpayRetorno.jsx usa React Router
echo "4. Verificar WebpayRetorno.jsx:"
grep -c "useNavigate\|useSearchParams" front-cloud/mi-tienda/src/componentes/WebpayRetorno.jsx
# Esperado: 2
```

**Resultado esperado**: Todas las búsquedas encuentran los patrones ✅

---

## 🌐 DEPLOY AWS: Comandos útiles

### Conectarse a AWS

```bash
# Configurar AWS CLI (una sola vez)
aws configure

# Verificar conexión
aws sts get-caller-identity
```

### Actualizar ECR

```bash
# Variables
AWS_ACCOUNT_ID="123456789012"  # Tu account ID
AWS_REGION="us-east-1"

# Login a ECR
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build y push del backend Java
docker build -t proyecto-java:latest apijava/
docker tag proyecto-java:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/proyecto-java:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/proyecto-java:latest

# Build y push del frontend
docker build -t proyecto-frontend:latest front-cloud/mi-tienda/
docker tag proyecto-frontend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/proyecto-frontend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/proyecto-frontend:latest
```

### Actualizar ECS

```bash
# Variables
CLUSTER_NAME="tu-cluster"
SERVICE_NAME_JAVA="tu-servicio-java"
SERVICE_NAME_FRONTEND="tu-servicio-frontend"

# Force new deployment del servicio Java
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME_JAVA \
  --force-new-deployment \
  --region us-east-1

# Force new deployment del frontend
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME_FRONTEND \
  --force-new-deployment \
  --region us-east-1

# Monitorear el deployment
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME_JAVA \
  --region us-east-1
```

### Ver logs en CloudWatch

```bash
# Variables
LOG_GROUP="/ecs/tu-servicio-java"
LOG_STREAM="tu-servicio-java"  # Obtener de CloudWatch

# Ver logs en tiempo real
aws logs tail $LOG_GROUP --follow

# Ver logs de las últimas 24 horas
aws logs tail $LOG_GROUP --since 24h

# Búsqueda de errores
aws logs filter-log-events \
  --log-group-name $LOG_GROUP \
  --filter-pattern "ERROR" \
  --query 'events[*].[timestamp,message]' \
  --output table
```

---

## 📋 CHECKLIST COMPLETO

```bash
# Copiar y pegar este checklist en un archivo:
cat > /tmp/checklist.md << 'EOF'
# Checklist Implementación Transbank Webpay Plus

## Desarrollo Local
- [ ] Paso 1: Recompilar Java
- [ ] Paso 2: Reconstruir Docker
- [ ] Paso 3: Iniciar servicios
- [ ] Paso 4: Validar health checks
- [ ] Paso 5: Testing UI completo

## Validación de Cambios
- [ ] CarritoLateral.jsx contiene form.submit()
- [ ] application.properties tiene server.tomcat.remoteip
- [ ] nginx.conf pasa X-Forwarded headers
- [ ] WebpayRetorno.jsx usa React Router hooks

## Testing Funcional
- [ ] Login funciona
- [ ] Carrito funciona
- [ ] Agregar productos funciona
- [ ] Click "Ir a Pagar" redirige a Transbank
- [ ] Pago en Transbank funciona
- [ ] Retorno a app funciona
- [ ] Pago se registra en BD
- [ ] Página de éxito se muestra

## AWS Deployment (si aplica)
- [ ] Build ECR exitoso
- [ ] Push a repositorio
- [ ] Update ECS service
- [ ] Health checks pasan
- [ ] Logs sin errores
- [ ] Testing en AWS

## Post-Deploy
- [ ] Monitorear durante 24 horas
- [ ] Validar métricas CloudWatch
- [ ] Verificar sin errores en logs
- [ ] Testing con pagos reales
EOF

# Ver el checklist
cat /tmp/checklist.md
```

---

## 🆘 SOPORTE RÁPIDO

### Error: "Connection refused"

```bash
# Verificar que los servicios están corriendo
docker ps -a

# Esperado: ver 3 contenedores corriendo
# td-backend, td-java, td-frontend
```

### Error: "CORS error" en console

```bash
# Verificar CORS config en Java
docker exec servicio_webpay_java cat \
  /app/src/main/java/com/webpaytest/api/config/CorsConfig.java

# Debería tener:
# .allowedOrigins("*")
# .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
```

### Error: "Mixed content"

```bash
# Esto ocurre si mezclas HTTP y HTTPS
# En desarrollo: Todo debe ser HTTP
# En AWS: Todo debe ser HTTPS
# Verificar que el returnUrl coincide con el protocolo
```

### Error: "Invalid token"

```bash
# Verificar que las credenciales son correctas
docker exec servicio_webpay_java cat \
  /app/src/main/resources/application.properties | grep transbank

# Debería ver:
# transbank.commerce.code=597055555532
# transbank.api.key=579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C
# transbank.environment=INTEGRATION
```

---

## 📞 Contactos útiles

- **Transbank Developers**: https://www.transbank.cl/developers/webpay
- **Transbank Support**: support@transbank.cl
- **SDK Java GitHub**: https://github.com/TransbankDevelopers/transbank-sdk-java
- **AWS Documentation**: https://docs.aws.amazon.com

---

## 🎓 Tips útiles

```bash
# Ver todos los logs a la vez con colores
docker-compose logs -f --timestamps

# Guardar logs en archivo para análisis
docker-compose logs > /tmp/all-logs.txt 2>&1

# Monitor de recursos (CPU, memoria)
docker stats

# Actualizar solo una imagen
docker-compose build td-java
docker-compose up td-java

# Bash en contenedor
docker-compose exec td-java bash

# Limpiar sin eliminar datos
docker-compose stop
docker-compose start

# Reiniciar solo un servicio
docker-compose restart td-java
```

---

**Última actualización**: 2026-05-18  
**Status**: ✅ LISTO PARA USAR  
**Próximo paso**: Ejecutar PASO 1

