const BASE_URL = "http://127.0.0.1:8000"

// Productos
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