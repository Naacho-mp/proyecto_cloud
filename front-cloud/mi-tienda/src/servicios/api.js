// Detectar ambiente
const isDevelopment = import.meta.env.DEV;

// URLs de API
// En desarrollo: puede usar localhost directamente para testing rápido
// En producción: SIEMPRE usa rutas relativas porque Nginx hace proxy interno
const BASE_URL = isDevelopment ? "http://localhost:8000/api" : "/api";
const WEBPAY_URL = isDevelopment ? "http://localhost:8080/java" : "/java";


export const getProductos = async () => {
    const response = await fetch(`${BASE_URL}/productos/`)
    return response.json()
}

// Usuarios
export const registrarUsuario = async (correo, password) => {
    const response = await fetch(`${BASE_URL}/usuarios/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password })
    })
    return response.json()
}

export const loginUsuario = async (correo, password) => {
    const response = await fetch(`${BASE_URL}/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password })
    })
    return response.json()
}

// Carrito
export const agregarAlCarrito = async (usuario_id, producto_id, cantidad) => {
    const response = await fetch(`${BASE_URL}/carrito/agregar?usuario_id=${usuario_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ producto_id, cantidad })
    })
    return response.json()
}

export const verCarrito = async (usuario_id) => {
    const response = await fetch(`${BASE_URL}/carrito/${usuario_id}`)
    return response.json()
}

export const pagarCarrito = async (usuario_id) => {
    const response = await fetch(`${BASE_URL}/carrito/pagar/${usuario_id}`, {
        method: "POST"
    })
    return response.json()
}

// ============================================================
// INTEGRACIÓN CON API DE PAGO (Java Webpay)
// ============================================================

/**
 * Paso 1: Crear transacción de pago
 * Se llama cuando el usuario hace click en "Pagar"
 *
 * @param {number} amount - Monto a pagar en CLP (entero, sin decimales)
 * @param {string} buyOrder - Número de orden único (máx 26 caracteres)
 * @param {string} sessionId - ID del usuario/sesión (máx 61 caracteres)
 * @param {string} returnUrl - URL HTTPS de retorno después del pago
 * @returns {Object} - Contiene { token, url, buyOrder, sessionId }
 * @throws {Error} Si los parámetros son inválidos
 */
export const crearTransaccionPago = async (amount, buyOrder, sessionId, returnUrl) => {
    // 1. Validar amount
    if (typeof amount !== 'number' || !Number.isInteger(amount) || amount <= 0) {
        throw new Error('El monto debe ser un número entero positivo');
    }
    if (amount > 9999999) {
        throw new Error('El monto no puede ser mayor a $9.999.999');
    }

    // 2. Validar buyOrder
    if (!buyOrder || buyOrder.length > 26 || /\s/.test(buyOrder)) {
        throw new Error('buyOrder: máx 26 caracteres, sin espacios');
    }
    if (!/^[a-zA-Z0-9\-_]+$/.test(buyOrder)) {
        throw new Error('buyOrder: solo alfanuméricos, guiones y guiones bajos');
    }

    // 3. Validar sessionId
    if (!sessionId || String(sessionId).length > 61) {
        throw new Error('sessionId: requerido y máx 61 caracteres');
    }

    // 4. Validar returnUrl
    if (!returnUrl) {
        throw new Error('returnUrl es requerido');
    }

    // En desarrollo: permitir http://localhost
    // En producción: requerir https://
    const isDevelopment = returnUrl.includes('localhost') || returnUrl.includes('127.0.0.1');
    if (!isDevelopment && !returnUrl.startsWith('https://')) {
        throw new Error('returnUrl debe ser HTTPS en producción');
    }

    // Validar que empiece con http:// o https://
    if (!returnUrl.startsWith('http://') && !returnUrl.startsWith('https://')) {
        throw new Error('returnUrl debe empezar con http:// o https://');
    }

    if (returnUrl.length > 256) {
        throw new Error('returnUrl: máx 256 caracteres');
    }

    // 5. Construir payload exacto que Webpay espera
    const payload = {
        amount,
        buyOrder,
        sessionId: String(sessionId),
        returnUrl
    };

    // 6. Enviar request
    const response = await fetch(`${WEBPAY_URL}/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    // 7. Validar response HTTP
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Error HTTP ${response.status}`);
    }

    // 8. Parsear y validar respuesta
    const result = await response.json();

    if (!result.success) {
        throw new Error(result.message || 'Error al crear transacción');
    }

    // 9. Validar que tiene token y url
    if (!result.data || !result.data.token || !result.data.url) {
        throw new Error('Respuesta inválida: falta token o url');
    }

    return result.data; // { token, url, buyOrder, sessionId }
}

/**
 * Paso 2: Confirmar transacción después de retorno de Webpay
 * Se llama cuando el usuario retorna de Webpay con el token en la URL
 *
 * @param {string} token - Token retornado por Webpay en la URL
 * @returns {Object} - Datos de la transacción confirmada
 */
/**
 * Paso 2: Confirmar transacción después de retorno de Webpay
 * Se llama cuando el usuario retorna de Webpay con el token en la URL
 *
 * IMPORTANTE: Esta función NO debe ser llamada múltiples veces
 * - Usa un flag en el componente para evitar duplicados
 * - Transbank rechaza un mismo token si ya fue procesado
 * - Error 422: "Transaction already locked by another process"
 *
 * @param {string} token - Token retornado por Webpay en la URL
 * @returns {Object} - Datos de la transacción confirmada
 * @throws {Error} Si el token es inválido o ya fue procesado
 */
export const confirmarTransaccionPago = async (token) => {
    // 1. Validar token
    if (!token || typeof token !== 'string') {
        throw new Error('Token inválido');
    }

    if (token.length === 0) {
        throw new Error('Token está vacío');
    }

    // 2. Construir payload
    const payload = { token };

    console.log('[API] Enviando confirmación de transacción con token:', token);

    try {
        // 3. Enviar request
        const response = await fetch(`${WEBPAY_URL}/commit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        // 4. Validar respuesta HTTP
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));

            // Si es 422: Transaction already locked
            if (response.status === 422) {
                throw new Error('Transacción ya fue procesada. No se puede procesar dos veces.');
            }

            throw new Error(error.message || `Error HTTP ${response.status}`);
        }

        // 5. Parsear respuesta
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'Error al confirmar transacción');
        }

        // 6. Validar que tiene datos
        if (!result.data) {
            throw new Error('Respuesta inválida: sin datos de confirmación');
        }

        console.log('[API] ✅ Transacción confirmada:', result.data.status);
        return result.data;

    } catch (err) {
        console.error('[API] ❌ Error al confirmar:', err.message);
        throw err;
    }
}

/**
 * Consultar estado de una transacción
 *
 * @param {string} token - Token de la transacción
 * @returns {Object} - Estado actual de la transacción
 */
export const consultarEstadoPago = async (token) => {
    const response = await fetch(`${WEBPAY_URL}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
    })
    return response.json()
}

/**
 * Reembolsar transacción
 *
 * @param {string} token - Token de la transacción a reembolsar
 * @returns {Object} - Datos del reembolso
 */
export const reembolsarPago = async (token) => {
    const response = await fetch(`${WEBPAY_URL}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
    })
    return response.json()
}

