import { useState } from 'react';
import { BsTrash } from 'react-icons/bs';
import { BsCreditCard2Back } from "react-icons/bs";
import { crearTransaccionPago } from '../servicios/api';

export const CarritoLateral = ({ carrito = [], eliminarDelCarrito = () => {} }) => {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0)

  const handleIrAPagar = async () => {
    try {
      setCargando(true);
      setError('');

      // 1. Validar usuario
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      if (!usuario.id) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        return;
      }

      // 2. Validar carrito
      if (carrito.length === 0) {
        setError('Tu carrito está vacío.');
        return;
      }

      // 3. Calcular y validar total
      const totalCarrito = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
      if (totalCarrito <= 0) {
        setError('El total del carrito no es válido.');
        return;
      }

      // 4. Construir payload exacto para Webpay
      const amount = Math.round(totalCarrito);
      const buyOrder = `ORD-${Date.now()}-${usuario.id}`;
      const sessionId = String(usuario.id);
      //const returnUrl = `${window.location.origin}/webpay-retorno`;
      //const returnUrl = `http://balanceador-carga-1567813537.us-east-1.elb.amazonaws.com/webpay-retorno`;
        const returnUrl = `${window.location.origin}/webpay-retorno`;
      // Guardar carrito en localStorage ANTES de ir a Webpay
      localStorage.setItem('carrito', JSON.stringify(carrito));
      console.log('[CarritoLateral] Carrito guardado en localStorage:', carrito);

      // 5. Crear transacción (con validaciones internas)
      const paymentData = await crearTransaccionPago(
        amount,
        buyOrder,
        sessionId,
        returnUrl
      );

      // 6. Extraer token y URL
      const { url: paymentUrl, token } = paymentData;

      if (!paymentUrl || !token) {
        setError('Respuesta inválida del servidor: falta token o URL');
        return;
      }

      // 7. Crear formulario HTML POST para Transbank
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = paymentUrl;

      const tokenInput = document.createElement('input');
      tokenInput.type = 'hidden';
      tokenInput.name = 'token_ws';
      tokenInput.value = token;

      form.appendChild(tokenInput);
      document.body.appendChild(form);

      console.log('[CarritoLateral] ✅ Redirigiendo a Transbank:', paymentUrl);
      form.submit();

    } catch (err) {
      console.error('[CarritoLateral] ❌ Error:', err.message);
      setError(err.message || 'Error desconocido al procesar el pago');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div 
      className="offcanvas offcanvas-end" 
      tabIndex="-1" 
      id="offcanvasCart" 
      aria-labelledby="offcanvasCartLabel"
    >
      <div className="offcanvas-header border-bottom">
        <h5 className="offcanvas-title fw-bold" id="offcanvasCartLabel">
          🛒 Mi Carrito
        </h5>
        <button 
          type="button" 
          className="btn-close" 
          data-bs-dismiss="offcanvas" 
          aria-label="Close"
        ></button>
      </div>
      
      <div className="offcanvas-body">
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => setError('')}
              aria-label="Close"
            ></button>
          </div>
        )}

        {carrito.length === 0 ? (
          <p className="text-muted text-center py-5">Tu carrito está vacío.</p>
        ) : (
          <div className="list-group">
            {carrito.map((item) => (
              <div key={item.id} className="list-group-item border-0 px-0 py-3">
                <div className="d-flex justify-content-between align-items-start gap-3">
                  <div className="flex-grow-1">
                    <h6 className="mb-1">{item.nombre}</h6>
                    <small className="text-muted">{item.cantidad} × {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(item.precio)}</small>
                  </div>

                  <div className="text-end">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger mb-2"
                      onClick={() => eliminarDelCarrito(item.id)}
                      aria-label={`Eliminar ${item.nombre}`}
                      disabled={cargando}
                    >
                      <BsTrash />
                    </button>
                    <div>
                      <strong>{new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(item.precio * item.cantidad)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="offcanvas-footer p-3 border-top">
        <div className="d-flex justify-content-between mb-3">
          <span className="fw-bold">Total:</span>
          <span className="fw-bold text-primary">
            {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(total)}
          </span>
        </div>
        <button 
          className="btn btn-dark w-100 py-2 fw-bold" 
          style={{ borderRadius: '10px' }}
          disabled={carrito.length === 0 || cargando}
          onClick={handleIrAPagar}
        >
          {cargando ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Procesando...
            </>
          ) : (
            <>
              Ir a Pagar
              <BsCreditCard2Back className="ms-2" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};