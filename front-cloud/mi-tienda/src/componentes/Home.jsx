import { useState, useEffect } from 'react';
import { ListaProductos } from './ListaProductos';
import { getProductos, crearTransaccionPago } from '../servicios/api';

function Home({ agregarAlCarrito }) {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getProductos().then(data => setProductos(data))
  }, [])

  const comprarAhora = async (producto) => {
    try {
      setCargando(true)
      setError('')

      // 1. Validar usuario
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
      if (!usuario.id) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.')
        return
      }

      // 2. Validar producto
      if (!producto || producto.precio <= 0) {
        setError('Producto no válido.')
        return
      }

      // 3. Construir payload para Webpay
      const amount = Math.round(producto.precio)
      const buyOrder = `ORD-${Date.now()}-${usuario.id}`
      const sessionId = String(usuario.id)

      let returnUrl = `${window.location.origin}/webpay-retorno`
      if (!returnUrl.includes('localhost') && !returnUrl.includes('127.0.0.1')) {
        if (returnUrl.startsWith('http://')) {
          returnUrl = returnUrl.replace('http://', 'https://')
        }
      }

      // 4. Guardar producto único en localStorage para compra directa
      localStorage.setItem('compraDirect', JSON.stringify({ ...producto, cantidad: 1 }))

      // 5. Crear transacción
      const paymentData = await crearTransaccionPago(
        amount,
        buyOrder,
        sessionId,
        returnUrl
      )

      const { url: paymentUrl, token } = paymentData

      if (!paymentUrl || !token) {
        setError('Respuesta inválida del servidor: falta token o URL')
        return
      }

      // 6. Crear formulario POST y enviar a Transbank
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = paymentUrl

      const tokenInput = document.createElement('input')
      tokenInput.type = 'hidden'
      tokenInput.name = 'token_ws'
      tokenInput.value = token

      form.appendChild(tokenInput)
      document.body.appendChild(form)

      console.log('[Home] ✅ Redirigiendo a Transbank para compra directa:', paymentUrl)
      form.submit()

    } catch (err) {
      console.error('[Home] ❌ Error en compra directa:', err.message)
      setError(err.message || 'Error desconocido al procesar el pago')
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="py-4">
      <div className="container text-center mb-4">
        <h2 className="titulo-productos">Nuestros Productos</h2>
        <hr className="w-25 mx-auto" />
      </div>

      {error && (
        <div className="container mb-4">
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => setError('')}
              aria-label="Close"
            ></button>
          </div>
        </div>
      )}

      {cargando && (
        <div className="container mb-4">
          <div className="alert alert-info" role="alert">
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Procesando pago...
          </div>
        </div>
      )}

      <ListaProductos productos={productos} agregarAlCarrito={agregarAlCarrito} comprarAhora={comprarAhora} />
    </main>
  );
}

export default Home;