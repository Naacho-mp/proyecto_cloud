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
 * @param {number} amount - Monto a pagar en CLP
 * @param {string} buyOrder - Número de orden (ej: "ORD-001")
 * @param {string} sessionId - ID de la sesión del usuario
 * @param {string} returnUrl - URL a donde retornar después del pago
 * @returns {Object} - Contiene el token y URL de Webpay
 */
export const crearTransaccionPago = async (amount, buyOrder, sessionId, returnUrl) => {
    const response = await fetch(`${WEBPAY_URL}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            amount,
            buyOrder,
            sessionId,
            returnUrl
        })
    })
    return response.json()
}

/**
 * Paso 2: Confirmar transacción después de retorno de Webpay
 * Se llama cuando el usuario retorna de Webpay con el token en la URL
 *
 * @param {string} token - Token retornado por Webpay en la URL
 * @returns {Object} - Datos de la transacción confirmada
 */
export const confirmarTransaccionPago = async (token) => {
    const response = await fetch(`${WEBPAY_URL}/commit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
    })
    return response.json()
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

