# 🧪 TESTING Y VALIDACIÓN - Transbank Webpay Plus

## ✅ VALIDACIONES COMPLETADAS

Todas las correcciones han sido aplicadas exitosamente:

```
✅ CarritoLateral.jsx          - Formulario POST HTML (CRÍTICO)
✅ application.properties      - X-Forwarded headers (CRÍTICO)  
✅ nginx.conf                  - Proxy headers X-Forwarded (ALTO)
✅ WebpayRetorno.jsx           - Lógica simplificada (MEDIO)
```

---

## 🚀 PASO A PASO: TESTING LOCAL

### PASO 1: Recompilar Backend Java

```bash
cd /Users/andresbluna/development/proyecto_cloud/apijava

# Limpiar y recompilar
./mvnw clean package -DskipTests

# El JAR se generará en: target/api-0.0.1-SNAPSHOT.jar
```

**¿Qué hace?**: Recompila el backend Java con la nueva configuración de `server.tomcat.remoteip.*`

**¿Qué esperar?**: 
- Compilación completará sin errores
- Duración: ~1-2 minutos

---

### PASO 2: Reconstruir Docker Images

```bash
cd /Users/andresbluna/development/proyecto_cloud

# Reconstruir TODAS las imágenes
docker-compose build --no-cache

# O individualmente si prefieres:
docker-compose build td-java      # Backend Java
docker-compose build td-frontend  # Frontend React + Nginx
docker-compose build td-backend   # Backend FastAPI
```

**¿Qué hace?**: Construye nuevas imágenes Docker con los cambios

**¿Qué esperar?**:
- `td-java`: ~30 segundos
- `td-frontend`: ~60 segundos  
- `td-backend`: ~20 segundos

---

### PASO 3: Iniciar los servicios

```bash
cd /Users/andresbluna/development/proyecto_cloud

# Detener servicios previos (si están corriendo)
docker-compose down

# Iniciar nuevamente
docker-compose up
```

**¿Qué esperar?**:
```
servicio_fastapi    | INFO:     Uvicorn running on http://0.0.0.0:8000
servicio_webpay_java | 2026-05-18 10:30:45.123  INFO ... Webpay Plus Transaction bean creado
tienda_frontend     | [notice] signal process started
```

---

### PASO 4: Verificar Health Checks

En otra terminal:

```bash
# FastAPI health
curl http://localhost:8000/api/health
# Esperado: {"mensaje":"OK"}

# Java Webpay health  
curl http://localhost:8080/java/health
# Esperado: {"status":"healthy","environment":"aws-production"}

# Frontend health
curl http://localhost/health
# Esperado: 200 OK
```

---

### PASO 5: Testing del Flujo Completo

#### 5.1 Abrir la aplicación

```
http://localhost
```

#### 5.2 Hacer login (crear cuenta si es necesario)

- Email: `test@example.com`
- Password: `password123`

#### 5.3 Agregar productos al carrito

- Click en cualquier producto
- Click "Agregar al Carrito"
- Repetir 2-3 veces

#### 5.4 Abrir el carrito

- Click en el icono del carrito (arriba derecha)
- Deberías ver los productos

#### 5.5 PASO CRÍTICO: Click "Ir a Pagar"

**AQUÍ es donde sucedía el problema antes**

Monitorear:
1. Abrir DevTools (F12) → Console tab
2. Click "Ir a Pagar"
3. **ESPERADO**: Ver logs:
   ```
   [CarritoLateral] Enviando formulario POST a Transbank: https://webpay3gint.transbank.cl/webpayplus/initTransaction
   ```
4. **El navegador debería redirigir a Transbank** (página de pago)

**✅ ÉXITO**: Si ves la pantalla de pago de Transbank con campos de tarjeta

**❌ PROBLEMA**: Si se queda en la misma página o ve error

---

## 🔍 DEBUGGING: Si algo falla

### Problema: No se redirige a Transbank

**Checklist**:

1. ¿Ves el log en consola del navegador?
   ```javascript
   [CarritoLateral] Enviando formulario POST a Transbank
   ```
   - NO → El código no se ejecutó. Revisar que CarritoLateral.jsx tiene `form.submit()`
   - SÍ → Continua al siguiente

