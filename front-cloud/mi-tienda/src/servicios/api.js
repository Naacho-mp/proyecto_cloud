// Detectar ambiente
const isDevelopment = import.meta.env.DEV;

// URLs de API
// En desarrollo: puede usar localhost directamente para testing rápido
// En producción: SIEMPRE usa rutas relativas porque Nginx hace proxy interno

const BASE_URL = isDevelopment ? "http://localhost:8000/api" : "/api";
const WEBPAY_URL = isDevelopment ? "http://localhost:8080/java" : "/java";
// const BASE_URL = "http://54.207.23.12:8000/api";
// const WEBPAY_URL = "http://18.231.151.69:8080/java";

// Imprimir URLs configuradas para debug
console.log(`[API] Mode: ${isDevelopment ? 'DEV' : 'PROD'}`);
console.log(`[API] BASE_URL: ${BASE_URL}`);
console.log(`[API] WEBPAY_URL: ${WEBPAY_URL}`);


export const getProductos = async () => {
    try {
        const response = await fetch(`${BASE_URL}/productos/`)
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json()
    } catch (error) {
        console.error("Error en getProductos:", error);
        throw error;
    }
}

// Usuarios
export const registrarUsuario = async (nombre, correo, password, codigo) => {
    const response = await fetch(`${BASE_URL}/usuarios/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, password, codigo })
    })
    return response.json()
}

export const enviarCodigoVerificacion = async (correo, nombre) => {
    const response = await fetch(`${BASE_URL}/usuarios/enviar-codigo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, nombre }) 
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


export const obtenerArchivosUsuario = async () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"))
    
    if (!usuario || !usuario.id) return []
    
    const response = await fetch(`${BASE_URL}/archivos/mis-archivos?usuario_id=${usuario.id}`)
    
    if (!response.ok) {
        throw new Error("Error al obtener archivos")
    }
    
    return await response.json()
}

export const subirArchivo = async (file) => {
    const usuario = JSON.parse(localStorage.getItem("usuario"))
    const formData = new FormData()
    formData.append("archivo", file)

    const response = await fetch(`${BASE_URL}/archivos/subir?usuario_id=${usuario.id}`, {
        method: "POST",
        body: formData
    })
    if (!response.ok) throw new Error("Error al subir archivo")
    return await response.json()
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

    // Validar que empiece con http:// o https://
    if (!returnUrl.startsWith('http://') && !returnUrl.startsWith('https://')) {
        throw new Error('returnUrl debe empezar con http:// o https://');
    }

    // Advertencia: Webpay requiere HTTPS en producción
    if (!returnUrl.includes('localhost') && !returnUrl.includes('127.0.0.1')) {
        if (returnUrl.startsWith('http://')) {
            console.warn('[API] Advertencia: returnUrl usa HTTP en producción. Webpay puede rechazarlo.');
            console.warn('[API] Se espera que el frontend la cambie a HTTPS automaticamente.');
        }
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
 * @returns {Object} - { success: true, data: {...} }
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

        // Retornar con estructura que espera el componente
        return {
            success: true,
            data: result.data,
            message: result.message
        };

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

