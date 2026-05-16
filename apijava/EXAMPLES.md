# Ejemplos de Uso de la API Webpay Plus

## Requisitos Previos

1. Tener la API corriendo en `http://localhost:8080`
2. Tener `curl` o Postman instalado
3. Credenciales de integración ya configuradas en `application.properties`

## Ejemplos Prácticos

### 1. Verificar que la API está funcionando

```bash
curl -X GET http://localhost:8080/api/health \
  -H "Content-Type: application/json"
```

Respuesta esperada:
```json
{
  "success": true,
  "message": "API está funcionando correctamente",
  "data": "API running",
  "timestamp": "2026-05-14T10:30:45.123456"
}
```

---

### 2. Crear una Transacción

**Escenario**: Un cliente quiere comprar algo por $50,000 pesos.

```bash
curl -X POST http://localhost:8080/api/webpay/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "buyOrder": "ORD-2026-001",
    "sessionId": "cliente-123-sesion",
    "returnUrl": "https://mitienda.com/pago/retorno"
  }'
```

**Explicación de parámetros**:
- `amount`: Monto total en pesos chilenos (sin decimales)
- `buyOrder`: ID único de la orden (máx 26 caracteres)
- `sessionId`: ID de sesión único por usuario
- `returnUrl`: URL a la que retornará Webpay después del pago

**Respuesta exitosa (201 Created)**:
```json
{
  "success": true,
  "message": "Transacción creada exitosamente",
  "data": {
    "token": "01928372ee1a2d9e",
    "url": "https://webpay3gplus.transbank.cl/webpayplus/initTransaction",
    "buyOrder": "ORD-2026-001",
    "sessionId": "cliente-123-sesion"
  },
  "timestamp": "2026-05-14T10:32:15.654321"
}
```

**Qué hacer con el token y la URL**:
1. Guardar el token en la sesión del cliente (frontend)
2. Redirigir al usuario a la URL proporcionada
3. Webpay mostrará formulario seguro para que ingrese datos de tarjeta

---

### 3. Confirmar Transacción (después del retorno de Webpay)

**Escenario**: Webpay redirige al usuario de vuelta a tu sitio con el token en la URL.

La URL de retorno se vería así:
```
https://mitienda.com/pago/retorno?token_ws=01928372ee1a2d9e
```

Tu frontend extrae el token y lo envía al backend:

```bash
curl -X POST http://localhost:8080/api/webpay/commit \
  -H "Content-Type: application/json" \
  -d '{
    "token": "01928372ee1a2d9e"
  }'
```

**Respuesta exitosa (200 OK)**:
```json
{
  "success": true,
  "message": "Transacción confirmada exitosamente",
  "data": {
    "buyOrder": "ORD-2026-001",
    "cardNumber": "****6623",
    "authorizationCode": "123456",
    "paymentTypeCode": "VD",
    "responseCode": 0,
    "amount": "50000",
    "status": "AUTHORIZED",
    "installmentsNumber": null,
    "installmentsAmount": null
  },
  "timestamp": "2026-05-14T10:33:45.987654"
}
```

**Interpretación de la respuesta**:
- `responseCode: 0` = Pago aprobado
- `status: "AUTHORIZED"` = Transacción autorizada
- `authorizationCode` = Número de autorización de la tarjeta
- `cardNumber` = Últimos 4 dígitos de la tarjeta (ej: ****6623)
- `paymentTypeCode: "VD"` = Venta Débito (también puede ser "VP" = Venta Prepago)

**Respuesta error (400 Bad Request)**:
```json
{
  "success": false,
  "message": "Error al confirmar transacción: Token inválido o expirado",
  "path": "/api/webpay/commit",
  "timestamp": "2026-05-14T10:34:00.111111"
}
```

---

### 4. Consultar Estado de una Transacción

**Escenario**: Necesitas verificar el estado de una transacción en cualquier momento.

```bash
curl -X POST http://localhost:8080/api/webpay/status \
  -H "Content-Type: application/json" \
  -d '{
    "token": "01928372ee1a2d9e"
  }'
```

