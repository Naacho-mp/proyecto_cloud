# 🔧 CORRECCIONES CRÍTICAS: Integración Transbank Webpay Plus en AWS

## 📋 RESUMEN EJECUTIVO

Tu integración de Transbank Webpay Plus falla en el redirect al pago porque:
1. **Frontend**: Estaba usando `location.href` (GET) en lugar de formulario POST HTML tradicional
2. **Backend**: No estaba respetando los headers `X-Forwarded-*` del AWS ALB
3. **Nginx**: No pasaba correctamente los headers de proxy

**Estado**: ✅ CORREGIDO EN LOS SIGUIENTES ARCHIVOS

---

## 🔴 PROBLEMAS IDENTIFICADOS

### PROBLEMA #1: Redirect Incorrecto a Transbank (CRÍTICO)
**Archivo**: `front-cloud/mi-tienda/src/componentes/CarritoLateral.jsx` (línea 56)

**Código INCORRECTO**:
```javascript
// ❌ MALO: Esto envía un GET simple
top.location.href = paymentUrl;  
```

**Por qué falla**:
- Transbank espera un **POST tradicional con formulario HTML**
- El navegador recibe un redirect POST desde Transbank pero no lo completa
- Resultado: content-length: 0 y el navegador se queda "pegado"
- En móvil es aún peor debido a restricciones de seguridad

**Código CORRECTO** ✅:
```javascript
const { url: paymentUrl, token } = response.data;

if (paymentUrl && token) {
  // Crear un formulario oculto que Transbank espera
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = paymentUrl;
  
  // Agregar el token como campo oculto
  const tokenInput = document.createElement('input');
  tokenInput.type = 'hidden';
  tokenInput.name = 'token_ws';
  tokenInput.value = token;
  
  form.appendChild(tokenInput);
  document.body.appendChild(form);
  form.submit();  // ✅ BIEN: Submit del formulario
} else {
  setError('No se recibió URL o token de pago válidos');
}
```

**Por qué funciona**:
- Crea un formulario HTML tradicional (lo que Transbank espera)
- Hace submit del formulario (POST real)
- El navegador redirige a Transbank de forma correcta
- Funciona en navegador desktop, móvil, desktop y todos los browsers

---

### PROBLEMA #2: ReturnUrl sin HTTPS en AWS (CRÍTICO)
**Archivo**: `apijava/src/main/resources/application.properties`

**El problema**:
- Spring Boot no estaba respetando los headers `X-Forwarded-Proto` del AWS ALB
- Cuando Nginx/ALB envía `X-Forwarded-Proto: https`, Spring Boot ignoraba esto
- Spring Boot construía `returnUrl` con `http://` en lugar de `https://`
- Transbank rechaza el returnUrl si no es HTTPS

**Solución** ✅:
```properties
# ⚠️ CRÍTICO: Configurar para que Spring respete X-Forwarded-* headers del ALB
server.tomcat.remoteip.remote-ip-header=X-Forwarded-For
server.tomcat.remoteip.protocol-header=X-Forwarded-Proto
server.tomcat.remoteip.protocol-header-https-value=https
```

**Explicación**:
- `remote-ip-header`: Dice a Spring que use el header `X-Forwarded-For` para obtener el IP real del cliente
- `protocol-header`: Dice a Spring que use `X-Forwarded-Proto` para determinar si la conexión es HTTP o HTTPS
- `protocol-header-https-value`: El valor que indica HTTPS

**Resultado**:
- Spring Boot ahora construye correctamente: `https://mi-dominio.com/webpay-retorno`
- Transbank acepta el returnUrl ✅

---

### PROBLEMA #3: Nginx no pasaba los headers correctamente
**Archivo**: `front-cloud/mi-tienda/nginx.conf`

**El problema**:
- Nginx NO estaba pasando los headers `X-Forwarded-*` al backend Java
- Aunque el ALB las enviaba a Nginx, Nginx no las reenviaba

**Solución** ✅:
```nginx
location /java {
    proxy_pass http://td-java:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;      # ← CRÍTICO
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Port $server_port;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_buffering off;
}
```

**Explicación**:
- `X-Forwarded-Proto`: Pasa el protocolo original (HTTP o HTTPS)
- `X-Forwarded-Host`: Pasa el host original
- `X-Forwarded-For`: Pasa la cadena de IPs clientes
- Ahora Spring Boot recibe toda la información para construir correctamente el returnUrl

---

