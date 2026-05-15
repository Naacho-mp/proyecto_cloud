# Guía de Instalación y Pruebas

## Instalación y Setup

### 1. Requisitos Previos

- **Java 17** o superior instalado
- **Maven 3.8.1** o superior
- **Git** (opcional)
- **curl** o **Postman** para probar endpoints

Verificar versiones:
```bash
java -version
mvn -version
```

### 2. Clonar o Descargar el Proyecto

```bash
# Si está en Git
git clone <repository-url>
cd api

# O simplemente navega a la carpeta del proyecto
cd /Users/andresbluna/development/api
```

### 3. Compilar el Proyecto

```bash
# Limpiar y compilar
mvn clean install

# O solo compilar sin tests
mvn clean install -DskipTests
```

**Salida esperada al final**:
```
[INFO] BUILD SUCCESS
[INFO] Total time:  XX.XXXs
[INFO] Finished at: 2026-05-14T10:30:45.123456
```

Si hay errores, verificar:
1. Java 17 está instalado correctamente
2. Maven está en el PATH
3. Conectividad a internet (para descargar dependencias)
4. El archivo `pom.xml` está íntegro

### 4. Ejecutar la Aplicación

#### Opción A: Con Maven
```bash
mvn spring-boot:run
```

#### Opción B: Con Java directamente (después de compilar)
```bash
java -jar target/api-0.0.1-SNAPSHOT.jar
```

**Salida esperada**:
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::               (v4.0.6)

2026-05-14T10:30:45.123456 INFO  ApiApplication - Starting ApiApplication v0.0.1-SNAPSHOT using Java 17.0.x with PID 12345
2026-05-14T10:30:45.234567 INFO  ApiApplication - No active profile set, falling back to 1 default profile: "default"
2026-05-14T10:30:45.567890 INFO  WebpayConfig - Inicializando Webpay Plus con Commerce Code: 597055555532
2026-05-14T10:30:45.678901 INFO  WebpayConfig - Ambiente: INTEGRATION
2026-05-14T10:30:45.789012 INFO  WebpayConfig - Webpay Plus configurado correctamente
2026-05-14T10:30:46.890123 INFO  ApiApplication - Started ApiApplication in 1.234 seconds (process running for 1.567)
```

**La API está lista cuando ves**:
```
Started ApiApplication in X.XXX seconds
```

### 5. Verificar que está funcionando

En otra terminal:
```bash
curl http://localhost:8080/api/health
```

Deberías recibir:
```json
{
  "success": true,
  "message": "API está funcionando correctamente",
  "data": "API running",
  "timestamp": "2026-05-14T10:30:45.123456"
}
```

---

## Pruebas Completas

### Test 1: Health Check
```bash
curl -X GET http://localhost:8080/api/health
```

### Test 2: Información de la API
```bash
curl -X GET http://localhost:8080/api/info
```

### Test 3: Crear Transacción
```bash
curl -X POST http://localhost:8080/api/webpay/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "buyOrder": "ORD-'$(date +%s)'",
    "sessionId": "SES-'$(date +%s)'",
    "returnUrl": "http://localhost:3000/callback"
  }'
```

Copiar el `token` de la respuesta para los siguientes tests.

### Test 4: Consultar Estado
```bash
curl -X POST http://localhost:8080/api/webpay/status \
  -H "Content-Type: application/json" \
  -d '{
    "token": "PEGAR_TOKEN_AQUI"
  }'
```

### Test 5: Confirmar Transacción
```bash
curl -X POST http://localhost:8080/api/webpay/commit \
  -H "Content-Type: application/json" \
  -d '{
    "token": "PEGAR_TOKEN_AQUI"
  }'
```

### Test 6: Reembolsar
```bash
curl -X POST http://localhost:8080/api/webpay/refund \
  -H "Content-Type: application/json" \
  -d '{
    "token": "PEGAR_TOKEN_AQUI"
  }'
```

### Test con Script Automatizado

```bash
# Hacer el script ejecutable
chmod +x test-api.sh

