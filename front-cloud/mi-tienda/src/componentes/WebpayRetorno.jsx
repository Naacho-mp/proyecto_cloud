import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { confirmarTransaccionPago, pagarCarrito } from '../servicios/api';

const WebpayRetorno = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Flag para evitar procesar múltiples veces
  const yaProcessado = useRef(false);

  const procesarRetorno = useCallback(async () => {
    try {
      // Obtener el token de la URL
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

      console.log('[WebpayRetorno] Transacción confirmada exitosamente');

      // Paso 2: Obtener datos del usuario
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

      if (!usuario.id) {
        console.error('[WebpayRetorno] Usuario no encontrado');
        mostrarError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        return;
      }

      // Paso 3: Guardar el pedido en la BD (FastAPI)
      console.log('[WebpayRetorno] Guardando pedido para usuario:', usuario.id);
      const responsePedido = await pagarCarrito(usuario.id);

      if (!responsePedido.success) {
        console.error('[WebpayRetorno] Error al guardar pedido:', responsePedido.detail);
        mostrarError(responsePedido.detail || 'Error al guardar el pedido en la base de datos');
        return;
      }

      console.log('[WebpayRetorno] Pedido guardado exitosamente');

      // Todo exitoso - redirigir a página de éxito
      localStorage.removeItem('carrito');
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
    // Solo procesar una única vez
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