2. ¿Ves error en la consola?
   ```
   CORS error / Network error / Mixed content
   ```
   - **CORS error**: El backend Java está rechazando la solicitud. Revisar `CorsConfig.java`
   - **Network error**: Problema de conectividad
   - **Mixed content**: Estás en HTTPS pero llamando HTTP (problema en desarrollo)

3. Revisar logs del backend Java:
   ```bash
   docker logs servicio_webpay_java | grep -i "crear\|create\|transacción"
   ```

4. Simular la solicitud manualmente:
   ```bash
   curl -X POST http://localhost:8080/java/create \
     -H "Content-Type: application/json" \
     -d '{
       "amount": 50000,
       "buyOrder": "TEST-123",
       "sessionId": "test-user",
       "returnUrl": "http://localhost/webpay-retorno"
     }'
   ```
   
   **Esperado**:
   ```json
   {
     "success": true,
     "data": {
       "url": "https://webpay3gint.transbank.cl/webpayplus/initTransaction",
       "token": "....",
       "buyOrder": "TEST-123"
     }
   }
   ```

### Problema: Transbank rechaza la URL

**Checklist**:

1. ¿La URL tiene formato antiguo?
   ```
   ❌ MALO: https://webpay3gint.transbank.cl/webpayserver/init_transaction.cgi
   ✅ BIEN: https://webpay3gint.transbank.cl/webpayplus/initTransaction
   ```

2. ¿El returnUrl es HTTPS?
   ```bash
   # En logs de Java, busca:
   docker logs servicio_webpay_java | grep -i "returnurl"
   
   # Debería ver:
   # https://localhost/webpay-retorno  (desarrollo)
   # https://mi-dominio.com/webpay-retorno  (producción)
   ```

3. ¿Las credenciales de Transbank son correctas?
   ```bash
   # En application.properties verificar:
   # transbank.commerce.code=597055555532
   # transbank.api.key=579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C
   # transbank.environment=INTEGRATION
   ```

### Problema: Después de pagar, retorno vacío

**Checklist**:

1. ¿Transbank está redirigiendo correctamente?
   - El returnUrl debería recibir un POST con `token_ws`

2. Revisar logs:
   ```bash
   docker logs servicio_webpay_java | grep -i "confirm\|commit"
   ```

3. Verificar que WebpayRetorno.jsx extrae el token:
   ```bash
   # En DevTools Console, debería ver:
   # [WebpayRetorno] Token recibido: 01928372ee1a2d9e
   ```

---

## 📊 MATRIZ DE TESTING

### Testing Local - Desktop

| Paso | Acción | Esperado | Status |
|------|--------|----------|--------|
| 1 | Login | ✅ Sesión iniciada | 🔄 |
| 2 | Agregar producto | ✅ Producto en carrito | 🔄 |
| 3 | Click "Ir a Pagar" | ✅ Redirige a Transbank | 🔄 |
| 4 | Ingresa datos tarjeta | ✅ Autoriza pago | 🔄 |
| 5 | Retorna a app | ✅ Muestra éxito | 🔄 |
| 6 | Verifica BD | ✅ Pedido guardado | 🔄 |

### Testing Local - Móvil (Android/Chrome)

| Prueba | Esperado | Status |
|--------|----------|--------|
| Abrir app en móvil | ✅ Funciona responsive | 🔄 |
| Click "Ir a Pagar" | ✅ Transbank abre en APP | 🔄 |
| Retorna a app | ✅ Captura token correctamente | 🔄 |

### Testing AWS

| Componente | Validación | Status |
|-----------|------------|--------|
| ALB | ✅ HTTPS configurado | 🔄 |
| Health Check | ✅ Todos en "healthy" | 🔄 |
| Nginx | ✅ Pasa X-Forwarded headers | 🔄 |
| Spring Boot | ✅ Respeta X-Forwarded-Proto | 🔄 |
| ReturnUrl | ✅ Es HTTPS completo | 🔄 |
| Transbank | ✅ Acepta returnUrl | 🔄 |

---

## 🎯 VERIFICACIÓN DE LOGS