# Ejecutar pruebas
./test-api.sh
```

---

## Pruebas en Postman

### 1. Importar Colección

Crear nueva carpeta "Webpay Plus API" en Postman

### 2. Crear Requests

#### Request: Health Check
- **Método**: GET
- **URL**: `http://localhost:8080/api/health`

#### Request: Crear Transacción
- **Método**: POST
- **URL**: `http://localhost:8080/api/webpay/create`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "amount": 50000,
  "buyOrder": "ORD-12345",
  "sessionId": "SES-12345",
  "returnUrl": "http://localhost:3000/callback"
}
```

#### Request: Confirmar Transacción
- **Método**: POST
- **URL**: `http://localhost:8080/api/webpay/commit`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "token": "{{token}}"
}
```

#### Request: Consultar Estado
- **Método**: POST
- **URL**: `http://localhost:8080/api/webpay/status`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "token": "{{token}}"
}
```

#### Request: Reembolsar
- **Método**: POST
- **URL**: `http://localhost:8080/api/webpay/refund`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "token": "{{token}}"
}
```

### 3. Usar Variables en Postman

Después de crear una transacción:
1. En la pestaña "Tests" del request "Crear Transacción", agregar:
```javascript
var jsonData = pm.response.json();
pm.environment.set("token", jsonData.data.token);
pm.environment.set("buyOrder", jsonData.data.buyOrder);
```

2. Ahora puedes usar `{{token}}` en otros requests

---

## Configuración de Credenciales

### Ambiente Integration (Actual)

En `src/main/resources/application.properties`:
```properties
webpay.commerce-code=597055555532
webpay.api-key=579B532A7440BB0C9079DED94D31EA1615BACEB7
webpay.environment=INTEGRATION
```

### Cambiar a Producción (Cuando esté listo)

```properties
webpay.commerce-code=TUS_DATOS_AQUI
webpay.api-key=TUS_DATOS_AQUI
webpay.environment=PRODUCTION
```

**Importante**: 
- Nunca commitear credenciales de producción a Git
- Usar variables de entorno o archivos externalizados
- Las credenciales de integración son públicas/de prueba

---

## Troubleshooting

### Error: "Could not find main class"
```
Error: Could not find or load main class com.webpaytest.api.ApiApplication
```

**Solución**:
```bash
# Limpiar y compilar de nuevo
mvn clean compile
mvn package
java -jar target/api-0.0.1-SNAPSHOT.jar
```

### Error: "Port 8080 is already in use"
```
Address already in use: bind
```

**Solución** (Opción A - Cambiar puerto):
```properties
# En application.properties
server.port=8081
```

**Solución** (Opción B - Matar proceso):
```bash
# Buscar proceso en puerto 8080
lsof -i :8080

# Matar proceso (reemplazar PID)
kill -9 <PID>
```

### Error: "Maven not found"
```
mvn: command not found
```

**Solución**:
```bash
# Verificar instalación
java -version

# Usar Maven Wrapper
./mvnw clean install
./mvnw spring-boot:run
```

### Error: "Java version not compatible"
```
[ERROR] Source option 17 is no longer supported. Use 18 or later.
```

**Solución**:
```bash
# Verificar versión Java
java -version

# Si necesitas Java 17, instalarlo:
# En macOS con Homebrew:
brew install openjdk@17

# Luego, apuntar a esa versión
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
java -version
```

### Error: "Cannot resolve symbol 'WebpayPlus'"
```
Cannot resolve symbol 'WebpayPlus'
```

**Solución**:
```bash
# Limpiar e invalidar cache de IDE
# En IntelliJ:
# - File -> Invalidate Caches -> Invalidate and Restart

# Luego:
mvn clean install
```

### Error: "Connection refused: connect" en Webpay
```
java.net.ConnectException: Connection refused
```

**Posibles causas**:
1. Webpay está fuera de servicio
2. No hay conectividad a internet
3. Las credenciales están incorrectas
4. El ambiente está caído

**Verificar**:
```bash
# Probar conectividad
ping www.google.com

