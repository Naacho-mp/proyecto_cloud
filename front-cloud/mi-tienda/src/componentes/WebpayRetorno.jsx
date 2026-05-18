import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { confirmarTransaccionPago } from '../servicios/api';

const WebpayRetorno = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const yaProcessado = useRef(false);

  const procesarRetorno = useCallback(async () => {
    try {
      const tokenWs = searchParams.get('token_ws');

      console.log('[WebpayRetorno] Token recibido:', tokenWs);

      if (!tokenWs) {
        console.error('[WebpayRetorno] No se encontró token_ws en URL');
        mostrarError('No se recibió token de Transbank. Por favor, intenta nuevamente.');
        return;
      }

      // Paso 1: Confirmar la transacción con el backend Java
      console.log('[WebpayRetorno] Confirmando transacción...');
      const responseConfirm = await confirmarTransaccionPago(tokenWs);

      if (!responseConfirm.success) {
        console.error('[WebpayRetorno] Error al confirmar:', responseConfirm.message);
        mostrarError(responseConfirm.message || 'Error al confirmar la transacción');
        return;
      }

      console.log('[WebpayRetorno] ✅ Transacción confirmada exitosamente');

      // Guardar datos de la transacción en localStorage para ResultadoPago
      localStorage.setItem('datoPago', JSON.stringify(responseConfirm.data));

      // TODO: Aquí debería llamar a pagarCarrito() pero guardamos solo en localStorage por ahora
      // El carrito ya está en localStorage desde CarritoLateral

      // Redirigir a página de éxito
      navigate('/pago-resultado?token_ws=' + tokenWs);

    } catch (error) {
      console.error('[WebpayRetorno] Error inesperado:', error);
      mostrarError(error.message || 'Error desconocido al procesar el pago');
    }
  }, [searchParams, navigate]);

  const mostrarError = (mensaje) => {
    navigate('/pago-resultado?error=' + encodeURIComponent(mensaje));
  };

  useEffect(() => {
    if (yaProcessado.current) {
      console.log('[WebpayRetorno] Ya fue procesado, ignorando llamada duplicada');
      return;
    }

    procesarRetorno();
    yaProcessado.current = true;
  }, [procesarRetorno]);

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Procesando retorno de Webpay...</span>
      </div>
      <p>Procesando tu pago, por favor espera...</p>
    </div>
  );
};

export default WebpayRetorno;