**Respuesta**:
```json
{
  "success": true,
  "message": "Estado consultado exitosamente",
  "data": {
    "buyOrder": "ORD-2026-001",
    "cardNumber": "****6623",
    "authorizationCode": "123456",
    "paymentTypeCode": "VD",
    "responseCode": 0,
    "status": "AUTHORIZED",
    "installmentsNumber": null,
    "installmentsAmount": null
  },
  "timestamp": "2026-05-14T10:35:10.222222"
}
```

---

### 5. Reembolsar una Transacción

**Escenario**: El cliente solicita devolución de dinero.

```bash
curl -X POST http://localhost:8080/api/webpay/refund \
  -H "Content-Type: application/json" \
  -d '{
    "token": "01928372ee1a2d9e"
  }'
```

**Respuesta exitosa (200 OK)**:
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
  "timestamp": "2026-05-14T10:36:20.333333"
}
```

---

## Casos de Error Comunes

### Error 1: Validación fallida

```bash
curl -X POST http://localhost:8080/api/webpay/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": -50000,
    "buyOrder": "",
    "sessionId": "test"
  }'
```

Respuesta (400 Bad Request):
```json
{
  "success": false,
  "message": "amount: El monto debe ser mayor a 0",
  "path": "/api/webpay/create",
  "timestamp": "2026-05-14T10:37:00.444444"
}
```

### Error 2: Token inválido

```bash
curl -X POST http://localhost:8080/api/webpay/commit \
  -H "Content-Type: application/json" \
  -d '{
    "token": "token-invalido-xyz"
  }'
```

Respuesta (400 Bad Request):
```json
{
  "success": false,
  "message": "Error al confirmar transacción: Token inválido o expirado",
  "path": "/api/webpay/commit",
  "timestamp": "2026-05-14T10:37:30.555555"
}
```

### Error 3: Campo requerido vacío

```bash
curl -X POST http://localhost:8080/api/webpay/commit \
  -H "Content-Type: application/json" \
  -d '{
    "token": ""
  }'
```

Respuesta (400 Bad Request):
```json
{
  "success": false,
  "message": "token: El token es requerido",
  "path": "/api/webpay/commit",
  "timestamp": "2026-05-14T10:38:00.666666"
}
```

---

## Ejemplo Completo: Flujo de Integración Frontend-Backend

### Frontend (React/Vue/Angular)

```javascript
// 1. Usuario hace clic en "Pagar con Webpay"
async function handlePayment() {
  try {
    // 2. Crear transacción en backend
    const createResponse = await fetch('http://localhost:8080/api/webpay/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 50000,
        buyOrder: `ORD-${Date.now()}`,
        sessionId: `SES-${Math.random()}`,
        returnUrl: `${window.location.origin}/pago/retorno`
      })
    });

    const createData = await createResponse.json();
    
    if (createData.success) {
      // 3. Guardar token en sessionStorage
      sessionStorage.setItem('webpayToken', createData.data.token);
      
      // 4. Redirigir a Webpay
      window.location.href = `${createData.data.url}?token_ws=${createData.data.token}`;
    } else {
      alert('Error: ' + createData.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al procesar el pago');
  }
}

