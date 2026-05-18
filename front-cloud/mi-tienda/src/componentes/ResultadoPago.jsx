import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BsCheckCircle, BsXCircle } from 'react-icons/bs';

const ResultadoPago = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [estado, setEstado] = useState('cargando');
  const [datoPago, setDatoPago] = useState(null);
  const [mensajeError, setMensajeError] = useState('');

  useEffect(() => {
    procesarRetornoPago();
  }, []);

  const procesarRetornoPago = async () => {
    try {
      // Verificar si hay error en URL
      const error = searchParams.get('error');
      if (error) {
        setEstado('error');
        setMensajeError(decodeURIComponent(error));
        return;
      }

      // Obtener token
      const token = searchParams.get('token_ws');
      if (!token) {
        setEstado('error');
        setMensajeError('No se recibió token de pago.');
        return;
      }

      console.log('[ResultadoPago] Token recibido:', token);

      // IMPORTANTE: NO confirmar aquí nuevamente
      // WebpayRetorno.jsx ya hizo la confirmación
      // Solo guardar el pedido en BD

      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      if (!usuario.id) {
        setEstado('error');
        setMensajeError('Sesión expirada.');
        return;
      }

      console.log('[ResultadoPago] Datos de pago:', datoPago);

      // Si llegamos aquí, la transacción fue exitosa
      // (WebpayRetorno.jsx ya confirmó y guardó el pedido)
      setEstado('exito');
      setDatoPago(datoPago);

      // Limpiar localStorage después de 5 segundos
      setTimeout(() => {
        localStorage.removeItem('carrito');
        localStorage.removeItem('carritoTemp');
        localStorage.removeItem('datoPago');
        navigate('/productos');
      }, 5000);

    } catch (error) {
      console.error('[ResultadoPago] Error:', error.message);
      setEstado('error');
      setMensajeError(error.message || 'Error desconocido');
    }
  };

  if (estado === 'cargando') {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Procesando...</span>
        </div>
        <p className="mt-3 text-muted">Por favor espera...</p>
      </div>
    );
  }

  if (estado === 'exito') {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="alert alert-success text-center py-5" role="alert">
              <BsCheckCircle size={80} className="mb-3 text-success" />
              <h2 className="mt-3 fw-bold">¡Pago Exitoso!</h2>
              <p className="mt-3 text-muted">
                Tu transacción ha sido procesada correctamente.
              </p>

              {datoPago && (
                <div className="card mt-4 text-start">
                  <div className="card-body">
                    <h5 className="card-title">Detalles de la Transacción</h5>
                    <hr />
                    <p>
                      <strong>Estado:</strong> {datoPago.status}
                    </p>
                    <p>
                      <strong>Código de Autorización:</strong> {datoPago.authorizationCode}
                    </p>
                    <p>
                      <strong>Monto:</strong> ${Number(datoPago.amount).toLocaleString('es-CL')}
                    </p>
                    <p>
                      <strong>Tarjeta:</strong> {datoPago.cardNumber}
                    </p>
                    <p>
                      <strong>Tipo de Pago:</strong>{' '}
                      {datoPago.paymentTypeCode === 'VD' ? 'Venta Débito' : datoPago.paymentTypeCode}
                    </p>
                  </div>
                </div>
              )}

              <p className="mt-4 text-muted small">
                Serás redirigido a la tienda en 5 segundos...
              </p>
              <button
                className="btn btn-primary mt-3"
                onClick={() => navigate('/productos')}
              >
                Volver a la Tienda
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estado: error
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="alert alert-danger text-center py-5" role="alert">
            <BsXCircle size={80} className="mb-3 text-danger" />
            <h2 className="mt-3 fw-bold">❌ Error en el Pago</h2>
            <p className="mt-3">{mensajeError}</p>

            <button
              className="btn btn-primary mt-3"
              onClick={() => navigate('/productos')}
            >
              Volver a la Tienda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultadoPago;

