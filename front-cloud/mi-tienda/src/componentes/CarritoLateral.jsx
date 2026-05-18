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

      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

      if (!usuario.id) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        return;
      }

      if (carrito.length === 0) {
        setError('Tu carrito está vacío.');
        return;
      }

      if (total <= 0) {
        setError('El total del carrito no es válido.');
        return;
      }

      const buyOrder = `ORD-${Date.now()}-${usuario.id}`;
      const returnUrl = `${window.location.origin}/webpay-retorno`;

      const response = await crearTransaccionPago(
        Math.round(total),
        buyOrder,
        String(usuario.id),
        returnUrl
      );

      if (!response.success) {
        setError(response.message || 'Error al crear la transacción de pago');
        return;
      }

      const paymentUrl = response.data.url;

      if (paymentUrl) {
        // eslint-disable-next-line no-undef
        top.location.href = paymentUrl;
      } else {
        setError('No se recibió URL de pago válida');
      }

    } catch (err) {
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