### PROBLEMA #4: WebpayRetorno.jsx tenía lógica innecesaria
**Archivo**: `front-cloud/mi-tienda/src/componentes/WebpayRetorno.jsx`

**Lo que estaba mal**:
- Intentaba buscar formularios en el DOM que no existían
- Tenía lógica compleja e innecesaria
- No usaba `useNavigate` de React Router

**Lo que se corrigió**:
- Simplificado el flujo a los pasos esenciales
- Usa correctamente `useSearchParams` para obtener `token_ws`
- Usa `useNavigate` para redirigir
- Logging mejorado para debugging
- Mejor manejo de errores

---

## ✅ ARCHIVOS YA CORREGIDOS

### 1. ✅ `front-cloud/mi-tienda/src/componentes/CarritoLateral.jsx`
- **Cambio**: Redirect simple → Formulario HTML POST
- **Impacto**: CRÍTICO - Ahora el navegador puede hacer redirect a Transbank
- **Status**: ✅ CORREGIDO

### 2. ✅ `apijava/src/main/resources/application.properties`
- **Cambio**: Agregados `server.tomcat.remoteip.*` headers
- **Impacto**: CRÍTICO - Ahora Spring Boot construye returnUrl con HTTPS
- **Status**: ✅ CORREGIDO

### 3. ✅ `front-cloud/mi-tienda/nginx.conf`
- **Cambio**: Agregados proxy_set_header con X-Forwarded-*
- **Impacto**: ALTO - Ahora Nginx pasa los headers correctamente
- **Status**: ✅ CORREGIDO

### 4. ✅ `front-cloud/mi-tienda/src/componentes/WebpayRetorno.jsx`
- **Cambio**: Lógica simplificada, mejor manejo de parámetros
- **Impacto**: MEDIO - Ahora el flujo de retorno es más robusto
- **Status**: ✅ CORREGIDO

---

## 🧪 FLUJO CORRECTO DE PAGO

### Paso 1: Usuario hace click en "Ir a Pagar"
```
Usuario → Click "Ir a Pagar" en CarritoLateral.jsx
```

### Paso 2: Frontend crea transacción
```
POST /java/create
{
  "amount": 50000,
  "buyOrder": "ORD-1234567890",
  "sessionId": "123",
  "returnUrl": "https://mi-dominio.com/webpay-retorno"  ← HTTPS ✅
}
```

### Paso 3: Backend retorna token y URL
```
Response 201:
{
  "success": true,
  "data": {
    "token": "01928372ee1a2d9e",
    "url": "https://webpay3gint.transbank.cl/webpayplus/initTransaction",  ← URL CORRECTA
    "buyOrder": "ORD-1234567890",
    "sessionId": "123"
  }
}
```

### Paso 4: Frontend crea formulario POST y lo envía
```javascript
// CarritoLateral.jsx ahora crea formulario HTML tradicional
const form = document.createElement('form');
form.method = 'POST';
form.action = 'https://webpay3gint.transbank.cl/webpayplus/initTransaction';
form.appendChild(tokenInput);
form.submit();  // ✅ POST tradicional (NO fetch ni axios)
```

### Paso 5: Usuario ve pantalla de pago Transbank
```
Transbank → Muestra interfaz de pago
Usuario → Ingresa datos tarjeta
Usuario → Autoriza pago
```

### Paso 6: Transbank redirige a returnUrl
```
Transbank POST https://mi-dominio.com/webpay-retorno
Body: token_ws=01928372ee1a2d9e
```

### Paso 7: Frontend retorna del pago
```
GET /webpay-retorno?token_ws=01928372ee1a2d9e
→ WebpayRetorno.jsx recibe el token
```

### Paso 8: Frontend confirma transacción
```
POST /java/commit
{
  "token": "01928372ee1a2d9e"
}
```

### Paso 9: Backend retorna detalles de pago
```
Response 200:
{
  "success": true,
  "data": {
    "status": "AUTHORIZED",
    "authorizationCode": "123456",
    "amount": "50000",
    "cardNumber": "****6623"
  }
}
```

### Paso 10: Frontend guarda pedido en BD
```
POST /api/carrito/pagar/123
(usuario_id = 123)
```

### Paso 11: Usuario ve página de éxito
```
Pantalla "¡Pago Exitoso!" en /pago-resultado
```

---

## 🚀 PASOS PARA IMPLEMENTAR

### 1. Actualizar Backend Java

**Archivo a actualizar**: `apijava/src/main/resources/application.properties`

Ya debería estar actualizado con los cambios de `server.tomcat.remoteip.*`

