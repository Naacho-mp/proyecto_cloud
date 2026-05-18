import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { confirmarTransaccionPago, pagarCarrito } from '../servicios/api';
import { BsCheckCircle, BsXCircle } from 'react-icons/bs';

const ResultadoPago = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [estado, setEstado] = useState('cargando'); // 'cargando', 'exito', 'error'
  const [datoPago, setDatoPago] = useState(null);
  const [mensajeError, setMensajeError] = useState('');

  useEffect(() => {
    procesarRetornoPago();
  }, []);

  const procesarRetornoPago = async () => {
    try {
      // Obtener el token de la URL (parámetro token_ws de Webpay)
      const token = searchParams.get('token_ws');

      if (!token) {
        setEstado('error');
        setMensajeError('No se recibió token de pago. Transacción incompleta.');
        return;
      }

      // Paso 1: Confirmar la transacción con el backend Java
      console.log('[ResultadoPago] Confirmando transacción con token:', token);

      const responseConfirm = await confirmarTransaccionPago(token);

      if (!responseConfirm.success) {
        setEstado('error');
        setMensajeError(
          responseConfirm.message || 'Error al confirmar la transacción'
        );
        return;
      }

      // Paso 2: Guardar el pedido en la BD (FastAPI)
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

      if (!usuario.id) {
        setEstado('error');
        setMensajeError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        return;
      }

      console.log('[ResultadoPago] Guardando pedido en BD para usuario:', usuario.id);

      const responsePedido = await pagarCarrito(usuario.id);

      if (!responsePedido.success && responsePedido.detail) {
        setEstado('error');
        setMensajeError(
          responsePedido.detail || 'Error al guardar el pedido en la base de datos'
        );
        return;
      }

      // Todo exitoso
      setEstado('exito');
      setDatoPago(responseConfirm.data);

      // Limpiar datos de pago de localStorage después de 5 segundos
      setTimeout(() => {
        localStorage.removeItem('carrito');
        navigate('/productos');
      }, 5000);

    } catch (error) {
      console.error('[ResultadoPago] Error:', error);
      setEstado('error');
      setMensajeError(
        error.message || 'Error desconocido al procesar el pago'
      );
    }
  };

  if (estado === 'cargando') {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Procesando pago...</span>
        </div>
        <p className="mt-3 text-muted">Procesando tu transacción, por favor espera...</p>
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
                      {datoPago.paymentTypeCode === 'VD'
                        ? 'Venta Débito'
                        : datoPago.paymentTypeCode === 'VP'
                        ? 'Venta Prepago'
                        : datoPago.paymentTypeCode === 'VC'
                        ? 'Venta Crédito'
                        : datoPago.paymentTypeCode}
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
            <h2 className="mt-3 fw-bold">Error en la Transacción</h2>
            <p className="mt-3">{mensajeError}</p>

            <div className="mt-4">
              <p className="text-muted small">
                Por favor, intenta nuevamente o contacta con soporte.
              </p>
              <button
                className="btn btn-danger me-2"
                onClick={() => navigate('/productos')}
              >
                Volver al Carrito
              </button>
              <button
                className="btn btn-outline-danger"
                onClick={() => window.location.reload()}
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultadoPago;

