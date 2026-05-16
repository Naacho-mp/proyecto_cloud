# API REST - Webpay Plus Integration

## Descripción

API REST simple y limpia para integración con Webpay Plus de Transbank. Desarrollada con Spring Boot 4.0.6 y Java 17.

## Características

- ✅ Arquitectura MVC simple
- ✅ Endpoints REST para crear, confirmar, consultar y reembolsar transacciones
- ✅ Validaciones con Jakarta Validation
- ✅ Manejo global de excepciones
- ✅ Logging con SLF4J
- ✅ DTOs tipados
- ✅ Responses JSON consistentes
- ✅ Compatible con Spring Boot 4.0.6 y Java 17
- ✅ Sin base de datos ni persistencia

## Estructura del Proyecto

```
src/
├── main/
│   ├── java/com/webpaytest/api/
│   │   ├── controller/
│   │   │   ├── WebpayController.java      # Endpoints REST principales
│   │   │   └── HealthController.java      # Health checks
│   │   ├── service/
│   │   │   └── WebpayService.java         # Lógica de negocio
│   │   ├── config/
│   │   │   └── WebpayConfig.java          # Configuración de Transbank
│   │   ├── dto/
│   │   │   ├── CreateTransactionRequest.java
│   │   │   ├── CreateTransactionResponse.java
│   │   │   ├── CommitTransactionRequest.java
│   │   │   ├── CommitTransactionResponse.java
│   │   │   ├── GetStatusRequest.java
│   │   │   ├── GetStatusResponse.java
│   │   │   ├── RefundTransactionRequest.java
│   │   │   ├── RefundTransactionResponse.java
│   │   │   └── ApiResponse.java            # DTO genérico de respuesta
│   │   ├── exception/
│   │   │   ├── WebpayException.java        # Excepción personalizada
│   │   │   └── GlobalExceptionHandler.java # Manejador global
│   │   └── ApiApplication.java
│   └── resources/
│       └── application.properties
└── test/
```

## Dependencias Principales

```xml
<!-- Spring Boot Web -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- Transbank SDK Oficial 6.x -->
<dependency>
    <groupId>com.github.transbankdevelopers</groupId>
    <artifactId>transbank-sdk-java</artifactId>
    <version>6.1.0</version>
</dependency>

<!-- Validation -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>

<!-- Lombok -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
</dependency>
```

## Configuración

### application.properties

```properties
# Webpay Integration Environment
webpay.commerce-code=597055555532
webpay.api-key=579B532A7440BB0C9079DED94D31EA1615BACEB7
webpay.environment=INTEGRATION

# Server
server.port=8080

# Logging
logging.level.com.webpaytest.api=DEBUG
```

### Credenciales de Integración (Pruebas)

- **Commerce Code**: 597055555532
- **API Key**: 579B532A7440BB0C9079DED94D31EA1615BACEB7
- **Ambiente**: INTEGRATION

## Endpoints Disponibles

### 1. Health Check

#### GET /api/health
Verifica que la API está funcionando

```bash
curl http://localhost:8080/api/health
```

Response:
```json
{
  "success": true,
  "message": "API está funcionando correctamente",
  "data": "API running",
  "timestamp": "2026-05-14T10:30:45.123456"
}
```

### 2. Información de la API

#### GET /api/info
Retorna información general de la API

```bash
curl http://localhost:8080/api/info
```

### 3. Crear Transacción

#### POST /api/webpay/create

Crea una nueva transacción en Webpay Plus.

**Request:**
```bash
curl -X POST http://localhost:8080/api/webpay/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "buyOrder": "ORD-12345",
    "sessionId": "sesion-12345",
    "returnUrl": "http://localhost:3000/callback"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Transacción creada exitosamente",
  "data": {
    "token": "01928372ee1a2d9e",
    "url": "https://webpay3gplus.transbank.cl/webpayplus/initTransaction",
    "buyOrder": "ORD-12345",
    "sessionId": "sesion-12345"
  },
  "timestamp": "2026-05-14T10:30:45.123456"
}
```

**Parámetros:**
- `amount` (long, requerido): Monto de la transacción en pesos chilenos
- `buyOrder` (string, requerido): Identificador único de la orden
- `sessionId` (string, requerido): ID de sesión del cliente
- `returnUrl` (string, requerido): URL a la que retornará Webpay después del pago

### 4. Confirmar Transacción

#### POST /api/webpay/commit

Confirma una transacción después de que el usuario retorna de Webpay.