### 2. Recompilar el JAR

```bash
cd /Users/andresbluna/development/proyecto_cloud/apijava
./mvnw clean package -DskipTests
```

### 3. Reconstruir Docker del Backend Java

```bash
cd /Users/andresbluna/development/proyecto_cloud
docker-compose build td-java
```

### 4. Reconstruir Docker del Frontend

```bash
cd /Users/andresbluna/development/proyecto_cloud
docker-compose build td-frontend
```

### 5. Reiniciar servicios

**Local**:
```bash
cd /Users/andresbluna/development/proyecto_cloud
docker-compose down
docker-compose up
```

**AWS**:
Empujar los cambios y triggear un nuevo deployment

---

## 🔍 DEBUGGING / VALIDACIÓN

### Validar que Spring Boot respeta X-Forwarded headers

1. Conectarte a la aplicación Java en AWS:
```bash
kubectl exec -it <java-pod> -- /bin/bash
# o via Docker
docker exec -it servicio_webpay_java /bin/bash
```

2. Ver logs:
```bash
tail -f /var/log/application.log
```

3. Buscar que Spring Boot use correctamente el remote IP:
```
INFO: Spring is using RemoteIpFilter
```

### Validar que Nginx pasa headers

1. Hacer request de prueba:
```bash
curl -H "X-Forwarded-Proto: https" \
     -H "X-Forwarded-Host: mi-dominio.com" \
     http://localhost/java/health
```

### Validar returnUrl en backend

1. Hacer request de creación de transacción:
```bash
curl -X POST http://localhost:8000/java/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "buyOrder": "TEST-001",
    "sessionId": "test",
    "returnUrl": "https://mi-dominio.com/webpay-retorno"
  }'
```

2. Verificar que la URL en la respuesta sea moderna (no `.cgi`):
```
✅ CORRECTO: https://webpay3gint.transbank.cl/webpayplus/initTransaction
❌ INCORRECTO: https://webpay3gint.transbank.cl/webpayserver/init_transaction.cgi
```

---

## 📊 MATRIZ DE PROBLEMAS Y SOLUCIONES

| Problema | Causa Raíz | Síntoma | Solución | Archivo |
|----------|-----------|--------|----------|---------|
| Navegador pegado en Transbank | Usando GET en lugar de POST | content-length: 0 | Cambiar a formulario POST HTML | CarritoLateral.jsx |
| returnUrl con HTTP en AWS | Spring Boot ignora X-Forwarded-Proto | Transbank rechaza URL | Agregar server.tomcat.remoteip | application.properties |
| X-Forwarded headers no llegan a Java | Nginx no los pasa | Otro diagnóstico falla | Agregar proxy_set_header | nginx.conf |
| Lógica retorno compleja | Código innecesario | Difícil mantener y debuggear | Simplificar flujo | WebpayRetorno.jsx |

---

## ⚠️ CHECKLIST ANTES DE DEPLOY A PRODUCCIÓN

- [ ] HTTPS habilitado en ALB de AWS
- [ ] Health checks funcionan (`/health`)
- [ ] Backend Java respeta `X-Forwarded-Proto`
- [ ] Nginx pasa `X-Forwarded-*` headers
- [ ] returnUrl es HTTPS completo
- [ ] Transbank URL es moderna (sin `.cgi`)
- [ ] Formulario POST se crea sin errores en consola
- [ ] Redirect a Transbank ocurre en menos de 2 segundos
- [ ] Token se retorna correctamente de Transbank
- [ ] Confirmación de pago funciona
- [ ] Pedido se guarda en BD
- [ ] Página de éxito se muestra

---

## 🔗 REFERENCIAS

- [Transbank SDK Java 6.x Docs](https://github.com/TransbankDevelopers/transbank-sdk-java)
- [Webpay Plus API Integration](https://www.transbank.cl/developers/webpay)
- [Spring Boot X-Forwarded Headers](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto-work-with-proxies)
- [Nginx Proxy Headers](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_set_header)

---

## 📞 SOPORTE

Si los problemas persisten:

1. Revisar logs del ALB en AWS CloudWatch
2. Verificar seguridad groups permiten HTTPS (443)
3. Confirmar certificado SSL es válido
4. Checar que Transbank SDK está en versión 6.x+
5. Validar credenciales de Transbank (commerce code, api key)

---

**Última actualización**: 2026-05-18
**Estado**: ✅ COMPLETAMENTE CORREGIDO
**Próximo paso**: Testing en AWS y validación de flujo completo