### Logs Importantes en Desarrollo

#### Backend Java - Crear Transacción

```bash
docker logs servicio_webpay_java -f | grep -i "transacción\|create"
```

**Esperado**:
```
INFO com.webpaytest.api.controller.WebpayController : Request para crear transacción recibida
INFO com.webpaytest.api.service.WebpayService : Creando transacción - Orden: ORD-1234567890, Monto: 50000
INFO com.webpaytest.api.service.WebpayService : Transacción creada - Token: 01928372ee1a2d9e
```

#### Backend Java - Confirmar Transacción

```bash
docker logs servicio_webpay_java -f | grep -i "confirm\|commit"
```

**Esperado**:
```
INFO com.webpaytest.api.controller.WebpayController : Request para confirmar transacción recibida
INFO com.webpaytest.api.service.WebpayService : Confirmando transacción - Token: 01928372ee1a2d9e
INFO com.webpaytest.api.service.WebpayService : Transacción confirmada - Orden: ORD-1234567890
```

#### Frontend Console

```javascript
[CarritoLateral] Enviando formulario POST a Transbank: https://webpay3gint.transbank.cl/webpayplus/initTransaction
[WebpayRetorno] Token recibido: 01928372ee1a2d9e
[WebpayRetorno] Confirmando transacción...
[WebpayRetorno] Transacción confirmada exitosamente
```

#### Nginx Access Logs

```bash
docker logs tienda_frontend -f | grep "/java/create"
```

**Esperado**:
```
POST /java/create HTTP/1.1" 201
```

---

## 🚨 CHECKLIST PRE-DEPLOY AWS

Antes de hacer deploy a producción en AWS, verificar:

- [ ] ✅ Testing local completo exitoso
- [ ] ✅ Logs muestran flujo correcto
- [ ] ✅ No hay errores CORS
- [ ] ✅ ReturnUrl es HTTPS
- [ ] ✅ Nginx pasa X-Forwarded headers
- [ ] ✅ Spring Boot respeta headers
- [ ] ✅ Certificate SSL válido en ALB
- [ ] ✅ Security groups permiten 443
- [ ] ✅ Health checks pasan
- [ ] ✅ Credenciales Transbank son correctas
- [ ] ✅ Commerce code es para INTEGRATION (no LIVE)
- [ ] ✅ Base de datos accesible
- [ ] ✅ Todos los secrets configurados

---

## 📞 SOPORTE: Si el problema persiste

1. **Recolectar información**:
   ```bash
   # Logs Java
   docker logs servicio_webpay_java > java-logs.txt
   
   # Logs Nginx
   docker logs tienda_frontend > nginx-logs.txt
   
   # Logs FastAPI
   docker logs servicio_fastapi > fastapi-logs.txt
   ```

2. **Revisar en AWS CloudWatch** (si es en producción):
   - ALB logs
   - ECS logs
   - Application logs

3. **Validar directamente con Transbank**:
   - Contactar al equipo de soporte de Transbank
   - Proporcionar: commerce code, token rechazado, timestamp

4. **Validar en postman**:
   - Crear collection con todas las solicitudes
   - Testing paso a paso

---

## 📚 REFERENCIA RÁPIDA

### Comando Útil: Recrear todo desde cero

```bash
cd /Users/andresbluna/development/proyecto_cloud

# Nuclear option: Eliminar todo y empezar de nuevo
docker-compose down -v
docker system prune -a -f

# Reconstruir
docker-compose build --no-cache

# Iniciar
docker-compose up
```

### Ver logs en tiempo real

```bash
# Java
docker logs -f servicio_webpay_java

# Frontend
docker logs -f tienda_frontend

# FastAPI
docker logs -f servicio_fastapi

# Todos
docker-compose logs -f
```

### Conectarse a contenedor

```bash
# Java
docker exec -it servicio_webpay_java bash

# Frontend
docker exec -it tienda_frontend bash

# FastAPI
docker exec -it servicio_fastapi bash
```

---

**Última actualización**: 2026-05-18  
**Estado**: ✅ LISTO PARA TESTING  
**Próximo paso**: Ejecutar PASO 1 (Recompilar Java)