# Comprobar que application.properties tiene:
webpay.environment=INTEGRATION
```

---

## Logs y Debugging

### Ver logs detallados

En `application.properties`:
```properties
logging.level.root=DEBUG
logging.level.com.webpaytest.api=DEBUG
logging.level.com.transbank=DEBUG
```

Esto mostrará toda la comunicación con Webpay en la consola.

### Guardar logs en archivo

En `application.properties`:
```properties
logging.file.name=logs/application.log
logging.level.root=INFO
```

Los logs se guardarán en `logs/application.log`

---

## Estructura de Carpetas Final

Después de `mvn clean install`:

```
api/
├── pom.xml                                 ✅
├── README.md                               ✅
├── EXAMPLES.md                             ✅
├── INSTALLATION.md                         ✅
├── test-api.sh                             ✅
├── src/
│   ├── main/
│   │   ├── java/com/webpaytest/api/
│   │   │   ├── ApiApplication.java         ✅
│   │   │   ├── config/
│   │   │   │   └── WebpayConfig.java       ✅
│   │   │   ├── controller/
│   │   │   │   ├── WebpayController.java   ✅
│   │   │   │   └── HealthController.java   ✅
│   │   │   ├── service/
│   │   │   │   └── WebpayService.java      ✅
│   │   │   ├── dto/                        ✅
│   │   │   │   ├── ApiResponse.java
│   │   │   │   ├── CreateTransactionRequest.java
│   │   │   │   ├── CreateTransactionResponse.java
│   │   │   │   ├── CommitTransactionRequest.java
│   │   │   │   ├── CommitTransactionResponse.java
│   │   │   │   ├── GetStatusRequest.java
│   │   │   │   ├── GetStatusResponse.java
│   │   │   │   ├── RefundTransactionRequest.java
│   │   │   │   └── RefundTransactionResponse.java
│   │   │   └── exception/                  ✅
│   │   │       ├── WebpayException.java
│   │   │       └── GlobalExceptionHandler.java
│   │   └── resources/
│   │       └── application.properties      ✅
│   └── test/
│       └── java/com/webpaytest/api/
│           └── ApiApplicationTests.java
├── target/                                 (Generado - no editar)
│   ├── classes/
│   ├── generated-sources/
│   └── api-0.0.1-SNAPSHOT.jar             (El JAR compilado)
└── mvnw, mvnw.cmd                         (Maven Wrapper)
```

---

## Checklist de Verificación

- [ ] Java 17 instalado: `java -version`
- [ ] Maven instalado: `mvn -version`
- [ ] Proyecto compilado: `mvn clean install`
- [ ] API inicia sin errores: `mvn spring-boot:run`
- [ ] Health check responde: `curl http://localhost:8080/api/health`
- [ ] Crear transacción funciona
- [ ] Token se obtiene correctamente
- [ ] Confirmar transacción funciona
- [ ] Consultar estado funciona
- [ ] Reembolsar funciona
- [ ] Errores de validación se manejan correctamente
- [ ] Logs aparecen en consola

---

## Próximos Pasos

1. **Integrar con tu Frontend**: Usar los ejemplos en EXAMPLES.md
2. **Cambiar a Producción**: Actualizar credenciales en application.properties
3. **Agregar Base de Datos** (opcional): Si necesitas persistencia
4. **Agregar Tests**: Crear tests unitarios e integración
5. **Desplegar**: En servidor de producción (AWS, Azure, etc.)

---

## Soporte

Para errores o problemas:

1. Revisar logs en consola
2. Consultar la documentación oficial de Transbank
3. Verificar credenciales en application.properties
4. Probar con tarjeta de prueba oficial: 4051885600446623

---

## Links Útiles

- [Documentación Transbank SDK Java](https://github.com/transbankdevelopers/transbank-sdk-java)
- [API Webpay Plus Transbank](https://www.transbankdevelopers.cl/producto/webpay-plus)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Maven Documentation](https://maven.apache.org/guides/)