// 5. En la página de retorno (/pago/retorno)
async function processPaymentReturn() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token_ws');
  
  if (!token) {
    alert('Token no encontrado');
    return;
  }

  // 6. Confirmar transacción en backend
  try {
    const commitResponse = await fetch('http://localhost:8080/api/webpay/commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    const commitData = await commitResponse.json();

    if (commitData.success && commitData.data.responseCode === 0) {
      // 7. Pago exitoso
      alert('¡Pago exitoso!\nAutorización: ' + commitData.data.authorizationCode);
      // Redirigir a página de éxito
      window.location.href = '/gracias';
    } else {
      // 8. Pago rechazado
      alert('Pago rechazado');
      window.location.href = '/error';
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al procesar el retorno del pago');
  }
}

// Ejecutar al cargar la página
if (window.location.pathname === '/pago/retorno') {
  processPaymentReturn();
}
```

---

## Testeo Práctico en Ambiente Integration

### Tarjetas de Prueba Válidas

| Tipo | Número | Vencimiento | CVV | Resultado |
|------|--------|-------------|-----|-----------|
| Débito | 4051885600446623 | 12/26 | 123 | Aprobada |
| Crédito | 5186059559590568 | 12/26 | 123 | Aprobada |

### RUT de Prueba
- RUT: `11.111.111-1`

### Pasos para Probar

1. Ejecutar: `mvn spring-boot:run`
2. Crear transacción con curl (ver ejemplo arriba)
3. Obtener URL y token de respuesta
4. Abrir URL en navegador
5. Ingresar datos de tarjeta de prueba
6. Confirmar pago
7. Retorna a tu returnUrl con token
8. Confirmar transacción con curl

---

## Logs en la Consola

Cuando ejecutes las operaciones, verás en la consola:

```
2026-05-14 10:30:45 - INFO  - WebpayConfig - Inicializando Webpay Plus con Commerce Code: 597055555532
2026-05-14 10:30:45 - INFO  - WebpayConfig - Ambiente: INTEGRATION
2026-05-14 10:30:45 - INFO  - WebpayConfig - Webpay Plus configurado correctamente

[Al crear transacción]
2026-05-14 10:32:15 - DEBUG - WebpayService - Creando transacción - Orden: ORD-2026-001, Monto: 50000
2026-05-14 10:32:15 - INFO  - WebpayService - Transacción creada exitosamente - Token: 01928372ee1a2d9e
2026-05-14 10:32:15 - DEBUG - WebpayController - Request para crear transacción recibida

[Al confirmar transacción]
2026-05-14 10:33:45 - DEBUG - WebpayController - Request para confirmar transacción recibida
2026-05-14 10:33:45 - DEBUG - WebpayService - Confirmando transacción - Token: 01928372ee1a2d9e
2026-05-14 10:33:45 - INFO  - WebpayService - Transacción confirmada - Orden: ORD-2026-001, Código de autorización: 123456
```

---

## Respuestas de Codigo de Respuesta (responseCode)

| Code | Significado | Estado |
|------|-------------|--------|
| 0 | Transacción aprobada | AUTHORIZED |
| -1 | Rechazo de transacción | REJECTED |
| -2 | Transacción anulada | REVERSED |
| -3 | Transacción del usuario rechazada | REJECTED |
| -4 | Autenticación fallida | FAILED |
| -5 | Transacción expirada | EXPIRED |

---

## Estructura de Carpetas Generada

```
api/
├── pom.xml                          # Dependencias (incluye SDK Transbank 6.1.0)
├── README.md                        # Este archivo
├── test-api.sh                      # Script de pruebas
├── EXAMPLES.md                      # Ejemplos detallados (este archivo)
├── src/
│   ├── main/
│   │   ├── java/com/webpaytest/api/
│   │   │   ├── ApiApplication.java
│   │   │   ├── config/
│   │   │   │   └── WebpayConfig.java                    # Configuración de Transbank
│   │   │   ├── controller/
│   │   │   │   ├── WebpayController.java               # Endpoints REST
│   │   │   │   └── HealthController.java               # Health check
│   │   │   ├── service/
│   │   │   │   └── WebpayService.java                  # Lógica de negocio
│   │   │   ├── dto/
│   │   │   │   ├── CreateTransactionRequest.java
│   │   │   │   ├── CreateTransactionResponse.java
│   │   │   │   ├── CommitTransactionRequest.java
│   │   │   │   ├── CommitTransactionResponse.java
│   │   │   │   ├── GetStatusRequest.java
│   │   │   │   ├── GetStatusResponse.java
│   │   │   │   ├── RefundTransactionRequest.java
│   │   │   │   ├── RefundTransactionResponse.java
│   │   │   │   └── ApiResponse.java
│   │   │   └── exception/
│   │   │       ├── WebpayException.java
│   │   │       └── GlobalExceptionHandler.java
│   │   └── resources/
│   │       └── application.properties                  # Configuración (creds + logs)
│   └── test/
│       └── java/com/webpaytest/api/
│           └── ApiApplicationTests.java
├── target/                          # Generado tras compilar
└── mvnw                             # Maven Wrapper
```