**Request:**
```bash
curl -X POST http://localhost:8080/api/webpay/commit \
  -H "Content-Type: application/json" \
  -d '{
    "token": "01928372ee1a2d9e"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Transacción confirmada exitosamente",
  "data": {
    "buyOrder": "ORD-12345",
    "cardNumber": "****6623",
    "authorizationCode": "123456",
    "paymentTypeCode": "VD",
    "responseCode": 0,
    "amount": "50000",
    "status": "AUTHORIZED",
    "installmentsNumber": null,
    "installmentsAmount": null
  },
  "timestamp": "2026-05-14T10:30:45.123456"
}
```

### 5. Consultar Estado

#### POST /api/webpay/status

Consulta el estado de una transacción.

**Request:**
```bash
curl -X POST http://localhost:8080/api/webpay/status \
  -H "Content-Type: application/json" \
  -d '{
    "token": "01928372ee1a2d9e"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Estado consultado exitosamente",
  "data": {
    "buyOrder": "ORD-12345",
    "cardNumber": "****6623",
    "authorizationCode": "123456",
    "paymentTypeCode": "VD",
    "responseCode": 0,
    "status": "AUTHORIZED",
    "installmentsNumber": null,
    "installmentsAmount": null
  },
  "timestamp": "2026-05-14T10:30:45.123456"
}
```

### 6. Reembolsar Transacción

#### POST /api/webpay/refund

Reembolsa o anula una transacción.

**Request:**
```bash
curl -X POST http://localhost:8080/api/webpay/refund \
  -H "Content-Type: application/json" \
  -d '{
    "token": "01928372ee1a2d9e"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Transacción reembolsada exitosamente",
  "data": {
    "type": "REFUND",
    "token": "01928372ee1a2d9e",
    "refundedAmount": 50000,
    "balance": 0,
    "status": "REFUNDED"
  },
  "timestamp": "2026-05-14T10:30:45.123456"
}
```

## Errores

La API retorna errores en formato JSON consistente:

```json
{
  "success": false,
  "message": "Descripción del error",
  "path": "/api/webpay/create",
  "timestamp": "2026-05-14T10:30:45.123456"
}
```

### Códigos HTTP

- `200 OK`: Operación exitosa
- `201 Created`: Transacción creada exitosamente
- `400 Bad Request`: Datos inválidos o error en la transacción
- `500 Internal Server Error`: Error del servidor

## Flujo de Integración Típico

1. **Frontend**: El usuario hace clic en "Pagar con Webpay"
2. **Frontend → Backend**: POST a `/api/webpay/create` con monto y datos
3. **Backend → Webpay**: Crea transacción y obtiene token y URL
4. **Backend → Frontend**: Retorna token y URL
5. **Frontend**: Redirige usuario a URL de Webpay con token
6. **Usuario**: Ingresa datos de pago en Webpay
7. **Webpay → Frontend**: Redirige a returnUrl con token en query param
8. **Frontend → Backend**: POST a `/api/webpay/commit` con token
9. **Backend → Webpay**: Confirma transacción
10. **Backend → Frontend**: Retorna resultado del pago

## Ejecución

### Compilar

```bash
mvn clean install
```

### Ejecutar

```bash
mvn spring-boot:run
```

O usando el JAR:

```bash
java -jar target/api-0.0.1-SNAPSHOT.jar
```

La API estará disponible en `http://localhost:8080`

## Notas de Implementación

### Transbank SDK 6.x
- Usa imports modernos: `com.transbank.webpay.plus.*`
- NO usa imports legacy: `cl.transbank.webpay.plus.*`
- Compatible con Spring Boot 4.0.6 y Java 17

### Arquitectura
- MVC simple sin capas adicionales
- Lógica concentrada en Service y Controller
- Manejo global de excepciones
- Validaciones automáticas con Jakarta Validation

### Logging
- SLF4J con configuración en application.properties
- Logs para todas las operaciones principales
- Nivel DEBUG para desarrollo

### Sin Persistencia
- No usa base de datos
- No guarda transacciones en memoria
- Cada request es independiente
- Ideal para pruebas e integración

## Pruebas de Integración con Webpay

Para probar exitosamente con ambiente Integration de Transbank:

1. Usar tarjeta de prueba: `4051885600446623`
2. Vencimiento: `12/26`
3. CVV: `123`
4. RUT: `11.111.111-1`

## Próximos Pasos

Para producción:
1. Cambiar credenciales a ambiente Production
2. Agregar base de datos para persistencia
3. Implementar autenticación/autorización
4. Agregar tests unitarios e integración
5. Configurar HTTPS
6. Implementar rate limiting


# apiwebpay
