import { useEffect } from 'react';
import { confirmarTransaccionPago, pagarCarrito } from '../servicios/api';

const WebpayRetorno = () => {
  useEffect(() => {
    procesarRetorno();
  }, []);

  const procesarRetorno = async () => {
    try {
      // El token viene en los datos del formulario de Webpay
      // Necesitamos extraerlo de forma diferente según cómo lo envíe

      // Método 1: Ver si está en la URL
      const urlParams = new URLSearchParams(window.location.search);
      const tokenUrl = urlParams.get('token_ws');

      // Método 2: Ver si está en el body (POST)
      // En este caso, Webpay hace un POST con token_ws

      if (tokenUrl) {
        console.log('Token desde URL:', tokenUrl);
        await confirmarPago(tokenUrl);
      } else {
        // Intentar obtener del formulario oculto que dejó Webpay
        const formas = document.querySelectorAll('form');
        console.log('Formas encontradas:', formas.length);

        if (formas.length > 0) {
          // Buscar el campo token_ws en los formularios
          const tokenInput = document.querySelector('input[name="token_ws"]');
          if (tokenInput) {
            console.log('Token desde form:', tokenInput.value);
            await confirmarPago(tokenInput.value);
          }
        } else {
          // Fallback: mostrar error
          mostrarError('No se encontró token de pago');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      mostrarError(error.message);
    }
  };

  const confirmarPago = async (token) => {
    try {
      // Confirmar con backend Java
      const responseConfirm = await confirmarTransaccionPago(token);

      if (!responseConfirm.success) {
        mostrarError(responseConfirm.message || 'Error al confirmar pago');
        return;
      }

      // Guardar pedido en BD
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

      if (!usuario.id) {
        mostrarError('Sesión expirada');
        return;
      }

      const responsePedido = await pagarCarrito(usuario.id);

      if (responsePedido.success) {
        // Éxito
        localStorage.removeItem('carrito');
        window.location.href = '/pago-resultado?exito=true&token=' + token;
      } else {
        mostrarError('Error al guardar pedido');
      }
    } catch (error) {
      console.error('Error:', error);
      mostrarError(error.message);
    }
  };

  const mostrarError = (mensaje) => {
    window.location.href = `/pago-resultado?error=${encodeURIComponent(mensaje)}`;
  };

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

